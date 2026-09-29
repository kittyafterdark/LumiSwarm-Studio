import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { runInNewContext } from 'node:vm'
import { chromium } from 'playwright'

// Real Chromium layout/bitmap decoding; no SwarmUI or host connection is used.
const frontend = await readFile(new URL('../dist/frontend.js', import.meta.url))
const cssSource = await readFile(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const css = runInNewContext(cssSource + '; STYLES + STUDIO_V3_STYLES')
const server = createServer((req, res) => {
  if (req.url === '/frontend.js') {
    res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(frontend)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<!doctype html><html><head></head><body><div id="root" style="height:900px"></div></body></html>')
  }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
let browser
try {
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`http://127.0.0.1:${server.address().port}`)
  await page.addStyleTag({ content: css })
  await page.evaluate(async () => {
    const { StudioController, defaultStudioBehavior } = await import('/frontend.js')
    const root = document.querySelector('#root')
    root.style.setProperty('--lumiverse-fill-subtle', 'transparent')
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 4
    const nativeDecode = HTMLImageElement.prototype.decode
    let release
    const gate = new Promise(resolve => { release = resolve })
    const diagnostic = window.diagnostic = { responses: 0, decoded: 0, disconnects: 0, renders: 0, release }
    HTMLImageElement.prototype.decode = async function () {
      await nativeDecode.call(this)
      diagnostic.decoded++
      await gate
    }
    let controller
    controller = new StudioController({ sendToBackend(message) {
      if (message.type !== 'preview') return
      canvas.getContext('2d').fillStyle = `hsl(${Number(message.name.split('-')[1]) * 6} 80% 50%)`
      canvas.getContext('2d').fillRect(0, 0, 4, 4)
      const bitmap = canvas.toDataURL()
      setTimeout(() => {
        controller.onMessage({ type: 'preview_result', requestId: message.requestId, name: message.name, dataUrl: bitmap })
        diagnostic.responses++
      }, 20 + Number(message.name.split('-')[1]) % 10 * 15)
    } }, { root }, () => {}, () => {}, defaultStudioBehavior(), () => {})
    controller.state.connection = { id: 'mock' }
    root.querySelector('[data-role="lora-filter"]').value = 'all'
    controller.state.loras = Array.from({ length: 60 }, (_, i) => ({ name: `model-${i}`, title: `LoRA ${i}`, previewRef: 'preview.png', tags: [], defaultWeight: 1, triggerPhrase: '', architecture: 'sdxl' }))
    controller.setStudioView('styles')
    const cards = [...root.querySelectorAll('.ss-lora-card')]
    diagnostic.cards = cards
    diagnostic.controller = controller
    diagnostic.observer = new MutationObserver(records => {
      for (const record of records) for (const node of record.removedNodes) {
        diagnostic.disconnects += cards.filter(card => node === card || node.contains?.(card)).length
      }
    })
    diagnostic.observer.observe(root, { subtree: true, childList: true })
    const render = controller.renderLoras.bind(controller)
    controller.renderLoras = () => { diagnostic.renders++; render() }
    // Hydrate the whole initial page, including cards below the viewport.
    for (const lora of controller.state.loras) {
      controller.requestedPreviews.add(lora.name)
      controller.send('preview', { connectionId: 'mock', name: lora.name, previewRef: lora.previewRef })
    }
  })
  await page.waitForFunction(() => diagnostic.responses === 60 && diagnostic.decoded === 60)
  const before = await page.evaluate(() => ({
    count: diagnostic.cards.length,
    pending: diagnostic.cards.every(card => {
      const img = card.querySelector('img')
      return img.getAttribute('src') === null && getComputedStyle(img).opacity === '0'
        && getComputedStyle(card.querySelector('.ss-lora-placeholder')).visibility === 'visible'
    }),
    background: getComputedStyle(document.querySelector('.ss-lora-folder-sidebar')).backgroundColor,
    geometry: diagnostic.cards.map(card => { const r = card.getBoundingClientRect(); return [r.x,r.y,r.width,r.height] }),
  }))
  assert.equal(before.count, 60)
  assert.equal(before.pending, true, 'Placeholders remain visible until decode completes')
  assert.equal(before.background, 'rgb(20, 21, 26)', 'Transparent theme still has an opaque folder surface')
  await page.evaluate(() => diagnostic.release())
  await page.waitForFunction(() => diagnostic.cards.every(card => card.querySelector('img').dataset.loaded === 'true'))
  const after = await page.evaluate(() => ({
    disconnects: diagnostic.disconnects,
    renders: diagnostic.renders,
    identity: diagnostic.cards.every((card, i) => card.isConnected && document.querySelectorAll('.ss-lora-card')[i] === card),
    decoded: diagnostic.cards.every(card => { const img = card.querySelector('img'); return img.naturalWidth === 4 && getComputedStyle(img).opacity === '1' }),
    geometry: diagnostic.cards.map(card => { const r = card.getBoundingClientRect(); return [r.x,r.y,r.width,r.height] }),
  }))
  assert.equal(after.disconnects, 0)
  assert.equal(after.renders, 0, 'Preview responses must never call renderLoras')
  assert.equal(after.identity, true)
  assert.equal(after.decoded, true)
  assert.deepEqual(after.geometry, before.geometry, 'Thumbnail arrival must not shift card geometry')
  assert.deepEqual(errors, [])
  console.log('Chromium: 60 delayed decoded previews, zero card disconnects, zero library renders, stable geometry, opaque folders: ok')
} finally {
  await browser?.close()
  await new Promise(resolve => server.close(resolve))
}
