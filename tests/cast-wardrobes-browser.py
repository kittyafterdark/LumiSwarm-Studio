"""Real compiled Cast workspace and narrative with strict mocked scoped transport."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={cleanCastLibrary,StudioCastWorkspace,StudioCastNarrative,castRenderIslands,STYLES,CAST_PRESENTATION_CSS,cleanCastCardOverride,cleanCastMemberPreference};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
(ROOT/'test-results').mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 for width in (1440,390,320):
  page=browser.new_page(viewport={'width':width,'height':860});errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell"><div class="ss-cast-workspace" id="cast" style="width:min(1360px,100%);height:820px;overflow:auto"></div></div><main id="chat" style="width:min(100%,640px)"></main></body></html>''')
  page.add_script_tag(content=JS)
  page.evaluate('''()=>{
    const style=document.createElement('style');style.textContent=t.STYLES+t.CAST_PRESENTATION_CSS;document.head.append(style);
    window.mock={library:t.cleanCastLibrary({groups:[{id:'crew',name:'BNHA',inject:true}],members:[{id:'actor',groupId:'crew',name:'Katsuki',prefix:'katsuki',identityPrompt:'blond hair',images:{neutral:{id:'casual-neutral'},joy:{id:'casual-joy'},'patrol-neutral':{id:'hero-neutral'},'patrol-confident':{id:'hero-confident'}}}],chatGroups:{chat:'crew'}}),calls:[],callbacks:new Set(),opened:null,overrides:{},preferences:{}};
    for(let i=0;i<24;i++)mock.library.members[0].images['extra-'+i]={id:'extra-'+i,url:'/api/v1/images/extra-'+i};mock.library=t.cleanCastLibrary(mock.library);
    const emit=p=>{for(const fn of [...mock.callbacks])fn(structuredClone(p))};mock.emit=emit;
    window.ctx={getActiveChat:()=>({chatId:'chat'}),dom:{listMessageElements:()=>[{messageId:'m1',element:document.querySelector('#chat')}],getMessageId:()=> 'm1'},messages:{getRecent:()=>[{id:'m1',chat_id:'chat',swipe_id:0}]},events:{on:()=>()=>{}},onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(p){mock.calls.push(structuredClone(p));queueMicrotask(()=>{
      const reply=data=>emit({type:'cast_result',requestId:p.requestId,data});
      if(p.type==='load_cast_library')reply({...mock.library,chatId:'chat'});
      else if(p.type==='save_cast_library'){
        if(p.baseSignature!==JSON.stringify(mock.library)){emit({type:'studio_error',requestId:p.requestId,error:'Fixture stale write'});return}
        mock.library=t.cleanCastLibrary(p.library);reply(mock.library);emit({type:'cast_library_changed',library:mock.library});
      }else if(p.type==='load_cast_card_overrides')emit({type:'cast_card_overrides_result',requestId:p.requestId,chatId:p.chatId,data:mock.overrides,preferences:mock.preferences});
      else if(p.type==='set_cast_card_override'){if(p.override)mock.overrides[p.key]=t.cleanCastCardOverride(p.override);else delete mock.overrides[p.key];emit({type:'cast_card_override_result',requestId:p.requestId,chatId:p.chatId,key:p.key,override:p.override})}
    })}};
    window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>[],options=>mock.opened=options,()=>{});
  }''')
  page.set_default_timeout(7000)
  page.locator('.cast-card[data-id=crew]').click()
  action=lambda key:page.locator(f'[data-cast-action="{key}"]')
  modal=page.locator('#ss-cast-dialog')
  grid=page.locator('[data-cast-expression-grid]')
  assert grid.locator('[data-expression-slot]').count()==28
  action('wardrobe-edit').click();modal.locator('[name=name]').fill('Casual');modal.locator('[name=outfit]').fill('black t-shirt');modal.get_by_role('button',name='Save outfit').click();modal.wait_for(state='hidden')
  action('wardrobe-new').click();modal.locator('[name=name]').fill('Dynamight');modal.locator('[name=key]').fill('patrol');modal.locator('[name=outfit]').fill('black and orange hero suit');modal.get_by_role('button',name='Create outfit').click();modal.wait_for(state='hidden')
  assert page.get_by_text('A little more expression.').is_visible()
  action('wardrobe-select').filter(has_text='Casual').click();action('wardrobe-move').click()
  movegrid=modal.locator('.cast-wardrobe-move-grid');count=modal.locator('[data-wardrobe-move-count]')
  assert count.inner_text()=='0 of 28 selected'
  assert movegrid.evaluate('(e)=>e.scrollHeight>e.clientHeight')
  assert modal.evaluate('(e)=>e.getBoundingClientRect().width<=innerWidth && e.getBoundingClientRect().height<=innerHeight')
  assert modal.locator('.dialog-footer').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight')
  if width==1440:assert modal.evaluate('(e)=>e.getBoundingClientRect().width>=850')
  assert movegrid.evaluate('(e)=>getComputedStyle(e).gridTemplateColumns.split(" ").length')==(5 if width==1440 else 3 if width==390 else 2)
  action('wardrobe-move-all').click();assert count.inner_text()=='28 of 28 selected'
  action('wardrobe-move-none').click();assert count.inner_text()=='0 of 28 selected'
  movegrid.evaluate('(e)=>e.scrollTop=e.scrollHeight');assert modal.get_by_role('button',name='Move selected').is_visible()
  movegrid.evaluate('(e)=>e.scrollTop=0')
  if width in (1440,390):page.screenshot(path=str(ROOT/f'test-results/wardrobe-move-{width}.png'))
  modal.locator('[name=destination]').select_option('patrol');modal.locator('[name=strip]').fill('patrol-');modal.locator('[name=slot][value=patrol-neutral]').check();modal.locator('[name=slot][value=patrol-confident]').check();assert count.inner_text()=='2 of 28 selected';modal.get_by_role('button',name='Move selected').click();modal.wait_for(state='hidden')
  assert grid.locator('[data-expression-slot]').count()==2
  assert grid.locator('[data-expression-slot=confident] img').get_attribute('src')=='/api/v1/images/hero-confident'
  assert 'wardrobe=patrol' in page.locator('.use-tag code').inner_text()
  action('wardrobe-edit').click();modal.get_by_role('button',name='Use Neutral').click();modal.get_by_role('button',name='Save outfit').click();modal.wait_for(state='hidden')
  action('expressions').click();page.wait_for_function('mock.opened!==null')
  assert page.evaluate('mock.opened.wardrobeKey')=='patrol';assert page.evaluate('mock.opened.wardrobeOutfit')=='black and orange hero suit';assert page.evaluate('mock.opened.member.referenceImageId')=='hero-neutral';assert page.evaluate('Object.keys(mock.opened.member.images).sort()')==['confident','neutral']
  page.evaluate('''async()=>{const m=structuredClone(mock.opened.member);m.images.joy={id:'hero-joy',url:'/api/v1/images/hero-joy'};await mock.opened.save(m)}''')
  assert grid.locator('[data-expression-slot=joy] img').get_attribute('src')=='/api/v1/images/hero-joy'
  action('wardrobe-select').filter(has_text='Casual').click();assert grid.locator('[data-expression-slot=joy] img').get_attribute('src')=='/api/v1/images/casual-joy'
  action('wardrobe-select').filter(has_text='Dynamight').click();assert grid.locator('[data-expression-slot=joy] img').get_attribute('src')=='/api/v1/images/hero-joy'
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
  if width in (1440,390):page.screenshot(path=str(ROOT/f'test-results/wardrobes-{width}.png'))
  # Mount live packet projections. Same member, different outfits, including a legacy key.
  page.evaluate('''()=>{document.querySelector('#cast').hidden=true;document.querySelector('#chat').innerHTML=t.castRenderIslands('<swarm-cast=katsuki-joy wardrobe=patrol>"Patrol."</swarm-cast> <swarm-cast=katsuki-joy wardrobe=default>"Casual."</swarm-cast> <swarm-cast=katsuki-patrol-confident>"Old packet."</swarm-cast> <swarm-cast=katsuki-angry wardrobe=patrol>"Fallback."</swarm-cast>');window.narrative=new t.StudioCastNarrative(ctx);window.asset=i=>document.querySelectorAll('[data-ss-cast-slot]')[i]?.shadowRoot?.querySelector('img');window.authored=document.querySelector('#chat').innerHTML}''')
  page.wait_for_function('asset(3)?.getAttribute("src")==="/api/v1/images/hero-neutral"')
  assert page.evaluate('Array.from({length:4},(_,i)=>asset(i).getAttribute("src"))')==['/api/v1/images/hero-joy','/api/v1/images/casual-joy','/api/v1/images/hero-confident','/api/v1/images/hero-neutral']
  # Exercise card correction through actual context menu; never edit source text.
  page.evaluate('asset(0).dispatchEvent(new MouseEvent("contextmenu",{bubbles:true,composed:true,cancelable:true}))')
  editor=page.locator('.ss-card-editor');editor.wait_for();editor.get_by_role('button',name='Replace expression',exact=True).click();editor.get_by_label('Card wardrobe').select_option('default');editor.get_by_role('button',name='Apply to card').click();editor.get_by_text('Expression correction saved.').wait_for()
  page.wait_for_function('asset(0)?.getAttribute("src")==="/api/v1/images/casual-joy"');assert page.evaluate('asset(1).getAttribute("src")')=='/api/v1/images/casual-joy';assert page.evaluate('asset(2).getAttribute("src")')=='/api/v1/images/hero-confident';assert page.evaluate('document.querySelector("#chat").innerHTML===authored')
  editor.get_by_role('button',name='Restore original').click();editor.get_by_role('button',name='Apply to card').click();page.wait_for_function('asset(0)?.getAttribute("src")==="/api/v1/images/hero-joy"')
  assert not errors,errors
  print(f'Cast wardrobe migration, scoped workshop and historical card correction {width}px: PASS',flush=True)
  page.close()
 browser.close()
