"""Art direction: production bundle, actual Cast templates, mock host, responsive preview and persistence."""
import os, json, base64
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ','function ')+ '\nwindow.T={StoryTheaterController,theaterSequence,theaterSnapshot,theaterCleanArt,theaterArtCard,theaterArtStorage,THEATER_ART,castPresentationTemplate,castRenderIslands,StudioCastNarrative};'
gallery=ROOT/'docs/readme/gallery'
assets={'scene':gallery/'library.webp','portrait':gallery/'portrait-cutout.webp','cg':gallery/'inline-midnight-ramen.webp','cg2':gallery/'inline-lockers.webp'}
OUT=Path(os.environ.get('THEATER_SCREENSHOTS','/tmp/theater132-art'));OUT.mkdir(parents=True,exist_ok=True)
def jump_index(root,index):
 target=root.locator(f'[data-jump="{index}"]')
 if not target.is_visible():
  target.locator("xpath=ancestor::section[contains(@class, 'index-group')]").locator(".index-toggle").click()
 target.click()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(w,h) for w,h in [(1440,900),(390,844),(320,640)] if not os.environ.get("THEATER_WIDTH") or w==int(os.environ["THEATER_WIDTH"]) ]:
  page=browser.new_page(viewport={'width':width,'height':height},has_touch=width<=720, reduced_motion='reduce')
  page.set_default_timeout(5000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content('<!doctype html><html><body><button id="launch">Story Theater</button><main id="chat"></main></body></html>')
  page.evaluate("""assets=>{window.assets=assets;const store=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});localStorage.setItem('ss-story-theater-art-v1',JSON.stringify({global:{staging:'authored'}}))}""",{k:'data:image/webp;base64,'+base64.b64encode(v.read_bytes()).decode() for k,v in assets.items()})
  page.add_script_tag(content=code)
  page.evaluate('''()=>{
   const t=window.T;const chat=document.querySelector('#chat');window.calls=[];window.evt=new Map();window.activeChat='chat-one';
   const card=t.castPresentationTemplate('afterglow-cinema',{key:'ren-neutral',src:assets.portrait,name:'Ren',label:'neutral',dialogue:'“You came back. <font color="#ffc05e">I thought you might.</font> The city has been quiet all evening.”',color:'#e8d8ff',background:{id:'scene',name:'The library'},side:'right',crop:{enabled:false,x:50,y:20,zoom:1}},s=>s);
   const a=document.createElement('article');a.dataset.id='m1';a.innerHTML='<header>Forbidden header</header><div data-message-content><p>Rain whispered against the library windows. <em>He waited.</em> <font color="#ff79bb">Hello</font> <span style="color:rgb(95, 210, 235);font-weight:700;position:fixed;left:9999px">World</span></p><p>“Before.” <span data-ss-cast-slot="1" data-ss-cast-key="ren-neutral">“You came back.”</span> <strong>After the pause.</strong></p><figure data-swarm-studio-image="true"><img src="/api/v1/images/cg" alt="Midnight ramen"><button data-swarm-studio-inline-action="open">Do not copy</button></figure><p>After the artwork.</p><div data-html-island></div><p>One more paragraph.</p></div><button>Regenerate</button>';chat.append(a);a.querySelector('figure img').src=assets.cg;
   const host=a.querySelector('[data-ss-cast-slot]');host.attachShadow({mode:'open'}).innerHTML=card.replace('/api/v1/images/scene',assets.scene);
   const island=a.querySelector('[data-html-island]');island.attachShadow({mode:'open'}).innerHTML='<style>.fixture-panel{background:#263550;color:#fff;padding:24px;border:1px solid #86a6cf;border-radius:12px}.fixture-panel strong{color:#d3bcff}</style><section class="fixture-panel"><strong>Messages · 02:14</strong><p>Meet me downstairs. <font color="#ffb070">Tonight.</font></p><button data-regex-action="send" onclick="window.bad=1">Reply</button><script>window.bad=2</script></section>';
   const b=document.createElement('article');b.dataset.id='m2';b.innerHTML='<div class="_content_abc"><p>Last message.</p><img src="/api/v1/images/cg2" alt="Hallway"></div>';chat.append(b);b.querySelector('img').src=assets.cg2;
   window.ctx={getActiveChat:()=>({chatId:window.activeChat}),dom:{listMessageElements:()=>[...chat.querySelectorAll('article')].reverse().map(element=>({messageId:element.dataset.id,element}))},messages:{listMessageIds:()=>['m0','m1','m2','m3']},events:{on(name,fn){if(!evt.has(name))evt.set(name,new Set());evt.get(name).add(fn);return()=>evt.get(name).delete(fn)}},sendToBackend:m=>calls.push(m)};
   window.emit=name=>{for(const fn of evt.get(name)||[])fn()};window.theater=new t.StoryTheaterController(ctx);document.querySelector('#launch').onclick=()=>theater.open();window.original=chat.innerHTML;
  }''')
  page.locator('#launch').click();shell=page.locator('.ss-story-theater-dialog .shell').first;stage=shell.locator('main.stage');count=shell.locator('[data-count]');panel=shell.locator('.panel')
  def go(n):
   shell.locator('[data-action=backlog]').click();jump_index(panel,n);assert count.inner_text()==f'{n+1} / 10'
  def editor():
   shell.locator('[data-action=settings]').click();panel.locator('[data-action=art]').click();assert panel.get_attribute('data-panel')=='art'
  def shot(name):
   page.wait_for_timeout(100);page.screenshot(path=str(OUT/f'{name}-{width}.png'))
  go(2)
  original_card=stage.locator('[data-swarm-cast]');original_quote=stage.locator('[data-swarm-cast-dialogue]').inner_text();original_actor=stage.locator('[data-cast-asset]').get_attribute('src')
  assert original_card.get_attribute('data-cast-preset')=='afterglow-cinema'
  density=stage.locator('.projection > div').evaluate('e=>({zoom:Number(e.style.zoom),caption:Number(e.style.getPropertyValue("--th-caption-scale")),density:e.dataset.density})');assert density['density']=='scene'
  if width==1440: assert density['zoom']>1.4 and density['caption']<.95,density
  editor();assert panel.locator('.art-tile').count()==9;shot('picker-original')
  panel.locator('[data-art-preset=ghost]').click();assert shell.get_attribute('data-art')=='ghost';assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-preset')=='afterglow-cinema'
  panel.locator('[data-art-tab=cast]').click();panel.locator('[data-art-setting=cast]').select_option('recommended');assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-preset')=='cyber-comms';assert stage.locator('.th-codec-monitor').count()==1;assert stage.locator('[data-swarm-cast-dialogue]').inner_text()==original_quote
  assert stage.locator('[data-cast-asset]').get_attribute('src')==original_actor
  assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-side')=='right';assert stage.locator('[data-swarm-cast-dialogue]').get_by_text('I thought you might.',exact=True).evaluate('e=>getComputedStyle(e).color')=='rgb(255, 192, 94)'
  panel.locator('[data-action=panel-close]').click();assert shell.get_attribute('data-art')=='original';assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-preset')=='afterglow-cinema';assert page.evaluate('JSON.parse(localStorage.getItem("ss-story-theater-art-v1")).global.staging')=='authored'
  expected={'celluloid':'afterglow-letterbox','paper-riot':'manga-frame','velvet':'gothic-folio','ghost':'cyber-comms','ephemera':'washi-scrapbook','reverie':'overlap-materia','critical':'persona-comic','renai':'vn-hero'}
  for theme,card in expected.items():
   editor();panel.locator(f'[data-art-preset={theme}]').click();panel.locator('[data-art-tab=cast]').click();panel.locator('[data-art-setting=cast]').select_option('recommended');panel.locator('[data-action=art-apply]').click();panel.locator('[data-action=panel-close]').click();assert shell.get_attribute('data-art')==theme;assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-preset')==card;assert stage.locator('[data-swarm-cast-dialogue]').inner_text()==original_quote;assert stage.locator('[data-cast-asset]').get_attribute('src')==original_actor
   # Actual screenshot with hidden chrome, preserving available space.
   shell.locator('[data-action=hide]').first.click();shot(theme+'-cast');shell.locator('.restore').click()
   for n,kind in [(0,'narration'),(4,'cg'),(6,'html')]:
    go(n);assert stage.locator('.frame').get_attribute('data-kind')==kind
    if kind=='html': assert stage.locator('.fixture-panel').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(38, 53, 80)'
    if width==1440 or kind=='narration':
     shell.locator('[data-action=hide]').first.click();shot(theme+'-'+kind);shell.locator('.restore').click()
    assert shell.evaluate('e=>e.scrollWidth<=e.clientWidth+1')
   go(2);print(f'{width} {theme} PASS',flush=True)
  editor();panel.locator('[data-art-preset=ghost]').click();panel.locator('[data-art-tab=effects]').click();panel.locator('[data-stage-tab=atmosphere]').click();panel.locator('[data-art-setting=weather]').select_option('rain');assert shell.locator('.ambience').get_attribute('data-weather')=='rain';assert shell.locator('.ambience i').count()>0
  panel.locator('[data-art-setting=motion]').uncheck();assert shell.locator('.ambience').get_attribute('data-motion')=='false';panel.locator('[data-art-tab=looks]').click();panel.locator('[data-art-preset=ephemera]').click();assert shell.locator('.ambience').get_attribute('data-weather')=='rain';panel.locator('[data-art-preset=ghost]').click()
  panel.locator('[data-art-tab=cast]').click();panel.locator('[data-art-setting=cast]').select_option('custom');panel.locator('.art-card-search').fill('manga sfx');panel.locator('[data-art-card=manga-sfx]').click();assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-preset')=='manga-sfx'
  panel.locator('[data-art-setting=scope]').select_option('chat');panel.locator('[data-action=art-apply]').click();panel.locator('[data-action=panel-close]').click();assert page.evaluate('T.theaterArtStorage().chats["chat-one"].preset')=='ghost';assert page.evaluate('T.theaterArtStorage().global.preset')=='renai'
  shell.locator('[data-action=exit]').click();page.locator('#launch').click();assert shell.get_attribute('data-art')=='ghost';assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-preset')=='manga-sfx'
  # Save and recall a named variant; export, rejected import, valid import preview.
  editor();panel.locator('[data-art-tab=library]').click();panel.locator('.art-name').fill('Night watch');panel.locator('[data-action=art-save-named]').click();assert panel.locator('[data-art-setting=saved] option').count()==2;panel.locator('[data-action=art-load-saved]').click();panel.locator('[data-action=art-export]').click();assert json.loads(panel.locator('.art-json').input_value())['preset']=='ghost'
  panel.locator('.art-json').fill('{"preset":"not-a-theme"}');panel.locator('[data-action=art-import]').click();assert 'Invalid' in panel.locator('.art-actions .art-status').inner_text();panel.locator('.art-json').fill('{"preset":"ephemera","cast":"recommended","weather":"snow","intensity":999,"palette":["url(evil)"]}');panel.locator('[data-action=art-import]').click();assert shell.get_attribute('data-art')=='ephemera'
  # Alpha.15 uses a bounded procedural field, not the old 40-particle pattern.
  assert shell.locator('.ambience').get_attribute('data-weather')=='snow'
  assert 55<=shell.locator('.ambience i').count()<=56
  panel.locator('[data-action=art-export]').click();imported=json.loads(panel.locator('.art-json').input_value());assert imported['intensity']==100 and 'palette' not in imported,imported
  panel.locator('.art-json').fill('{"preset":"ephemera","cast":"recommended","weather":"rain","intensity":999}');panel.locator('[data-action=art-import]').click();assert shell.locator('.ambience').get_attribute('data-weather')=='rain';assert shell.locator('.ambience i').count()==72
  panel.locator('[data-action=panel-close]').click();assert shell.get_attribute('data-art')=='ghost'
  assert page.evaluate('document.querySelector("#chat").innerHTML===original');assert page.evaluate('calls.length')==0
  shell.locator('[data-action=exit]').click();page.evaluate('window.activeChat="different-chat"');page.locator('#launch').click();assert shell.get_attribute('data-art')=='renai'
  page.evaluate('theater.destroy()');assert not errors,errors;print(f'ART DIRECTION {width} PASS',flush=True);page.close()
 browser.close()
