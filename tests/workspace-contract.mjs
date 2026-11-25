import assert from 'node:assert/strict'
import { normalizeWorkspaceState, StudioController } from '../dist/frontend.js'
assert.deepEqual(normalizeWorkspaceState(null).sizes, {})
assert.deepEqual(normalizeWorkspaceState({ sizes: { generationWidth: 180, historyWidth: 2400, dockHeight: 300, promptHeight: 'bad' } }).sizes, { generationWidth: 310, historyWidth: 300 })
const shell = { dataset: {}, classList: { remove() {} } }
const controls = [{ dataset: { view: 'generate' }, setAttribute() {} }, { dataset: { view: 'styles' }, setAttribute() {} }]
const state = { prompt: 'unsaved', negative: 'blur', stack: [{ weight: 0.7 }], currentImage: { id: 'image' }, seed: 42 }
const initSlot = { appendChild() {} }
const init = { parentElement: initSlot }
const details = { open: false }
const mobilePanes = ['create','generation','history','style','loras','stack'].map(key => ({dataset:{mobilePane:key},hidden:false}))
const controller = { state, mobileMedia: {matches:true}, applyMobilePanes:StudioController.prototype.applyMobilePanes,
  get: selector => selector === '.ss-shell' ? shell : selector === '.ss-init-panel' ? init : selector.includes('init-slot') ? initSlot : details,
  renderStyleOptions() {}, root: { querySelector: () => null, querySelectorAll: selector => selector.includes("studio-view") ? controls : selector.includes("data-mobile-pane") ? mobilePanes : [] } }
globalThis.requestAnimationFrame = fn => fn()
for (const view of [undefined, 'styles', 'generate']) {
  StudioController.prototype.setStudioView.call(controller, view)
  assert.equal(shell.dataset.studioView, view || 'generate')
  assert.equal(shell.dataset.mobileTab,view==='styles'?'style':'create')
  assert.deepEqual(mobilePanes.filter(pane=>!pane.hidden).map(pane=>pane.dataset.mobilePane),[shell.dataset.mobileTab])
  assert.equal(controller.state, state)
}
assert.equal(state.prompt, 'unsaved')
console.log('workspace contract: ok')
