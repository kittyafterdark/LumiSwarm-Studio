"""Browser regression for saved Cast crop Y/X beating donated focal defaults.
Run: python tests/cast-crop-focal-browser.py
"""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
FRONT = (ROOT / 'dist/frontend.js').read_text(encoding='utf-8')
ART = (ROOT / 'tests/fixtures/cast-portrait.png').read_bytes()

async def main():
 async with async_playwright() as p:
  browser = await p.chromium.launch(headless=True, executable_path=os.environ.get('CAST_CHROME', '/usr/bin/chromium'), args=['--no-sandbox'])
  try:
   page = await browser.new_page(viewport={'width':850,'height':850})
   errors=[]
   page.on('pageerror',lambda error:errors.append(str(error)))
   await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
   await page.set_content('''<!DOCTYPE html><html><head><base href="http://cast.local/"></head><body style="background:#15131b;color:#eee"><div id="test"></div></body></html>''')
   await page.evaluate('''async frontend=>{
     const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));
     const api=await import(url);URL.revokeObjectURL(url);window.api=api;
     const css=new CSSStyleSheet();css.replaceSync(api.CAST_PRESENTATION_CSS);
     window.sheet=css;
     window.renderCast=(preset,crop,shadow=false)=>{
       const lib=api.cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Crew'}],members:[{
         id:'shoto',groupId:'crew',name:'Shoto Todoroki',prefix:'Shoto',presentation:preset,crop,
         images:{confusion:{id:'saved-image'}}}]});
       const html=api.renderCastTags('<swarm-cast=Shoto-confusion>"Shoto speaks."</swarm-cast>',lib,s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
       const holder=document.querySelector('#test');holder.replaceChildren();
       if(shadow){const host=document.createElement('div');holder.append(host);const root=host.attachShadow({mode:'open'});root.adoptedStyleSheets=[css];root.innerHTML=html;return root.querySelector('.ss-cast-design')}
       document.adoptedStyleSheets=[css];holder.innerHTML=html;return holder.querySelector('.ss-cast-design');
     }
   }''',FRONT)
   for preset in ('tech-messenger','editorial-square','chapter-tab'):
    for shadow in (False,True):
     async def test_state(crop):
      return await page.evaluate('''({preset,crop,shadow})=>{
        const root=window.renderCast(preset,crop,shadow);
        const img=root.querySelector('[data-cast-asset]');
        const cs=getComputedStyle(img);
        return {cropEnabled:root.getAttribute('data-cast-crop-enabled'),objectPosition:cs.objectPosition,objectFit:cs.objectFit,scale:cs.scale,src:img.getAttribute('src')};
      }''',{'preset':preset,'crop':crop,'shadow':shadow})
     default=await test_state({'enabled':False,'x':50,'y':20,'zoom':1})
     top=await test_state({'enabled':True,'x':14,'y':0,'zoom':1})
     bottom=await test_state({'enabled':True,'x':86,'y':100,'zoom':1})
     assert default['cropEnabled']=='false', (preset,default)
     assert top['cropEnabled']=='true' and top['objectPosition']=='14% 0%',(preset,shadow,top)
     assert bottom['objectPosition']=='86% 100%',(preset,shadow,bottom)
     assert default['src']==top['src']==bottom['src'],(preset,shadow,'source changed')
     print(f'{preset} shadow={shadow}: default={default["objectPosition"]}, top={top["objectPosition"]}, bottom={bottom["objectPosition"]}')
   # Huge zoom must stay inside the actual image bay, not paint across the
   # next dialogue/paragraph. The quote coordinates remain unchanged.
   for preset in ('fighter-banner','vn-hero','tarot-arch','shonen-burst','open-horizon'):
    bounds=[]
    for zoom in (1,2.65):
     result=await page.evaluate("""async ({preset,zoom})=>{
       const root=window.renderCast(preset,{enabled:true,x:45,y:8,zoom},true);
       const img=root.querySelector('[data-cast-asset]'),bay=img.parentElement;
       await img.decode();
       const quote=root.querySelector('[data-swarm-cast-dialogue]');
       const r=e=>{const a=e.getBoundingClientRect();return [a.x,a.y,a.width,a.height]};
       return {clip:getComputedStyle(bay).overflow,scale:getComputedStyle(img).scale,frame:r(bay),quote:r(quote),outer:r(root)};
     }""",{'preset':preset,'zoom':zoom})
     assert result['clip'] in ('clip','hidden') and result['frame'][2]>8 and result['frame'][3]>8, (preset,zoom,result)
     bounds.append(result)
    assert all(abs(a-b)<1 for a,b in zip(bounds[0]['frame'],bounds[1]['frame'])),(preset,'image bay must not grow',bounds)
    assert all(abs(a-b)<1 for a,b in zip(bounds[0]['quote'],bounds[1]['quote'])),(preset,'caption must not move with zoom',bounds)
    print(f'{preset}: zoom clipped inside {bounds[1]["frame"]}, caption stable')
   # A CSS value alone is insufficient: the visible crop must really move.
   shots=[]
   for y in (0,100):
    await page.evaluate('''({y})=>window.renderCast('tech-messenger',{enabled:true,x:50,y,zoom:1},true)''',{'y':y})
    image=page.locator('#test [data-cast-asset]')
    await image.wait_for(state='visible')
    await image.evaluate('el=>el.decode()')
    shots.append(await image.screenshot())
   assert shots[0] != shots[1], 'Y=0 and Y=100 generated identical screenshot bytes'
   print('Pixel diff PASS: Y=0 and Y=100 produce different visible artwork')
   assert not errors,errors
   print('PASS: live scoped CSS, original focal points when disabled, and shared X/Y overrides on all tested variants')
  finally:
   await browser.close()

if __name__=='__main__':asyncio.run(main())
