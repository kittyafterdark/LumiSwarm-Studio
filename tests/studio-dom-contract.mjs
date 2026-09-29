import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import { runInNewContext } from 'node:vm'
import { StudioController, defaultStudioBehavior } from '../dist/frontend.js'
const dom = new JSDOM('<div id="root"></div>', { url:'https://studio.test' })
for (const key of ['window','document','HTMLElement','HTMLInputElement','HTMLSelectElement','HTMLTextAreaElement','HTMLButtonElement','HTMLDetailsElement']) globalThis[key] = dom.window[key]
dom.window.HTMLImageElement.prototype.decode = () => Promise.resolve()
window.matchMedia = () => ({matches:false, addEventListener(){}, removeEventListener(){}})
globalThis.requestAnimationFrame = () => 0
window.requestAnimationFrame = globalThis.requestAnimationFrame
globalThis.fetch = async () => { throw Error('Standalone') }
const resizeTargets=[]
globalThis.ResizeObserver=class { observe(target){resizeTargets.push(target)} disconnect(){} }
let observersCreated = 0
globalThis.IntersectionObserver = class { constructor(){ observersCreated++ } observe(){} disconnect(){} unobserve(){} }
const styleSource = await readFile(new URL('../src/studio/styles.ts',import.meta.url),'utf8')
const styleNode = document.createElement('style')
styleNode.textContent=runInNewContext(styleSource + '; STYLES + STUDIO_V3_STYLES')
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
assert.equal(root.querySelectorAll('[data-style-column]').length,3)
assert.equal(root.querySelectorAll('[role="tablist"]').length,0)
assert.equal(root.querySelector('.ss-generate-page'),null)
assert.equal(root.querySelector('.ss-workspace').dataset.studioPage,'generate')
for (const column of root.querySelectorAll('[data-style-column]')) assert.equal(column.hidden,false)
assert.ok(field('lora-grid').closest('[data-style-column="library"]'))
assert.ok(field('stack-list').closest('[data-style-column="stacks"]'))
assert.ok(field('generate-stack-list').closest('[data-studio-page="generate"]'))
assert.ok(field('style-name').closest('[data-style-column="saved"]'))
assert.equal(field('rail-history').open,false)
assert.equal(resizeTargets.some(node=>node.dataset.role==='output-stage'),false)
assert.equal(field('lora-folder-toggle').textContent.trim(),'')
assert.ok(root.querySelector('[data-action="save-defaults"]').closest('[data-studio-page="generate"]'))
const bootstrapCount=messages.filter(message=>message.type==='bootstrap').length
root.querySelector('[data-view="styles"]').click()
assert.equal(shell.dataset.studioView,'styles')
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
controller.focusStyleColumn('library')
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
  controller.focusStyleColumn('stacks')
  controller.focusStyleColumn('library')
  controller.toggleLoraFolders(false)
  assert.equal(field('lora-folder-sidebar').hidden,true)
  controller.toggleLoraFolders(true)
}
assert.equal(createdCards,60)
assert.equal(observersCreated,observerCount)
assert.equal(field('lora-folder-tree').firstElementChild,folderNode)
assert.equal(field('lora-grid').firstElementChild,libraryCard)
assert.equal(field('lora-folder-toggle').getAttribute('aria-expanded'),'true')
// Shared stack updates preserve both presentations, focused inputs and library previews.
const fullRow=field('stack-list').firstElementChild
const compactRow=field('generate-stack-list').firstElementChild
const fullWeight=fullRow.querySelector('.ss-stack-weight')
const compactWeight=compactRow.querySelector('.ss-stack-weight')
fullWeight.focus()
fullWeight.value='0.65'
fullWeight.dispatchEvent(new window.Event('change',{bubbles:true}))
assert.equal(compactWeight.value,'0.65')
assert.equal(document.activeElement,fullWeight)
controller.state.stack=controller.state.stack.map(item=>({...item,weight:0.8}))
controller.renderStack()
compactWeight.value='0.45'
compactWeight.dispatchEvent(new window.Event('change',{bubbles:true}))
assert.equal(controller.state.stack[0].weight,0.45)
assert.equal(fullWeight.value,'0.45')
assert.equal(field('stack-list').firstElementChild,fullRow)
assert.equal(field('generate-stack-list').firstElementChild,compactRow)
controller.addLora(controller.state.loras[1])
fullRow.querySelectorAll('.ss-stack-actions button')[1].click()
assert.equal(field('stack-list').lastElementChild,fullRow)
assert.equal(field('generate-stack-list').lastElementChild,compactRow)
fullRow.querySelectorAll('.ss-stack-actions button')[0].click()
assert.equal(field('stack-list').firstElementChild,fullRow)
assert.equal(field('lora-grid').firstElementChild,libraryCard)
assert.equal(libraryCard.querySelector('img'),previewNode)
const mutationObserver=new window.MutationObserver(()=>{})
mutationObserver.observe(previewNode,{attributes:true,attributeFilter:['src']})
controller.updatePreviewImages(controller.state.stack[0].lora.name,'data:image/png;base64,test')
assert.equal(mutationObserver.takeRecords().length,0)
await Promise.resolve()
assert.equal(previewNode.dataset.loaded,'true')
assert.equal(previewNode.getAttribute('src'),'data:image/png;base64,test')
mutationObserver.takeRecords()
controller.updatePreviewImages(controller.state.stack[0].lora.name,'data:image/png;base64,test')
assert.equal(mutationObserver.takeRecords().length,0)
mutationObserver.disconnect()
// Dragging and deleting use current keys, including after saved-stack replacement.
const drop=new window.Event('drop',{bubbles:true,cancelable:true})
Object.defineProperty(drop,'dataTransfer',{value:{getData:()=>controller.state.stack[0].lora.name}})
field('stack-list').lastElementChild.dispatchEvent(drop)
assert.equal(field('stack-list').lastElementChild,fullRow)
assert.equal(field('generate-stack-list').lastElementChild,compactRow)
fullRow.querySelectorAll('.ss-stack-actions button')[0].click()
field('stack-list').lastElementChild.querySelectorAll('.ss-stack-actions button')[2].click()
assert.equal(field('stack-list').children.length,1)
assert.equal(field('generate-stack-list').children.length,1)
const renderLibrary=controller.renderLoras.bind(controller)
let unrelatedLibraryRenders=0
controller.renderLoras=()=>{unrelatedLibraryRenders++;renderLibrary()}
field('style-name').value='Identity test'
field('style-positive').value='soft lighting'
click('style-save')
controller.renderStyleOptions()
assert.equal(unrelatedLibraryRenders,0)
assert.equal(field('lora-grid').firstElementChild,libraryCard)
controller.renderLoras=renderLibrary
// Live frames change image content without writing preview geometry or replacing prompts.
const previewFrame=field('current-preview')
const outputImage=field('preview-image')
const previewMutations=new window.MutationObserver(()=>{})
previewMutations.observe(previewFrame,{attributes:true,attributeFilter:['style']})
for(let i=0;i<12;i++) {
  controller.showLivePreview(`data:image/png;base64,frame${i}`,i,12)
  controller.updatePreviewAspect(i%2 ? 1536:768,1024)
}
assert.equal(previewMutations.takeRecords().length,0)
assert.equal(field('preview-image'),outputImage)
assert.equal(field('positive'),promptNode)
previewMutations.disconnect()
// History cards survive refreshed metadata and open/close without replacing image nodes.
controller.state.outputs=[{id:'one',url:'https://studio.test/one.png',original_filename:'one.png'}]
controller.state.outputTotal=1
controller.renderOutputs()
const historyCard=field('history-grid').firstElementChild
const historyImage=historyCard.querySelector('img')
for(let i=0;i<20;i++) {
  field('rail-history').open=i%2===0
  controller.setStudioView('generate')
  controller.setStudioView('styles')
  controller.renderStack()
  controller.renderOutputs()
}
assert.equal(field('history-grid').firstElementChild,historyCard)
assert.equal(historyCard.querySelector('img'),historyImage)
assert.equal(field('stack-list').firstElementChild,fullRow)
assert.equal(field('lora-grid').firstElementChild,libraryCard)
controller.state.outputs=[{...controller.state.outputs[0],original_filename:'renamed.png'}]
controller.renderOutputs()
assert.equal(historyImage.alt,'renamed.png')
assert.equal(field('history-grid').firstElementChild,historyCard)
controller.state.outputs=[]
controller.renderOutputs()
assert.equal(historyCard.isConnected,false)
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
assert.equal(root.querySelector('.ss-shell'),shell)
assert.ok(field('style-positive').closest('.ss-style-composition'))
assert.ok(field('style-render-steps').closest('details.ss-style-recipe'))
click('style-collapse')
assert.equal(field('styles-columns').dataset.collapsed,'true')
click('style-collapse')
assert.equal(field('styles-columns').dataset.collapsed,'false')
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
controller.focusStyleColumn('library')
assert.equal(window.getComputedStyle(root.querySelector('.ss-lora-library')).display,'flex')
controller.setStudioView('generate')
assert.equal(shell.dataset.mobileTab,'create')
assert.equal(root.querySelector('[data-tab="create"]').getAttribute('aria-current'),'page')
// Decode races must not reveal removed, stale or failed thumbnails.
await Promise.resolve()
const pendingDecodes=[]
dom.window.HTMLImageElement.prototype.decode = function () {
  return new Promise((resolve,reject)=>pendingDecodes.push({resolve,reject}))
}
const delayedImage=document.createElement('img')
root.appendChild(delayedImage)
controller.revealDecodedPreview(delayedImage,'older')
controller.revealDecodedPreview(delayedImage,'newer')
pendingDecodes.shift().resolve()
await Promise.resolve()
assert.equal(delayedImage.hasAttribute('src'),false)
pendingDecodes.shift().resolve()
await Promise.resolve()
assert.equal(delayedImage.getAttribute('src'),'newer')
assert.equal(delayedImage.dataset.loaded,'true')
controller.revealDecodedPreview(delayedImage,'old-connection')
controller.previewEpoch++
pendingDecodes.shift().resolve()
await Promise.resolve()
assert.equal(delayedImage.getAttribute('src'),'newer')
controller.revealDecodedPreview(delayedImage,'detached')
delayedImage.remove()
pendingDecodes.shift().resolve()
await Promise.resolve()
assert.equal(delayedImage.getAttribute('src'),'newer')
const failedImage=document.createElement('img')
root.appendChild(failedImage)
controller.revealDecodedPreview(failedImage,'invalid-bitmap')
pendingDecodes.shift().reject(new Error('Decode failed'))
await Promise.resolve()
await Promise.resolve()
assert.equal(failedImage.hasAttribute('src'),false)
assert.equal(failedImage.dataset.loaded,undefined)
controller.revealDecodedPreview(failedImage,'disposed')
controller.disposed=true
pendingDecodes.shift().resolve()
await Promise.resolve()
assert.equal(failedImage.hasAttribute('src'),false)
failedImage.remove()
console.log('large library and persistent Styles columns: ok')
controller.disposed=true
if(controller.profileSyncTimer)clearTimeout(controller.profileSyncTimer)
dom.window.close()
console.log('mounted Studio navigation and defaults: ok')
