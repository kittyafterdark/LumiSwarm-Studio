import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { StudioController, defaultStudioBehavior } from '../dist/frontend.js'
const dom = new JSDOM('<div id="root"></div>', { url:'https://studio.test' })
for (const key of ['window','document','HTMLElement','HTMLInputElement','HTMLSelectElement','HTMLTextAreaElement','HTMLButtonElement','HTMLDetailsElement']) globalThis[key] = dom.window[key]
window.matchMedia = () => ({matches:false, addEventListener(){}, removeEventListener(){}})
globalThis.requestAnimationFrame = () => 0
window.requestAnimationFrame = globalThis.requestAnimationFrame
globalThis.fetch = async () => { throw Error('Standalone') }
globalThis.IntersectionObserver = class { observe(){} disconnect(){} unobserve(){} }
const messages=[]
const root = document.getElementById('root')
window.localStorage.setItem('swarm-studio-workspace-v1',JSON.stringify({sizes:{generationWidth:180,historyWidth:500,dockHeight:400}}))
const controller = new StudioController({sendToBackend:payload=>messages.push(payload)}, {root}, ()=>{}, ()=>{}, defaultStudioBehavior(), ()=>{})
const field=role=>root.querySelector(`[data-role="${role}"]`)
const click=action=>root.querySelector(`[data-action="${action}"]`).click()
const shell=root.querySelector('.ss-shell')
assert.equal(shell.dataset.studioView,'generate')
assert.equal(shell.style.getPropertyValue('--ss-generation-width'),'310px')
assert.equal(shell.style.getPropertyValue('--ss-history-width'),'300px')
field('positive').value='unsaved portrait'
field('negative').value='blur'
field('seed').value='123'
controller.state.currentImage={src:'image',label:'test'}
const image=controller.state.currentImage
const stack=controller.state.stack
const promptNode=field('positive')
const bootstrapCount=messages.filter(message=>message.type==='bootstrap').length
click('manage-stack')
assert.equal(shell.dataset.studioView,'styles')
assert.equal(shell.dataset.styleSection,'stacks')
root.querySelector('[data-view="generate"]').click()
assert.equal(field('positive'),promptNode)
assert.equal(field('positive').value,'unsaved portrait')
assert.equal(field('negative').value,'blur')
assert.equal(field('seed').value,'123')
assert.equal(controller.state.currentImage,image)
assert.equal(controller.state.stack,stack)
assert.equal(messages.filter(message=>message.type==='bootstrap').length,bootstrapCount)
click('save-defaults')
const saved=messages.findLast(message=>message.type==='save_studio_defaults').defaults
assert.equal(saved.seed,undefined)
assert.equal(saved.prompt,undefined)
controller.studioDefaults={version:1,steps:33,cfg:0}
click('restore-defaults')
assert.equal(field('steps').value,'33')
assert.equal(field('cfg').value,'0')
assert.equal(field('seed').value,'123')
controller.renderStyles=[{id:'style',name:'Soft',recipe:{steps:25},loraStackId:'missing'}]
controller.renderStyleOptions()
field('render-style').value='style'
controller.editRenderStyle()
click('style-apply')
assert.equal(controller.activeRenderStyleId,'style')
assert.equal(field('steps').value,'25')
assert.equal(field('positive').value,'unsaved portrait')
assert.match(field('style-summary').textContent,/missing/)
await Promise.resolve()
assert.equal(root.querySelector('[data-action="save-native-main"]').disabled,true)
controller.disposed=true
if(controller.profileSyncTimer)clearTimeout(controller.profileSyncTimer)
dom.window.close()
console.log('mounted Studio navigation and defaults: ok')
