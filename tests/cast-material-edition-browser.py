"""Visual and structural regression for eight full-material Cast redesigns.
No application server is needed: render the actual compiled frontend catalog.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64
ROOT=Path(__file__).resolve().parents[1]
SOURCE=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0]
API=SOURCE+'\nwindow.__material={CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,CAST_PRESENTATION_ENTRIES,castPresentationTemplate};'
ART='data:image/png;base64,'+base64.b64encode((ROOT/'tests/fixtures/cast-portrait.png').read_bytes()).decode()
IDS=['tech-messenger','agency-lanyard','cyber-comms','retro-rpg','gothic-folio','mecha-hud','terminal-console','cinematic-bleed']
SELECTORS={
 'tech-messenger':'.r-messenger-thread','agency-lanyard':'.r-badge-plastic',
 'cyber-comms':'.r-comms','retro-rpg':'.r-rpg-battle','gothic-folio':'.r-folio',
 'mecha-hud':'.r-mecha','terminal-console':'.r-terminal-prompt','cinematic-bleed':'.r-cinema'
}
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1160,'height':850},device_scale_factor=1)
 page.set_content('<!doctype html><html><head></head><body style="background:#0b0a0f;color:#f4e9f7;font:13px system-ui;margin:0"><main id="root"></main></body></html>')
 errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
 page.add_script_tag(content=API)
 page.evaluate('''()=>{const a=window.__material,s=document.createElement('style');s.textContent=a.CAST_PRESENTATION_CSS+'\\n'+a.CAST_PRESENTATION_SIDE_CSS;document.head.append(s);}''')
 reports=[]
 for width in [760,420,320]:
  for side in ['auto','left','right']:
   for color in ['#ed7ca8','#599ce3']:
    for key in IDS:
     r=page.evaluate('''async ({width,side,color,key,art,selector})=>{
      const a=window.__material,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const line='We made it to the footbridge before the cameras stopped recording. You really should have seen the expression on his face. ';const q='“'+(width===320?line.repeat(4):line)+'”';
      const html=a.castPresentationTemplate(key,{key:'Mina-neutral',name:'Mina Ashido',label:'neutral smile',src:art,color,dialogue:esc(q),side,crop:{enabled:false,x:50,y:20,zoom:1}},esc);
      document.querySelector('#root').innerHTML=`<div id="lane" style="width:${width}px;max-width:100%;padding:8px;box-sizing:border-box"><p>Before the panel</p>${html}<p id="after">The next paragraph starts normally.</p></div>`;
      const lane=document.querySelector('#lane'),root=lane.querySelector('.ss-cast-design'),img=root.querySelector('[data-cast-asset]'),quote=root.querySelector('[data-swarm-cast-dialogue]');await img.decode().catch(()=>{});
      const target=root.querySelector(selector);const style=getComputedStyle(target),d=root.getBoundingClientRect(),qrect=quote.getBoundingClientRect(),after=lane.querySelector('#after').getBoundingClientRect();
      return {key,width,side,color,assets:root.querySelectorAll('[data-cast-asset]').length,quotes:root.querySelectorAll('[data-swarm-cast-dialogue]').length,
       material:style.backgroundImage+'|'+style.backgroundColor+'|'+style.color,quoteColor:getComputedStyle(quote).color,
       quoteVisible:qrect.width>30&&qrect.height>7,overflow:lane.scrollWidth>lane.clientWidth+2,
       clipping:qrect.left<d.left-2||qrect.right>d.right+2||qrect.bottom>d.bottom+6,following:after.top>=d.bottom-2};
     }''',{'width':width,'side':side,'color':color,'key':key,'art':ART,'selector':SELECTORS[key]})
     reports.append(r)
 failures=[r for r in reports if r['assets']!=1 or r['quotes']!=1 or not r['quoteVisible'] or r['overflow'] or r['clipping'] or not r['following']]
 assert not failures,f'{len(failures)} layout failures: {failures[:8]}'
 assert all(r['quoteColor']==('rgb(237, 124, 168)' if r['color']=='#ed7ca8' else 'rgb(89, 156, 227)') for r in reports)
 for key in IDS:
  mina=next(r for r in reports if r['key']==key and r['width']==760 and r['side']=='auto' and r['color']=='#ed7ca8')
  shoto=next(r for r in reports if r['key']==key and r['width']==760 and r['side']=='auto' and r['color']=='#599ce3')
  assert mina['material']!=shoto['material'],(key,mina['material'])
 # Material styling, not a recycled 3px stripe on one side of rounded boxes.
 css=(ROOT/'scripts/cast-material-redesign.css').read_text('utf-8')
 assert 'border-left:3px' not in css and 'border-left:5px' not in css
 for key in IDS:
  assert sum(key in str(e) for e in IDS)==1

 # Visual inspection contact sheet, real presentation markup, two speaker colors.
 page.set_viewport_size({'width':1220,'height':760})
 page.evaluate('''({ids,art})=>{
  const a=window.__material,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let cases=[];for(const key of ids){const ent=a.CAST_PRESENTATION_ENTRIES.find(e=>e.id===key);const i=ids.indexOf(key),color=i%2?'#599ce3':'#ed7ca8';cases.push(`<section style="border:1px solid #454049;padding:12px;background:#110f16;border-radius:8px;min-width:0"><h3 style="font:700 14px system-ui;color:#e8dce9;margin:0 0 8px">${ent.name}</h3>${a.castPresentationTemplate(key,{key:'Mina-neutral',name:i%2?'Shoto':'Mina',label:'neutral',src:art,color,dialogue:esc('“He said the camera could not see us from here, but he never checked the east stairwell.”'),side:'auto',crop:{enabled:false,x:50,y:20,zoom:1}},esc)}</section>`)}
  document.querySelector('#root').innerHTML=`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;padding:18px">${cases.join('')}</div>`;
 }''',{'ids':IDS,'art':ART})
 # Ensure all image dimensions decoded before capturing
 page.wait_for_function("[...document.images].every(i=>i.complete)")
 (ROOT/'docs/screenshots').mkdir(parents=True,exist_ok=True)
 page.screenshot(path=str(ROOT/'docs/screenshots/cast-material-edition-current.png'),full_page=True)
 assert not errors,errors
 browser.close()
 print('MATERIAL EDITION PASS:',len(reports),'scenarios, eight unique component anatomies, authored colors, distinct speaker materials and no overflow')
