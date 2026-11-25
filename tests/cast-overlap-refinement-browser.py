"""Actual compiled card renderer in a mocked message Shadow DOM.
Checks long dialogue, short dialogue, contrasting speaker colors, stage-side
parity, capsule avatar provenance and the original 1-actor/1-quote contract.
Set CAST_OVERLAP_SCREENSHOTS to save the visual review sheet.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
ROOT=Path(__file__).resolve().parents[1]
SOURCE=(ROOT/'dist/frontend.js').read_text(encoding='utf8')
SCRIPT=SOURCE.rsplit('export {',1)[0].replace('export function ','function ')+'\nwindow.T={castPresentationTemplate,castPresentationStageWidth,CAST_ISLAND_CSS,cleanCastLibrary,renderCastTags,theaterArtCard,theaterCleanArt};'
ASSETS=ROOT/'tests/fixtures/stagecraft'
SHORT='“You came back?”'
LONG='“Ugh, Todoroki, you are zero fun when you are being practical. I thought you two were hanging out all the time now! Do not tell me you guys only talk about boot brushes and agency paperwork. Wait, what about you? You are twenty now, you are making top-ten rookie buzz every month, and half the interns at Mt. Lady’s office have your poster in their lockers. Are you seeing anybody?”'
IDS=['shonen-burst','manga-sfx','anime-ova','overlap-cyber','overlap-capsule','overlap-origami','overlap-washi','overlap-docket']
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1450,'height':1000},reduced_motion='reduce')
 page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/webp',body=(ASSETS/('shoto-amusement.webp' if route.request.url.endswith('/default-face') else 'shoto-deadpan.webp')).read_bytes()))
 page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#121318;color:#f4f0ee;font:15px/1.5 system-ui"><main id="root"></main></body></html>')
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)));page.add_script_tag(content=SCRIPT)
 rows=page.evaluate('''async ({ids,short,long})=>{
   const root=document.querySelector('#root'),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
   const opts={key:'Shoto-deadpan',src:'/api/v1/images/current-face',defaultSrc:'/api/v1/images/default-face',name:'Shoto Todoroki',label:'Deadpan',crop:{enabled:false,x:50,y:20,zoom:1}};
   const report=[];
   const box=e=>e.getBoundingClientRect();
   for(const width of [760,420,320])for(const side of ['auto','left','right'])for(const color of ['#ff42ae','#141e36','#ffcd24'])for(const id of ids){
     const host=document.createElement('div');host.style.width=width+'px';root.replaceChildren(host);const shadow=host.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=T.CAST_ISLAND_CSS;shadow.append(style);const content=document.createElement('div');content.className='ss-cast-island-content';shadow.append(content);
     const heights=[];let data;
     for(const quote of [short,long]){
       content.innerHTML=T.castPresentationTemplate(id,{...opts,color,side,dialogue:esc(quote)},esc);
       const d=content.querySelector('.ss-cast-design'),q=d.querySelector('[data-swarm-cast-dialogue]'),img=d.querySelector('[data-cast-asset]');await img.decode();const r=box(d),t=box(q),a=box(img);
       const meta=d.querySelector('.vhs-speaker-tag');const badge=d.querySelector('.capsule-badge');heights.push(r.height);
       data={id,width,side,color,quoteWidth:t.width,quoteHeight:t.height,stageWidth:r.width,actorWidth:a.width,actorHeight:a.height,actorLoaded:img.naturalWidth>0,contained:t.left>=r.left-2&&t.right<=r.right+2&&t.bottom<=r.bottom+2&&q.scrollWidth<=q.clientWidth+2&&q.scrollHeight<=q.clientHeight+2,overflow:host.scrollWidth>host.clientWidth+2,oneActor:d.querySelectorAll('[data-cast-asset]').length===1,oneQuote:d.querySelectorAll('[data-swarm-cast-dialogue]').length===1,exact:q.textContent===quote,ink:getComputedStyle(q).color,meta:meta?{bg:getComputedStyle(meta).backgroundColor,fg:getComputedStyle(meta).color}:null,ova:meta?{bg:getComputedStyle(meta.parentElement).backgroundColor,image:getComputedStyle(meta.parentElement).backgroundImage,border:getComputedStyle(meta.parentElement).borderTopWidth,after:getComputedStyle(meta.parentElement,'::after').content,shadow:getComputedStyle(q).textShadow,outline:getComputedStyle(q).getPropertyValue('--ova-outline').trim()}:null,badge:badge?{image:getComputedStyle(badge).backgroundImage,text:badge.textContent,w:box(badge).width,h:box(badge).height}:null};
     }
     data.grows=heights[1]>heights[0];report.push(data);
   }
   return report;
 }''',{'ids':IDS,'short':SHORT,'long':LONG})
 assert len(rows)==216,len(rows)
 for r in rows:
  assert r['actorLoaded'] and r['contained'] and not r['overflow'] and r['oneActor'] and r['oneQuote'] and r['exact'],r
  assert r['quoteWidth']>=175,r
  assert r['ink']==f"rgb({int(r['color'][1:3],16)}, {int(r['color'][3:5],16)}, {int(r['color'][5:7],16)})",r
  if r['badge']:assert 'default-face' in r['badge']['image'] and not r['badge']['text'] and abs(r['badge']['w']-r['badge']['h'])<1,r
  if r['meta']:assert r['meta']['bg']!='rgba(0, 0, 0, 0)' and r['meta']['bg']!=r['meta']['fg'],r
  if r['ova']:
   assert r['ova']['bg']=='rgba(0, 0, 0, 0)' and r['ova']['image']=='none' and r['ova']['border']=='0px' and r['ova']['after']=='none' and r['ova']['shadow']!='none',r
   assert r['ova']['outline']==('#fff' if r['color']=='#141e36' else '#08080a'),r
  if r['id'] in ('manga-sfx','anime-ova','overlap-cyber','overlap-capsule','overlap-origami','overlap-washi','overlap-docket'):assert r['grows'],r
 for r in rows:
  if r['width']==760 and r['id']=='shonen-burst':assert r['quoteWidth']>=380,r
  if r['width']==760 and r['id']=='manga-sfx':assert r['quoteWidth']>=470,r
 # End-to-end default expression selection (and renderer fallback), not just template substitution.
 result=page.evaluate('''()=>{const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lib=T.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Group'}],members:[{id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'overlap-capsule',defaultExpression:'neutral',images:{neutral:{id:'default-face'},deadpan:{id:'current-face'}}}]});
 const html=T.renderCastTags('<swarm-cast=Shoto-deadpan> <font color="#ff42ae">"Hello."</font></swarm-cast>',lib,esc);const t=document.createElement('template');t.innerHTML=html;const c=t.content.querySelector('[data-swarm-cast]');const f={content:t.content,text:'Hello.',kind:'cast',scene:''};const override=T.theaterArtCard(f,T.theaterCleanArt({preset:'renai',cast:'custom',card:'overlap-capsule'}));const o=override.querySelector('[data-swarm-cast]');return {defaultSrc:c.dataset.castDefaultImage,main:c.querySelector('[data-cast-asset]').getAttribute('src'),badge:c.style.getPropertyValue('--cast-badge-image'),theater:o.style.getPropertyValue('--cast-badge-image')};}''')
 assert result['defaultSrc'].endswith('/default-face') and result['main'].endswith('/current-face') and 'default-face' in result['badge'] and 'default-face' in result['theater'],result
 assert not errors,errors
 if os.environ.get('CAST_OVERLAP_SCREENSHOTS'):
  out=Path(os.environ['CAST_OVERLAP_SCREENSHOTS']);out.mkdir(parents=True,exist_ok=True)
  for color,filename in [('#ff42ae','bright-ink'),('#141e36','dark-ink')]:
   page.evaluate('''({ids,long,color})=>{const root=document.querySelector('#root');root.replaceChildren();root.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:16px;align-items:start';for(const id of ids){const h=document.createElement('section');h.style.cssText='width:100%;box-sizing:border-box;padding:12px;border:1px solid #393a44;border-radius:8px;min-width:0';root.append(h);const s=h.attachShadow({mode:'open'});const style=document.createElement('style');style.textContent=T.CAST_ISLAND_CSS;s.append(style);const title=document.createElement('h3');title.style.cssText='font:600 13px system-ui;color:#ddd;margin:0 0 10px';title.textContent=id;s.append(title);const content=document.createElement('div');content.className='ss-cast-island-content';s.append(content);content.innerHTML=T.castPresentationTemplate(id,{key:'Shoto-deadpan',src:'/api/v1/images/current-face',defaultSrc:'/api/v1/images/default-face',name:'Shoto Todoroki',label:'Deadpan',dialogue:long,color,side:'auto',crop:{enabled:false,x:50,y:20,zoom:1}},s=>String(s).replace(/"/g,'&quot;'));}}''',{'ids':IDS,'long':LONG,'color':color});page.wait_for_timeout(500);page.screenshot(path=str(out/f'{filename}.png'),full_page=True)
 print(f'OVERLAP REFINEMENT PASS: {len(rows)} layout cases (8 presets × 3 widths × 3 sides × 3 authored colors), short/long quotes, wardrobe default badge, Theater override')
 browser.close()
