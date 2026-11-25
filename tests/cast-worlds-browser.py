"""Real Chromium: saved scenes, full Cast workspace mock, actual Island hydration,
responsive curated templates. No Swarm service or generation is needed."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, re, os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''\nwindow.t={CAST_PRESENTATION_ENTRIES,CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,castRenderIslands,castPresentationTemplate,renderCastTags,cleanCastLibrary,StudioCastWorkspace,StudioCastNarrative,STYLES};'''
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
WORLD=base64.b64decode(re.search(r'--world:\s*url\("data:image/jpeg;base64,([^"\)]+)"\)',(ROOT/'docs/cast-layout-sources/curated-cards.html').read_text('utf8'))[1])
ESC="s=>String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]))"
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1120,'height':860})
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/jpeg' if 'world' in route.request.url else 'image/png',body=WORLD if 'world' in route.request.url else ART))
 page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui"><div class="ss-shell"><div class="ss-cast-workspace" id="cast" style="width:min(900px,100%);height:820px;overflow:auto"></div></div><main id="message" style="width:min(100%,640px)"></main></body></html>')
 page.add_script_tag(content=JS)
 page.evaluate('''()=>{
 const style=document.createElement('style');style.textContent=t.STYLES+'\n'+t.CAST_PRESENTATION_CSS+'\n'+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(style);
 const library=t.cleanCastLibrary({activeGroupId:'crew',chatGroups:{chat:'crew'},groups:[{id:'crew',name:'Crew',defaultPresentation:'vn-hero'}],members:[{id:'s',groupId:'crew',name:'Shoto',prefix:'shoto',images:{joy:{id:'portrait1'}}}]});
 window.mock={library,callbacks:new Set(),nextImage:'world1',sent:[],source:'Before <swarm-cast=shoto-joy background=sidewalk>"First."</swarm-cast> between <swarm-cast=shoto-joy background=none>"Second."</swarm-cast> after.'};
 const emit=p=>{for(const fn of [...mock.callbacks])fn(p)};
 window.ctx={getActiveChat:()=>({chatId:'chat'}),dom:{listMessageElements:()=>[{messageId:'m1',element:document.querySelector('#message')}],getMessageId:()=> 'm1'},events:{on:()=>()=>{}},onBackendMessage(fn){mock.callbacks.add(fn);return()=>mock.callbacks.delete(fn)},sendToBackend(data){mock.sent.push(data.type);queueMicrotask(()=>{if(data.type==='load_cast_library')emit({type:'cast_result',requestId:data.requestId,data:{...mock.library,chatId:'chat',characterId:''}});else if(data.type==='save_cast_library'){const failure=mock.failNext;mock.failNext='';if(failure==='reject'){emit({type:'studio_error',requestId:data.requestId,error:'Choose an available background image you own.'});return}mock.library=t.cleanCastLibrary(data.library);emit({type:'cast_library_changed',library:mock.library});if(failure==='commit-error')emit({type:'studio_error',requestId:data.requestId,error:'Response lost after write'});else emit({type:'cast_result',requestId:data.requestId,data:mock.library})}else if(data.type==='export_cast_background_folder')emit({type:'cast_result',requestId:data.requestId,data:{count:mock.library.groups[0].backgrounds.length}})})}};
 window.mountWorkspace=()=>new t.StudioCastWorkspace(ctx,document.querySelector('#cast'),()=>[],()=>{},(initial,choose)=>choose({id:mock.nextImage,url:'/api/v1/images/'+mock.nextImage}));window.workspace=mountWorkspace();
 document.querySelector('#message').innerHTML=t.castRenderIslands(mock.source);window.narrative=new t.StudioCastNarrative(ctx);
 }'''.replace("+'\n'+","+'\\n'+"))
 page.set_default_timeout(8000)
 page.locator('.cast-card').click()
 action=lambda key:page.locator(f'[data-cast-action="{key}"]')
 action('backgrounds').click()
 assert page.locator('#ss-cast-dialog').get_by_text('No backgrounds yet.',exact=False).is_visible()
 action('background-add').click()
 page.locator('[name=name]').fill('Evening sidewalk');page.locator('[name=key]').fill('sidewalk')
 # A genuine backend rejection must not create a phantom local reference.
 page.evaluate('mock.failNext="reject"')
 page.locator('button[form="ss-cast-background-form"]').click()
 page.locator('[data-cast-error]').wait_for()
 assert page.locator('[name=name]').input_value()=='Evening sidewalk'
 assert page.evaluate('mock.library.groups[0].backgrounds.length===0')
 page.locator('#ss-cast-dialog [data-cast-action=backgrounds]').click()
 assert page.locator('#ss-cast-dialog').get_by_text('No backgrounds yet.',exact=False).is_visible()
 action('background-add').click()
 page.locator('[name=name]').fill('Evening sidewalk');page.locator('[name=key]').fill('sidewalk')
 # If the write committed but the response failed, reconcile persisted state.
 page.evaluate('mock.failNext="commit-error"')
 page.locator('button[form="ss-cast-background-form"]').click()
 page.locator('.cast-background-tile').wait_for()
 assert not page.locator('[data-cast-error]').count()
 page.wait_for_function('mock.library.groups[0].backgrounds.length===1')
 page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('.ss-cast-design')?.style.getPropertyValue('--cast-world').includes('world1')")
 action('background-default').click();page.wait_for_function('mock.library.groups[0].defaultBackground==="sidewalk"')
 # Explicit opt-out must remain scene-free even with a default.
 assert page.evaluate("document.querySelectorAll('[data-ss-cast-slot]')[1].shadowRoot.querySelector('.ss-cast-design').style.getPropertyValue('--cast-world')")==''
 action('background-rename').click();page.locator('[name=name]').fill('Plaza');page.locator('[name=key]').fill('plaza');page.locator('button[form="ss-cast-background-form"]').click()
 page.wait_for_function('mock.library.groups[0].backgrounds[0].aliases.includes("sidewalk")&&mock.library.groups[0].defaultBackground==="plaza"')
 action('background-export').click();page.wait_for_function('mock.sent.includes("export_cast_background_folder")')
 page.evaluate('mock.nextImage="world2"');action('background-replace').click();page.locator('button[form="ss-cast-background-form"]').click()
 page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('.ss-cast-design')?.style.getPropertyValue('--cast-world').includes('world2')")
 action('close-dialog').first.click();page.locator('[data-cast-action=member-tab][data-tab=presentation]').click();action('open-presentation-modal').click()
 assert page.locator('.cast-preset-choice').count()==52
 page.locator('[data-cast-action=presentation-filter][data-group=scene]').click();assert page.locator('.cast-preset-choice').count()==8
 page.locator('#ss-cast-preview-background').select_option('none');assert not page.locator('.cast-preset-choice [style*="--cast-world:url"]').count()
 page.locator('#ss-cast-preview-background').select_option('plaza');assert page.locator('.cast-preset-choice [style*="--cast-world:url"]').count()==8
 # The actual workspace stylesheet must not turn transparent scene sprites into album photos.
 assert page.evaluate("""()=>[...document.querySelectorAll('.cast-preset-choice .actor img')].every(i=>{const s=getComputedStyle(i);return s.backgroundColor==='rgba(0, 0, 0, 0)'&&s.transform==='none'&&s.paddingTop==='0px'&&s.paddingBottom==='0px'})""")
 for side in ('left','right'):
  page.locator(f'.cast-gallery-stage [data-side="{side}"]').click()
  page.wait_for_function(f"[...document.querySelectorAll('.cast-preset-choice .ss-cast-design')].every(n=>n.dataset.castSide==='{side}')")
  page.wait_for_function('[...document.querySelectorAll(".cast-preset-choice img")].every(i=>i.complete)')
  assert page.evaluate("""side=>[...document.querySelectorAll('.cast-preset-choice .stage')].every(stage=>{const a=stage.querySelector('.actor').getBoundingClientRect(),s=stage.getBoundingClientRect();return side==='left'?a.x+a.width/2<s.x+s.width/2:a.x+a.width/2>s.x+s.width/2})""",side),side
 page.locator('.cast-gallery-stage [data-side="auto"]').click()
 page.locator('.cast-preset-group').scroll_into_view_if_needed()
 page.screenshot(path=str(ROOT/'test-results/cast-picker-clean.png'))
 page.locator('[data-cast-action=presentation-filter][data-group=overlap]').click();assert page.locator('.cast-preset-choice').count()>=10
 action('close-dialog').first.click();action('backgrounds').click()
 # Real modal at phone width, with the new controls present.
 page.set_viewport_size({'width':390,'height':844})
 page.screenshot(path=str(ROOT/'test-results/cast-backgrounds-mobile.png'))
 assert page.locator('.cast-background-default').locator('[data-cast-action=background-clear]').count()==1
 action('background-clear').click();page.wait_for_function('!mock.library.groups[0].defaultBackground')
 action('background-default').click();page.wait_for_function('mock.library.groups[0].defaultBackground==="plaza"')
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
 action('background-remove').click();action('background-remove-confirm').click()
 page.wait_for_function('mock.library.groups[0].backgrounds.length===0&&!mock.library.groups[0].defaultBackground')
 page.wait_for_function("document.querySelector('[data-ss-cast-slot]')?.shadowRoot?.querySelector('.ss-cast-design')?.style.getPropertyValue('--cast-world')==='' ")
 assert page.evaluate('''()=>{const m=document.querySelector('#message');return m.textContent==='Before "First." between "Second." after.'&&[...m.querySelectorAll('[data-ss-cast-slot]')].every(s=>s.shadowRoot.querySelectorAll('[data-swarm-cast-dialogue]').length===1)}''')
 assert page.evaluate('mock.sent.every(type=>!type.includes("generat"))')
 print('CAST WORLDS UI/ISLAND PASS: add, default, aliases, replace, export, preview filter, mobile, remove, immutable native prose, no GPU jobs',flush=True)
 page.evaluate('workspace.dispose();narrative.destroy()')
 page.set_viewport_size({'width':1600,'height':900})
 # Render exact production CSS and compiled catalog, not the original doctype.
 page.evaluate('''()=>{document.body.innerHTML='<main id="sheet"></main>';document.body.style.cssText='margin:0;background:#15131a;color:#f0eaf2;font:14px system-ui';}''')
 for family in ('overlap','other'):
  page.evaluate('''({family})=>{const entries=t.CAST_PRESENTATION_ENTRIES.filter(e=>e.origin==='atelier'&&(family==='overlap'?e.composition==='overlap':e.composition!=='overlap'));const esc='''+ESC+''';document.querySelector('#sheet').innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;padding:16px">${entries.map(e=>`<section style="min-width:0;background:#1b1820;border:1px solid #3d3544;padding:12px;border-radius:8px"><h3 style="margin:0 0 12px;font-size:14px">${e.name}</h3>${t.castPresentationTemplate(e.id,{key:'shoto-joy',src:'/api/v1/images/portrait1',name:'Shoto',label:'joy',dialogue:esc('“We could kiss in the middle of the plaza and they would thank us for the market share increase.”'),color:'',background:{id:'world1',name:'Evening walkway'},crop:{enabled:false,x:50,y:50,zoom:1}},esc)}</section>`).join('')}</div>`}''',{'family':family})
  page.wait_for_function('[...document.images].every(i=>i.complete)');page.wait_for_timeout(300)
  page.screenshot(path=str(ROOT/f'test-results/cast-curated-{family}.png'),full_page=True)
 assert not errors,errors
 browser.close()
