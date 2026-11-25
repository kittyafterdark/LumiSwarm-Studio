"""Chromium mock for Cast placement and edit-mode isolation; run with Python Playwright."""
from __future__ import annotations
import json
from pathlib import Path
from os import environ
from shutil import which
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent.parent
frontend = (root/'dist/frontend.js').read_bytes()
# Uses a blob ESM module and set_content(), so it needs no local HTTP server.
# Optional browser path override is useful on Windows staging environments.
with sync_playwright() as p:
  executable = environ.get('CAST_CHROMIUM') or which('chromium') or which('chromium-browser')
  browser = p.chromium.launch(headless=True, **({'executable_path':executable} if executable else {}))
  page = browser.new_page(viewport={'width':1100,'height':800})
  errors=[]
  page.on('pageerror', lambda e: errors.append(str(e)))
  page.set_content("""<!doctype html><html><head><style>body {background:#13141a;color:#eee;font:16px/1.6 system-ui;--lumiverse-prose-dialogue:#69b9f1}article {margin:25px auto;max-width:900px;padding:20px;border:1px solid #666}p {margin:10px 0}textarea {width:100%;height:120px}</style></head><body><main id="chat"></main></body></html>""")
  page.evaluate('(source) => { window.__testModuleUrl=URL.createObjectURL(new Blob([source],{type:"application/javascript"})) }',frontend.decode())
  page.evaluate('''async () => {
    const {StudioCastNarrative,cleanCastLibrary}=await import(window.__testModuleUrl);
    const messages=[];
    let callback;
    let library=cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Crew'}],members:[{id:'shoto',groupId:'crew',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{confusion:{id:'confusion-image'}}}]});
    const events=new Map(),listeners=new Set();
    const ctx={getActiveChat:()=>({chatId:'chat-1'}),registerDomDecorator(o){callback=o.render;return()=>{}},dom:{listMessageElements:()=>[...document.querySelectorAll('article')].map(element=>({element,messageId:element.id})),getMessageId:el=>el.closest('article')?.id||null},messages:{getContent:id=>messages.find(m=>m.id===id)?.content||null,getRecent:n=>messages.slice(-n)},events:{on(name,fn){if(!events.has(name))events.set(name,new Set());events.get(name).add(fn);return()=>events.get(name).delete(fn)}},onBackendMessage(fn){listeners.add(fn);return()=>listeners.delete(fn)},sendToBackend(m){if(m.type==='load_cast_library')queueMicrotask(()=>{for(const listener of listeners)listener({type:'cast_result',requestId:m.requestId,data:library})})}};
    function emit(e){for(const fn of events.get(e)||[])fn({messageId:'repeated'})}
    const first=('paragraph ').repeat(140).trim()+'.';
    const after=('paragraph ').repeat(180).trim()+'.';
    const quote='"Your harness was twisted since the pharmacy. You usually notice that before I do."';
    const content=first+'\\n\\n<swarm-cast=Shoto-confusion>'+quote+'\\n\\n'+after;
    messages.push({id:'repeated',role:'assistant',content});
    const article=document.createElement('article');article.id='repeated';
    for(const [id,value] of [['before',first],['after',after]]){const p=document.createElement('p');p.id=id;p.textContent=value;article.append(p)}
    document.querySelector('#chat').append(article);
    const narrative=new StudioCastNarrative(ctx);
    window.testHarness={narrative,ctx,article,first,after,quote,emit,messages,notifyMount(){callback?.()},beginEdit(){const div=document.createElement('div');div.id='edit-form';div.innerHTML='<label>RESPONSE<textarea></textarea></label>';div.querySelector('textarea').value=messages[0].content;article.prepend(div)},endEdit(){document.querySelector('#edit-form').remove()},changeContent(text){messages[0].content=text;emit('MESSAGE_EDITED')}};
  }''')
  page.wait_for_selector('#repeated [data-swarm-cast-dialogue]:not([hidden])')
  def state():
   return page.evaluate('''() => {const e=document.querySelector('#repeated'),slot=e.querySelector('[data-ss-cast-live]');return { image:e.querySelectorAll('[data-swarm-cast] img').length,caption:e.querySelector('[data-swarm-cast-dialogue]')?.textContent||'',between:slot?.previousElementSibling?.id==='before'&&slot?.nextElementSibling?.id==='after',siblings:[...e.children].map(x=>x.id||x.dataset.ssCastLive||x.tagName),before:e.querySelector('#before').textContent,after:e.querySelector('#after')?.textContent||'',edit:!!e.querySelector('textarea')}}''')
  initial=state();print('INITIAL',json.dumps({k:v for k,v in initial.items() if k not in ('before','after')}))
  assert initial['image']==1 and initial['between'] and initial['before']==page.evaluate('testHarness.first') and initial['after']==page.evaluate('testHarness.after'), 'wrong placement or lost prose'
  page.evaluate('testHarness.beginEdit()')
  page.wait_for_function('document.querySelectorAll("#repeated [data-swarm-cast]").length===0')
  edited=state();print('WHILE EDITING',json.dumps({k:v for k,v in edited.items() if k not in ('before','after')}))
  assert edited['image']==0 and edited['edit'], 'expression leaked under edit UI'
  page.evaluate('testHarness.endEdit()')
  page.wait_for_selector('#repeated [data-swarm-cast-dialogue]:not([hidden])')
  restored=state();print('AFTER CANCEL',json.dumps({k:v for k,v in restored.items() if k not in ('before','after')}))
  assert restored['between'] and restored['image']==1, 'failed to restore after cancel'
  for _ in range(5):
   page.evaluate('window.dispatchEvent(new Event("lumiverse:message-content-layout"))')
   page.wait_for_timeout(20)
   assert state()['image']==1, 'duplicate or lost mount under repeated reconcile'
  for spacer in [' ', '', '\n']:
   page.evaluate("""spacer => {const h=window.testHarness;h.changeContent(h.first+'\\n\\n<swarm-cast=Shoto-confusion>'+spacer+h.quote+'\\n\\n'+h.after)}""", spacer)
   page.wait_for_function('document.querySelectorAll("#repeated [data-swarm-cast-dialogue]:not([hidden])").length===1')
   result=state()
   assert result['between'] and result['caption']==page.evaluate('testHarness.quote'), f'variant {spacer!r} misplaced or lost its caption'
  page.evaluate("""() => {testHarness.beginEdit();testHarness.messages[0].content='A different saved message without a Cast expression.';testHarness.emit('MESSAGE_EDITED');testHarness.endEdit();document.querySelector('#before').textContent=testHarness.messages[0].content;document.querySelector('#after').remove()}""")
  page.wait_for_function('document.querySelectorAll("#repeated [data-swarm-cast]").length===0')
  assert state()['image']==0, 'saved edit with no tag kept old character'
  # In some Lumiverse builds the public DOM API enumerates the message body,
  # while the editor is a SIBLING within the same article. It must still pause.
  page.evaluate("""() => {
   const h=testHarness,article=document.createElement('article'),body=document.createElement('div');
   article.id='nested';body.id='nested-body';body.className='body';article.append(body);
   document.querySelector('#chat').append(article);
   h.messages.push({id:'nested',role:'assistant',content:'<swarm-cast=Shoto-confusion> '+h.quote});
   h.ctx.dom.listMessageElements=()=>[...document.querySelectorAll('article')].map(article=>({messageId:article.id,element:article.id==='nested'?article.querySelector('.body'):article}));
   h.emit('CHARACTER_MESSAGE_RENDERED');h.notifyMount();
  }""")
  page.wait_for_selector('#nested-body [data-swarm-cast-dialogue]:not([hidden])')
  page.evaluate("""() => {const editor=document.createElement('div');editor.id='nested-editor';editor.innerHTML='<textarea aria-label="Edit reply"></textarea>';document.querySelector('#nested').append(editor)}""")
  page.wait_for_function('document.querySelectorAll("#nested-body [data-swarm-cast]").length===0')
  page.evaluate('document.querySelector("#nested-editor").remove()')
  page.wait_for_selector('#nested-body [data-swarm-cast-dialogue]:not([hidden])')
  assert page.locator('#nested-body [data-swarm-cast]').count()==1, 'Nested body editor pause did not resume'
  assert errors == [], 'browser errors: '+str(errors)
  print('PASS: repeated-text middle placement, editor/cancel, 3 whitespace variants, saved removal, native prose conservation, no duplicate mounts')
  browser.close()
