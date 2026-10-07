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
