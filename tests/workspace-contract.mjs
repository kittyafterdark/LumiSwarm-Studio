import assert from 'node:assert/strict'
import { normalizeWorkspaceState, StudioController } from '../dist/frontend.js'
assert.deepEqual(normalizeWorkspaceState(null).sizes, {})
assert.deepEqual(normalizeWorkspaceState({ sizes: { generationWidth: 180, historyWidth: 2400, dockHeight: 300, promptHeight: 'bad' } }).sizes, { generationWidth: 310, historyWidth: 300 })
const shell = { dataset: {}, classList: { remove() {} } }
const controls = [{ dataset: { view: 'generate' }, setAttribute() {} }, { dataset: { view: 'styles' }, setAttribute() {} }]
const state = { prompt: 'unsaved', negative: 'blur', stack: [{ weight: 0.7 }], currentImage: { id: 'image' }, seed: 42 }
const controller = { state, get: () => shell, renderStyleOptions() {}, root: { querySelector: () => null, querySelectorAll: () => controls }, fitPreviewToAspect() {} }
globalThis.requestAnimationFrame = fn => fn()
for (const view of [undefined, 'styles', 'generate']) {
  StudioController.prototype.setStudioView.call(controller, view)
  assert.equal(shell.dataset.studioView, view || 'generate')
  assert.equal(controller.state, state)
}
assert.equal(state.prompt, 'unsaved')
console.log('workspace contract: ok')
