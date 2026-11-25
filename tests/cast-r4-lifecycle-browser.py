"""Optional Chromium torture harness for Cast lifecycle regressions.
Requires Python Playwright and a local Chromium binary. No Lumiverse install.
Run: python tests/cast-r4-lifecycle-browser.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os

ROOT = Path(__file__).resolve().parents[1]
errors=[]
try:
 with sync_playwright() as p:
  browser = p.chromium.launch(headless=True, executable_path=os.getenv('CAST_CHROME','/usr/bin/chromium'), args=['--no-sandbox'])
  page = browser.new_page(viewport={'width':1200,'height':800})
  page.on('pageerror', lambda err: errors.append(str(err)))
  page.goto('about:blank')
  page.set_content('<!doctype html><html><head><style>body{color:white;background:black;font:16px/1.5 system-ui}article{padding:12px;border:1px solid #333;margin:10px auto;max-width:900px;min-height:20px}main{max-width:1100px;margin:auto}</style></head><body><main id="chat"></main></body></html>')
  page.evaluate('''async source => {const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})); window.castModule=await import(url); URL.revokeObjectURL(url);const el=document.createElement('style');el.textContent=window.castModule.CAST_PRESENTATION_CSS;document.head.append(el)}''', (ROOT/'dist/frontend.js').read_text())
  page.evaluate('''async () => {
    const {StudioCastNarrative,cleanCastLibrary}=window.castModule
    let chatId='c1'
    const messages=[]; const hooks=new Set(); const events=new Map()
    let decorator=null, reads=0, backendReads=0
    const library=cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Crew',defaultPresentation:'portrait'}],members:[{id:'shoto',groupId:'crew',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{confusion:{id:'shotoimg'},neutral:{id:'shotoimg2'}}}]})
    const context={
      getActiveChat:()=>({chatId}),
      registerDomDecorator(options){decorator=options.render;return()=>{decorator=null}},
      dom:{listMessageElements:()=>[...document.querySelectorAll('article')].map(element=>({messageId:element.id,element})),getMessageId:element=>element.closest('article')?.id||null},
      messages:{getContent:id=>messages.find(m=>m.id===id)?.content??null,getRecent(n){reads++;return messages.slice(-n)}},
      events:{on(event,fn){if(!events.has(event))events.set(event,new Set());events.get(event).add(fn);return()=>events.get(event).delete(fn)}},
      onBackendMessage(fn){hooks.add(fn);return()=>hooks.delete(fn)},
      sendToBackend(payload){if(payload.type==='load_cast_library')queueMicrotask(()=>{for(const fn of hooks)fn({type:'cast_result',requestId:payload.requestId,data:library})});if(payload.type==='load_cast_roles')backendReads++}
    }
    function emit(event,payload={}){for(const fn of events.get(event)||[])fn(payload)}
    function mount(id,content,html){messages.push({id,role:'assistant',content});let el=document.createElement('article');el.id=id;el.innerHTML=html;document.querySelector('#chat').append(el);return el}
    const line='"Your harness was twisted since the pharmacy. You usually notice that before I do."'
    mount('basic','<swarm-cast=Shoto-confusion> '+line,'<p>\\u200b</p>')
    mount('tight','<swarm-cast=Shoto-confusion>'+line,'<p>\\u200b</p>')
    mount('newline','<swarm-cast=Shoto-confusion>\\n'+line,'<p>\\u200b</p>')
    const two=[
      'Before first.','<swarm-cast=Shoto-confusion>','<font color="#599CE3">"First blue sentence."</font>',
      'Between the two.','<swarm-cast=Shoto-neutral>','<font color="#ffc524">"Second gold sentence."</font>',
      'After second.'
    ].join('\\n\\n')
    mount('colored',two,'<p id="before">Before first.</p><p id="between">Between the two.</p><p id="after">After second.</p>')
    mount('mutable','<swarm-cast=Shoto-confusion> '+line,'<p>\\u200b</p>')
    mount('unstyled-host','<swarm-cast=Shoto-confusion> <font color="#599CE3">"Host kept these words, but lost their color."</font>',
      '<p>&lt;swarm-cast=Shoto-confusion&gt; <span>"Host kept these words, but lost their color."</span></p>')
    const narrative=new StudioCastNarrative(context)
    window.testCast={context,messages,emit,mount,line,narrative,library,notifyLibrary(){for(const fn of hooks)fn({type:'cast_library_changed',library})},getReads(){return reads},getBackendReads(){return backendReads},notify(){decorator?.()}}
  }''')
  page.wait_for_function("document.querySelectorAll('#colored [data-ss-cast-live]').length===2 && document.querySelectorAll('#basic [data-ss-cast-live]').length===1")
  for id in ('basic','tight','newline','mutable'):
   assert page.locator(f'#{id} [data-swarm-cast-dialogue]').inner_text()== '"Your harness was twisted since the pharmacy. You usually notice that before I do."',id
  assert page.locator('#colored [data-swarm-cast-dialogue]').count()==2
  page.wait_for_function("document.querySelector('#unstyled-host [data-swarm-cast-dialogue]')?.textContent.includes('Host kept these words')")
  assert page.locator('#unstyled-host [data-swarm-cast-dialogue]').evaluate('(el)=>getComputedStyle(el).color')=='rgb(89, 156, 227)', 'Authored color must win over stripped host default color'
  assert page.locator('#unstyled-host').inner_text().count('Host kept these words')==1, 'No duplicate native quote' 
  assert page.locator('#colored [data-swarm-cast-dialogue]').nth(0).inner_text()=='"First blue sentence."'
  assert page.locator('#colored [data-swarm-cast-dialogue]').nth(1).inner_text()=='"Second gold sentence."'
  colors=page.locator('#colored [data-swarm-cast-dialogue]').evaluate_all('(els)=>els.map(el=>getComputedStyle(el).color)')
  assert colors==['rgb(89, 156, 227)','rgb(255, 197, 36)'], colors
  # The first and last prose blocks must remain on their respective sides of both expressions.
  sequence=page.locator('#colored').evaluate('(el)=>[...el.children].map(x=>x.id||x.dataset.ssCastLive||x.tagName)')
  print('COLOR ORDER:',sequence,'COLORS:',colors)
  assert sequence.index('before') < sequence.index('between') < sequence.index('after')
  page.evaluate('''() => {
    const el=document.querySelector('#colored')
    const toolbar=document.createElement('div');toolbar.setAttribute('role','toolbar');toolbar.innerHTML='<button type="button">Edit</button>';el.append(toolbar)
    window.testCast.toolbar=toolbar
    window.testCast.changes=0
    window.testCast.obs=new MutationObserver(records=>{window.testCast.changes+=records.filter(r=>!(r.target instanceof Element && r.target.closest('[role="toolbar"]'))).length})
    window.testCast.obs.observe(document.querySelector('#colored'),{subtree:true,childList:true,characterData:true,attributes:true})
  }''')
  page.wait_for_timeout(100)
  before=page.evaluate('({recs:testCast.changes,reads:testCast.getReads(),backend:testCast.getBackendReads(),images:document.querySelectorAll("#colored img").length})')
  page.evaluate('''() => {
    for(let i=0;i<100;i++){
      window.dispatchEvent(new Event('scroll'))
      document.dispatchEvent(new Event('scroll'))
      testCast.toolbar.style.opacity=String(.8+(i%3)*.1)
    }
  }''')
  page.wait_for_timeout(180)
  after=page.evaluate('({recs:testCast.changes,reads:testCast.getReads(),backend:testCast.getBackendReads(),images:document.querySelectorAll("#colored img").length})')
  print('SCROLL STABILITY:', before,after)
  assert after['backend']==before['backend'], 'No backend role reads on scroll'
  assert after['recs']-before['recs']<=3, 'Cast must not write the settled DOM while scrolling'
  assert after['images']==2
  # External replacement/clearing still repairs.
  page.evaluate("document.querySelector('#colored [data-swarm-cast-dialogue]').replaceChildren()")
  page.wait_for_function("document.querySelector('#colored [data-swarm-cast-dialogue]')?.textContent==='\"First blue sentence.\"'")
  # A sibling editor isolates the native response and restores on cancellation.
  page.evaluate('''() => {const f=document.createElement('form');f.id='editing';f.innerHTML='<textarea>Editing</textarea>';document.querySelector('#mutable').prepend(f)}''')
  page.wait_for_function("document.querySelectorAll('#mutable [data-ss-cast-live]').length===0")
  page.evaluate("document.querySelector('#editing').remove()")
  page.wait_for_function("document.querySelectorAll('#mutable [data-ss-cast-live]').length===1")
  # Swipe to a distinct packet; the previous caption must not haunt the new one.
  page.evaluate('''() => { const m=testCast.messages.find(m=>m.id==='mutable');m.content='No cast here.';document.querySelector('#mutable').innerHTML='<p>No cast here.</p>';testCast.emit('MESSAGE_SWIPED',{messageId:'mutable'})}''')
  page.wait_for_function("document.querySelectorAll('#mutable [data-ss-cast-live]').length===0")
  assert 'No cast here.' in page.locator('#mutable').inner_text()
  # A stream-to-final element replacement must retarget the mutation observer.
  # Without this, only swipe/scroll events repair later host text changes.
  page.evaluate('''() => {
    const source='<swarm-cast=Shoto-confusion> "Stream handoff original."'
    const article=testCast.mount('stream-temp',source,'<p>\u200b</p>')
    testCast.emit('GENERATION_STARTED')
    testCast.emit('STREAM_TOKEN_RECEIVED')
    testCast.notify()
  }''')
  page.wait_for_function("document.querySelector('#stream-temp [data-swarm-cast-dialogue]')?.textContent==='\"Stream handoff original.\"'")
  page.evaluate('''() => {
    testCast.oldImage=document.querySelector('#stream-temp img')
    testCast.emit('GENERATION_ENDED',{messageId:'stream-final'})
    const old=document.querySelector('#stream-temp'),next=document.createElement('article');next.id='stream-final';next.innerHTML='<p>\u200b</p>'
    old.replaceWith(next)
    testCast.messages.find(m=>m.id==='stream-temp').id='stream-final'
    testCast.notify()
  }''')
  page.wait_for_function("document.querySelector('#stream-final img')===testCast.oldImage")
  page.evaluate('''() => {
    testCast.messages.find(m=>m.id==='stream-final').content='<swarm-cast=Shoto-confusion> "Updated after final host commit."'
    document.querySelector('#stream-final p').textContent='<swarm-cast=Shoto-confusion> "Updated after final host commit."'
  }''')
  page.wait_for_function("document.querySelector('#stream-final [data-swarm-cast-dialogue]')?.textContent==='\"Updated after final host commit.\"'")
  assert page.locator('#stream-final').inner_text().count('Updated after final host commit.')==1
  # Named presets have the same stable live slots as the original three.
  page.evaluate('''() => {testCast.library.members[0].presentation='chapter-tab';testCast.notifyLibrary()}''')
  page.wait_for_function("document.querySelectorAll('#colored [data-cast-preset=chapter-tab]').length===2")
  assert page.locator('#colored [data-cast-preset=chapter-tab] img').count()==2
  assert page.locator('#colored').inner_text().count('First blue sentence.')==1
  assert page.locator('#colored [data-swarm-cast-dialogue]').first.evaluate('e=>getComputedStyle(e).color')=='rgb(89, 156, 227)'
  page.evaluate('''() => {testCast.library.members[0].presentation='vn-hero';testCast.notifyLibrary()}''')
  page.wait_for_function("document.querySelectorAll('#colored [data-cast-preset=vn-hero]').length===2")
  assert page.locator('#colored [data-cast-preset=vn-hero] img').count()==2
  assert page.locator('#colored').inner_text().count('Second gold sentence.')==1
  page.wait_for_timeout(60)
  reads_before=page.evaluate('({mutations:testCast.changes,backend:testCast.getBackendReads()})')
  page.evaluate('''() => {for(let i=0;i<100;i++){dispatchEvent(new Event('scroll'));document.dispatchEvent(new Event('scroll'))}}''')
  page.wait_for_timeout(120)
  reads_after=page.evaluate('({mutations:testCast.changes,backend:testCast.getBackendReads()})')
  assert reads_after['mutations']==reads_before['mutations'],(reads_before,reads_after,'Named presets should not rewrite during scroll')
  assert reads_after['backend']==reads_before['backend']
  page.evaluate('testCast.narrative.destroy()')
  print('PASS: no scroll-driven repaint, styled captions, multiple tags, editor, swipe, external repair')
  assert not errors,errors
  browser.close()
finally:
 pass
