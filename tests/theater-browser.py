"""Story Theater: production bundle, mock host and real Cast renderer; no GPU."""
import os, json, base64
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ','function ')+ '\nwindow.T={StoryTheaterController,theaterSequence,theaterSnapshot,castPresentationTemplate,castRenderIslands,StudioCastNarrative};'
gallery=ROOT/'docs/readme/gallery'
assets={'scene':gallery/'library.webp','portrait':gallery/'portrait-cutout.webp','cg':gallery/'inline-midnight-ramen.webp','cg2':gallery/'inline-lockers.webp'}
OUT=Path(os.environ.get('THEATER_SCREENSHOTS','/tmp/theater-screens'));OUT.mkdir(parents=True,exist_ok=True)
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
   const card=t.castPresentationTemplate('afterglow-cinema',{key:'ren-neutral',src:assets.portrait,name:'Ren',label:'neutral',dialogue:'“You came back.”',color:'#e8d8ff',background:{id:'scene',name:'The library'},side:'right',crop:{enabled:false,x:50,y:20,zoom:1}},s=>s);
   const a=document.createElement('article');a.dataset.id='m1';a.innerHTML='<header>Forbidden header</header><div data-message-content><p>Rain whispered against the library windows. <em>He waited.</em> <font color="#ff79bb">Hello</font> <span style="color:rgb(95, 210, 235);font-weight:700;position:fixed;left:9999px">World</span></p><p>“Before.” <span data-ss-cast-slot="1" data-ss-cast-key="ren-neutral">“You came back.”</span> <strong>After the pause.</strong></p><figure data-swarm-studio-image="true"><img src="/api/v1/images/cg" alt="Midnight ramen"><button data-swarm-studio-inline-action="open">Do not copy</button></figure><p>After the artwork.</p><div data-html-island></div><p>One more paragraph.</p></div><button>Regenerate</button>';chat.append(a);a.querySelector('figure img').src=assets.cg;
   const host=a.querySelector('[data-ss-cast-slot]');host.attachShadow({mode:'open'}).innerHTML=card.replace('/api/v1/images/scene',assets.scene);
   const island=a.querySelector('[data-html-island]');island.attachShadow({mode:'open'}).innerHTML='<style>.fixture-panel{background:#263550;color:#fff;padding:24px;border:1px solid #86a6cf;border-radius:12px}.fixture-panel strong{color:#d3bcff}</style><section class="fixture-panel"><strong>Messages · 02:14</strong><p>Meet me downstairs. <font color="#ffb070">Tonight.</font></p><button data-regex-action="send" onclick="window.bad=1">Reply</button><script>window.bad=2</script></section>';
   const b=document.createElement('article');b.dataset.id='m2';b.innerHTML='<div class="_content_abc"><p>Last message.</p><img src="/api/v1/images/cg2" alt="Hallway"></div>';chat.append(b);b.querySelector('img').src=assets.cg2;
   window.ctx={getActiveChat:()=>({chatId:window.activeChat}),dom:{listMessageElements:()=>[...chat.querySelectorAll('article')].reverse().map(element=>({messageId:element.dataset.id,element}))},messages:{listMessageIds:()=>['m0','m1','m2','m3']},events:{on(name,fn){if(!evt.has(name))evt.set(name,new Set());evt.get(name).add(fn);return()=>evt.get(name).delete(fn)}},sendToBackend:m=>calls.push(m)};
   window.emit=name=>{for(const fn of evt.get(name)||[])fn()};window.theater=new t.StoryTheaterController(ctx);document.querySelector('#launch').onclick=()=>theater.open();window.original=chat.innerHTML;
  }''')
  data=page.evaluate('''()=>T.theaterSequence(ctx).frames.map(f=>({kind:f.kind,text:f.text,scene:f.scene}))''')
  print(width,[(d['kind'],d['text'][:45]) for d in data],flush=True)
  assert [d['kind'] for d in data]==['narration','narration','cast','narration','cg','narration','html','narration','narration','cg'],data
  assert data[0]['scene']=='' and data[2]['scene'].startswith('data:image/webp') and all(d['scene'].startswith('data:image/webp') for d in data[2:]),data
  page.locator('#launch').click();shell=page.locator('.ss-story-theater-dialog .shell');stage=shell.locator('main.stage');count=shell.locator('[data-count]');assert count.inner_text()=='1 / 10';assert shell.locator('.scope').inner_text()=='2/4 mounted messages'
  assert stage.locator('em').inner_text()=='He waited.'
  assert stage.get_by_text('Hello',exact=True).evaluate('e=>getComputedStyle(e).color')=='rgb(255, 121, 187)'
  assert stage.get_by_text('World',exact=True).evaluate('e=>[getComputedStyle(e).color,e.style.position]')==['rgb(95, 210, 235)','']
  assert stage.locator('[data-pending]').count()==0
  def go(n):
   shell.locator('[data-action=backlog]').click();jump_index(shell,n);assert count.inner_text()==f'{n+1} / 10'
  def shot(name):
   page.wait_for_timeout(200);page.screenshot(path=str(OUT/f'{name}-{width}.png'))
   geo=shell.evaluate('''e=>({width:e.clientWidth,scroll:e.scrollWidth,height:e.clientHeight,foot:e.querySelector('.foot').getBoundingClientRect().bottom})''');assert geo['scroll']<=geo['width']+1 and geo['foot']<=height+1,geo
  page.keyboard.press('ArrowRight');assert count.inner_text()=='2 / 10';shell.locator('[data-action=next]').click();assert count.inner_text()=='3 / 10';assert stage.locator('[data-swarm-cast-dialogue]').inner_text()=='“You came back.”';stage.locator('img').first.wait_for();page.wait_for_timeout(100);assert stage.locator('img').first.evaluate('i=>i.complete&&i.naturalWidth>0');shot('cast')
  assert float(stage.locator('.projection').get_attribute('data-scale')) >= (1.4 if width==1440 else 1)
  geo=stage.locator('[data-swarm-cast]').bounding_box();assert geo and abs(geo['x']+geo['width']/2-width/2)<5,geo
  assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-preset')=='afterglow-cinema';assert stage.locator('[data-swarm-cast]').get_attribute('data-cast-side')=='right'
  shell.locator('[data-action=next]').click();assert 'After the pause.' in stage.inner_text();shot('narration')
  shell.locator('[data-action=next]').click();assert stage.locator('img').get_attribute('alt')=='Midnight ramen';shot('cg')
  shell.locator('[data-action=hide]').first.click();assert shell.get_attribute('data-chrome')=='hidden';shell.locator('.restore').click();assert shell.get_attribute('data-chrome')=='visible'
  shell.locator('[data-action=gallery]').click();assert shell.locator('.gallery button').count()==2;shot('gallery');shell.locator('.gallery button').last.click();assert count.inner_text()=='10 / 10';assert shell.locator('[data-action=next]').is_disabled()
  go(6);assert stage.locator('.fixture-panel').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgb(38, 53, 80)';assert stage.locator('script').count()==0;assert stage.locator('.fixture-panel button').get_attribute('onclick') is None;assert stage.locator('.fixture-panel button').get_attribute('data-regex-action') is None;assert not page.evaluate('window.bad');assert stage.locator('.projection').evaluate('e=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)';assert stage.get_by_text('Tonight.',exact=True).evaluate('e=>getComputedStyle(e).color')=='rgb(255, 176, 112)';shot('html')
  shell.locator('[data-action=settings]').click();shell.locator('.quick-defaults summary').click();shell.locator('[data-quick-setting=transition][data-quick-value=slide]').click();shell.locator('[data-quick-setting=preset][data-quick-value=reading]').click();shell.locator('[data-setting=seconds]').fill('2');shell.locator('[data-setting=seconds]').dispatch_event('change');shell.locator('[data-action=panel-close]').click();assert shell.get_attribute('data-preset')=='reading'
  go(7);shell.locator('[data-action=play]').click();page.wait_for_function('document.querySelector(".ss-story-theater-dialog > div").shadowRoot.querySelector("[data-count]").textContent==="9 / 10"',timeout=4000);shell.locator('[data-action=play]').click();assert count.inner_text()=='9 / 10';shell.locator('[data-action=exit]').click();assert page.locator('.ss-story-theater-dialog').count()==0;assert page.evaluate('document.activeElement.id')=='launch';page.locator('#launch').click();assert count.inner_text()=='9 / 10';assert shell.get_attribute('data-preset')=='reading'
  page.evaluate('emit("CHAT_SWITCHED")');assert page.locator('.ss-story-theater-dialog').count()==0
  assert page.evaluate('document.querySelector("#chat").innerHTML===original');assert page.evaluate('calls.length')==0
  if width==1440:
   page.evaluate('''()=>{window.activeChat='late';const chat=document.querySelector('#chat');chat.innerHTML='<article data-id="late1"><div data-message-content><p>Before.</p><span data-ss-cast-slot="1" data-ss-cast-key="ren-neutral">“Late.”</span><p>After.</p></div></article>';ctx.messages.listMessageIds=()=>['late1']}''')
   page.locator('#launch').click();shell.locator('[data-action=next]').click();assert count.inner_text()=='2 / 3';assert 'Late.' in stage.locator('.projection p').inner_text()
   page.evaluate('''()=>{const card=T.castPresentationTemplate('afterglow-cinema',{key:'ren-neutral',src:assets.portrait,name:'Ren',label:'neutral',dialogue:'“Late.”',color:'#e8d8ff',background:{id:'scene',name:'Library'},side:'right',crop:{enabled:false,x:50,y:20,zoom:1}},s=>s);document.querySelector('[data-ss-cast-slot]').attachShadow({mode:'open'}).innerHTML=card.replace('/api/v1/images/scene',assets.scene)}''')
   stage.locator('[data-swarm-cast]').wait_for();assert count.inner_text()=='2 / 3';assert stage.locator('[data-swarm-cast-dialogue]').inner_text()=='“Late.”';shell.locator('[data-action=exit]').click();print('Late Cast hydration PASS',flush=True)
  # Exercise active animation, not just the reduced-motion baseline.
  if width in (1440,390):
   page.emulate_media(reduced_motion='no-preference')
   page.evaluate('''()=>{window.activeChat='polish';localStorage.removeItem('ss-story-theater-resume-v1');localStorage.setItem('ss-story-theater-settings-v1',JSON.stringify({reveal:'typewriter',speed:60,seconds:2,transition:'cut'}));const chat=document.querySelector('#chat');chat.innerHTML='<article data-id="polish1"><div data-message-content><p><font color="#ff80be">A long painted sentence.</font> <em>Every letter should remain in the final layout, even before it becomes visible.</em> 🧪</p><span data-ss-cast-slot="1" data-ss-cast-key="ren-neutral">Hello from the other side.</span><p>This is the last screen.</p></div></article>';ctx.messages.listMessageIds=()=>['polish1'];const card=T.castPresentationTemplate('manga-sfx',{key:'ren-neutral',src:assets.portrait,name:'Ren',label:'curiosity',dialogue:'<font color="#e91e84">“Hello from the other side.”</font>',color:'#e91e84',side:'right',crop:{enabled:false,x:50,y:20,zoom:1}},s=>s);document.querySelector('[data-ss-cast-slot]').attachShadow({mode:'open'}).innerHTML=card;window.polishOriginal=chat.innerHTML}''')
   page.locator('#launch').click();assert count.inner_text()=='1 / 3';assert stage.locator('[data-pending]').count()>10
   assert stage.locator('.prose').evaluate('e=>e.textContent.includes("🧪")')
   original_height=stage.locator('.prose').bounding_box()['height'];page.wait_for_timeout(300);assert stage.locator('[data-pending]').count()>0;assert stage.locator('.prose').bounding_box()['height']==original_height
   shell.locator('[data-action=play]').click();page.wait_for_timeout(2200);assert count.inner_text()=='1 / 3';assert stage.locator('[data-pending]').count()>0
   shell.locator('[data-action=next]').click();assert count.inner_text()=='1 / 3';assert stage.locator('[data-pending]').count()==0
   shell.locator('[data-action=play]').click();shell.locator('[data-action=next]').click();assert count.inner_text()=='2 / 3'
   assert stage.locator('[data-swarm-cast-dialogue] [data-pending]').count()>0
   assert stage.locator('[data-swarm-cast-dialogue] span').first.evaluate('e=>getComputedStyle(e).color')=='rgb(233, 30, 132)'
   shell.locator('[data-action=next]').click();assert count.inner_text()=='2 / 3';assert stage.locator('[data-pending]').count()==0
   if width==1440:
    factor=float(stage.locator('.projection').get_attribute('data-scale'));assert factor>=1.5,factor
    before=stage.locator('.manga-figure-center').bounding_box()['height'];assert before>350,before
    shell.locator('[data-action=hide]').first.click();page.wait_for_timeout(200);assert stage.locator('.manga-figure-center').bounding_box()['height']>=before
    shot('overlap-hidden');shell.locator('.restore').click()
   shot('overlap')
   shell.locator('[data-action=settings]').click();shell.locator('.quick-defaults').evaluate('e=>e.open=true');shell.locator('[data-quick-setting=island][data-quick-value=glass]').click();assert shell.get_attribute('data-island')=='glass';assert stage.locator('[data-pending]').count()==0
   shell.locator('[data-action=panel-close]').click();shell.locator('[data-action=next]').click();assert count.inner_text()=='3 / 3';assert not shell.locator('[data-action=next]').is_disabled();shell.locator('[data-action=next]').click();assert shell.locator('[data-action=next]').is_disabled();assert stage.locator('[data-pending]').count()==0
   # Switch to word mode and verify the default animation path and hint fade.
   shell.locator('[data-action=settings]').click();shell.locator('[data-quick-setting=reveal][data-quick-value=words]').click();shell.locator('[data-action=panel-close]').click();shell.locator('[data-action=backlog]').click();shell.locator('[data-jump="0"]').click();assert stage.locator('.prose .th-reveal').count()<35;assert stage.locator('[data-pending]').count()>0
   shell.locator('[data-action=next]').click();assert count.inner_text()=='1 / 3';assert stage.locator('[data-pending]').count()==0
   if width==1440:
    page.mouse.move(10,10);page.wait_for_timeout(4300);assert float(stage.locator('.hint-copy').evaluate('e=>getComputedStyle(e).opacity'))<0.05;assert stage.locator('.hint-mark').evaluate('e=>getComputedStyle(e).animationName')=='th-mark'
   assert page.evaluate('document.querySelector("#chat").innerHTML===polishOriginal');shell.locator('[data-action=exit]').click();print(f'Active motion and overlap fit {width} PASS',flush=True)
  page.evaluate('theater.destroy()');assert page.evaluate('[...evt.values()].every(s=>s.size===0)');assert not errors,errors
  print(f'Theater {width} PASS: source order, real Cast card, scene carry, CG, isolated HTML, gallery, settings, autoplay, resume, teardown',flush=True)
  page.close()
 browser.close()
