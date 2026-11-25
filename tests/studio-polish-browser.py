"""Compiled frontend regression: mobile shared footer, scaled dialogs, prompt editor,
background queue and widget activity isolated from normal generation state."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64, os, re
ROOT = Path(__file__).resolve().parents[1]
compiled = (ROOT/'dist/frontend.js').read_text()
fixture = (ROOT/'tests/ui-harness.html').read_text().replace('<head>', '<head><base href="http://studio.local/">').replace('import { setup } from "../dist/frontend.js"', compiled.replace('</script','<\\/script'))
fixture = fixture.replace('    const handlers = []', '''    const handlers = []; window.emitPolish = payload => handlers.forEach(fn=>fn(payload));
    window.polishCalls = []; window.backgroundSnapshot = [];
    const storage=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)}});
''')
fixture = fixture.replace('      sendToBackend(message) {', '''      sendToBackend(message) {
        polishCalls.push(structuredClone(message));
        if(message.type==='list_cast_background_jobs') {later({type:'cast_background_jobs_result',requestId:message.requestId,data:backgroundSnapshot});return;}
        if(message.type==='load_cast_library') {later({type:'cast_result',requestId:message.requestId,data:{chatId:'chat-1',groups:[{id:'crew',name:'Crew',inject:true,generateBackgrounds:true,backgrounds:[{id:'background-1',key:'kitchen',name:'Kitchen'}]}],chatGroups:{'chat-1':'crew'},members:[],backgroundJobs:backgroundSnapshot}});return;}
        if(message.type==='set_tag_automation') {later({type:'tag_automation_result',requestId:message.requestId,data:message.config});return;}
''')
fixture = fixture.replace('images: true, chats: true','images: true, chats: true, chatMutation: true')
fixture = fixture.replace('    drawerRoot.querySelector("button").click()', '')
fixture = fixture.replace('#drawer { display: block; position: fixed; inset: 0; padding: 16px; overflow: auto; }','#drawer { display: block; position: fixed; inset: 55px auto 0 0; width: min(360px,100vw); padding: 4px; box-sizing:border-box; overflow: auto; }')
out=ROOT/'test-results';out.mkdir(exist_ok=True)
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
WORLD=base64.b64decode(re.search(r'--world:\s*url\("data:image/jpeg;base64,([^"\)]+)"\)',(ROOT/'docs/cast-layout-sources/curated-cards.html').read_text())[1])
PREVIEW='data:image/jpeg;base64,'+base64.b64encode(WORLD).decode()
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (1440,390,320):
  page=browser.new_page(viewport={'width':width,'height':860},has_touch=width<=720)
  page.set_default_timeout(8000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/api/v1/images/**',lambda r:r.fulfill(content_type='image/jpeg' if 'background-1' in r.request.url else 'image/png',body=WORLD if 'background-1' in r.request.url else ART))
  page.route('**/api/v1/image-gen/**',lambda r:r.fulfill(content_type='application/json',body='{"presets":[]}'))
  page.set_content(fixture,wait_until='domcontentloaded')
  page.locator('.ss-launcher').wait_for()
  drawer=page.locator('#drawer').bounding_box();launcher=page.locator('.ss-launcher').bounding_box()
  assert abs(drawer['y']+drawer['height']-(launcher['y']+launcher['height'])) <= 20,(drawer,launcher)
  assert page.locator('.ss-launcher-actions button').nth(0).locator('svg').count()==1
  assert page.locator('.ss-launcher-actions button').nth(1).locator('svg').count()==1
  if width==390: page.screenshot(path=str(out/'polish-drawer-390.png'))
  page.locator('.ss-launcher-actions button').nth(0).click()
  shell=page.locator('.ss-shell');shell.wait_for()
  footer=page.locator('.ss-commandbar');nav=page.locator('.ss-mobile-tabs')
  # Connected tabs at every viewport and every workspace; a real active seam.
  for view in ('styles','visuals','cast','lore','generate'):
   page.locator(f'.ss-view-nav [data-view={view}]').click()
   page.mouse.move(1,1);page.wait_for_timeout(180)
   tab_state=page.evaluate('''()=>{const n=document.querySelector('.ss-view-nav'),t=n.querySelector('[aria-current=page]'),p=document.querySelector('[data-studio-page]:not([hidden])'),c=getComputedStyle(t),seam=getComputedStyle(t,'::after');return {active:t.dataset.view,count:n.querySelectorAll('[aria-current=page]').length,radius:c.borderTopLeftRadius,top:c.borderTopWidth,bottom:c.borderBottomWidth,fill:c.backgroundColor,seam:seam.backgroundColor,seamHeight:seam.height,tabBottom:t.getBoundingClientRect().bottom,navBottom:n.getBoundingClientRect().bottom,paneTop:p.getBoundingClientRect().top,navRight:n.getBoundingClientRect().right,tabRight:n.lastElementChild.getBoundingClientRect().right}}''')
   assert tab_state['active']==view and tab_state['count']==1,tab_state
   assert tab_state['radius']=='8px' and tab_state['top']=='1px' and tab_state['bottom']=='0px',tab_state
   assert tab_state['fill']==tab_state['seam'] and tab_state['seamHeight']=='2px',tab_state
   assert abs(tab_state['tabBottom']-tab_state['navBottom'])<=2 and abs(tab_state['paneTop']-tab_state['navBottom'])<=2,tab_state
   assert tab_state['tabRight']<=tab_state['navRight'],tab_state
  # Test actual computed pixels across custom theme colors, including the
  # independent black Buttons swatch that previously swallowed the CTA.
  button=page.locator('.ss-generate:visible').first
  for accent,ink in (('#a6a1e9',[0,0,0]),('#24114d',[255,255,255]),('#777777',[0,0,0]),('#666666',[255,255,255]),('#ffffff',[0,0,0]),('#000000',[255,255,255])):
   page.evaluate("""accent=>{const s=document.querySelector('.ss-shell');s.style.setProperty('--ss-accent',accent);s.style.setProperty('--ss-primary-bg','#000000');s.style.setProperty('--ss-primary-ink','#ffffff');s.style.setProperty('--ss-button-bg','#000000')}""",accent)
   page.wait_for_timeout(180)
   def colors():
    return button.evaluate('''el=>{const c=getComputedStyle(el),x=document.createElement('canvas').getContext('2d',{willReadFrequently:true});function rgb(v){x.clearRect(0,0,1,1);x.fillStyle=v;x.fillRect(0,0,1,1);return Array.from(x.getImageData(0,0,1,1).data).slice(0,3)}return [rgb(c.backgroundColor),rgb(c.color)]}''')
   expected=[int(accent[i:i+2],16) for i in (1,3,5)]
   assert colors()==[expected,ink],(width,accent,colors())
   if not button.is_disabled():
    button.hover();page.wait_for_timeout(180);assert colors()==[expected,ink],(width,accent,colors());page.mouse.move(1,1)
  page.evaluate("""()=>{const s=document.querySelector('.ss-shell');s.style.setProperty('--ss-accent','#a6a1e9')}""");page.wait_for_timeout(180)
  if width in (1440,390):page.screenshot(path=str(out/f'alpha71-tabs-{width}.png'))
  page.evaluate("""()=>{const s=document.querySelector('.ss-shell');for(const p of ['--ss-accent','--ss-primary-bg','--ss-primary-ink','--ss-button-bg'])s.style.removeProperty(p)}""")
  if width<=720:
   assert nav.is_visible() and footer.is_visible()
   assert nav.evaluate('el=>el.parentElement.classList.contains("ss-commandbar")')
   for tab in ('generation','style','loras','stack','history','create'):
    nav.locator(f'[data-tab={tab}]').click()
    assert nav.is_visible() and footer.is_visible(),tab
    assert nav.locator('[data-active=true]').count()==1 and nav.locator('[data-active=true]').get_attribute('data-tab')==tab
    page.mouse.move(1,1);page.wait_for_timeout(180)
    state=page.evaluate('''()=>{let f=document.querySelector('.ss-commandbar'),n=document.querySelector('.ss-mobile-tabs'),p=document.querySelector('[data-studio-page]:not([hidden])');return {footer:f.getBoundingClientRect().toJSON(),nav:n.getBoundingClientRect().toJSON(),pane:p.getBoundingClientRect().toJSON(),overflow:document.querySelector('.ss-shell').scrollWidth>innerWidth}}''')
    assert state['pane']['bottom']<=state['footer']['top']+1,(tab,state)
    assert not state['overflow'],state
    assert nav.locator(f'[data-tab={tab}] svg').count()==1
    assert page.locator('[data-mobile-pane]:visible').count()>0,tab
    if width==390 and tab=='generation':page.screenshot(path=str(out/'polish-tune-390.png'))
   page.locator('[data-view=styles]').click();assert shell.get_attribute('data-mobile-tab')=='style'
   page.locator('[data-view=generate]').click();assert shell.get_attribute('data-mobile-tab')=='create'
   assert page.locator('[data-role=positive]').is_visible()
   page.locator('[data-view=visuals]').click();assert footer.is_hidden();page.locator('[data-view=generate]').click()
  positive=page.locator('[data-role=positive]');positive.fill('untouched illustration draft')
  old_image=page.locator('[data-role=preview-image]').get_attribute('src')
  def emit(key,status,**kwargs):
   page.evaluate('payload=>emitPolish(payload)',{'type':'cast_background_job','data':{'groupId':'crew','key':key,'status':status,**kwargs}})
  emit('kitchen','queued');label=page.locator('[data-role=background-label]');label.filter(has_text='Background queued').wait_for()
  emit('library','queued');emit('kitchen','generating',step=3,totalSteps=8,preview=PREVIEW)
  assert label.inner_text()=='Rendering background'
  assert page.locator('[data-role=background-progress]').evaluate('el=>el.value')==37.5
  assert '2 pending' in page.locator('[data-role=background-detail]').inner_text()
  assert page.locator('[data-role=background-preview]').get_attribute('src')==PREVIEW
  assert positive.input_value()=='untouched illustration draft'
  assert page.locator('[data-role=preview-image]').get_attribute('src')==old_image
  assert page.locator('.ss-generate:visible').first.inner_text()=='Generate image'
  if width==390:page.screenshot(path=str(out/'polish-background-progress-390.png'))
  # A concurrent normal render may have its own controls; background completion must not settle it.
  page.evaluate("emitPolish({type:'generation_started',clientJobId:'normal-1',data:{connectionId:'swarm-1',model:'anima'}})")
  normal_label=page.locator('.ss-generate:visible').first.inner_text()
  emit('kitchen','ready',imageId='background-1');assert label.inner_text()=='Background queued'
  emit('library','error',error='provider mock failed');assert label.inner_text()=='Background failed'
  assert page.locator('.ss-generate:visible').first.inner_text()==normal_label
  assert positive.input_value()=='untouched illustration draft'
  # Snapshot sent after an event must not regress it to queued.
  page.evaluate("emitPolish({type:'cast_background_jobs_result',data:[{groupId:'crew',key:'library',status:'queued'}]})")
  assert label.inner_text()=='Background failed'
  emit('library','queued');emit('library','generating',step=4,totalSteps=8);assert label.inner_text()=='Rendering background'
  emit('library','ready',imageId='background-1');assert label.inner_text()=='Background saved'
  assert page.locator('[data-role=background-preview]').get_attribute('src').endswith('/background-1')
  # Prompt family selector uses all nine compiler values and keeps the unsaved protocol.
  page.locator('[data-action=toggle-config]').click();page.locator('[data-settings-tab=generation]').click()
  family=page.locator('[data-role=prompt-family]');family.wait_for()
  assert family.locator('option').count()==9
  prompt=page.locator('[data-role=tag-protocol-prompt]');prompt.fill('unsaved protocol {{swarm_dynamic_guidance}}')
  family.select_option('moss-layout');page.wait_for_function("polishCalls.some(c=>c.type==='set_tag_automation'&&c.config.promptFamily==='moss-layout')")
  assert prompt.input_value()=='unsaved protocol {{swarm_dynamic_guidance}}'
  assert 'Native JSON' in page.locator('[data-role=prompt-family-help]').inner_text()
  strength=page.locator('[data-role=count-strength]');assert strength.input_value()=='1.5'
  for value in ('1.25','0','1.5'):
   strength.select_option(value)
   page.wait_for_function("v=>polishCalls.some(c=>c.type==='set_tag_automation'&&c.config.countStrength===Number(v))",arg=value)
   assert prompt.input_value()=='unsaved protocol {{swarm_dynamic_guidance}}'
   assert strength.input_value()==value
  macro=page.locator('.ss-macro-guide summary');macro.click()
  assert macro.locator('svg').count()==1 and macro.evaluate("el=>getComputedStyle(el).listStyleType==='none' && getComputedStyle(el,'::marker').content==='\"\"'")
  assert page.locator('.ss-macro-guide').evaluate('el=>el.open')
  assert prompt.evaluate('el=>el.getBoundingClientRect().height') >= (180 if width<=720 else 210)
  if width==390:
   page.locator('[data-action=reset-tag-protocol]').click();family.scroll_into_view_if_needed();page.wait_for_timeout(200);page.screenshot(path=str(out/'polish-protocol-390.png'))
  page.locator('[data-action=close-settings]').last.click()
  # Live background job survives closing/reopening Studio without replacing artwork.
  page.locator('[data-action=close-studio]').click()
  badge=page.locator('[data-role=mini-background-badge]');badge.wait_for();assert badge.inner_text()=='✓'
  emit('alley','queued');assert badge.inner_text()=='1';assert 'queued' in badge.get_attribute('title')
  emit('alley','generating',step=2,totalSteps=8);assert 'Rendering background' in badge.get_attribute('title')
  if width==390:page.screenshot(path=str(out/'polish-widget-390.png'))
  page.locator('.ss-launcher-actions button').nth(0).click();page.locator('[data-role=background-label]').filter(has_text='Rendering background').wait_for()
  # Scaled viewport sizing for the native Cast background modal.
  page.locator('[data-view=cast]').click();page.locator('.cast-card[data-id=crew]').click();page.locator('[data-cast-action=backgrounds]').click()
  modal=page.locator('#ss-cast-dialog');modal.wait_for()
  if width<=720:
   before=modal.bounding_box()
   page.evaluate('''()=>{document.documentElement.style.setProperty('--app-scaled-viewport-width',innerWidth+'px');document.body.style.zoom='0.75';document.documentElement.style.setProperty('--app-scaled-viewport-width',(innerWidth/.75)+'px');document.documentElement.style.setProperty('--app-interactive-viewport-height',(innerHeight/.75)+'px')}''')
   after=modal.bounding_box();assert after['width']>=width-30,(width,before,after)
   assert after['x']>=-1 and after['x']+after['width']<=width+1,(width,after)
   if width==390:page.screenshot(path=str(out/'polish-background-modal-scaled-390.png'))
  assert not errors,errors
  page.close();print(f'Studio polish {width}px: PASS',flush=True)
 browser.close()
