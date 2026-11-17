import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { StudioController, defaultStudioBehavior } from '../dist/frontend.js'

// Minimal hosted DOM. We do not need SwarmUI, credentials, or any user data to test Tune.
const dom = new JSDOM('<div id="root"></div>', { url: 'https://studio.test' })
for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLSelectElement', 'HTMLTextAreaElement', 'HTMLButtonElement', 'HTMLDetailsElement']) globalThis[key] = dom.window[key]
window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){} })
window.requestAnimationFrame = globalThis.requestAnimationFrame = () => 0
window.HTMLImageElement.prototype.decode = async () => {}
globalThis.fetch = async () => { throw Error('Deliberately disconnected fixture') }
globalThis.ResizeObserver = class { observe(){} disconnect(){} }
globalThis.IntersectionObserver = class { observe(){} disconnect(){} unobserve(){} }
const messages = []
const root = document.querySelector('#root')
const studio = new StudioController({ sendToBackend: message => messages.push(message) }, {root}, ()=>{}, ()=>{}, defaultStudioBehavior(), ()=>{})
const field = role => root.querySelector(`[data-role="${role}"]`)
const trigger = action => root.querySelector(`[data-action="${action}"]`).click()

assert.equal(root.querySelector('.ss-generation-pane .ss-pane-title strong')?.textContent, 'Tune')
assert.deepEqual([...root.querySelectorAll('.ss-tune-group[data-tune-group]')].map(el=>el.dataset.tuneGroup), ['model','canvas','sampling'])
assert.ok(root.querySelector('.ss-brand > svg'), 'Header reuses the existing SVG tab icon')
assert.deepEqual([...root.querySelectorAll('.ss-mobile-tabs button')].map(el=>el.textContent.trim()), ['Create','Tune','Style','LoRAs','Stack','History'])
const orientation = name => root.querySelector(`[data-action="select-orientation"][data-orientation="${name}"]`)
assert.equal(orientation('square').getAttribute('aria-pressed'), 'true', 'Initial state is current dimensions, not decorative')
orientation('portrait').click()
assert.equal(field('aspect').value,'2:3')
assert.equal(orientation('portrait').getAttribute('aria-pressed'), 'true')
assert.ok(+field('height').value > +field('width').value)
orientation('landscape').click()
assert.equal(field('aspect').value,'3:2')
assert.equal(orientation('landscape').getAttribute('aria-pressed'), 'true')
orientation('square').click()
assert.equal(field('aspect').value,'1:1')
assert.equal(field('width').value,field('height').value)

const recipeMenu = field('recipe-menu')
assert.equal(recipeMenu.tagName,'DETAILS')
recipeMenu.open=true
trigger('save-defaults')
assert.equal(recipeMenu.open,false,'Recipe action closes overflow without resetting controls')
assert.equal(messages.filter(msg => msg.type === 'save_studio_defaults').length,1)
field('seed').value='401'
trigger('use-output-seed')
assert.equal(field('seed').value,'401','No output means seed remains unchanged')
studio.state.currentImage={src:'image',url:'data:image/png;base64,',label:'Test',details:{parameters:{seed:987654}}}
trigger('use-output-seed')
assert.equal(field('seed').value,'987654')
assert.match(field('tune-sampling-summary').textContent,/Fixed seed/)
trigger('random-seed-mobile')
assert.equal(field('seed').value,'-1')
assert.match(field('tune-sampling-summary').textContent,/Random seed/)
field('steps').value='33'
field('steps').dispatchEvent(new window.Event('input',{bubbles:true}))
assert.match(field('tune-sampling-summary').textContent,/33 steps/)

const styleSource = await readFile(new URL('../src/studio/styles.ts',import.meta.url),'utf8')
const setup = await readFile(new URL('../src/host/setup.ts',import.meta.url),'utf8')
assert.match(styleSource,/const STYLES = `/)
assert.match(styleSource,/const STUDIO_V3_STYLES = ""/)
assert.match(setup,/ctx\.dom\.addStyle\(STYLES\)/)
assert.doesNotMatch(setup,/STYLES\s*\+\s*STUDIO_V3_STYLES/)
assert.doesNotMatch(styleSource,/\.ss-tune-orientation-display span \{/)
// Restoring the library's missing folder/selection/visual components adds real
// source rules, not a second layered stylesheet. Guard against the old ~158k cascade.
assert.equal((styleSource.match(/\.ss-commandbar \{ display:flex; position:absolute/g)||[]).length,1,'Mobile command bar has one layout definition')
assert.equal((styleSource.match(/\.ss-library-folder-preview img \{/g)||[]).length,1,'Library thumbnail styling must have one authored definition')
console.log('Tune redesign contract: real aspect controls, menu actions, seed reuse, summaries, icon, six mobile panes and single stylesheet: ok')
