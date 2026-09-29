import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { StudioController, defaultStudioBehavior } from '../dist/frontend.js'
const dom = new JSDOM('<div id="root"></div>', { url:'https://studio.test' })
for (const key of ['window','document','HTMLElement','HTMLInputElement','HTMLSelectElement','HTMLTextAreaElement','HTMLButtonElement','HTMLDetailsElement']) globalThis[key] = dom.window[key]
window.matchMedia = () => ({matches:false, addEventListener(){}, removeEventListener(){}})
globalThis.requestAnimationFrame = () => 0
window.requestAnimationFrame = globalThis.requestAnimationFrame
globalThis.fetch = async () => { throw Error('Standalone') }
let observersCreated = 0
globalThis.IntersectionObserver = class { constructor(){ observersCreated++ } observe(){} disconnect(){} unobserve(){} }
const styleSource = await readFile(new URL('../src/studio/styles.ts',import.meta.url),'utf8')
const styleNode = document.createElement('style')
styleNode.textContent=styleSource.slice(styleSource.indexOf('`')+1,styleSource.lastIndexOf('`'))
document.head.appendChild(styleNode)
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
assert.equal(root.querySelector('.ss-lora-dock'),null)
assert.equal(root.querySelector('.ss-default-actions'),null)
assert.equal(root.querySelectorAll('[data-style-page]').length,3)
for (const section of ['saved','stacks','library','saved']) {
  controller.setStylesSection(section)
  assert.deepEqual([...root.querySelectorAll('[data-style-page]')].filter(page=>!page.hidden).map(page=>page.dataset.stylePage),[section])
  assert.equal(root.querySelector(`[data-section="${section}"]`).getAttribute('aria-selected'),'true')
  for(const page of root.querySelectorAll('[data-style-page]')) assert.equal(window.getComputedStyle(page).display === 'none',page.dataset.stylePage !== section)
}
assert.ok(field('lora-grid').closest('[data-style-page="library"]'))
assert.ok(field('stack-list').closest('[data-style-page="stacks"]'))
assert.ok(field('style-name').closest('[data-style-page="saved"]'))
assert.ok(root.querySelector('[data-action="save-defaults"]').closest('[data-studio-page="generate"]'))
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
// Full-page library regression: bounded cards, stable nodes and no observer churn.
controller.state.connection={id:'swarm'}
field('lora-filter').value='all'
controller.state.loras=Array.from({length:1200},(_,i)=>({name:`folder${i%12}/model-${String(i).padStart(4,'0')}`,title:`Model ${String(i).padStart(4,'0')}`,author:'Artist',description:'LoRA',previewRef:'preview.png',architecture:'sdxl',className:'',compatClass:'',resolution:'',usageHint:'',triggerPhrase:'',tags:[],defaultWeight:1,local:true}))
let createdCards=0
const makeCard=controller.makeLoraCard.bind(controller)
controller.makeLoraCard=lora=>{createdCards++;return makeCard(lora)}
controller.setStudioView('generate')
controller.renderLoras()
assert.equal(createdCards,0)
controller.setStudioView('styles')
controller.setStylesSection('library')
assert.equal(field('lora-grid').children.length,60)
assert.equal(createdCards,60)
const libraryCard=field('lora-grid').firstElementChild
const previewNode=libraryCard.querySelector('img')
const folderNode=field('lora-folder-tree').firstElementChild
field('lora-grid').scrollTop=300
const observerCount=observersCreated
libraryCard.querySelector('.ss-add-button').click()
assert.equal(field('lora-grid').firstElementChild,libraryCard)
assert.equal(libraryCard.querySelector('img'),previewNode)
assert.equal(libraryCard.querySelector('.ss-add-button').disabled,true)
assert.equal(field('lora-grid').scrollTop,300)
for(let i=0;i<20;i++) {
  controller.setStylesSection('stacks')
  controller.setStylesSection('library')
  controller.toggleLoraFolders(false)
  assert.equal(field('lora-folder-sidebar').hidden,true)
  controller.toggleLoraFolders(true)
}
assert.equal(createdCards,60)
assert.equal(observersCreated,observerCount)
assert.equal(field('lora-folder-tree').firstElementChild,folderNode)
assert.equal(field('lora-grid').firstElementChild,libraryCard)
assert.equal(field('lora-folder-toggle').getAttribute('aria-expanded'),'true')
controller.selectLoraFolder('folder1')
assert.equal(controller.filteredLoras().length,100)
assert.equal(field('lora-grid').children.length,60)
assert.match(field('lora-page-status').textContent,/1–60 of 100/)
click('lora-page-next')
assert.equal(field('lora-grid').children.length,40)
assert.match(field('lora-page-status').textContent,/61–100 of 100/)
assert.equal(controller.loraCards.size,40)
controller.toggleLoraFolders(false)
const workspace=JSON.parse(window.localStorage.getItem('swarm-studio-workspace-v2'))
assert.equal(workspace.loraBrowser.folder,'folder1')
assert.equal(workspace.loraBrowser.open,false)
field('lora-search').value='no such model'
controller.renderLoras()
assert.equal(field('lora-grid').querySelectorAll('.ss-lora-card').length,0)
assert.equal(controller.loraPage,0)
// Deleted selected folder recovers to All instead of leaving an empty stale path.
controller.state.loras=controller.state.loras.filter(lora=>!lora.name.startsWith('folder1/'))
field('lora-search').value=''
controller.renderLoras()
assert.equal(controller.selectedLoraFolder,null)
assert.equal(field('lora-grid').children.length,60)
assert.equal(controller.loraCards.size,60)
// Tabs implement roving keyboard selection and never detach the Studio root.
const libraryTab=root.querySelector('#ss-tab-library')
libraryTab.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Home',bubbles:true}))
assert.equal(controller.stylesSection,'saved')
assert.equal(document.activeElement.id,'ss-tab-saved')
assert.equal(root.querySelector('.ss-shell'),shell)
assert.equal(root.querySelector('.ss-style-columns').children.length,2)
assert.ok(field('style-positive').closest('.ss-style-composition'))
assert.ok(field('style-render-steps').closest('.ss-style-recipe'))
// Unsaved editor fields and library search survive cross-screen navigation.
field('style-name').value='Unsaved Style name'
field('style-positive').value='unsaved lighting'
controller.setStudioView('generate')
assert.equal(window.getComputedStyle(root.querySelector('[data-studio-page="styles"]')).display,'none')
controller.setStudioView('styles')
assert.equal(field('style-name').value,'Unsaved Style name')
assert.equal(field('style-positive').value,'unsaved lighting')
assert.equal(window.getComputedStyle(root.querySelector('[data-studio-page="generate"]')).display,'none')
assert.equal(root.querySelectorAll('.ss-defaults-menu [data-action]').length,3)
assert.ok(root.querySelector('[data-action="save-native-main"]').closest('.ss-native-actions'))
assert.ok(root.querySelector('[data-action="save-base-recipe"]').closest('.ss-character-actions'))
// Late responses and errors from an old connection cannot touch current previews/status.
const oldRequest=controller.send('preview',{connectionId:'old',name:'stale',previewRef:'old.png'})
controller.onMessage({type:'preview_result',requestId:oldRequest,name:'stale',dataUrl:'data:image/png;base64,old'})
assert.equal(controller.previewCache.has('stale'),false)
const validRequest=controller.send('preview',{connectionId:'swarm',name:'fresh',previewRef:'fresh.png'})
controller.onMessage({type:'preview_result',requestId:validRequest,name:'fresh',dataUrl:'data:image/png;base64,fresh'})
assert.equal(controller.previewCache.get('fresh'),'data:image/png;base64,fresh')
const statusBefore=field('run-status').textContent
controller.onMessage({type:'studio_error',operation:'preview',requestId:'expired',name:'stale',error:'Old connection failed'})
assert.equal(field('run-status').textContent,statusBefore)
// Styles navigation supersedes a stale mobile LoRA/Stack tab.
controller.setMobileTab('stack')
controller.setStylesSection('library')
assert.equal(window.getComputedStyle(root.querySelector('.ss-lora-library')).display,'flex')
controller.setStudioView('generate')
assert.equal(shell.dataset.mobileTab,'create')
assert.equal(root.querySelector('[data-tab="create"]').getAttribute('aria-current'),'page')
console.log('large library and exclusive Styles pages: ok')
controller.disposed=true
if(controller.profileSyncTimer)clearTimeout(controller.profileSyncTimer)
dom.window.close()
console.log('mounted Studio navigation and defaults: ok')
