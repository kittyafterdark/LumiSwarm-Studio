"""Compiled Member Atelier: delayed and failed preference reads, safe retries and chat isolation."""
from pathlib import Path
import sys
import base64,re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
compiled=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ', 'function ')+ '\nwindow.test={STYLES,CAST_PRESENTATION_CSS,castRenderIslands,StudioCastNarrative,TaggedImageController,applyAppearanceVariables,cleanCastCardOverride,cleanCastMemberPreference,cleanCastLibrary};'
art=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
world=base64.b64decode(re.search(r'--world:\s*url\("data:image/jpeg;base64,([^"\)]+)"\)',(ROOT/'docs/cast-layout-sources/curated-cards.html').read_text())[1])
fixture={'groups':[{'id':'crew','name':'Crew','defaultPresentation':'vn-hero','backgrounds':[{'key':'kitchen','id':'world','name':'Kitchen'}]}],'activeGroupId':'crew','chatGroups':{'chat1':'crew','chat2':'crew'},'members':[{'id':'actor','groupId':'crew','prefix':'actor','name':'Shoto','defaultExpression':'neutral','presentation':'afterglow-cinema','presentationSide':'right','images':{'neutral':{'id':'neutral-image'},'joy':{'id':'joy-image'}}},{'id':'other','groupId':'crew','prefix':'other','name':'Other','defaultExpression':'neutral','presentation':'afterglow-cinema','images':{'neutral':{'id':'other-image'}}}]}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in (1440,390,320):
  page=browser.new_page(viewport={'width':width,'height':850},has_touch=width<=720)
  page.set_default_timeout(6000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/jpeg' if route.request.url.endswith('/world') else 'image/png',body=world if route.request.url.endswith('/world') else art))
  page.set_content('<base href="http://studio.local/"><meta name="viewport" content="width=device-width, initial-scale=1"><style>:root{--lumiverse-bg:#171a20;--lumiverse-fill:#653b57;--lumiverse-text:#eee;--lumiverse-accent:#a6a1e9}body{background:var(--lumiverse-bg);color:#eee;margin:0}#chat{width:min(900px,100%);margin:auto}</style><main id="chat"></main>')
  page.add_script_tag(content=compiled)
  page.evaluate('''raw=>{const t=window.test;const storage=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)}});localStorage.setItem('swarm-studio-appearance-v1',JSON.stringify({colors:{canvas:'#101820',accent:'#a6a1e9',button:'#28303a'},surfaceMode:'host'}));const style=document.createElement('style');style.textContent=t.STYLES+'\\n'+t.CAST_PRESENTATION_CSS;document.head.append(style);
    window.state={library:t.cleanCastLibrary(raw),overrides:{},preferences:{},calls:[],listeners:new Set(),swipe:0,chat:'chat1',reject:false,activeFailures:1,loadMode:'race',late:[]};
    window.source='Before. <swarm-cast=actor-neutral background=kitchen><font color="#e7b04a">"A first scene."</font></swarm-cast> Between. <swarm-cast=actor-neutral>"Second scene."</swarm-cast> <swarm-cast=other-neutral>"Other member."</swarm-cast> After.';
    window.mount=()=>{document.querySelector('#chat').innerHTML=t.castRenderIslands(source)};mount();
    window.ctx={getActiveChat:()=>({chatId:state.chat}),dom:{listMessageElements:()=>[{messageId:'msg1',element:document.querySelector('#chat')}],getMessageId:()=> 'msg1'},messages:{getRecent:()=>[{id:'msg1',chat_id:state.chat,swipe_id:state.swipe}]},onBackendMessage(cb){state.listeners.add(cb);return()=>state.listeners.delete(cb)},events:{on(name,cb){state[name]=cb;return()=>{}}},sendToBackend(p){state.calls.push(structuredClone(p));queueMicrotask(()=>{let response;if(p.type==='load_cast_library')response={type:'cast_result',requestId:p.requestId,data:state.library};if(p.type==='load_cast_card_overrides'){const ok={type:'cast_card_overrides_result',requestId:p.requestId,chatId:p.chatId,data:state.overrides,preferences:state.preferences};if(state.loadMode==='race'&&state.activeFailures-->0)response={type:'studio_error',requestId:p.requestId,error:'The active chat changed.'};else if(state.loadMode==='error')response={type:'studio_error',requestId:p.requestId,error:'Fixture storage error'};else if(state.loadMode==='hold')state.late.push(ok);else response=ok;}if(p.type==='set_cast_member_preference'){if(state.reject)response={type:'studio_error',requestId:p.requestId,error:'Fixture rejection'};else{state.preferences[p.memberId]=t.cleanCastMemberPreference(p.preference);response={type:'cast_member_preference_result',requestId:p.requestId,chatId:p.chatId,memberId:p.memberId,preference:state.preferences[p.memberId]}}}if(p.type==='set_cast_card_override'){if(state.reject)response={type:'studio_error',requestId:p.requestId,error:'Fixture rejection'};else{if(p.override)state.overrides[p.key]=t.cleanCastCardOverride(p.override);else delete state.overrides[p.key];response={type:'cast_card_override_result',requestId:p.requestId,chatId:p.chatId,key:p.key,override:p.override}}}if(response)for(const cb of state.listeners)cb(structuredClone(response))})}};
    window.narrative=new t.StudioCastNarrative(ctx,id=>state.openedMember=id);window.card=(i=0)=>document.querySelectorAll('[data-ss-cast-slot]')[i].shadowRoot?.querySelector('[data-swarm-cast]');window.asset=(i=0)=>card(i)?.querySelector('img');window.rawHtml=document.querySelector('#chat').innerHTML; }''',fixture)
  page.wait_for_function('()=>window.card(0)&&window.card(1)&&state.calls.some(p=>p.type==="load_cast_card_overrides")')
  def click_card():
   page.evaluate("()=>document.querySelector('[data-ss-cast-slot]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,composed:true,clientX:110,clientY:160,button:2}))")
  click_card()
  dialog=page.locator('.ss-member-atelier');dialog.wait_for()
  assert page.locator('.ss-cast-quick-picker').count()==0
  assert page.evaluate('state.calls.filter(p=>p.type==="load_cast_card_overrides").length')==2
  assert page.evaluate('state.calls.every(p=>!p.type.startsWith("set_cast_"))')
  # A duplicate server chat notification does not discard the opened editor.
  page.evaluate("()=>{for(const cb of state.listeners)cb({type:'cast_chat_changed'})}")
  assert dialog.is_visible()
  dialog.get_by_role('button',name='Close card editor').click()
  # Non-transient failures must appear, not silently fall back to old picker.
  page.evaluate("()=>{state.loadMode='error';state.chat='chat2';state.CHAT_SWITCHED()}")
  page.wait_for_function("()=>card() && state.calls.some(p=>p.type==='load_cast_card_overrides'&&p.chatId==='chat2')")
  click_card();notice=page.locator('.ss-atelier-loading');notice.get_by_text('Fixture storage error').wait_for()
  assert page.locator('.ss-cast-quick-picker').count()==0
  page.evaluate("state.loadMode='ok'");notice.get_by_role('button',name='Retry').click();dialog.wait_for()
  assert notice.count()==0
  dialog.get_by_role('button',name='Close card editor').click()
  # Switching conversations while loading invalidates the old request and UI.
  page.evaluate("()=>{state.loadMode='hold';state.chat='chat1';state.CHAT_SWITCHED()}")
  page.wait_for_function('state.late.length===1');click_card();notice.wait_for()
  page.evaluate("()=>{state.chat='chat2';state.CHAT_SWITCHED()}")
  notice.wait_for(state='detached');page.wait_for_function('state.late.length===2')
  click_card();notice.wait_for()
  page.evaluate("()=>{for(const cb of state.listeners)cb(state.late[0])}")
  assert notice.is_visible() and dialog.count()==0
  page.evaluate("()=>{for(const cb of state.listeners)cb(state.late[1])}")
  dialog.wait_for();assert notice.count()==0
  assert page.evaluate('state.calls.every(p=>!p.type.startsWith("set_cast_"))')
  assert not errors,errors
  print(f'PASS {width}px: load race, retry, duplicate chat event, stale chat response and no writes')
  page.close()
 browser.close()
