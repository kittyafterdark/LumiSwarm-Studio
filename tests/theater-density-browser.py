"""Production Theater + real Cast templates, mock host; no GPU/network."""
import base64, os, json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ','function ')+'\nwindow.T={StoryTheaterController,theaterSequence,theaterActorTimeline,theaterCleanArt,theaterStageDefaults,theaterScenerySvg,THEATER_SCENERY,castPresentationTemplate};'
gallery=ROOT/'docs/readme/gallery';fixture=ROOT/'tests/fixtures/stagecraft';assets={'scene':gallery/'library.webp','scene2':gallery/'forest.webp','ren':gallery/'portrait-cutout.webp','shoto':fixture/'shoto-deadpan.webp','smile':fixture/'shoto-amusement.webp','cg':gallery/'inline-midnight-ramen.webp'}
OUT=Path(os.environ.get('THEATER_SCREENSHOTS','/tmp/theater136-density'));OUT.mkdir(parents=True,exist_ok=True)
def jump_index(root,index):
 target=root.locator(f'[data-jump="{index}"]')
 if not target.is_visible():
  target.locator("xpath=ancestor::section[contains(@class, 'index-group')]").locator(".index-toggle").click()
 target.click()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(w,h) for w,h in [(1440,900),(390,844),(320,640)] if not os.environ.get("THEATER_WIDTH") or w==int(os.environ["THEATER_WIDTH"]) ]:
  page=browser.new_page(viewport={'width':width,'height':height},has_touch=width<=720,reduced_motion='reduce');page.set_default_timeout(5000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content('<!doctype html><button id="launch">Theater</button><main id="chat"></main>')
  page.evaluate('''assets=>{window.assets=assets;const store=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});localStorage.setItem('ss-story-theater-art-v1',JSON.stringify({global:{preset:'renai',cast:'recommended',actors:true}}))}''',{k:'data:image/webp;base64,'+base64.b64encode(v.read_bytes()).decode() for k,v in assets.items()});page.add_script_tag(content=code)
  page.evaluate('''()=>{const chat=document.querySelector('#chat');window.calls=[];window.activeChat='one';window.evt=new Map();let n=0;function msg(html){const a=document.createElement('article');a.dataset.id='m'+n++;a.innerHTML='<div data-message-content>'+html+'</div>';chat.append(a);return a.querySelector('[data-message-content]')}
   function card(name,id,expression,src,side,scene,quote){const row=msg('<span data-ss-cast-slot="1"></span>');const slot=row.firstChild;slot.dataset.ssCastKey=id+'-'+expression;if(scene)slot.dataset.ssCastBackground=scene;const root=slot.attachShadow({mode:'open'});root.innerHTML=T.castPresentationTemplate('vn-hero',{key:id+'-'+expression,src:assets[src],name,label:expression,dialogue:quote,color:id==='ren'?'#efcaff':'#acd5ff',background:scene&&scene!=='none'?{id:scene,name:scene==='scene2'?'The forest':'The library'}:undefined,side,crop:{enabled:false,x:50,y:20,zoom:1}},s=>s);const c=root.querySelector('[data-swarm-cast]');c.dataset.castMemberId=id;if(scene&&scene!=='none'){c.style.setProperty('--cast-world','url("'+assets[scene]+'")');c.dataset.castSceneId=scene}return slot}
   msg('<p>Before anyone arrived.</p>');card('Shōto','shoto','deadpan','shoto','left','scene','“I thought you might come back.”');msg('<p>He looked out the window for a moment.</p>');card('Ren','ren','neutral','ren','right','scene','“You were waiting?”');msg('<p>Outside, rain gathered against the library windows. Neither of them had anywhere else to be.</p>');msg('<p>The room fell quiet again.</p>');card('Shōto','shoto','amusement','smile','left','scene','“Perhaps.”');msg('<p>He smiled, just barely.</p>');const cg=msg('<figure data-swarm-studio-image="true"><img alt="Dinner"></figure>');cg.querySelector('img').src=assets.cg;msg('<p>They finished their dinner.</p>');card('Ren','ren','neutral','ren','right','scene2','“We should go.”');msg('<p>The trees surrounded him.</p>');card('Ren','ren','neutral','ren','right','none','“Nothing here.”');msg('<p>Beyond the scene.</p>');
   window.ctx={getActiveChat:()=>({chatId:activeChat}),dom:{listMessageElements:()=>[...chat.querySelectorAll('article')].map(element=>({messageId:element.dataset.id,element}))},messages:{listMessageIds:()=>[...chat.querySelectorAll('article')].map(e=>e.dataset.id)},events:{on(name,fn){if(!evt.has(name))evt.set(name,new Set());evt.get(name).add(fn);return()=>evt.get(name).delete(fn)}},sendToBackend:m=>calls.push(m)};window.theater=new T.StoryTheaterController(ctx);document.querySelector('#launch').onclick=()=>theater.open();window.original=chat.innerHTML;
   const frames=T.theaterSequence(ctx).frames;window.timeline=T.theaterActorTimeline(frames);window.boundary=frames.map(f=>!!f.sceneBoundary);window.originalArt=localStorage.getItem('ss-story-theater-art-v1');
  }''')
  assert page.evaluate('timeline.map(s=>s.actors.map(a=>a.expression))')==[[],['deadpan'],['deadpan'],['deadpan','neutral'],['deadpan','neutral'],['deadpan','neutral'],['neutral','amusement'],['neutral','amusement'],['neutral','amusement'],['neutral','amusement'],['neutral'],['neutral'],['neutral'],['neutral']]
  assert page.evaluate('boundary')==[True,False,False,False,False,False,False,False,False,False,True,False,True,False]
  page.locator('#launch').click();shell=page.locator('.ss-story-theater-dialog .shell').first;stage=shell.locator('main.stage');panel=shell.locator('.panel');layer=shell.locator('.stagecraft-actors');pat=shell.locator('.stagecraft-pattern')
  def go(n):
   shell.locator('[data-action=backlog]').click();jump_index(panel,n);assert shell.locator('[data-count]').inner_text()==f'{n+1} / 14'
  def editor():
   shell.locator('[data-action=settings]').click();panel.locator('[data-action=art]').click();panel.locator('[data-art-tab=effects]').click()
  def shot(name):
   page.wait_for_timeout(100);page.screenshot(path=str(OUT/f'{name}-{width}.png'))
  def visible():return layer.locator('[data-visible=true]').count()
  go(3)
  def apply_art(art):
   page.evaluate('''art=>{localStorage.setItem('ss-story-theater-art-v1',JSON.stringify({global:art}));theater.close();theater.open()}''',art)
   go(3);page.wait_for_timeout(100)
  base={'preset':'celluloid','cast':'recommended','actors':True,'staging':'native','dialogue':75,'sceneLabel':80}
  apply_art(base)
  quote=stage.locator('.native-quote');size=lambda:float(quote.evaluate('e=>getComputedStyle(e).fontSize').removesuffix('px'))
  assert size()>=18,(width,size());assert layer.locator('[data-active=false][data-visible=true]').evaluate('e=>getComputedStyle(e).opacity')=='1';assert layer.locator('[data-active=false][data-visible=true]').evaluate('e=>getComputedStyle(e).filter')=='saturate(0) brightness(0.75)'
  shot('native-celluloid');initial=size();apply_art({**base,'nativeDialogue':140});assert size()>initial
  apply_art({**base,'actorOpacity':65,'actorBrightness':90});assert layer.locator('[data-active=false][data-visible=true]').evaluate('e=>getComputedStyle(e).opacity')=='0.65';assert layer.locator('[data-active=false][data-visible=true]').evaluate('e=>getComputedStyle(e).filter')=='saturate(0) brightness(0.9)'
  def measure():
   return stage.evaluate('''e=>{const frame=e.querySelector('.frame'),proj=frame.querySelector('.projection>div'),card=proj.shadowRoot.querySelector('[data-swarm-cast]'),quote=card.querySelector('[data-swarm-cast-dialogue]'),strip=card.querySelector('.strip-swiss'),r=e.getBoundingClientRect(),cr=card.getBoundingClientRect();return {gap:r.bottom-parseFloat(getComputedStyle(e).borderBottomWidth)-cr.bottom,stripGap:strip?r.bottom-parseFloat(getComputedStyle(e).borderBottomWidth)-strip.getBoundingClientRect().bottom:null,font:parseFloat(getComputedStyle(quote).fontSize)*Number(proj.style.zoom||1),zoom:Number(proj.style.zoom||1),scroll:e.scrollHeight-e.clientHeight}}''')
  for preset in ['overlap-swiss','shonen-burst','vn-hero']:
   art={**base,'cast':'custom','card':preset,'staging':'authored','dockCards':True}
   apply_art(art);m=measure();print(width,preset,m,flush=True);assert abs(m['gap'])<5 or m['scroll']>2,m
   if preset=='overlap-swiss':assert abs(m['stripGap'])<5 or m['scroll']>2,m
   if m['scroll']>2:
    stage.evaluate('e=>e.scrollTop=e.scrollHeight');assert abs(measure()['gap'])<5,measure();stage.evaluate('e=>e.scrollTop=0')
   shot(preset+'-docked')
   if preset=='overlap-swiss':
    shell.locator('.foot [data-action=hide]').click();page.wait_for_timeout(120);assert abs(measure()['stripGap'])<5,measure();shell.locator('.restore').focus();shell.locator('.restore').click();page.wait_for_timeout(120)
    shell.locator('[data-action=settings]').click();panel.locator('[data-action=art]').click();panel.locator('[data-art-tab=cast]').click();panel.locator('[data-art-setting=graphicDialogue]').evaluate('e=>{e.value="60";e.dispatchEvent(new Event("change",{bubbles:true}))}');assert measure()['font']<m['font']*.95;panel.locator('[data-action=panel-close]').click()
   if preset!='vn-hero':
    apply_art({**art,'graphicDialogue':60});sm=measure();assert sm['font']<m['font']*.95,(m,sm)
    apply_art({**art,'dockCards':False});undocked=measure();assert undocked['gap']>m['gap']+5 or undocked['scroll']>2,(m,undocked)
  assert page.evaluate('document.querySelector("#chat").innerHTML===original');assert page.evaluate('calls.length')==0;assert not errors,errors
  page.evaluate('theater.destroy()');print(f'THEATER DENSITY {width} PASS',flush=True);page.close()
 browser.close()
