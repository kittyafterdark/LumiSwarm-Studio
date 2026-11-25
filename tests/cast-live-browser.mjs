import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {createServer} from 'node:http'
import {join} from 'node:path'
import {chromium} from 'playwright'
const frontend=await readFile(new URL('../dist/frontend.js',import.meta.url))
const bitmap=await readFile(new URL('./fixtures/studio-avatar.webp',import.meta.url))
const server=createServer((req,res)=>{
 if(req.url==='/frontend.js'){res.setHeader('Content-Type','text/javascript');res.end(frontend)}
 else if(req.url.startsWith('/api/v1/images/')){res.setHeader('Content-Type','image/webp');res.end(bitmap)}
 else res.end('<!doctype html><html><body style="background:#13141a;color:#e7e5ec;font:16px/1.6 system-ui;--lumiverse-prose-dialogue:#69b9f1"><main id="chat" style="max-width:760px;margin:24px auto"></main></body></html>')
})
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
let browser
try{
 browser=await chromium.launch({headless:true})
 const page=await browser.newPage({viewport:{width:1100,height:900}}),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto(`http://127.0.0.1:${server.address().port}`)
 await page.evaluate(async()=>{
  const{StudioCastNarrative,cleanCastLibrary}=await import('/frontend.js')
  let chatId='chat-1',messages=[],library=cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Crew'}],members:[{id:'shoto',groupId:'crew',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{neutral:{id:'neutral-image'},joy:{id:'joy-image'}}}]}),rolesReads=0
  const listeners=new Set(),events=new Map(),calls=[]
  let mountedCallback=null
  const ctx={getActiveChat:()=>({chatId}),registerDomDecorator(options){mountedCallback=options.render;return()=>{mountedCallback=null}},dom:{listMessageElements:()=>[...document.querySelectorAll('article')].map(element=>({messageId:element.id,element})),getMessageId:element=>element.closest('article')?.id||null},messages:{getContent:id=>messages.find(message=>message.id===id)?.content??null,getRecent(n){rolesReads++;return messages.slice(-n)}},events:{on(name,fn){if(!events.has(name))events.set(name,new Set());events.get(name).add(fn);return()=>events.get(name).delete(fn)}},onBackendMessage(fn){listeners.add(fn);return()=>listeners.delete(fn)},sendToBackend(message){calls.push(message);if(message.type==='load_cast_library')queueMicrotask(()=>{for(const fn of listeners)fn({type:'cast_result',requestId:message.requestId,data:library})})}}
  function emit(name,payload={}){for(const fn of events.get(name)||[])fn(payload)}
  function mount(id,role,content){messages.push({id,role,content});const article=document.createElement('article');article.id=id;article.style.cssText='padding:16px;border-bottom:1px solid #333';const p=document.createElement('p');p.append(document.createTextNode(content));article.append(p);document.querySelector('#chat').append(article);return p.firstChild}
  mount('user','user','User example: <swarm-cast=Shoto-neutral> "Leave this literal."')
  const manual=mount('manual','assistant','The room is quiet. <swarm-cast=Shoto-neutral> "I saved you a seat." A small moment, just for you.')
  const code=mount('code','assistant','');code.parentElement.innerHTML='<pre><code>&lt;swarm-cast=Shoto-joy&gt;</code></pre>'
  const narrative=new StudioCastNarrative(ctx)
  window.live={narrative,calls,events,listeners,manual,emit,mount,ctx,messages,get rolesReads(){return rolesReads},get library(){return library},notifyMount(){mountedCallback?.()},setStyle(style){library.members[0].presentation=style;for(const fn of listeners)fn({type:'cast_library_changed',library})},mountStream(){const node=mount('local-stream-placeholder','assistant','His expression softens. <swarm-cast=Shoto-jo');emit('GENERATION_STARTED');return node},nativeStreamNode:null,token(text){messages.find(message=>message.id==='local-stream-placeholder').content=text;this.nativeStreamNode.data=text;emit('STREAM_TOKEN_RECEIVED',{chatId,generationId:'g',token:text})},splitQuote(){messages.find(message=>message.id==='manual').content='A quiet room. <swarm-cast=Shoto-neutral> “I saved you a seat.”';const p=document.querySelector('#manual p');p.replaceChildren(document.createTextNode('A quiet room. <swarm-cast=Shoto-neutral> '));const q=document.createElement('span');q.style.color='var(--lumiverse-prose-dialogue)';q.append(document.createTextNode('“I saved '),document.createTextNode('you a seat.”'));p.append(q)},switchChat(){chatId='chat-2';library=cleanCastLibrary({...library,chatGroups:{'chat-2':''}});emit('CHAT_SWITCHED')},clearChat(){document.querySelector('#chat').replaceChildren();emit('CHARACTER_MESSAGE_RENDERED')}}
 })
 await page.locator('#manual [data-swarm-cast]').waitFor()
 assert.match(await page.locator('#user').innerText(),/<swarm-cast=Shoto-neutral>/)
 assert.match(await page.locator('#code').innerText(),/<swarm-cast=Shoto-joy>/)
 const portrait=page.locator('#manual [data-swarm-cast]')
 assert.equal(await portrait.locator('img').count(),1)
 assert.equal((await portrait.innerText()).split('I saved you a seat.').length-1,1)
 const geometry=await portrait.evaluate(el=>{const image=el.querySelector('img').getBoundingClientRect(),quote=el.lastElementChild.getBoundingClientRect();return{imageBottom:image.bottom,quoteTop:quote.top,display:getComputedStyle(el).display,color:getComputedStyle(el.lastElementChild).color}})
 assert.equal(geometry.display,'block');assert.ok(geometry.quoteTop>=geometry.imageBottom);assert.equal(geometry.color,'rgb(105, 185, 241)')
 await page.evaluate(()=>live.splitQuote())
 await page.waitForFunction(()=>document.querySelector('#manual [data-swarm-cast]')?.textContent.includes('I saved you a seat.'))
 assert.equal((await page.locator('#manual').innerText()).split('I saved you a seat.').length-1,1,'Dialogue styled across native text nodes is moved once')
 await page.evaluate(()=>live.setStyle('sticker'))
 await page.waitForFunction(()=>document.querySelector('#manual [data-swarm-cast] img')?.parentElement.style.borderRadius==='50%')
 await page.evaluate(()=>live.setStyle('story'))
 await page.waitForFunction(()=>document.querySelector('#manual [data-swarm-cast]')?.style.display==='inline-flex'&&document.querySelector('#manual [data-swarm-cast]')?.style.width==='360px')
 assert.equal((await page.locator('#manual').innerText()).split('I saved you a seat.').length-1,1)
 await page.evaluate(()=>{live.nativeStreamNode=live.mountStream()})
 await page.evaluate(()=>live.token('His expression softens. <swarm-cast=Shoto-joy> "You '))
 await page.locator('#local-stream-placeholder img[src$=joy-image]').waitFor()
 await page.evaluate(()=>live.token('His expression softens. <swarm-cast=Shoto-joy> "You told me the plan."'))
 await page.waitForFunction(()=>document.querySelector('#local-stream-placeholder [data-swarm-cast]')?.textContent.includes('You told me the plan.'))
 assert.equal(await page.locator('#local-stream-placeholder img').count(),1,'Repeated stream updates do not duplicate images')
 assert.equal((await page.locator('#local-stream-placeholder').innerText()).split('You told me the plan.').length-1,1)
 assert.equal(await page.evaluate(()=>live.calls.filter(call=>/update.*message|save.*message/i.test(call.type)).length),0,'Streaming and presentation changes do not write message history')
 await page.evaluate(()=>live.setStyle('portrait'))
 await page.waitForFunction(()=>document.querySelector('#local-stream-placeholder [data-swarm-cast]')?.style.display==='block')
 for(const width of[1100,390,320]){await page.setViewportSize({width,height:900});assert.ok(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth+1));const box=await page.locator('#local-stream-placeholder [data-swarm-cast]').evaluate(el=>{const image=el.querySelector('img').getBoundingClientRect(),quote=el.lastElementChild.getBoundingClientRect();return{bottom:image.bottom,top:quote.top}});assert.ok(box.top>=box.bottom)}
 const out=process.env.STUDIO_SCREENSHOT_DIR
 if(out){await mkdir(out,{recursive:true});await page.setViewportSize({width:1100,height:900});await page.screenshot({path:join(out,'live-portrait-dialogue.png'),fullPage:true})}
 // Production-shaped stream updates replace the native HTML, then the final
 // sanitizer strips the unknown Cast tag. The source still retains that tag.
 await page.evaluate(()=>{
  live.library.members[0].images.confusion={id:'confusion-image',url:'/api/v1/images/confusion-image'}
  live.setStyle('portrait')
  live.authoredQuote='"Your harness was twisted since the pharmacy. You usually notice that before I do."'
  live.rawFontSource='<swarm-cast=Shoto-confusion>\n<font\u2800color="#599CE3">'+live.authoredQuote.replaceAll(' ','\u2800')+'</font>'
  live.mount('font-stream','assistant',live.rawFontSource)
  live.nativeFontHTML=(final=false,tail='')=>(final?'':'&lt;swarm-cast=Shoto-confusion&gt;\n')+'<font color="#599CE3">'+live.authoredQuote.replace('usually','<em>usually</em>')+'</font><p><font color="#f0a000">Another speaker stays orange.</font> '+tail+'</p>'
  document.querySelector('#font-stream p').innerHTML=live.nativeFontHTML()
  live.emit('GENERATION_STARTED');live.emit('STREAM_TOKEN_RECEIVED',{chatId:'chat-1'});live.notifyMount()
 })
 await page.locator('#font-stream img[src$=confusion-image]').waitFor()
 await page.evaluate(()=>live.stableImage=document.querySelector('#font-stream img'))
 assert.equal(await page.locator('#font-stream [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(89, 156, 227)')
 assert.ok(await page.locator('#font-stream [data-swarm-cast-dialogue] em').count()>0,'Native inline emphasis is retained')
 for(let index=0;index<12;index++){
  await page.evaluate(index=>{document.querySelector('#font-stream p').innerHTML=live.nativeFontHTML(false,'Streaming tail '+index);live.emit('STREAM_TOKEN_RECEIVED',{chatId:'chat-1'})},index)
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
  assert.ok(await page.evaluate(()=>document.querySelector('#font-stream img')===live.stableImage),'Streaming commits reuse the same image before paint')
  assert.equal(await page.locator('#font-stream [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(89, 156, 227)')
 }
 await page.evaluate(()=>live.emit('GENERATION_ENDED',{chatId:'chat-1',messageId:'font-final'}))
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
 await page.evaluate(()=>{
  const message=live.messages.find(message=>message.id==='font-stream');message.id='font-final'
  const old=document.querySelector('#font-stream'),final=document.createElement('article');final.id='font-final';final.style.cssText=old.style.cssText
  const p=document.createElement('p');p.innerHTML=live.nativeFontHTML(true,'Completed response.');final.append(p);old.replaceWith(final)
  // This callback is the real public message_body_after mount contract. It is
  // deliberately later than GENERATION_ENDED, as in the actual host handoff.
  live.notifyMount()
 })
 await page.locator('#font-final img[src$=confusion-image]').waitFor()
 assert.ok(await page.evaluate(()=>document.querySelector('#font-final img')===live.stableImage),'The final bubble adopts the streaming image instead of dropping it')
 for(let frame=0;frame<8;frame++){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));assert.equal(await page.locator('#font-final img').count(),1)}
 assert.equal((await page.locator('#font-final').innerText()).split('Your harness was twisted').length-1,1)
 assert.equal(await page.locator('#font-final [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(89, 156, 227)')
 assert.equal(await page.locator('#font-final font[color="#f0a000"]').evaluate(el=>getComputedStyle(el).color),'rgb(240, 160, 0)')
 if(process.env.STUDIO_SCREENSHOT_DIR){await mkdir(process.env.STUDIO_SCREENSHOT_DIR,{recursive:true});await page.locator('#font-final').screenshot({path:join(process.env.STUDIO_SCREENSHOT_DIR,'cast-final-blue-font.png')})}
 for(const style of['sticker','story','portrait']){await page.evaluate(style=>live.setStyle(style),style);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));assert.ok(await page.evaluate(()=>document.querySelector('#font-final img')===live.stableImage));assert.equal(await page.locator('#font-final [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(89, 156, 227)')}
 // Direct edits with normal spaces also survive final sanitization and preserve
 // the newly authored color, rather than restoring an old cached quote.
 await page.evaluate(()=>{
  live.messages.find(message=>message.id==='font-final').content='<swarm-cast=Shoto-confusion>\n<font color="#d178e0">"A directly edited line."</font>'
  document.querySelector('#font-final p').innerHTML='<font color="#d178e0">"A directly edited line."</font>'
  live.emit('MESSAGE_EDITED')
 })
 await page.waitForFunction(()=>document.querySelector('#font-final [data-swarm-cast-dialogue]')?.textContent==='"A directly edited line."')
 assert.equal(await page.locator('#font-final [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(209, 120, 224)')
 assert.ok(await page.evaluate(()=>document.querySelector('#font-final img')===live.stableImage))
 await page.evaluate(()=>{live.mount('before-quote','assistant','A pause. "A preceding line." <swarm-cast=Shoto-neutral>');live.notifyMount()})
 await page.locator('#before-quote img').waitFor()
 assert.equal((await page.locator('#before-quote').innerText()).split('A preceding line.').length-1,1,'Preceding dialogue is paired without duplication')
 await page.evaluate(()=>{live.mount('only-tag','assistant','<swarm-cast=Shoto-joy>');document.querySelector('#only-tag p').replaceChildren();live.notifyMount()})
 await page.locator('#only-tag img[src$=joy-image]').waitFor()
 // Regression: host sanitization can swallow an entire tag + quote, leaving
 // no native text nodes to anchor to. All spacing variants must recover from
 // the saved assistant source without losing the portrait or duplicating prose.
 const recoveredQuote='"Your harness was twisted since the pharmacy. You usually notice that before I do."'
 const recoveryCases=[
  ['recovery-space',`<swarm-cast=Shoto-confusion> ${recoveredQuote}`],
  ['recovery-tight',`<swarm-cast=Shoto-confusion>${recoveredQuote}`],
  ['recovery-newline',`<swarm-cast=Shoto-confusion>\n${recoveredQuote}`],
  ['recovery-font',`<swarm-cast=Shoto-confusion>\n<font color="#599CE3">${recoveredQuote}</font>`],
 ]
 await page.evaluate(cases=>{for(const[id,source]of cases)live.mount(id,'assistant',source);live.notifyMount()},recoveryCases)
 for(const[id]of recoveryCases){
  await page.waitForFunction(id=>document.querySelector(`#${id} [data-swarm-cast-dialogue]`)?.textContent.includes('Your harness was twisted'),id)
  assert.equal((await page.locator(`#${id}`).innerText()).split('Your harness was twisted').length-1,1)
 }
 await page.evaluate(cases=>{
  for(const[id]of cases){const article=document.getElementById(id),p=document.createElement('p');article.replaceChildren(p)}
  live.notifyMount()
 },recoveryCases)
 for(const[id]of recoveryCases){
  await page.waitForFunction(id=>document.querySelector(`#${id} [data-swarm-cast-dialogue]`)?.textContent.includes('Your harness was twisted'),id)
  assert.equal(await page.locator(`#${id} img`).count(),1,`${id} image survives sanitization`)
  assert.equal((await page.locator(`#${id}`).innerText()).split('Your harness was twisted').length-1,1,`${id} dialogue is painted once`)
  assert.equal(await page.locator(`#${id} [data-swarm-cast-dialogue]`).evaluate(el=>el.hidden),false)
 }
 assert.equal(await page.locator('#recovery-font [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(89, 156, 227)','Source color survives when native styled quote is deleted')
 // Unlike a completely empty <p>, some host commits leave zero-width
 // sentinels or a thought-summary fragment. Those are not valid anchors and
 // must never cause a source-backed expression to disappear.
 await page.evaluate(cases=>{
  for(const[id]of cases){
   const article=document.getElementById(id),p=document.createElement('p')
   p.textContent=id==='recovery-newline'?'Thought for 21s':'\u200b'
   article.replaceChildren(p)
   // Simulate an API projection temporarily returning sanitized content, too.
   live.messages.find(message=>message.id===id).content=p.textContent
  }
  live.notifyMount()
 },recoveryCases)
 for(const[id]of recoveryCases){
  await page.waitForFunction(id=>document.querySelector(`#${id} [data-swarm-cast-dialogue]`)?.textContent.includes('Your harness was twisted'),id)
  assert.equal(await page.locator(`#${id} img`).count(),1,`${id} remains mounted with sanitizer residue`)
  assert.equal(await page.locator(`#${id} [data-swarm-cast-dialogue]`).evaluate(el=>el.hidden),false)
  assert.equal((await page.locator(`#${id}`).innerText()).split('Your harness was twisted').length-1,1,'Cached source must not create duplicate dialogue')
 }
 // An HTML-escaped tag from an intermediate source API is still a Cast
 // packet, even though a browser template would otherwise see only text.
 await page.evaluate(()=>{
  live.mount('escaped-source','assistant','&lt;swarm-cast=Shoto-confusion&gt;\n"A safely recovered line."')
  document.querySelector('#escaped-source p').textContent='\u200b'
  live.notifyMount()
 })
 await page.waitForFunction(()=>document.querySelector('#escaped-source [data-swarm-cast-dialogue]')?.textContent.includes('A safely recovered line.'))
 assert.equal(await page.locator('#escaped-source img').count(),1)
 // The host can also retain the raw tag while dropping only the quote. The
 // incomplete native plan must not override the complete saved source plan.
 await page.evaluate(()=>{
  document.getElementById('recovery-font').replaceChildren(document.createTextNode('<swarm-cast=Shoto-confusion>'))
  live.notifyMount()
 })
 await page.waitForFunction(()=>document.querySelector('#recovery-font [data-swarm-cast-dialogue]')?.textContent.includes('Your harness was twisted'))
 assert.equal((await page.locator('#recovery-font').innerText()).split('Your harness was twisted').length-1,1,'Literal tag with sanitized quote recovers source caption')
 assert.equal(await page.locator('#recovery-font img').count(),1)
 // Full prose around a Cast packet is allowed to survive the host commit, even
 // when the inline tag and dialogue disappear completely.
 const front='His gloved fingers were warm against the black nylon. Katsuki stilled on instinct, red eyes narrowing immediately.'
 const tail='Katsuki\'s pulse kicked once, annoyingly hard, right under Shoto\'s hand.'
 const fullSource=`${front}\n\n<swarm-cast=Shoto-confusion>\n${recoveredQuote}\n\n${tail}`
 await page.evaluate(({front,tail,source})=>{
  const node=live.mount('recovery-paragraphs','assistant',source)
  const article=node.parentElement
  article.replaceChildren(...[front,`<swarm-cast=Shoto-confusion>\n${live.authoredQuote}`,tail].map(text=>{const p=document.createElement('p');p.textContent=text;return p}))
  live.notifyMount()
 },{front,tail,source:fullSource})
 await page.waitForFunction(()=>document.querySelector('#recovery-paragraphs [data-swarm-cast-dialogue]')?.textContent.includes('Your harness was twisted'))
 await page.evaluate(({front,tail})=>{
  document.getElementById('recovery-paragraphs').replaceChildren(...[front,tail].map(text=>{const p=document.createElement('p');p.textContent=text;return p}))
  live.notifyMount()
 },{front,tail})
 await page.waitForFunction(()=>document.querySelector('#recovery-paragraphs [data-swarm-cast-dialogue]')?.textContent.includes('Your harness was twisted'))
 const recoveredBody=await page.locator('#recovery-paragraphs').innerText()
 for(const fragment of [front,tail,'Your harness was twisted'])assert.equal(recoveredBody.split(fragment).length-1,1,`Full narrative conserves ${fragment.slice(0,30)}`)
 assert.equal(await page.locator('#recovery-paragraphs img').count(),1,'Portrait survives a multi-paragraph sanitized commit')
 const colorEvidence=process.env.STUDIO_SCREENSHOT_DIR
 if(colorEvidence){await mkdir(colorEvidence,{recursive:true});await page.screenshot({path:join(colorEvidence,'cast-final-authored-color.png'),fullPage:true})}

 // Host formatting classes can depend on their original parent structure.
 // Copying them into a Cast caption must never make consumed dialogue invisible.
 await page.addStyleTag({content:'.host-quote-fragment{display:none}.native-prose > p > font > .host-quote-fragment{display:inline;color:#599ce3;font-style:italic}'})
 await page.evaluate(()=>{
  live.mount('contextual-dialogue','assistant','<swarm-cast=Shoto-neutral> <font color="#599CE3">"The sealant is not cured. Please step around it."</font>')
  const article=document.querySelector('#contextual-dialogue');article.className='native-prose'
  article.querySelector('p').innerHTML='&lt;swarm-cast=Shoto-neutral&gt; <font color="#599CE3"><span class="host-quote-fragment">"The sealant is not cured. Please step around it."</span></font>'
  live.notifyMount()
 })
 await page.locator('#contextual-dialogue img').waitFor()
 for(const style of['story','sticker','portrait']){
  await page.evaluate(style=>live.setStyle(style),style)
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
  assert.equal((await page.locator('#contextual-dialogue').innerText()).split('The sealant is not cured.').length-1,1,'Dialogue must be painted once, not merely present in hidden DOM')
  const painted=await page.locator('#contextual-dialogue [data-swarm-cast-dialogue]').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);return [...range.getClientRects()].some(rect=>rect.width>0&&rect.height>0)})
  assert.ok(painted,'The paired dialogue has a visible text box in every presentation')
  assert.equal(await page.locator('#contextual-dialogue [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(89, 156, 227)')
  if(process.env.STUDIO_SCREENSHOT_DIR)await page.locator('#contextual-dialogue').screenshot({path:join(process.env.STUDIO_SCREENSHOT_DIR,'dialogue-visible-'+style+'.png')})
 }
 // If a host update clears an owned caption, its cached signature must not
 // prevent repair while the original text is already hidden.
 await page.evaluate(()=>document.querySelector('#contextual-dialogue [data-swarm-cast-dialogue]').replaceChildren())
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
 assert.equal((await page.locator('#contextual-dialogue').innerText()).split('The sealant is not cured.').length-1,1,'A cleared caption is repaired before paint')
 const blocked=await page.addStyleTag({content:'#fallback-dialogue [data-swarm-cast-dialogue]{display:none!important}'})
 await page.evaluate(()=>{live.mount('fallback-dialogue','assistant','<swarm-cast=Shoto-neutral> "Keep this line visible even if the replacement is hidden."');live.notifyMount()})
 await page.locator('#fallback-dialogue img').waitFor()
 assert.equal((await page.locator('#fallback-dialogue').innerText()).split('Keep this line visible').length-1,1,'A hidden replacement leaves native dialogue visible')
 await blocked.evaluate(el=>el.remove())
 await page.evaluate(()=>window.dispatchEvent(new Event('lumiverse:message-content-layout')))
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)))
 assert.equal((await page.locator('#fallback-dialogue').innerText()).split('Keep this line visible').length-1,1,'Recovery from a hidden caption does not duplicate the line')

 // Repeated paragraphs must not anchor a sanitized tag at the first matching
 // "paragraph" fragment. An open response editor must never host Cast artwork.
 await page.evaluate(()=>{
  const before=('paragraph ').repeat(140).trim()+'.'
  const after=('paragraph ').repeat(180).trim()+'.'
  const line='"Your harness was twisted since the pharmacy. You usually notice that before I do."'
  const source=before+'\n\n<swarm-cast=Shoto-confusion>'+line+'\n\n'+after
  live.mount('mid-repeated','assistant',source)
  const article=document.querySelector('#mid-repeated')
  const first=document.createElement('p'),last=document.createElement('p')
  first.id='mid-before';first.textContent=before
  last.id='mid-after';last.textContent=after
  article.replaceChildren(first,last)
  live.middle={before,after,line,article}
  live.notifyMount()
 })
 await page.waitForFunction(()=>{
  const slot=document.querySelector('#mid-repeated [data-ss-cast-live]')
  return slot?.previousElementSibling?.id==='mid-before'&&slot.nextElementSibling?.id==='mid-after'&&slot.querySelector('[data-swarm-cast-dialogue]')?.textContent===live.middle.line
 })
 assert.equal(await page.locator('#mid-before').innerText(),await page.evaluate(()=>live.middle.before),'Prose before Cast remains intact')
 assert.equal(await page.locator('#mid-after').innerText(),await page.evaluate(()=>live.middle.after),'Prose after Cast remains intact')
 await page.evaluate(()=>{
  const form=document.createElement('form');form.id='mid-response-editor'
  form.innerHTML='<label>RESPONSE<textarea aria-label="Edit response"></textarea></label>'
  form.querySelector('textarea').value=live.messages.find(m=>m.id==='mid-repeated').content
  live.middle.article.prepend(form)
 })
 await page.waitForFunction(()=>document.querySelectorAll('#mid-repeated [data-ss-cast-live]').length===0)
 assert.equal(await page.locator('#mid-repeated textarea').count(),1,'Native response editor is left alone')
 await page.evaluate(()=>document.querySelector('#mid-response-editor').remove())
 await page.waitForFunction(()=>{
  const slot=document.querySelector('#mid-repeated [data-ss-cast-live]')
  return slot?.previousElementSibling?.id==='mid-before'&&slot.nextElementSibling?.id==='mid-after'
 })
 for(const separator of[' ','','\n']){
  await page.evaluate(separator=>{
   const m=live.messages.find(m=>m.id==='mid-repeated')
   m.content=live.middle.before+'\n\n<swarm-cast=Shoto-confusion>'+separator+live.middle.line+'\n\n'+live.middle.after
   live.emit('MESSAGE_EDITED',{messageId:m.id})
  },separator)
  await page.waitForFunction(()=>{
   const slot=document.querySelector('#mid-repeated [data-ss-cast-live]')
   return slot?.previousElementSibling?.id==='mid-before'&&slot.nextElementSibling?.id==='mid-after'&&slot.querySelector('[data-swarm-cast-dialogue]')?.textContent===live.middle.line
  })
 }
 await page.evaluate(()=>{
  const form=document.createElement('form');form.id='mid-response-editor'
  form.innerHTML='<textarea aria-label="Edit response"></textarea>'
  live.middle.article.prepend(form)
  const m=live.messages.find(m=>m.id==='mid-repeated')
  m.content='A new reply without any Cast tag.'
  document.querySelector('#mid-before').textContent=m.content
  document.querySelector('#mid-after').remove()
  form.remove()
  live.emit('MESSAGE_EDITED',{messageId:m.id})
 })
 await page.waitForFunction(()=>document.querySelectorAll('#mid-repeated [data-ss-cast-live]').length===0)
 assert.equal((await page.locator('#mid-repeated').innerText()).trim(),'A new reply without any Cast tag.','Saved edit cannot retain an old expression')

 // Some hosts enumerate an inner message body but place Edit beside it.
 // Observing only the inner body misses the editor opening entirely.
 await page.evaluate(()=>{
  live.mount('nested-editor-case','assistant','<swarm-cast=Shoto-confusion> '+live.middle.line)
  const article=document.querySelector('#nested-editor-case')
  const body=document.createElement('div');body.className='nested-message-body';body.textContent=''
  article.replaceChildren(body)
  const existing=live.ctx.dom.listMessageElements
  live.ctx.dom.listMessageElements=()=>existing().map(item=>item.messageId==='nested-editor-case'?{...item,element:body}:item)
  live.notifyMount()
 })
 await page.locator('#nested-editor-case .nested-message-body [data-swarm-cast]').waitFor()
 await page.evaluate(()=>{
  const editor=document.createElement('div');editor.id='sibling-editor'
  editor.innerHTML='<textarea aria-label="Edit response"></textarea>'
  document.querySelector('#nested-editor-case').append(editor)
 })
 await page.waitForFunction(()=>document.querySelectorAll('#nested-editor-case [data-ss-cast-live]').length===0)
 await page.evaluate(()=>document.querySelector('#sibling-editor').remove())
 await page.locator('#nested-editor-case .nested-message-body [data-swarm-cast]').waitFor()

 // R4: two styled quotes must survive a sanitizer commit within one long
 // message. The first and second caption retain independent authored colors.
 await page.evaluate(()=>{
  const quote1='"First blue expression."',quote2='"Second amber expression."'
  const source=[
   'Before the first portrait.',
   '<swarm-cast=Shoto-confusion>','<font color="#599CE3">'+quote1+'</font>',
   'Between the two portraits.',
   '<swarm-cast=Shoto-neutral>','<font color="#FFC524">'+quote2+'</font>',
   'After the second portrait.',
  ].join('\n\n')
  live.mount('multi-styled','assistant',source)
  const article=document.querySelector('#multi-styled')
  article.innerHTML='<p>Before the first portrait.</p><p>Between the two portraits.</p><p>After the second portrait.</p>'
  live.notifyMount()
 })
 await page.waitForFunction(()=>document.querySelectorAll('#multi-styled [data-swarm-cast-dialogue]').length===2)
 assert.deepEqual(await page.locator('#multi-styled [data-swarm-cast-dialogue]').evaluateAll(els=>els.map(el=>getComputedStyle(el).color)),['rgb(89, 156, 227)','rgb(255, 197, 36)'])
 assert.equal((await page.locator('#multi-styled').innerText()).split('First blue expression.').length-1,1)
 assert.equal((await page.locator('#multi-styled').innerText()).split('Second amber expression.').length-1,1)
 // The processed DOM may keep the words but strip the <font> wrapper. Copying
 // generic inherited text paint into a cloned span must not override source color.
 await page.evaluate(()=>{
  live.mount('unstyled-native','assistant','<swarm-cast=Shoto-confusion> <font color="#599CE3">"Native words lost their font wrapper."</font>')
  document.querySelector('#unstyled-native p').innerHTML='&lt;swarm-cast=Shoto-confusion&gt; <span>"Native words lost their font wrapper."</span>'
  live.notifyMount()
 })
 await page.waitForFunction(()=>document.querySelector('#unstyled-native [data-swarm-cast-dialogue]')?.textContent.includes('Native words lost their font wrapper.'))
 assert.equal(await page.locator('#unstyled-native [data-swarm-cast-dialogue]').evaluate(el=>getComputedStyle(el).color),'rgb(89, 156, 227)')
 assert.equal((await page.locator('#unstyled-native').innerText()).split('Native words lost their font wrapper.').length-1,1)
 // Synthetic scrolling and toolbar hover churn must not remount or rewrite a
 // settled expression. Observe the message, excluding the deliberate toolbar
 // mutations from the count.
 await page.evaluate(()=>{
  const article=document.querySelector('#multi-styled')
  const toolbar=document.createElement('nav');toolbar.setAttribute('role','toolbar')
  toolbar.innerHTML='<button type="button">Actions</button>';article.append(toolbar)
  window.r4Scroll={toolbar,changes:0,images:[...article.querySelectorAll('[data-swarm-cast] img')]}
  const observer=new MutationObserver(records=>{
   window.r4Scroll.changes+=records.filter(record=>!(record.target instanceof Element&&record.target.closest('[role="toolbar"]'))).length
  })
  observer.observe(article,{childList:true,characterData:true,subtree:true,attributes:true})
  window.r4Scroll.observer=observer
 })
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
 await page.evaluate(()=>{
  for(let i=0;i<100;i++){
   window.dispatchEvent(new Event('scroll'))
   document.dispatchEvent(new Event('scroll'))
   window.r4Scroll.toolbar.style.opacity=String(.8+(i%3)*.1)
  }
 })
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))))
 assert.equal(await page.evaluate(()=>window.r4Scroll.changes),0,'Scroll/toolbar updates do not rewrite settled Cast DOM')
 assert.ok(await page.evaluate(()=>window.r4Scroll.images.every((img,index)=>document.querySelectorAll('#multi-styled [data-swarm-cast] img')[index]===img)),'Images remain identical across scroll')
 await page.evaluate(()=>window.r4Scroll.observer.disconnect())
 // R4: after the streaming element is replaced, mutations on the FINAL
 // element must reach the retargeted observer without requiring a swipe/event.
 await page.evaluate(()=>{
  live.mount('r4-stream','assistant','<swarm-cast=Shoto-confusion> "The old streamed line."')
  document.querySelector('#r4-stream p').textContent='\u200b'
  live.emit('GENERATION_STARTED')
  live.emit('STREAM_TOKEN_RECEIVED')
  live.notifyMount()
 })
 await page.waitForFunction(()=>document.querySelector('#r4-stream [data-swarm-cast-dialogue]')?.textContent==='"The old streamed line."')
 await page.evaluate(()=>{
  live.r4Image=document.querySelector('#r4-stream img')
  live.emit('GENERATION_ENDED',{messageId:'r4-final'})
  const previous=document.querySelector('#r4-stream'),article=document.createElement('article')
  article.id='r4-final';article.innerHTML='<p>\u200b</p>';previous.replaceWith(article)
  live.messages.find(m=>m.id==='r4-stream').id='r4-final'
  live.notifyMount()
 })
 await page.waitForFunction(()=>document.querySelector('#r4-final img')===live.r4Image)
 await page.evaluate(()=>{
  live.messages.find(m=>m.id==='r4-final').content='<swarm-cast=Shoto-confusion> "Updated after final commit."'
  document.querySelector('#r4-final p').textContent='<swarm-cast=Shoto-confusion> "Updated after final commit."'
 })
 await page.waitForFunction(()=>document.querySelector('#r4-final [data-swarm-cast-dialogue]')?.textContent==='"Updated after final commit."')
 assert.equal((await page.locator('#r4-final').innerText()).split('Updated after final commit.').length-1,1)

 // Swiping/remounting supplies new host nodes; stale decorations must disappear.
 await page.evaluate(()=>{const p=document.querySelector('#manual p');const content='A different swipe, with no expression.';live.messages.find(message=>message.id==='manual').content=content;p.replaceChildren(document.createTextNode(content));live.emit('MESSAGE_SWIPED',{messageId:'manual'})})
 await page.waitForFunction(()=>document.querySelectorAll('#manual [data-swarm-cast]').length===0)
 await page.evaluate(()=>live.switchChat())
 await page.waitForFunction(()=>document.querySelectorAll('[data-ss-cast-live]').length===0)
 assert.match(await page.locator('#local-stream-placeholder').innerText(),/<swarm-cast=Shoto-joy>/)
 await page.evaluate(()=>live.narrative.destroy())
 assert.equal(await page.evaluate(()=>live.listeners.size+[...live.events.values()].reduce((sum,set)=>sum+set.size,0)),0)
 assert.deepEqual(errors,[])
 console.log('Cast live browser PASS: stable image identity over HTML stream commits, delayed sanitized final mount/handoff, exact braille/font-color example, normal-space edits, rich dialogue, live presentation swaps, preceding/tag-only messages, painted dialogue conservation in every presentation, hidden/cleared caption recovery, no history writes and teardown')
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
