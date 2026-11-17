import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const host = readFileSync(new URL('../src/host/image-gen.ts', import.meta.url), 'utf8')
const studio = readFileSync(new URL('../src/studio/controller.ts', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/studio/styles.ts', import.meta.url), 'utf8')
const bundled = readFileSync(new URL('../dist/frontend.js', import.meta.url), 'utf8')

for (const name of ['zoom', 'x', 'y', 'reset', 'close', 'cancel', 'apply']) {
  assert.ok(host.includes(`data-crop="${name}"`), `crop ${name} control present`)
}
for (const name of ['ss-avatar-crop-header', 'ss-avatar-crop-stage', 'ss-avatar-crop-settings', 'ss-avatar-crop-footer']) {
  assert.ok(host.includes(name) && css.includes(`.${name}`), `${name} has original markup and authored styling`)
}
assert.equal((css.match(/^\.ss-avatar-crop \{/gm) || []).length, 1, 'one canonical avatar dialog CSS definition')
assert.equal((css.match(/^\.ss-confirm-folder \{/gm) || []).length, 1, 'one canonical folder dialog CSS definition')
assert.ok(host.includes('const modalMount = root.querySelector(".ss-shell") || root'), 'crop inherits Studio theme variables')
assert.ok(studio.includes('const modalMount = this.root.querySelector(".ss-shell") || this.root'), 'folder modal inherits Studio theme variables')
assert.ok(host.includes('form.append("original_avatar", original'), 'avatar API still receives original image')
assert.ok(host.includes('form.append("avatar", crop'), 'avatar API still receives square crop')
assert.ok(host.includes('canvas.toBlob('), 'actual canvas crop still exported')
assert.ok(host.includes('canvas.addEventListener("pointermove"'), 'pointer crop positioning retained')
assert.ok(host.includes('canvas.addEventListener("keydown"'), 'keyboard crop positioning supported')
assert.ok(studio.includes('AI model / custom ComfyUI upscale'), 'upscale action opens the enhancement workspace')
assert.ok(bundled.includes('ss-avatar-crop-preserved') && bundled.includes('AI Upscale'), 'built runtime includes redesign')
console.log('Image Studio v24 avatar crop and upscale UI contract passed')
