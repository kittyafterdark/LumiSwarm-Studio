"""Fighter banner geometry, font proportions, foreground stacking in Chromium."""
import asyncio, os, base64
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text(encoding='utf8')
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  try:
   page=await browser.new_page(viewport={'width':780,'height':900})
   await page.route('**/api/v1/images/**',lambda r:r.fulfill(content_type='image/png',body=ART))
   await page.set_content('<html><body style="background:#141019;color:#eee"><main style="max-width:560px;margin:80px auto" id="test"></main></body></html>')
   await page.evaluate('''async ({source,image})=>{
    const u=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));const api=await import(u);URL.revokeObjectURL(u);
    document.head.append(Object.assign(document.createElement('style'),{textContent:api.CAST_PRESENTATION_CSS}));
    document.querySelector('#test').innerHTML=api.castPresentationTemplate('fighter-banner',{key:'Shoto-approval',src:image,name:'Shoto Todoroki',label:'approval',dialogue:'"Let them print it. It would save me having to explain why I keep requesting your sector for night rotations."',color:'#599CE3',crop:{enabled:false,x:50,y:20,zoom:1}},s=>s);
   }''',{'source':JS,'image':'data:image/png;base64,'+base64.b64encode(ART).decode()})
   values=await page.evaluate('''()=>{
    const frame=document.querySelector('.versus-select-card');const art=frame.querySelector('.versus-full-img');const back=frame.querySelector('.versus-figure-stage');const band=frame.querySelector('.versus-banner-dock'),text=frame.querySelector('.versus-voice-quote');
    return {width:frame.getBoundingClientRect().width,band:band.getBoundingClientRect().width,backdropZ:getComputedStyle(back,'::before').zIndex,artZ:getComputedStyle(art).zIndex,bandZ:getComputedStyle(band).zIndex,textSize:parseFloat(getComputedStyle(text).fontSize),quote:text.textContent.trim()}
   }''')
   assert values['width']>480 and values['band']>=values['width']*.90,values
   assert values['textSize']<=16 and int(values['artZ'])>int(values['backdropZ']),values
   if os.environ.get('CAST_SCREENSHOT_DIR'):
    folder=Path(os.environ['CAST_SCREENSHOT_DIR']);folder.mkdir(parents=True,exist_ok=True)
    await page.locator('#test').screenshot(path=str(folder/'fighter-banner-r20.png'))
   print('PASS fighter',values)
  finally:await browser.close()
if __name__=='__main__':asyncio.run(main())
