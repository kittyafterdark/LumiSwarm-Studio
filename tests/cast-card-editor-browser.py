"""Compiled card editor: exact-slot persistence, real actor handles, responsive width,
source isolation, safe remounts and theme-aware standalone surfaces."""
from pathlib import Path
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
    window.state={library:t.cleanCastLibrary(raw),overrides:{},preferences:{},calls:[],listeners:new Set(),swipe:0,chat:'chat1',reject:false};
    window.source='Before. <swarm-cast=actor-neutral background=kitchen><font color="#e7b04a">"A first scene."</font></swarm-cast> Between. <swarm-cast=actor-neutral>"Second scene."</swarm-cast> <swarm-cast=other-neutral>"Other member."</swarm-cast> After.';
    window.mount=()=>{document.querySelector('#chat').innerHTML=t.castRenderIslands(source)};mount();
    window.ctx={getActiveChat:()=>({chatId:state.chat}),dom:{listMessageElements:()=>[{messageId:'msg1',element:document.querySelector('#chat')}],getMessageId:()=> 'msg1'},messages:{getRecent:()=>[{id:'msg1',chat_id:state.chat,swipe_id:state.swipe}]},onBackendMessage(cb){state.listeners.add(cb);return()=>state.listeners.delete(cb)},events:{on(name,cb){state[name]=cb;return()=>{}}},sendToBackend(p){state.calls.push(structuredClone(p));queueMicrotask(()=>{let response;if(p.type==='load_cast_library')response={type:'cast_result',requestId:p.requestId,data:state.library};if(p.type==='load_cast_card_overrides')response={type:'cast_card_overrides_result',requestId:p.requestId,chatId:p.chatId,data:state.overrides,preferences:state.preferences};if(p.type==='set_cast_member_preference'){if(state.reject)response={type:'studio_error',requestId:p.requestId,error:'Fixture rejection'};else{state.preferences[p.memberId]=t.cleanCastMemberPreference(p.preference);response={type:'cast_member_preference_result',requestId:p.requestId,chatId:p.chatId,memberId:p.memberId,preference:state.preferences[p.memberId]}}}if(p.type==='set_cast_card_override'){if(state.reject)response={type:'studio_error',requestId:p.requestId,error:'Fixture rejection'};else{if(p.override)state.overrides[p.key]=t.cleanCastCardOverride(p.override);else delete state.overrides[p.key];response={type:'cast_card_override_result',requestId:p.requestId,chatId:p.chatId,key:p.key,override:p.override}}}if(response)for(const cb of state.listeners)cb(structuredClone(response))})}};
    window.narrative=new t.StudioCastNarrative(ctx,id=>state.openedMember=id);window.card=(i=0)=>document.querySelectorAll('[data-ss-cast-slot]')[i].shadowRoot?.querySelector('[data-swarm-cast]');window.asset=(i=0)=>card(i)?.querySelector('img');window.rawHtml=document.querySelector('#chat').innerHTML; }''',fixture)
  page.wait_for_function('()=>window.card(0)&&window.card(1)&&state.calls.some(p=>p.type==="load_cast_card_overrides")')
  def open_editor():
   page.evaluate("()=>document.querySelector('[data-ss-cast-slot]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,composed:true,clientX:110,clientY:160,button:2}))")
   dialog=page.locator('.ss-card-editor');dialog.wait_for();return dialog
  initial=page.evaluate('()=>({width:card().getBoundingClientRect().width,src:asset()?.getAttribute("src"),quote:card().querySelector("[data-swarm-cast-dialogue]").textContent})')
  dialog=open_editor();assert dialog.evaluate('el=>getComputedStyle(el).backgroundColor')=='rgb(16, 24, 32)'
  assert page.evaluate('()=>document.activeElement?.tagName') not in ('INPUT','TEXTAREA')
  canvas=dialog.locator('.ss-card-editor-render')
  assert dialog.locator('.ss-atelier-look-preview [data-swarm-cast]').count()>=8
  dialog.get_by_role('button',name='VN Hero Stage',exact=True).click()
  assert canvas.locator('[data-swarm-cast]').get_attribute('data-cast-preset')=='vn-hero'
  assert page.evaluate('card().dataset.castPreset')=='afterglow-cinema'
  dialog.get_by_role('button',name='Afterglow Subtitle',exact=True).click()
  page.wait_for_function('()=>{const d=document.querySelector(".ss-card-editor-render").shadowRoot;const i=d.querySelector("img");return i?.complete&&i.naturalWidth>0}')
  assert dialog.evaluate('el=>{const v=el.querySelector(".ss-atelier-viewport").getBoundingClientRect(),c=el.querySelector(".ss-card-editor-render").shadowRoot.querySelector("[data-swarm-cast]").getBoundingClientRect();return Math.abs((v.left+v.right-c.left-c.right)/2)<4&&c.top>=v.top-2&&c.bottom<=v.bottom+2}')
  if width in (1440,390):
   out=ROOT/'test-results';out.mkdir(exist_ok=True);page.screenshot(path=str(out/f'member-atelier-looks-{width}.png'))
  dialog.get_by_role('button',name='Replace expression',exact=True).click()
  dialog.get_by_role('button',name='joy',exact=True).click()
  assert canvas.locator('img').get_attribute('src')=='/api/v1/images/joy-image'
  assert page.evaluate('asset()?.getAttribute("src")')==initial['src'],'draft changed live card before save'
  def slider(label,value):
   dialog.get_by_role("slider",name=label,exact=True).evaluate('(el,v)=>{el.value=String(v);el.dispatchEvent(new Event("input",{bubbles:true}))}',value)
  dialog.get_by_role('button',name='Size & position',exact=True).click()
  dialog.get_by_role('button',name='Left',exact=True).click()
  slider('Expression size',1.22);slider('Horizontal position',7);slider('Vertical position',-5)
  assert canvas.locator('[data-swarm-cast]').get_attribute('data-cast-side')=='left'
  if width==1440:
   handle=dialog.get_by_label('Drag to resize selected layer');handle.scroll_into_view_if_needed();r=handle.bounding_box();page.mouse.move(r['x']+r['width']/2,r['y']+r['height']/2);page.mouse.down();page.mouse.move(r['x']+r['width']/2+20,r['y']+r['height']/2+20,steps=5);page.mouse.up()
   assert float(dialog.get_by_label('Expression size',exact=True).input_value())>1.22
   box=dialog.locator('.ss-card-selection').bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(box['x']+box['width']/2-15,box['y']+box['height']/2+10,steps=5);page.mouse.up()
   assert float(dialog.get_by_label('Horizontal position',exact=True).input_value())<7
  if width in (1440,390):page.screenshot(path=str(ROOT/'test-results'/f'member-atelier-transform-{width}.png'))
  dialog.get_by_role('button',name='Crop framing',exact=True).click()
  dialog.get_by_text('Enable crop framing',exact=True).click();slider('Crop horizontal',35);slider('Crop vertical',65);slider('Crop zoom',1.4)
  assert canvas.locator('[data-swarm-cast]').get_attribute('data-cast-crop-enabled')=='true'
  dialog.get_by_text('Enable crop framing',exact=True).click();assert canvas.locator('[data-swarm-cast]').get_attribute('data-cast-crop-enabled')=='false'
  dialog.get_by_role('button',name='Use base crop',exact=True).click()
  if width>720:
   dialog.get_by_role('button',name='Card width',exact=True).click()
   slider('Card width',90)
   assert dialog.get_by_role('slider',name='Card width',exact=True).is_visible()
  else:
   assert dialog.get_by_role('button',name='Card width',exact=True).is_hidden();assert dialog.get_by_role('slider',name='Card width',exact=True).is_hidden()
  # Reject first member save, preserve both drafts, retry without closing.
  page.evaluate('state.reject=true');dialog.get_by_role('button',name='Apply to member').click();dialog.get_by_text('Fixture rejection').wait_for()
  assert canvas.locator('img').get_attribute('src')=='/api/v1/images/joy-image';assert page.evaluate('asset()?.getAttribute("src")')==initial['src']
  page.evaluate('state.reject=false');dialog.get_by_role('button',name='Apply to member').click();dialog.get_by_text('Member preferences saved.').wait_for()
  page.wait_for_function('card().dataset.castSide==="left" && card(1).dataset.castSide==="left"')
  assert page.evaluate('card(2).dataset.castSide')=='auto'
  assert page.evaluate('asset().getAttribute("src")')==initial['src']
  assert float(page.evaluate('asset().style.scale'))>=1.22
  assert page.evaluate('asset(1).style.scale')==page.evaluate('asset().style.scale')
  if width>720:assert abs(page.evaluate('card().getBoundingClientRect().width')-810)<3
  dialog.get_by_role('button',name='Replace expression',exact=True).click()
  assert dialog.get_by_role('button',name='joy',exact=True).get_attribute('aria-pressed')=='true'
  dialog.get_by_role('button',name='Apply to card').click();dialog.get_by_text('Expression correction saved.').wait_for()
  page.wait_for_function('asset()?.getAttribute("src")==="/api/v1/images/joy-image"')
  assert page.evaluate('asset(1).getAttribute("src")')==initial['src']
  assert page.evaluate('card().querySelector("[data-swarm-cast-dialogue]").textContent')==initial['quote']
  assert page.evaluate('document.querySelector("#chat").innerHTML===rawHtml')
  assert page.evaluate('Object.values(state.overrides)[0].scale')==1
  assert page.evaluate('Object.keys(state.preferences).length')==1
  dialog.get_by_role('button',name='Close card editor').click();dialog.wait_for(state='detached')
  page.evaluate('narrative.destroy();mount();window.narrative=new test.StudioCastNarrative(ctx,id=>state.openedMember=id)');page.wait_for_function('asset()?.getAttribute("src")==="/api/v1/images/joy-image" && card().dataset.castSide==="left"')
  page.evaluate('state.swipe=1;mount();state.MESSAGE_SWIPED()');page.wait_for_function('asset()?.getAttribute("src")==="/api/v1/images/neutral-image" && card().dataset.castSide==="left"')
  page.evaluate('state.swipe=0;mount();state.MESSAGE_SWIPED()');page.wait_for_function('asset()?.getAttribute("src")==="/api/v1/images/joy-image"')
  # Change template and apply without leaving the picker; both cards update.
  dialog=open_editor();dialog.get_by_role('button',name='VN Hero Stage',exact=True).click();dialog.get_by_role('button',name='Apply to member').click();dialog.get_by_text('Member preferences saved.').wait_for()
  page.wait_for_function('card().dataset.castPreset==="vn-hero" && card(1).dataset.castPreset==="vn-hero"')
  assert page.evaluate('card(2).dataset.castPreset')=='afterglow-cinema'
  # Revert member independently; keep corrected expression.
  dialog.get_by_role('button',name='Revert member').click();dialog.get_by_role('button',name='Apply to member').click();dialog.get_by_text('Member preferences saved.').wait_for();page.wait_for_function('card().dataset.castSide==="right" && card(1).dataset.castSide==="right"')
  assert page.evaluate('asset().getAttribute("src")')=='/api/v1/images/joy-image'
  assert page.evaluate('Object.keys(state.preferences.actor).length')==0
  dialog.get_by_role('button',name='Replace expression',exact=True).click();dialog.get_by_role('button',name='Restore original').click();dialog.get_by_role('button',name='Apply to card').click();dialog.get_by_text('Expression correction saved.').wait_for();page.wait_for_function('asset()?.getAttribute("src")==="/api/v1/images/neutral-image"')
  assert page.evaluate('Object.keys(state.overrides).length')==0
  dialog.get_by_role('button',name='Open Shoto in Cast').click();dialog.wait_for(state='detached');assert page.evaluate('state.openedMember')=='actor'
  # Test computed standalone surface colors (actual styles + appearance bridge).
  theme=page.evaluate('''()=>{const root=document.createElement('div');root.innerHTML='<div class="ss-miniplayer" data-collapsed="false"><div class="ss-mini-quick"><header class="ss-mini-quick-head"></header><textarea class="ss-mini-prompt"></textarea></div></div>';document.body.append(root);test.applyAppearanceVariables(root,{colors:{canvas:'#101820',accent:'#a6a1e9'},surfaceMode:'host',radius:null,blur:12,customCss:''});const result=[getComputedStyle(root.querySelector('.ss-miniplayer')).backgroundColor,getComputedStyle(root.querySelector('.ss-mini-quick')).backgroundColor];root.remove();return result}''')
  assert theme==['rgb(16, 24, 32)']*2,theme
  # Production inspector menu/icon and dialog, including host vs custom canvas.
  page.evaluate('''()=>{window.diag=Object.create(test.TaggedImageController.prototype);window.menuResult=diag.showImageMenu([{key:'prompt-diagnostics',label:'Inspect request & compiled prompt'}],20,20)}''')
  action=page.get_by_role('menuitem',name='Inspect request & compiled prompt');assert action.locator('svg').count()==1
  action.click();assert page.evaluate('menuResult')=={'selectedKey':'prompt-diagnostics'}
  page.evaluate('''()=>diag.showPromptDiagnostics({promptCompiler:'anima',compilerDiagnostics:['Auto: provider architecture anima'],sourcePrompt:'Source scene',clientJobId:'job',prompt:'Compiled scene',negativePrompt:'No rain',loreDiagnostics:[]})''')
  inspector=page.locator('.ss-inline-prompt-diagnostics');inspector.wait_for()
  assert inspector.evaluate('el=>getComputedStyle(el).backgroundColor')=='rgb(16, 24, 32)'
  box=inspector.bounding_box();assert box['x']>=8 and box['y']>=8 and box['x']+box['width']<=width-8 and abs(box['x']*2+box['width']-width)<3,box
  assert inspector.locator('textarea[readonly]').count()==3
  if width==390:page.screenshot(path=str(ROOT/'test-results'/'cast-card-inspector-390.png'))
  inspector.get_by_role('button',name='Close',exact=True).click();inspector.wait_for(state='detached')
  assert not errors,errors
  print(f'PASS {width}px: picker, member-wide geometry, card correction, isolated scopes, remount, swipe, failed save, reset, theme')
  page.close()
 browser.close()
