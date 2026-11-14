import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { StudioController, defaultStudioBehavior } from '../dist/frontend.js'

// Self-contained host fixture: no SwarmUI server, network, or user credentials.
// It deliberately nests Studio in a scaled host, as real Lumiverse modals can be.
const dom = new JSDOM('<main class="host-dialog" style="transform:scale(.8)"><div id="studio-root"></div></main>', {url:'https://studio.test'})
for (const key of ['window','document','HTMLElement','HTMLInputElement','HTMLSelectElement','HTMLTextAreaElement','HTMLButtonElement','HTMLDetailsElement']) globalThis[key] = dom.window[key]
window.matchMedia = () => ({matches:false,addEventListener(){},removeEventListener(){}})
globalThis.requestAnimationFrame = window.requestAnimationFrame = () => 0
window.HTMLImageElement.prototype.decode = async () => {}
globalThis.ResizeObserver = class {observe(){}disconnect(){}}
globalThis.IntersectionObserver = class {observe(){}disconnect(){}unobserve(){}}
globalThis.fetch = async () => {throw Error('Offline fixture; no requests allowed')}
const root = document.querySelector('#studio-root')
const controller = new StudioController({sendToBackend(){}}, {root}, ()=>{}, ()=>{}, defaultStudioBehavior(), ()=>{})
const css = await readFile(new URL('../src/studio/styles.ts',import.meta.url),'utf8')

// The user's snap-action caret is a filled SVG, not a text glyph or rotating transition.
const caretPath='M216.49 168.49a12 12 0 0 1-17 0L128 97l-71.51 71.49a12 12 0 0 1-17-17l80-80a12 12 0 0 1 17 0l80 80a12 12 0 0 1 0 17'
for (const section of root.querySelectorAll('.ss-tune-group')) {
  const caret=section.querySelector('summary .ss-tune-chevron svg')
  assert.ok(caret, 'Every Tune disclosure, including Advanced, has the shared SVG caret')
  assert.equal(caret.querySelector('path')?.getAttribute('d'),caretPath)
  assert.ok(section.querySelector('.ss-tune-group-icon'))
}
assert.ok(root.querySelector('.ss-advanced.ss-tune-group'), 'Advanced uses the same disclosure component')
assert.match(css,/\.ss-tune-chevron svg \{[^}]*transform:rotate\(180deg\)/)
assert.doesNotMatch(css,/\.ss-tune-chevron svg \{[^}]*transition:/)
const recipe=root.querySelector('.ss-recipe-menu')
assert.ok(recipe?.querySelector('.ss-recipe-menu-sheet'))
for(const action of ['save-defaults','restore-defaults','clear-defaults','save-look-recipe','save-native-main']) {
  assert.ok(recipe.querySelector(`[data-action="${action}"] svg`), `Recipe action ${action} keeps its SVG icon`)
}
assert.match(css,/\.ss-recipe-menu > summary \{[^}]*width:28px/)

// The stack renders actual user-provided filenames as metadata, never as UI labels.
const lora={name:'folder/Portrait_Style_v10.safetensors',title:'Portrait Style',author:'Example',previewRef:null,triggerPhrase:'portrait',defaultWeight:0.7,architecture:'anima-v1',compatClass:'',tags:[],local:true}
controller.state.loras=[lora]
controller.state.stack=[{lora,enabled:true,weight:0.7,useTrigger:false}]
controller.renderStack()
for(const role of ['stack-list','generate-stack-list']) {
  const row=root.querySelector(`[data-role="${role}"] .ss-stack-row`)
  assert.ok(row)
  assert.equal(row.querySelector('.ss-stack-name strong').textContent,'Portrait Style')
  assert.equal(row.querySelector('.ss-stack-name span'),null)
  assert.match(row.querySelector('.ss-stack-name').title,/Portrait_Style_v10\.safetensors/)
  assert.ok(row.querySelector('.ss-stack-preview img'))
  assert.equal(row.querySelectorAll('.ss-stack-actions button').length,1)
}
assert.match(css,/\.ss-stack-row \{[^}]*grid-template-columns:16px 36px minmax\(0,1fr\) 52px 28px/)
assert.match(css,/\.ss-stack-row \.ss-stack-preview img \{[^}]*object-fit:cover/)
assert.match(css,/\.ss-lora-grid \{[^}]*grid-auto-rows:max-content[^}]*overflow-y:auto/)
assert.match(css,/\.ss-lora-footer \{[^}]*justify-content:flex-end/)
assert.match(css,/\.ss-commandbar \{ display:none/)
assert.match(css,/--ss-surface-base: var\(--lumiverse-surface/)
assert.match(css,/--ss-panel-bg: var\(--ss-surface-base\)/)
assert.match(css,/\.ss-brand \{[^}]*color: var\(--ss-text\)/)
assert.match(css,/\.ss-sampling-pair \.ss-input\[type='number'\] \{[^}]*background:var\(--ss-field-bg\)/)

// Portalling fullscreen escapes the scaled host and is fully reversible.
const host=root.parentNode
root.querySelector('[data-action="toggle-fullscreen"]').click()
assert.equal(root.parentNode,document.body)
assert.ok(root.classList.contains('ss-fullscreen-root'))
assert.ok(root.querySelector('.ss-shell').classList.contains('ss-fullscreen-layer'))
assert.equal(host.childNodes.length,1,'Only the origin anchor stays behind')
root.querySelector('[data-action="toggle-fullscreen"]').click()
assert.equal(root.parentNode,host)
assert.ok(!root.classList.contains('ss-fullscreen-root'))
assert.ok(!root.querySelector('.ss-shell').classList.contains('ss-fullscreen-layer'))
assert.equal(host.querySelectorAll('#studio-root').length,1)
assert.equal(host.childNodes.length,1,'Origin anchor removed on restore')

console.log('Live redesign v5 contract: disclosures, icons, filenames, compact stack, paginated scroll, host-theme variables and scaled fullscreen restoration: ok')

assert.equal(root.querySelector('[data-role="lora-meta-layer"]').hidden,true)
assert.match(css,/--app-scaled-viewport-width/)
assert.match(css,/\.ss-styles-resizer \{[^}]*cursor:col-resize/)
