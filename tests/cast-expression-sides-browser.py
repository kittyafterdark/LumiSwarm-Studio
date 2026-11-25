"""Cast R35: member-wide stage side survives persistence and independent characters.
The browser fixture mounts valid pre-render Cast islands, not reconstructed text.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0]+'\nwindow.__test={STYLES,cleanCastLibrary,castRenderIslands,StudioCastNarrative,StudioCastWorkspace};'
raw={'groups':[{'id':'bnha','name':'BNHA','defaultPresentation':'editorial-square','inject':True}],'activeGroupId':'bnha','members':[
 {'id':'shoto','groupId':'bnha','prefix':'Shoto','name':'Shoto','presentation':'editorial-square','images':{'neutral':{'id':'img1'},'approval':{'id':'img2'}},'defaultExpression':'neutral'},
 {'id':'katsuki','groupId':'bnha','prefix':'Katsuki','name':'Katsuki','presentation':'editorial-square','images':{'03_angry_shout':{'id':'img3'}},'defaultExpression':'03_angry_shout'}
 ],'chatGroups':{'chat1':'bnha'}}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1200,'height':940})
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.set_content('<div class="ss-shell"><div id="workspace" class="ss-cast-workspace"></div></div><main id="chat" style="width:780px;margin:30px auto"></main>')
 page.add_script_tag(content=code)
 page.evaluate('''raw => {
   const t=window.__test;window.test={saved:t.cleanCastLibrary(raw),calls:[],subs:new Set(),chatId:'chat1'};
   const emit=v=>{for(const f of test.subs)f(v)};
   window.ctx={getActiveChat:()=>({chatId:'chat1'}),onBackendMessage(fn){test.subs.add(fn);return()=>test.subs.delete(fn)},
    sendToBackend(m){test.calls.push(m);queueMicrotask(()=>{
      if(m.type==='load_cast_library')emit({type:'cast_result',requestId:m.requestId,data:{...test.saved,chatId:'chat1',characterId:''}});
      if(m.type==='save_cast_library'){
        test.saved=t.cleanCastLibrary(m.library);emit({type:'cast_library_changed',library:test.saved});emit({type:'cast_result',requestId:m.requestId,data:test.saved});
      }
    })},dom:{listMessageElements:()=>[{messageId:'m1',element:document.getElementById('m1')}],getMessageId:()=> 'm1'},events:{on(){return()=>{}}}};
   const css=document.createElement('style');css.textContent=t.STYLES;document.head.append(css);
   window.workspace=new t.StudioCastWorkspace(ctx,document.getElementById('workspace'),()=>[],()=>{},()=>{});
   const p=document.createElement('article');p.id='m1';p.style.width='100%';p.innerHTML=t.castRenderIslands('<p>Before <swarm-cast=Shoto-neutral>"Neutral."</swarm-cast> middle <swarm-cast=Shoto-approval>"Approved."</swarm-cast> then <swarm-cast=Katsuki-03_angry_shout>"Angry."</swarm-cast> after.</p>');document.querySelector('#chat').append(p);
   window.narrative=new t.StudioCastNarrative(ctx);
 }''',raw)
 page.locator('.cast-card').first.wait_for();page.locator('.cast-card').first.click()
 page.locator('.expression-grid .expression-tile').first.wait_for()
 assert page.locator('.expression-tile .cast-side-choice').count()==0,'Per-expression buttons should be removed'
 assert page.locator('.preview-panel').count()==0,'Inline preview remains removed'
 assert page.locator('.workspace').evaluate('el=>getComputedStyle(el).gridTemplateColumns').count('px')==2
 page.wait_for_function('''()=>[...document.querySelectorAll('[data-ss-cast-slot]')].length===3 && [...document.querySelectorAll('[data-ss-cast-slot]')].every(h=>h.shadowRoot?.querySelector('[data-cast-preset]'))''')
 def sample():
  return page.evaluate('''()=>[...document.querySelectorAll('[data-ss-cast-slot]')].map(h=>{
    const root=h.shadowRoot,design=root.querySelector('.ss-cast-design'),avatar=root.querySelector('.square-editorial-avatar'),quote=root.querySelector('.square-editorial-quote');
    return {side:design?.dataset.castSide,portraitX:avatar?.getBoundingClientRect().x,quoteX:quote?.getBoundingClientRect().x,dialogue:quote?.textContent};
  })''')
 before=sample();assert [p['side'] for p in before]==['auto','auto','auto'],before
 page.locator('[data-cast-action="member-tab"][data-tab="presentation"]').click()
 assert page.locator('.cast-member-side .cast-side-choice').count()==3
 page.locator('.cast-member-side [data-side="right"]').click()
 page.wait_for_function('test.saved.members[0].presentationSide === "right"')
 page.wait_for_function('''()=>[...document.querySelectorAll('[data-ss-cast-slot]')].map(h=>h.shadowRoot?.querySelector('.ss-cast-design')?.dataset.castSide).join(',')==='right,right,auto' ''')
 # A second expression of the same member must move too.
 shoto=sample()[:2]
 assert all(x['portraitX']>x['quoteX'] for x in shoto),shoto
 page.locator('.member-button').nth(1).click()
 page.locator('[data-cast-action="member-tab"][data-tab="presentation"]').click()
 page.locator('.cast-member-side [data-side="left"]').click()
 page.wait_for_function('test.saved.members[1].presentationSide === "left"')
 page.wait_for_function('''()=>[...document.querySelectorAll('[data-ss-cast-slot]')].map(h=>h.shadowRoot?.querySelector('.ss-cast-design')?.dataset.castSide).join(',')==='right,right,left' ''')
 assert sample()[2]['portraitX']<sample()[2]['quoteX'],sample()
 # Reopening the first member reflects its saved value.
 page.locator('.member-button').first.click()
 page.locator('[data-cast-action="member-tab"][data-tab="presentation"]').click()
 assert page.locator('.cast-member-side [data-side="right"]').get_attribute('aria-pressed')=='true'
 # Auto resets this member only and does not alter Katsuki.
 page.locator('.cast-member-side [data-side="auto"]').click()
 page.wait_for_function('test.saved.members[0].presentationSide === "auto"')
 assert page.evaluate('test.saved.members[1].presentationSide')=='left'
 page.wait_for_function('''()=>[...document.querySelectorAll('[data-ss-cast-slot]')].map(h=>h.shadowRoot?.querySelector('.ss-cast-design')?.dataset.castSide).join(',')==='auto,auto,left' ''')
 assert 'Before' in page.locator('#m1').inner_text() and 'middle' in page.locator('#m1').inner_text() and 'after.' in page.locator('#m1').inner_text()
 # The full wardrobe modal is still available, not replaced by a preview.
 page.locator('[data-cast-action="open-presentation-modal"]').click()
 page.locator('#ss-cast-dialog').wait_for(state='visible')
 assert page.locator('.cast-preset-choice').count()>2
 page.locator('[data-cast-action="close-dialog"]').first.click()
 assert not errors,errors
 print('CAST MEMBER SIDE BROWSER PASS: independent characters, all expressions follow member side, autosave/reset, native prose and wardrobe preserved')
 browser.close()
