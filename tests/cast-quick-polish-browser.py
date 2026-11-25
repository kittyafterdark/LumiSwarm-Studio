"""Cast quick swap: no phone keyboard, targeted side save, direct-member launch,
Shadow DOM text ownership, and preservation of exact-position islands.
Standalone Chromium mock mirrors real backend acknowledgments and lazy Cast load.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0]
source+='\nwindow.__c={STYLES,CAST_PRESENTATION_CSS,castRenderIslands,StudioCastNarrative,StudioCastWorkspace,cleanCastLibrary};'
raw={
 'groups':[{'id':'bnha','name':'BNHA','defaultPresentation':'chapter-tab','inject':True}],
 'activeGroupId':'bnha', 'chatGroups':{'chat1':'bnha'},
 'members':[
  {'id':'shoto','groupId':'bnha','name':'Shoto Todoroki','prefix':'Shoto','presentation':'chapter-tab','presentationSide':'left','defaultExpression':'neutral','images':{'neutral':{'id':'img1'},'approval':{'id':'img2'}}},
  {'id':'katsuki','groupId':'bnha','name':'Katsuki Bakugo','prefix':'Katsuki','presentation':'chapter-tab','presentationSide':'right','defaultExpression':'neutral','images':{'neutral':{'id':'img3'}}}
 ]}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':740},is_mobile=True,has_touch=True)
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content('<meta name="viewport" content="width=device-width, initial-scale=1"><style>#chat{font-size:15px;text-align:justify!important}#chat *{line-height:1.6}</style><main id="chat"></main><section id="workspace" class="ss-cast-workspace" style="display:none"></section>')
 page.add_script_tag(content=source)
 page.evaluate('''raw=>{
   let t=window.__c;
   window.tstate={library:t.cleanCastLibrary(raw), callbacks:new Set(), calls:[], opened:[], chat:'chat1'};
   const emit=m=>{for(const fn of [...tstate.callbacks])fn(m)};
   window.cctx={getActiveChat:()=>({chatId:'chat1'}),dom:{listMessageElements:()=>[{messageId:'m1',element:document.querySelector('#chat')}],getMessageId:()=> 'm1'},
      onBackendMessage(fn){tstate.callbacks.add(fn);return()=>tstate.callbacks.delete(fn)},events:{on(){return()=>{}}},
      sendToBackend(p){tstate.calls.push(p);queueMicrotask(()=>{
        if(p.type==='load_cast_library')emit({type:'cast_result',requestId:p.requestId,data:{...tstate.library,chatId:'chat1',characterId:''}});
        if(p.type==='set_cast_side'){
          tstate.library.members.find(m=>m.id===p.memberId).presentationSide=p.side;
          emit({type:'cast_library_changed',library:tstate.library});emit({type:'cast_result',requestId:p.requestId,data:tstate.library});
        }
        if(p.type==='save_cast_library'){
          tstate.library=t.cleanCastLibrary(p.library);
          emit({type:'cast_result',requestId:p.requestId,data:tstate.library});
        }
      })}
   };
   const css=document.createElement('style');css.textContent=t.STYLES+'\\n'+t.CAST_PRESENTATION_CSS;document.head.append(css);
   window.testStudio=()=>{document.querySelector('#workspace').style.display='block';window.castWorkspaceController=new t.StudioCastWorkspace(cctx,document.querySelector('#workspace'),()=>[],()=>{},()=>{});return window.castWorkspaceController};
   const text='Before speech. <swarm-cast=Shoto-neutral><font color="#599CE3">"Dialogue that should be left aligned, not justified."</font></swarm-cast> After speech.';
   document.querySelector('#chat').innerHTML=t.castRenderIslands(text);
   window.narrative=new t.StudioCastNarrative(cctx,memberId=>{tstate.opened.push(memberId);if(!window.castWorkspaceController)testStudio();window.castWorkspaceController.openMember(memberId)});
 }''',raw)
 page.wait_for_function('''()=>document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('[data-swarm-cast-dialogue]')''')
 # Even with host MessageContent justified, text inside the Shadow Root is owned.
 align=page.evaluate('''()=>{
   const h=document.querySelector('[data-ss-cast-slot]');
   return {host:getComputedStyle(h).textAlign,quote:getComputedStyle(h.shadowRoot.querySelector('[data-swarm-cast-dialogue]')).textAlign,
     color:getComputedStyle(h.shadowRoot.querySelector('[data-swarm-cast-dialogue]')).color,
     prose:document.querySelector('#chat').textContent};
 }''')
 assert align['quote'] in ('left','start'),align
 assert 'Before speech.' in align['prose'] and 'After speech.' in align['prose'],align
 # A center-aligned approved standee must retain its intentional composition.
 page.evaluate('''()=>{
   tstate.library.members.find(m=>m.id==='shoto').presentation='moonlit-halo';
   for(const cb of [...tstate.callbacks])cb({type:'cast_library_changed',library:tstate.library});
 }''')
 page.wait_for_function('''()=>document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('[data-cast-preset="moonlit-halo"]')''')
 centered=page.evaluate('''()=>getComputedStyle(document.querySelector('[data-ss-cast-slot]').shadowRoot.querySelector('[data-swarm-cast-dialogue]')).textAlign''')
 assert centered=='center',centered
 page.evaluate('''()=>{
   tstate.library.members.find(m=>m.id==='shoto').presentation='chapter-tab';
   for(const cb of [...tstate.callbacks])cb({type:'cast_library_changed',library:tstate.library});
 }''')
 page.wait_for_function('''()=>document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('[data-cast-preset="chapter-tab"]')''')
 # Contextmenu on the slot bubbles through Shadow DOM, with the correct member.
 page.evaluate('''()=>document.querySelector('[data-ss-cast-slot]').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,composed:true,clientX:200,clientY:570,button:2}))''')
 page.locator('.ss-cast-quick-picker').wait_for()
 assert page.locator('.ss-cast-quick-picker input[type=search]').is_hidden()
 assert page.evaluate('document.activeElement?.tagName')!='INPUT', 'Opening the picker should not invoke the phone keyboard'
 page.locator('.ss-cast-quick-filter-row select').select_option('all')
 assert page.locator('[data-cast-quick-style="story"]').count()==0
 assert page.locator('[data-cast-quick-style="sticker"]').count()==1
 assert page.locator('.ss-cast-quick-search-toggle svg').count()==1
 page.screenshot(path=str(ROOT/'docs/screenshots/cast-quick-polish-mobile.png'))
 page.locator('.ss-cast-quick-search-toggle').click()
 assert page.locator('.ss-cast-quick-picker input[type=search]').is_visible()
 assert page.evaluate('document.activeElement?.getAttribute("aria-label")')=='Find a presentation'
 page.locator('.ss-cast-quick-picker input[type=search]').fill('manga')
 assert page.locator('.ss-cast-quick-choice').count()>0
 page.locator('.ss-cast-quick-search-toggle').click()
 assert page.locator('.ss-cast-quick-picker input[type=search]').is_hidden()
 page.locator('[data-cast-quick-side="right"]').click()
 page.wait_for_function("tstate.library.members.find(m=>m.id==='shoto').presentationSide==='right'")
 assert page.locator('[data-cast-quick-side="right"]').get_attribute('aria-pressed')=='true'
 assert page.evaluate("tstate.library.members.find(m=>m.id==='katsuki').presentationSide")=='right'
 assert page.evaluate("tstate.calls.some(p=>p.type==='set_cast_side' && p.memberId==='shoto' && p.side==='right')")
 page.locator('.ss-cast-quick-open-member').click()
 page.wait_for_function("tstate.opened.includes('shoto')")
 

 assert page.evaluate("""()=>document.querySelector('#ss-cast-member-content')?.textContent?.includes('Stage position')""")
 assert page.locator('.member-profile h2').inner_text()=='Shoto Todoroki'
 assert page.locator('.cast-member-side [data-side=right]').get_attribute('aria-pressed')=='true'
 assert page.locator('#ss-cast-square-crop').count()==0
 assert page.locator('.cast-open-picker').count()==1
 # Studio wardrobe still keeps crop workshop in its real visual modal.
 page.locator('[data-cast-action="open-presentation-modal"]').click()
 assert page.locator('.cast-picker-crop').count()==1
 assert page.locator('[data-style="story"]').count()==0
 assert page.locator('[data-style="chapter-tab"]').count()==1
 assert not errors,errors
 print('CAST QUICK POLISH BROWSER PASS: Shadow text alignment, keyboard-safe search, stage side save, direct member, crop location, legacy menu retirement')
 browser.close()
