"""Live-sized Cast Islands in wide and narrow message bubbles.
Run: python tests/cast-live-stage-parity-browser.py
"""
from pathlib import Path
import base64
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
SOURCE=(ROOT/'dist/frontend.js').read_text(encoding='utf-8')
SCRIPT=SOURCE.rsplit('export {',1)[0].replace('export function ','function ')+'''\nwindow.__castLiveStage={castPresentationTemplate,CAST_ISLAND_CSS};'''
ART='data:image/png;base64,'+base64.b64encode((ROOT/'tests/fixtures/cast-portrait.png').read_bytes()).decode()

def run():
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900},device_scale_factor=1)
  page.set_content('<!doctype html><html><body style="margin:0;background:#141418;color:#eee;font:15px/1.6 sans-serif"><main id="root" style="margin:16px auto;width:1160px;max-width:calc(100% - 32px)"></main></body></html>')
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.add_script_tag(content=SCRIPT)
  for width in [1160,760,420,320]:
   page.set_viewport_size({'width':max(width+32,360),'height':820})
   results=page.evaluate('''async ({width,art})=>{
    const t=window.__castLiveStage,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const message=document.querySelector('#root');message.style.width=width+'px';message.innerHTML='';
    const result=[];
    for(const side of ['auto','left','right']){
     const pre=document.createElement('p');pre.textContent='Narration remains native and independent of each Cast mount.';message.append(pre);
     const slot=document.createElement('div');slot.setAttribute('data-ss-cast-slot','1');message.append(slot);
     const root=slot.attachShadow({mode:'open'}),style=document.createElement('style');style.textContent=t.CAST_ISLAND_CSS;root.append(style);
     const content=document.createElement('div');content.className='ss-cast-island-content';root.append(content);
     content.innerHTML=t.castPresentationTemplate('manga-sfx',{key:'Shoto-neutral',src:art,name:'Shoto',label:'Neutral',color:'#599ce3',dialogue:esc('“The footbridge camera only sees the waist down until someone climbs the rail.”'),side,crop:{enabled:false,x:50,y:20,zoom:1}},esc);
     const img=root.querySelector('img[data-cast-asset]');await img.decode().catch(()=>{});
     const stage=root.querySelector('.ss-cast-design'),quote=root.querySelector('[data-swarm-cast-dialogue]');
     const r=e=>{const v=e.getBoundingClientRect();return {x:v.x,y:v.y,right:v.right,bottom:v.bottom,width:v.width,height:v.height}};
     const after=document.createElement('p');after.textContent='This is the next preserved narrative paragraph.';message.append(after);
     const m=r(message),h=r(slot),s=r(stage),i=r(img),q=r(quote),a=r(after);
     result.push({side,message:m,host:h,stage:s,image:i,quote:q,after:a,docWidth:document.documentElement.scrollWidth});
    }
    return result;
   }''',{'width':width,'art':ART})
   assert len(results)==3
   auto=results[0]
   for x in results:
    expected=min(width,560)
    assert abs(x['stage']['width']-expected)<2,(width,x['side'],'stage width',x)
    assert x['after']['y']>=x['stage']['bottom']-2,(width,x['side'],'prose overlap')
    assert x['docWidth']<=max(width+32,360)+2,(width,x['side'],'viewport overflow')
    for element in ('image','quote'):
     baseline=auto[element]['x']-auto['stage']['x']
     current=x[element]['x']-x['stage']['x']
     assert abs(current-baseline)<2,(width,x['side'],element,'internal geometry drift',baseline,current)
   if width>=760:
    assert results[1]['stage']['x']<results[0]['stage']['x']<results[2]['stage']['x'],('side position',width)
  assert not errors,errors
  print('CAST LIVE STAGE PARITY PASS: wide/narrow Shadow DOM hosts, Auto/Left/Right, unchanged Manga SFX internals, safe prose')
  browser.close()

if __name__=='__main__':run()
