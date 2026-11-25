"""Cast R38: preset-native widths, gallery scale parity, stage side cohesion,
and stable long prose in a minimal Shadow DOM-like message fixture.
Run: python tests/cast-stage-geometry-browser.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import base64,json
ROOT=Path(__file__).resolve().parents[1]
SOURCE=(ROOT/'dist/frontend.js').read_text(encoding='utf8')
SCRIPT=SOURCE.rsplit('export {',1)[0].replace('export function ', 'function ')+'\nwindow.__geometryTest={CAST_PRESENTATION_CSS,CAST_PRESENTATION_SIDE_CSS,CAST_PRESENTATION_ENTRIES,castPresentationTemplate,castPresentationStageWidth};'
ART='data:image/png;base64,'+base64.b64encode((ROOT/'tests/fixtures/cast-portrait.png').read_bytes()).decode()
QUOTE='“The footbridge camera only sees people below the waist until they climb the rail. I checked the camera before we crossed.”'
LONG_QUOTE='“'+('This is a realistic extended dialogue with independent clauses, quotation marks, and enough text to wrap inside a real scene. '*4)+'”'

def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1250,'height':1050})
  page.set_content('<!doctype html><html><head></head><body style="background:#121217;color:#edeef3;font:15px/1.5 sans-serif;margin:0"><div id="root"></div></body></html>')
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.add_script_tag(content=SCRIPT)
  page.evaluate('''()=>{let t=window.__geometryTest;const style=document.createElement('style');style.textContent=t.CAST_PRESENTATION_CSS+'\\n'+t.CAST_PRESENTATION_SIDE_CSS;document.head.append(style)}''')
  records=[]
  for width in [760,420,320]:
   for side in ['auto','left','right']:
    batch=page.evaluate('''async ({width,side,art,quote})=>{
      const t=window.__geometryTest;
      const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const report=[];
      for(const entry of t.CAST_PRESENTATION_ENTRIES){
        const packet=t.castPresentationTemplate(entry.id,{key:'Shoto-neutral',src:art,name:'Shoto',label:'Neutral',color:'#599ce3',dialogue:esc(quote),side,crop:{enabled:false,x:50,y:20,zoom:1}},esc);
        document.querySelector('#root').innerHTML=`<div id="host" style="width:${width}px;position:relative;isolation:isolate"><p>Introduction to the scene.</p><div id="island">${packet}</div><p id="after">The following paragraph is still here.</p></div>`;
        const host=document.querySelector('#host'),design=host.querySelector('.ss-cast-design'),image=host.querySelector('img[data-cast-asset]'),dialogue=host.querySelector('[data-swarm-cast-dialogue]'),following=host.querySelector('#after');
        await image.decode().catch(()=>{});
        const r=e=>{const x=e.getBoundingClientRect();return {x:x.x,y:x.y,right:x.right,bottom:x.bottom,width:x.width,height:x.height}};
        const d=r(design),im=r(image),q=r(dialogue),after=r(following);const intended=t.castPresentationStageWidth(entry.id);
        report.push({id:entry.id,side,hostWidth:width,intended,stage:d,image:im,quote:q,afterY:after.y,text:dialogue.textContent,
           overflow:host.scrollWidth>host.clientWidth+2,stageTooWide:d.width>Math.min(width,intended)+2,
           clippedQuote:q.x<d.x-2||q.right>d.right+2||q.bottom>d.bottom+6,
           followedByProse:after.y>=d.bottom-2});
      }
      return report;
    }''',{'width':width,'side':side,'art':ART,'quote': LONG_QUOTE if width==320 else QUOTE})
    records.extend(batch)
  assert len(records)==50*3*3,len(records)
  failures=[]
  for x in records:
   if x['overflow'] or x['stageTooWide'] or x['clippedQuote'] or not x['followedByProse'] or not x['text']:
    failures.append({k:x[k] for k in ('id','side','hostWidth','intended','overflow','stageTooWide','clippedQuote','followedByProse')})
  assert not failures,f'{len(failures)} layout geometry failures: {failures[:20]}'
  sfx=[x for x in records if x['id']=='manga-sfx' and x['hostWidth']==760]
  for x in sfx:
   assert round(x['stage']['width'])==560,x
   # Portrait and dialogue must now share substantial horizontal territory.
   img=x['image'];quote=x['quote']
   horizontal_overlap=min(img['right'],quote['right'])-max(img['x'],quote['x'])
   assert horizontal_overlap>=85,(x['side'],horizontal_overlap,img,quote)
  # A member's Left/Right setting positions the assembled Manga SFX artwork;
  # it must not independently rearrange the cutout and its speech plate.
  auto=next(x for x in sfx if x['side']=='auto')
  for x in sfx:
   for element in ('image','quote'):
    auto_local=auto[element]['x']-auto['stage']['x']
    local=x[element]['x']-x['stage']['x']
    assert abs(auto_local-local)<2,(x['side'],element,auto_local,local)
  # Capture comparable real-sized left/auto/right composition sheets, no isolated thumbnail reinterpretation.
  page.evaluate('''({art})=>{
    const t=window.__geometryTest,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const q='“It only catches the footbridge from the waist down unless someone climbs the rail. I checked when we came up the steps.”';
    document.querySelector('#root').innerHTML=`<div style="display:flex;gap:14px;padding:14px;align-items:flex-start;">${['auto','left','right'].map(side=>`<section style="width:420px;max-width:calc((100vw - 70px)/3);min-width:0"><p style="margin:0 0 4px;text-align:center;font-size:11px;color:#aaa">${side.toUpperCase()}</p>${t.castPresentationTemplate('manga-sfx',{key:'Shoto-neutral',src:art,name:'Shoto',label:'Neutral',color:'#599ce3',dialogue:esc(q),side,crop:{enabled:false,x:50,y:20,zoom:1}},esc)}</section>`).join('')}</div>`;
  }''',{'art':ART})
  page.screenshot(path=str(ROOT/'docs/screenshots/cast-stage-geometry-manga-sfx.png'))
  assert not errors,errors
  print('CAST STAGE GEOMETRY PASS: 50 layouts × Auto/Left/Right × 760/420/320, stage caps, dialogue containment, mobile prose, connected Manga SFX')
  browser.close()

if __name__=='__main__': run()
