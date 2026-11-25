import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import vm from 'node:vm'

const source = await readFile(new URL('../src/studio/expressions.ts', import.meta.url), 'utf8')
const start = source.indexOf('async function installExpressionBackgroundModel(')
const end = source.indexOf('\nfunction openCharacterExpressions(', start)
assert.ok(start >= 0 && end > start, 'find the real Studio installer function')

class MockFile {
  bytes = []
  getFile() { return Promise.resolve({ size: this.bytes.reduce((n, b) => n + b.length, 0) }) }
  createWritable() {
    return Promise.resolve(new WritableStream({ write: part => this.bytes.push(part) }))
  }
}
class MockDirectory {
  children = new Map()
  files = new Map()
  constructor(name) { this.name = name }
  async getDirectoryHandle(name, { create = false } = {}) {
    if (this.children.has(name)) return this.children.get(name)
    if (!create) throw new DOMException('No such folder', 'NotFoundError')
    const folder = new MockDirectory(name)
    this.children.set(name, folder)
    return folder
  }
  async getFileHandle(name, { create = false } = {}) {
    if (this.files.has(name)) return this.files.get(name)
    if (!create) throw new DOMException('No such file', 'NotFoundError')
    const file = new MockFile()
    this.files.set(name, file)
    return file
  }
}
let fetches = 0
const installer = vm.runInNewContext(stripTypeScriptTypes(source.slice(start, end)) + "\ninstallExpressionBackgroundModel", {
  DOMException, Blob, Response, WritableStream,
  EXPRESSION_BG_MODEL: "birefnet.safetensors",
  EXPRESSION_BG_MODEL_URL: "https://example.invalid/birefnet.safetensors",
  fetch: async () => {
    fetches++
    return new Response('mock model weights', { status: 200, headers: { 'Content-Type': 'application/octet-stream' } })
  },
})
const signal = new AbortController().signal
const check = async (name, setup, expectedFolder) => {
  const root = new MockDirectory(name)
  if (setup) await setup(root)
  assert.equal(await installer(root, signal), true)
  const target = expectedFolder ? root.children.get(expectedFolder) : root
  assert.ok(target?.files.has('birefnet.safetensors'), `${name} targets ${expectedFolder || '(itself)'}`)
  assert.equal(await installer(root, signal), false, 'existing model is not overwritten')
}
await check('BackgroundRemoval', null, null)
await check('background_removal', null, null)
await check('models', null, 'background_removal')
await check('Models', root => root.getDirectoryHandle('BackgroundRemoval', { create: true }), 'BackgroundRemoval')
await check('models', root => root.getDirectoryHandle('BackgroundRemoval', { create: true }), 'BackgroundRemoval')
await check('Models', root => root.getDirectoryHandle('background_removal', { create: true }), 'background_removal')
await assert.rejects(() => installer(new MockDirectory('Models'), signal), /Select the BackgroundRemoval folder/)
await assert.rejects(() => installer(new MockDirectory('checkpoints'), signal), /Choose ComfyUI/)
const ambiguous = new MockDirectory('Models')
await ambiguous.getDirectoryHandle('BackgroundRemoval', { create: true })
await ambiguous.getDirectoryHandle('background_removal', { create: true })
await assert.rejects(() => installer(ambiguous, signal), /Both background_removal and BackgroundRemoval exist/)
assert.equal(fetches, 6, 'only known target folders are downloaded into')
console.log('Stability Matrix & ComfyUI background-removal folder compatibility: PASS')
