import assert from 'node:assert/strict'
import {JSDOM} from 'jsdom'
import {StudioRecoveryController, TaggedImageController, defaultStudioBehavior, StudioController} from '../dist/frontend.js'
const dom=new JSDOM('<div id="root"></div>',{url:'https://studio.test'})
for(const name of ['window','document','HTMLElement','MutationObserver'])globalThis[name]=dom.window[name]
let visibility='visible'
Object.defineProperty(document,'visibilityState',{get:()=>visibility})
const originalTimeout=globalThis.setTimeout,originalClear=globalThis.clearTimeout
const timers=new Map();let nextTimer=0
globalThis.setTimeout=fn=>{const id=++nextTimer;timers.set(id,fn);return id}
globalThis.clearTimeout=id=>timers.delete(id)
const tick=()=>{const [id,fn]=timers.entries().next().value;timers.delete(id);fn()}
const messages=[];let refreshes=0
const recovery=new StudioRecoveryController({sendToBackend:message=>messages.push(message)},()=>refreshes++)
visibility='hidden';document.dispatchEvent(new window.Event('visibilitychange'))
assert.equal(timers.size,0)
visibility='visible';document.dispatchEvent(new window.Event('visibilitychange'))
window.dispatchEvent(new window.Event('pageshow'));window.dispatchEvent(new window.Event('focus'))
assert.equal(timers.size,1,'Resume events coalesce')
tick();assert.equal(messages.length,1);assert.equal(refreshes,0)
tick();assert.equal(messages.length,2);assert.equal(messages[0].requestId,messages[1].requestId)
recovery.onMessage({type:'tagged_image_jobs_result',requestId:messages[0].requestId})
assert.equal(timers.size,0,'Late reply cancels retry')
assert.equal(refreshes,1,'Other surfaces refresh after transport acknowledges recovery')
window.dispatchEvent(new window.Event('online'));tick()
tick();tick();tick();tick()
assert.equal(messages.length,6,'Retry cycle is bounded to four sends')
window.dispatchEvent(new window.Event('online'));tick()
visibility='hidden';document.dispatchEvent(new window.Event('visibilitychange'))
assert.equal(timers.size,0,'No background timers')
recovery.destroy();visibility='visible';document.dispatchEvent(new window.Event('visibilitychange'))
assert.equal(timers.size,0,'Unload removes lifecycle listeners')
globalThis.setTimeout=originalTimeout;globalThis.clearTimeout=originalClear
const widgets=new Map(),sent=[]
const ctx={sendToBackend:message=>sent.push(message),messages:{renderWidget({widgetId,html}){widgets.set(widgetId,html);return ()=>widgets.delete(widgetId)}}}
const inline=new TaggedImageController(ctx,defaultStudioBehavior(),()=>{},()=>false,()=>{})
const job={id:'saved-job',chatId:'chat',messageId:'message',slot:'one',status:'ready',inserted:true,imageUrl:'/api/v1/images/saved',alt:'Scene',prompt:'portrait'}
inline.onMessage({type:'tagged_image_jobs_result',data:[job]})
assert.equal(widgets.size,1)
assert.match([...widgets.values()][0],/alt="Scene"/)
inline.onMessage({type:'tagged_image_jobs_result',data:[job]})
assert.equal(widgets.size,1,'Repeat recovery does not duplicate images')
assert.equal(sent.length,0,'Recovery neither regenerates nor edits messages')
const figure=document.createElement('figure');figure.dataset.swarmStudioImage='true';figure.dataset.swarmStudioJobId=job.id;document.body.append(figure)
await new Promise(resolve=>originalTimeout(resolve,0))
assert.equal(widgets.size,0,'Native persisted image replaces fallback')
figure.remove();inline.onMessage({type:'tagged_image_jobs_result',data:[job]});inline.destroy()
assert.equal(widgets.size,0,'Unload cleans widgets and observer')
// Discovery requests are isolated to the parser; stale and disposed replies are ignored.
const discoveryCalls=[];let resolveOld
const controller=Object.create(StudioController.prototype)
controller.root=document.getElementById('root')
controller.root.innerHTML='<datalist data-role="parser-model-options"></datalist><p data-role="parser-connection-summary"></p>'
controller.state={permissions:{generation:true},parserConnections:[{id:'a'},{id:'b'}],parserModels:[]}
controller.behavior={parserConnectionId:'a',parserModel:'my-override'}
controller.ctx={sendToBackend(){throw Error('Public discovery must be used')},connections:{models(id){discoveryCalls.push(id);return id==='a'?new Promise(resolve=>resolveOld=resolve):Promise.resolve({models:['b-model','b-model'],model_labels:{'b-model':'Friendly B'}})}}}
const old=controller.loadParserModels();controller.behavior.parserConnectionId='b';await controller.loadParserModels()
resolveOld({models:['stale-a']});await old
assert.deepEqual(controller.state.parserModels,[{id:'b-model',label:'Friendly B'}])
assert.deepEqual(discoveryCalls,['a','b']);assert.equal(controller.behavior.parserModel,'my-override')
controller.ctx.connections.models=async()=>({error:'offline'})
await controller.loadParserModels();assert.match(controller.root.querySelector('p').textContent,/offline/)
controller.behavior.parserConnectionId='a';controller.ctx.connections.models=()=>new Promise(resolve=>resolveOld=resolve)
const pending=controller.loadParserModels();controller.disposed=true;resolveOld({models:['late']});await pending
assert.deepEqual(controller.state.parserModels,[])
dom.window.close()
console.log('foreground retries, cleanup, saved inline image recovery and live parser model discovery: ok')

// Snapshot reconciliation must settle the mini-player even without live completion events.
const {MiniPlayerController}=await import('../dist/frontend.js')
const miniDom=new JSDOM('<main></main>',{url:'https://studio.test',pretendToBeVisual:true})
for(const name of ['window','document','HTMLElement','MutationObserver','getComputedStyle'])globalThis[name]=miniDom.window[name]
const players=[]
function mini(active=true,source='tagged') {
 const root=document.createElement('div');document.body.append(root)
 const player=new MiniPlayerController({sendToBackend(){}},{root,destroy(){root.remove()}},()=>{},()=>{},()=>{},()=>null,defaultStudioBehavior(),()=>{})
 players.push(player)
 if(active)player.begin('attempt','','Fixture generation',source)
 return player
}
try {
 for(const status of ['ready','cancelled','failed']) {
  const p=mini();p.onMessage({type:'tagged_image_jobs_result',data:[{id:'tag',clientJobId:'attempt',status}]})
  assert.equal(p.snapshot().active,false,status+' snapshot clears loading')
  p.onMessage({type:'tagged_image_job',data:{id:'tag',clientJobId:'attempt',status:'generating'}})
  assert.equal(p.snapshot().active,false,'Delayed active event cannot revive terminal attempt')
 }
 const missing=mini();missing.onMessage({type:'tagged_image_jobs_result',data:[]});assert.equal(missing.snapshot().active,false)
 const manual=mini(true,'manual');manual.onMessage({type:'tagged_image_jobs_result',data:[]});assert.equal(manual.snapshot().active,true,'Tagged snapshots preserve manual generation')
 const concurrent=mini();concurrent.onMessage({type:'tagged_image_jobs_result',data:[{id:'done',clientJobId:'attempt',status:'ready'},{id:'live',clientJobId:'next',status:'generating'}]});assert.equal(concurrent.snapshot().jobId,'next');assert.equal(concurrent.snapshot().active,true)
 // Background activity must be initialized by the constructor and remain independent.
 const background=mini(true,'manual')
 background.onMessage({type:'cast_background_job',data:{groupId:'cast',key:'kitchen',status:'generating',step:2,totalSteps:8}})
 assert.equal(background.backgroundJobsSnapshot()[0].key,'kitchen')
 assert.equal(background.snapshot().jobId,'attempt','Background activity does not replace the foreground job')
 background.onMessage({type:'cast_background_job',data:{groupId:'cast',key:'kitchen',status:'ready'}})
 assert.equal(background.backgroundJobsSnapshot()[0].status,'ready')
 assert.equal(background.snapshot().active,true,'Background completion does not stop the foreground job')
} finally {
 for(const player of players)player.destroy()
 miniDom.window.close()
}
// A ready/remount strip retires as soon as the native figure mounts, including late mounting.
const stripDom=new JSDOM('<main></main>',{url:'https://studio.test'})
for(const name of ['window','document','HTMLElement','MutationObserver'])globalThis[name]=stripDom.window[name]
const strips=new Map()
const strip=new TaggedImageController({sendToBackend(){},messages:{renderWidget({widgetId,html}){strips.set(widgetId,html);return()=>strips.delete(widgetId)}}},defaultStudioBehavior(),()=>{},()=>false,()=>{})
const unattached={...job,id:'strip',inserted:false,error:'Background attachment needs recovery'}
strip.onMessage({type:'tagged_image_jobs_result',data:[unattached]});assert.equal(strips.size,1)
const mounted=document.createElement('figure');mounted.dataset.swarmStudioImage='true';mounted.dataset.swarmStudioJobId='strip';document.body.append(mounted)
await new Promise(resolve=>originalTimeout(resolve,0));assert.equal(strips.size,0,'Native image replaces Attach image strip')
strip.onMessage({type:'tagged_image_jobs_result',data:[unattached]});assert.equal(strips.size,0,'Resume cannot duplicate a native image')
mounted.remove();strip.onMessage({type:'tagged_image_jobs_result',data:[unattached]});assert.equal(strips.size,1)
strip.onMessage({type:'tagged_image_jobs_result',data:[]});assert.equal(strips.size,0,'Removed saved jobs retire their strips')
strip.destroy();stripDom.window.close()
console.log('terminal snapshots, concurrent attempts, late native image mounts and removed strips: ok')

// Completed URL output exposes a menu without recovering a second bitmap.
const urlDom=new JSDOM('<main><img alt="Authored harbor" src="/api/v1/images/saved-url"></main>',{url:'https://studio.test'})
for(const name of ['window','document','HTMLElement','MutationObserver'])globalThis[name]=urlDom.window[name]
const urlWidgets=new Map(),urlSent=[],urlActions=[]
const urlCtx={
 sendToBackend:message=>urlSent.push(message),
 ui:{async showContextMenu({items}){
  assert.deepEqual(items.filter(item=>['inpaint','replace'].includes(item.key)).map(item=>item.label),['Inpaint','Replace image…'])
  return {selectedKey:'inpaint'}
 }},
 messages:{renderWidget({widgetId,html},openMenu){urlWidgets.set(widgetId,{html,openMenu});return()=>urlWidgets.delete(widgetId)}},
}
const urlSaved={...job,id:'saved-url',output:'url',imageId:'saved-image',imageUrl:'/api/v1/images/saved-url'}
for(let mount=0;mount<2;mount++) {
 const urlInline=new TaggedImageController(urlCtx,defaultStudioBehavior(),()=>{},()=>false,()=>{},(action,target)=>urlActions.push([action,target.jobId,target.imageId]))
 urlInline.onMessage({type:'tagged_image_jobs_result',data:[urlSaved]})
 urlInline.onMessage({type:'tagged_image_job',data:urlSaved})
 assert.equal(urlWidgets.size,1,'Recovery and live completion share one URL action widget')
 const {html,openMenu}=[...urlWidgets.values()][0]
 assert.match(html,/Illustration actions for Scene/)
 assert.doesNotMatch(html,/<img|<figure/)
 openMenu({type:'menu'})
 await Promise.resolve()
 assert.equal(document.querySelectorAll('img').length,1)
 assert.equal(document.querySelector('img').alt,'Authored harbor')
 urlInline.destroy()
 assert.equal(urlWidgets.size,0)
}
assert.deepEqual(urlActions,Array(2).fill(['inpaint','saved-url','saved-image']))
assert.equal(urlSent.length,0,'URL recovery neither regenerates nor rewrites the saved message')
urlDom.window.close()
console.log('URL-only recovery, late completion and full remount: ok')

// No optimistic manual card, ready/attaching card, or stale replay after completion.
const quietDom=new JSDOM('<main><img alt="Harbor" src="/api/v1/images/quiet"></main>',{url:'https://studio.test'})
for(const name of ['window','document','HTMLElement','MutationObserver'])globalThis[name]=quietDom.window[name]
const quietTag='<swarm-image request="generate" output="url" slot="quiet">harbor</swarm-image>'
const quietPayload={chatId:'chat',messageId:'quiet-message',fullMatch:quietTag,content:'harbor',attrs:{request:'generate',output:'url',slot:'quiet'}}
const quietSaved={id:'quiet-job',chatId:'chat',messageId:'quiet-message',slot:'quiet',output:'url',tagFingerprint:'1qjubnl',clientJobId:'quiet-attempt',status:'ready',inserted:true,imageUrl:'/api/v1/images/quiet',error:''}
const quietWidgets=new Map(),quietSends=[]
let quietMounts=0
const quietCtx={sendToBackend:message=>quietSends.push(message),messages:{renderWidget({widgetId,html}){quietMounts++;quietWidgets.set(widgetId,html);return()=>quietWidgets.delete(widgetId)}}}
let quiet=new TaggedImageController(quietCtx,defaultStudioBehavior(),()=>{},()=>false,()=>{})
quiet.handleTag({...quietPayload,isStreaming:true})
quiet.handleTag({...quietPayload,isStreaming:false})
assert.equal(quietMounts,0,'A stale local auto-generation preference must not flash a Generate card')
for(const status of ['queued','generating','ready'])quiet.onMessage({type:'tagged_image_job',data:{...quietSaved,status,inserted:false}})
assert.equal(quietMounts,0,'Generation and normal attachment stay in the background')
quiet.onMessage({type:'tagged_image_job',data:{...quietSaved}})
quiet.destroy()
quiet=new TaggedImageController(quietCtx,defaultStudioBehavior(),()=>{},()=>false,()=>{})
quiet.onMessage({type:'tagged_image_jobs_result',data:[{...quietSaved}]})
quiet.handleTag({...quietPayload,isStreaming:false})
assert.equal(quietSends.filter(message=>message.type==='tag_generate').length,1,'Replaying a hydrated completed tag never starts a new request')
for(const type of ['tagged_image_job','tagged_image_jobs_result']) {
 const stale={...quietSaved,status:'requested',inserted:false,clientJobId:'',updatedAt:0}
 quiet.onMessage({type,...(type.endsWith('_result')?{data:[stale]}:{data:stale})})
}
assert.equal(quietMounts,0,'Reordered states cannot resurrect a banner beside a completed URL image')
const editedPayload={...quietPayload,fullMatch:quietTag.replace('>harbor<','>new harbor<'),content:'new harbor'}
quiet.handleTag({...editedPayload,isStreaming:false})
assert.equal(quietSends.filter(message=>message.type==='tag_generate').length,2,'A genuinely changed prompt is still submitted')
quiet.onMessage({type:'tagged_image_job',data:{...quietSaved,clientJobId:'new-attempt',status:'generating',inserted:false}})
quiet.onMessage({type:'tagged_image_job',data:{...quietSaved,clientJobId:'new-attempt',status:'failed',inserted:false,error:'Provider unavailable'}})
assert.match([...quietWidgets.values()][0],/>Retry<\/button>/,'A new attempt can fail without being hidden by an older completion')
quiet.destroy()
const manualInline=new TaggedImageController(quietCtx,defaultStudioBehavior(),()=>{},()=>false,()=>{})
manualInline.handleTag(quietPayload)
assert.equal(quietWidgets.size,0,'Manual approval also waits for the authoritative server state')
manualInline.onMessage({type:'tagged_image_job',data:{...quietSaved,status:'requested',inserted:false,clientJobId:''}})
assert.match([...quietWidgets.values()][0],/>Generate image<\/button>/)
manualInline.onMessage({type:'tagged_image_job',data:{...quietSaved,status:'ready',inserted:false,error:''}})
assert.equal(quietWidgets.size,0,'Ready images do not advertise Attach while the backend is attaching')
manualInline.onMessage({type:'tagged_image_job',data:{...quietSaved,status:'ready',inserted:false,error:'Attachment retries exhausted'}})
assert.match([...quietWidgets.values()][0],/>Attach image<\/button>/,'Exhausted attachment still offers recovery')
manualInline.destroy()
manualInline.handleTag(quietPayload)
assert.equal(quietWidgets.size,0,'Disposed controllers cannot remount banners')
quietDom.window.close()
console.log('background image lifecycle: no optimistic/attachment/replayed banners; manual generation and failure recovery preserved: ok')
