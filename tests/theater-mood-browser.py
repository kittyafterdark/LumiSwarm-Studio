"""Compiled native/author stage mood integration, mocked shared Cast settings."""
import os,base64
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ','function ')+'\nwindow.T={StoryTheaterController,theaterSequence,theaterCleanArt,castPresentationTemplate,castAtmosphereVisual};'
assets={k:'data:image/webp;base64,'+base64.b64encode((ROOT/p).read_bytes()).decode() for k,p in {'scene':'docs/readme/gallery/library.webp','actor':'tests/fixtures/stagecraft/shoto-deadpan.webp','cg':'docs/readme/gallery/inline-midnight-ramen.webp'}.items()}
OUT=Path(os.environ.get('THEATER_SCREENSHOTS','/tmp/theater177-mood'));OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(w,h) for w,h in [(1440,900),(390,844),(320,640)] if not os.environ.get('THEATER_WIDTH') or w==int(os.environ['THEATER_WIDTH'])]:
  page=browser.new_page(viewport={'width':w,'height':h},has_touch=w<700,reduced_motion='reduce');page.set_default_timeout(6000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content('<!doctype html><button id="launch">Theater</button><main id="chat"></main>')
  page.evaluate('''assets=>{window.assets=assets;const store=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});localStorage.setItem('ss-story-theater-art-v1',JSON.stringify({global:{preset:'renai',cast:'recommended',actors:true,staging:'native',weather:'rain',intensity:35}}))}''',assets);page.add_script_tag(content=code)
  page.evaluate('''()=>{const chat=document.querySelector('#chat');let n=0;window.prefs={enabled:true,intensity:80,actor:60,transitions:true,colorA:'#ffaacc',colorB:'#233344'};function msg(html){const a=document.createElement('article');a.dataset.id='m'+n++;a.innerHTML='<div data-message-content>'+html+'</div>';chat.append(a);return a.firstElementChild}
   function card(mood,scene,preset='vn-hero'){const row=msg('<span data-ss-cast-slot="1"></span>'),slot=row.firstChild;slot.dataset.ssCastKey='shoto-deadpan';slot.dataset.ssCastBackground=scene;if(mood)slot.dataset.ssCastAtmosphere=mood;const root=slot.attachShadow({mode:'open'});root.innerHTML=T.castPresentationTemplate(preset,{key:'shoto-deadpan',src:assets.actor,name:'Shōto',label:'deadpan',dialogue:'“Stay.”',color:'#acd5ff',background:{id:scene,name:scene},side:'left',crop:{enabled:false,x:50,y:20,zoom:1},atmosphere:T.castAtmosphereVisual(mood,prefs)},s=>s);const c=root.querySelector('[data-swarm-cast]');c.dataset.castMemberId='shoto';c.dataset.castSceneId=scene;c.dataset.castSceneUrl=assets.scene;if(preset==='vn-hero')c.style.setProperty('--cast-world','url("'+assets.scene+'")');return slot}
   card('moonlight','library');msg('<p>The room fell quiet.</p>');card('golden-hour','library','overlap-swiss');msg('<p>He turned.</p>');const cg=msg('<figure data-swarm-studio-image="true"><img alt="CG"></figure>');cg.querySelector('img').src=assets.cg;card('none','library');msg('<p>Ordinary light.</p>');card('custom','library');msg('<p>Custom light.</p>');card('','forest');msg('<p>A different room.</p>');
   window.ctx={getActiveChat:()=>({chatId:'one'}),dom:{listMessageElements:()=>[...chat.children].map(element=>({messageId:element.dataset.id,element}))},messages:{listMessageIds:()=>[...chat.children].map(x=>x.dataset.id)},events:{on:()=>()=>{}},sendToBackend:()=>{throw Error('unexpected backend call')}};window.theater=new T.StoryTheaterController(ctx,id=>{if(id!=='one')throw Error('wrong cast');return prefs});document.querySelector('#launch').onclick=()=>theater.open();window.original=chat.innerHTML;
  }''')
  assert page.evaluate('T.theaterSequence(ctx).frames.map(f=>f.mood)')==['moonlight','moonlight','golden-hour','golden-hour','golden-hour','none','none','custom','custom','none','none']
  assert page.evaluate('T.theaterCleanArt({mood:"invalid",moodIntensity:999,moodActor:-50})')=={'preset':'original','cast':'original','moodIntensity':100,'moodActor':0}
  page.locator('#launch').click();shell=page.locator('.ss-story-theater-dialog .shell').first;panel=shell.locator('.panel');scenery=shell.locator('.scenery');actor=shell.locator('.stagecraft-actors [data-visible=true] img');stage=shell.locator('main.stage')
  def go(i):
   shell.locator('[data-action=backlog]').click();t=panel.locator(f'[data-jump="{i}"]');
   if not t.is_visible():t.locator("xpath=ancestor::section[contains(@class,'index-group')]").locator('.index-toggle').click()
   t.click()
  def mood(k):expect(shell).to_have_attribute('data-stage-mood',k)
  def lighting():
   shell.locator('[data-action=settings]').click();panel.locator('[data-quick-stage=lighting]').click()
  go(0);mood('moonlight');assert 'brightness(0.592)' in scenery.evaluate('e=>getComputedStyle(e).filter');assert 'brightness(0.8656)' in actor.evaluate('e=>getComputedStyle(e).filter');assert stage.locator('.native-quote').evaluate('e=>getComputedStyle(e).color')=='rgb(172, 213, 255)';assert shell.locator('.ambience').locator('*').count()>0
  page.screenshot(path=str(OUT/f'moonlight-{w}.png'));go(1);mood('moonlight');assert 'brightness(0.8656)' in actor.evaluate('e=>getComputedStyle(e).filter');go(2);mood('golden-hour');go(4);mood('golden-hour');assert stage.locator('.cg img').evaluate('e=>getComputedStyle(e).filter')=='none';go(5);mood('none');go(7);mood('custom');assert '#ffaacc' in shell.evaluate('e=>e.style.getPropertyValue("--cast-atmosphere-wash")');go(9);mood('none');go(0);mood('moonlight')
  lighting();panel.locator('[data-stage-mood-choice=dawn]').click();mood('dawn');assert panel.locator('[data-stage-mood-choice=dawn]').get_attribute('aria-pressed')=='true';page.screenshot(path=str(OUT/f'lighting-{w}.png'));panel.locator('[data-action=panel-close]').click();mood('moonlight')
  lighting();panel.locator('[data-stage-mood-choice=none]').click();mood('none');panel.locator('[data-action=art-apply]').click();panel.locator('[data-action=panel-close]').click();go(2);mood('none');lighting();panel.locator('[data-stage-mood-choice=follow]').click();mood('golden-hour');panel.locator('[data-action=art-apply]').click();panel.locator('[data-action=panel-close]').click();go(0);mood('moonlight')
  # Authored world keeps the actor filter, but suppresses the redundant internal wash.
  shell.locator('[data-action=settings]').click();panel.locator('[data-quick-tab=cast]').click();panel.locator('[data-art-setting=staging]').select_option('authored');c=stage.locator('[data-swarm-cast]');expect(c).to_have_attribute('data-cast-atmosphere','moonlight');assert c.locator('.world').evaluate('e=>getComputedStyle(e,"::before").backgroundImage')=='none';assert 'brightness(0.8656)' in c.locator('img[data-cast-asset]').evaluate('e=>getComputedStyle(e).filter');panel.locator('[data-action=panel-close]').click()
  page.evaluate('prefs.enabled=false');go(1);mood('none');lighting();panel.locator('[data-stage-mood-choice=moonlight]').click();mood('moonlight');panel.locator('[data-action=panel-close]').click();mood('none');assert page.evaluate('document.querySelector("#chat").innerHTML===original');assert not errors,errors
  print(f'mood: {w} passed',flush=True);page.close()
 browser.close()
