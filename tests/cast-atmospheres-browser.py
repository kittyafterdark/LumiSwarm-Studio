"""Compiled workspace, packet hydration, immutable source and motion behavior."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os, re, base64
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={CAST_PRESENTATION_ENTRIES,cleanCastLibrary,cleanCastAtmosphereSettings,castRenderIslands,renderCastTags,StudioCastWorkspace,StudioCastNarrative,STYLES,CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
WORLD=base64.b64decode(re.search(r'--world:\s*url\("data:image/jpeg;base64,([^"\)]+)"\)',(ROOT/'docs/cast-layout-sources/curated-cards.html').read_text('utf8'))[1])
(ROOT/'test-results').mkdir(exist_ok=True)
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 for width in (1440,390,320):
  page=browser.new_page(viewport={'width':width,'height':860},reduced_motion='no-preference');errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/jpeg' if 'world' in route.request.url else 'image/png',body=WORLD if 'world' in route.request.url else ART))
  page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell"><div class="ss-cast-workspace" id="cast" style="width:min(1360px,100%);height:820px;overflow:auto"></div></div><main id="chat" style="width:min(100%,640px)"></main></body></html>''')
  page.add_script_tag(content=JS)
  page.evaluate('''()=>{
    const style=document.createElement('style');style.textContent=t.STYLES+t.CAST_PRESENTATION_CSS+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(style);
    window.mock={library:t.cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'BNHA',inject:true,defaultPresentation:'vn-hero',defaultBackground:'plaza',backgrounds:[{key:'plaza',name:'Evening plaza',id:'world1'}]}],members:[{id:'actor',groupId:'crew',name:'Shoto',prefix:'shoto',images:{neutral:{id:'neutral'},joy:{id:'joy'}}}],chatGroups:{chat:'crew'}}),calls:[],callbacks:new Set(),overrides:{},preferences:{}};
    const emit=p=>{for(const fn of [...mock.callbacks])fn(structuredClone(p))};mock.emit=emit;
    window.ctx={getActiveChat:()=>({chatId:'chat'}),dom:{listMessageElements:()=>[{messageId:'m1',element:document.querySelector('#chat')}],getMessageId:()=> 'm1'},messages:{getRecent:()=>[{id:'m1',chat_id:'chat',swipe_id:0}]},events:{on:()=>()=>{}},onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(p){mock.calls.push(structuredClone(p));queueMicrotask(()=>{
      const reply=data=>emit({type:'cast_result',requestId:p.requestId,data});
      if(p.type==='load_cast_library')reply({...mock.library,chatId:'chat'});
      else if(p.type==='save_cast_library'){if(p.baseSignature!==JSON.stringify(mock.library)){emit({type:'studio_error',requestId:p.requestId,error:'Fixture stale write'});return}mock.library=t.cleanCastLibrary(p.library);reply(mock.library);emit({type:'cast_library_changed',library:mock.library});}
      else if(p.type==='set_cast_atmosphere'){mock.library.groups.find(g=>g.id===p.groupId).atmosphere=t.cleanCastAtmosphereSettings(p.settings);emit({type:'cast_library_changed',library:mock.library});reply({library:mock.library})}
      else if(p.type==='load_cast_card_overrides')emit({type:'cast_card_overrides_result',requestId:p.requestId,chatId:p.chatId,data:mock.overrides,preferences:mock.preferences});
      else if(p.type==='set_cast_card_override'){if(p.override)mock.overrides[p.key]=p.override;else delete mock.overrides[p.key];emit({type:'cast_card_override_result',requestId:p.requestId,chatId:p.chatId,key:p.key,override:p.override})}
    })}};
    window.workspace=new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>[],()=>{},()=>{});
  }''')
  page.set_default_timeout(7000)
  page.locator('.cast-card[data-id=crew]').click();action=lambda key:page.locator(f'[data-cast-action="{key}"]')
  action('backgrounds').click();action('atmosphere').click()
  modal=page.locator('#ss-cast-dialog');form=modal.locator('#ss-cast-atmosphere-form');preview=form.locator('[data-atmosphere-preview]');card=preview.locator('[data-swarm-cast]')
  assert card.get_attribute('data-cast-atmosphere')=='golden-hour';assert not form.locator('[name=enabled]').is_checked();assert not form.locator('[name=animations]').is_checked();assert not form.locator('[name=transitions]').is_checked()
  assert preview.locator('img').evaluate('(i)=>i.complete&&i.naturalWidth>0') or preview.locator('img').evaluate('(i)=>i.decode().then(()=>true)')
  original=preview.locator('.stage').evaluate('(e)=>getComputedStyle(e,"::before").backgroundImage');assert 'color(srgb' in original or 'color-mix' in original or 'rgba(' in original,original
  assert 'world1' in original,original
  form.locator('[name=palette][value=none]').check();assert card.get_attribute('data-cast-atmosphere') is None
  baseline=preview.locator('.stage').evaluate('(e)=>getComputedStyle(e).backgroundImage');assert baseline!=original
  assert preview.locator('.stage').evaluate('(e)=>getComputedStyle(e,"::before").content')=='none'
  quote=preview.locator('[data-swarm-cast-dialogue]').evaluate('(e)=>getComputedStyle(e).color')
  form.locator('[name=palette][value=moonlight]').check();assert card.get_attribute('data-cast-atmosphere')=='moonlight'
  assert preview.locator('[data-swarm-cast-dialogue]').evaluate('(e)=>getComputedStyle(e).color')==quote
  assert preview.locator('img').evaluate('(e)=>getComputedStyle(e).filter')!='none'
  assert preview.locator('.stage').evaluate('(e)=>getComputedStyle(e).filter')=='none'
  assert preview.locator('.stage').evaluate('(e)=>getComputedStyle(e,"::before").filter').startswith('brightness(0.')
  assert 'contrast(1.' in preview.locator('.stage').evaluate('(e)=>getComputedStyle(e,"::before").filter')
  assert form.locator('[name=intensity]').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
  assert form.locator('[name=intensity]').evaluate('(e)=>getComputedStyle(e).appearance')=='none'
  assert preview.locator('img').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
  form.locator('[name=palette][value=custom]').check();form.locator('[name=colorA]').fill('#ff8866');form.locator('[name=colorB]').fill('#223366')
  assert '#ff8866' in card.get_attribute('style')
  form.locator('[name=palette][value=moonlight]').check();form.locator('[name=enabled]').check();form.locator('[name=transitions]').check();form.locator('[name=animations]').check()
  assert preview.locator('img').evaluate('(e)=>getComputedStyle(e).animationName')=='ss-cast-atmosphere-reveal'
  assert preview.locator('img').evaluate('(e)=>getComputedStyle(e).transitionProperty')=='filter'
  page.emulate_media(reduced_motion='reduce');assert preview.locator('img').evaluate('(e)=>getComputedStyle(e).animationName')=='none';assert preview.locator('img').evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s'
  page.emulate_media(reduced_motion='no-preference')
  assert modal.evaluate('(e)=>e.getBoundingClientRect().width<=innerWidth && e.getBoundingClientRect().height<=innerHeight')
  assert modal.locator('.dialog-footer').evaluate('(e)=>e.getBoundingClientRect().bottom<=innerHeight')
  assert form.evaluate('(e)=>e.scrollWidth<=e.clientWidth+2')
  if width<661:assert preview.evaluate('(e)=>e.getBoundingClientRect().top>=document.querySelector(".dialog-body").getBoundingClientRect().top-1'), 'preview must remain visible while adjusting settings'
  form.locator('.cast-atmosphere-controls').evaluate('(e)=>e.scrollTop=0');page.wait_for_timeout(300)
  if width in (1440,390):page.screenshot(path=str(ROOT/f'test-results/atmospheres-{width}.png'))
  modal.get_by_role('button',name='Save atmospheres').click();page.wait_for_function('mock.library.groups[0].atmosphere.enabled===true');action('atmosphere').click()
  assert form.locator('[name=enabled]').is_checked();assert form.locator('[name=animations]').is_checked();assert form.locator('[name=colorA]').input_value()=='#ff8866'
  action('close-dialog').click()
  page.evaluate('''()=>{document.querySelector('#cast').hidden=true;document.querySelector('#chat').innerHTML=t.castRenderIslands('Before <swarm-cast=shoto-neutral background=plaza atmosphere=moonlight><font color="#ff90ca">"Moonlight."</font></swarm-cast> <swarm-cast=shoto-joy background=plaza>"Original."</swarm-cast> <swarm-cast=shoto-joy background=plaza atmosphere=none>"None."</swarm-cast> after.');window.authored=document.querySelector('#chat').innerHTML;window.narrative=new t.StudioCastNarrative(ctx);window.card=i=>document.querySelectorAll('[data-ss-cast-slot]')[i]?.shadowRoot?.querySelector('[data-swarm-cast]')}''')
  page.wait_for_function('card(0)?.dataset.castAtmosphere==="moonlight" && card(2)')
  assert page.evaluate('card(1).dataset.castAtmosphere===undefined && card(2).dataset.castAtmosphere===undefined')
  assert page.evaluate('getComputedStyle(card(0).querySelector(".stage"),"::before").backgroundImage!==getComputedStyle(card(1).querySelector(".stage")).backgroundImage')
  assert page.evaluate('getComputedStyle(card(0).querySelector("[data-swarm-cast-dialogue]")).color')=='rgb(255, 144, 202)'
  # The eight real scene layouts each grade only their scenery, not the stage or text.
  grades=page.evaluate("""()=>{const fixtures=document.createElement('div');fixtures.style.cssText='position:fixed;left:-10000px;top:0;width:640px';document.body.append(fixtures);const results=t.CAST_PRESENTATION_ENTRIES.filter(e=>e.composition==='scene').map(p=>{const lib=t.cleanCastLibrary({...mock.library,members:[{...mock.library.members[0],presentation:p.id}]});fixtures.innerHTML=t.renderCastTags('<swarm-cast=shoto-neutral background=plaza atmosphere=moonlight><font color="#ff90ca">"Scene."</font></swarm-cast>',lib,s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));const stage=fixtures.querySelector('.stage'),world=stage.querySelector('.postcard-photo,.film-cell,.comic-world,.postcard-photo-rebellion'),grade=world?getComputedStyle(world):getComputedStyle(stage,'::before');return {id:p.id,grade:grade.filter,stage:getComputedStyle(stage).filter,dialogue:getComputedStyle(stage.querySelector('[data-swarm-cast-dialogue]')).filter}});fixtures.remove();return results}""")
  assert len(grades)==8 and all('brightness(0.' in g['grade'] and 'contrast(1.' in g['grade'] and g['stage']=='none' and g['dialogue']=='none' for g in grades),grades
  page.emulate_media(reduced_motion='reduce');assert page.evaluate('getComputedStyle(card(0).querySelector("img")).animationName')=='none'
  page.evaluate('''()=>{mock.library.groups[0].atmosphere.enabled=false;mock.emit({type:'cast_library_changed',library:mock.library})}''');page.wait_for_function('card(0)?.dataset.castAtmosphere===undefined');assert page.evaluate('document.querySelector("#chat").innerHTML===authored')
  assert not errors,errors
  print(f'Atmosphere editor, actual CSS, reduced motion, save/reopen and immutable live hydration {width}px: PASS',flush=True)
  page.close()
 browser.close()
