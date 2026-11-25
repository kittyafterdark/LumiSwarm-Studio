"""Regression for mobile Cast presentation picker: first-screen looks, framing tab,
independent navigation, scroll preservation, and desktop parity. Run with Python Playwright.
"""
import asyncio,base64
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8')
CSS=(ROOT/'src/studio/styles.ts').read_text('utf8').split('const STYLES = `',1)[1].split('\n`\n\nconst STUDIO_V3_STYLES',1)[0]
ART='data:image/png;base64,'+base64.b64encode((ROOT/'tests/fixtures/cast-portrait.png').read_bytes()).decode()

async def setup(browser,width,height):
 page=await browser.new_page(viewport={'width':width,'height':height},device_scale_factor=2,is_mobile=width<681,has_touch=width<681)
 await page.route("**/api/v1/images/**",lambda route:route.fulfill(status=200,content_type="image/png",body=(ROOT/"tests/fixtures/cast-portrait.png").read_bytes()))
 page.set_default_timeout(8500)
 await page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://cast.local/"></head><body style="margin:0;background:#111116">
 <div class="ss-shell"><div class="ss-cast-workspace" id="test-cast" style="width:100vw;height:100dvh;overflow:auto;
 --ss-canvas-bg:#111115;--ss-panel-bg:#151419;--ss-panel-hi:#1b1a20;--ss-header-bg:#151419;--ss-field-bg:#222028;--ss-text:#f3f1f5;--ss-muted:#aaa5b4;--ss-outline:#383442;--ss-border-subtle:#302c38;--ss-accent:#a69be8;--ss-accent-soft:#29253b;--ss-accent-line:#8076ad"></div></div></body></html>''')
 await page.add_style_tag(content=CSS)
 await page.evaluate('''async ({source,art})=>{
    const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
    window.api=await import(url);URL.revokeObjectURL(url);
    const style=document.createElement('style');style.textContent=api.CAST_PRESENTATION_CSS;document.head.append(style);
    window.mock={saved:api.cleanCastLibrary({groups:[{id:'crew',name:'Crew',defaultPresentation:'chapter-tab'}],activeGroupId:'crew',members:[
      {id:'shoto',groupId:'crew',name:'Shoto',prefix:'Shoto',images:{neutral:{id:'portrait-1',url:art}},defaultExpression:'neutral',presentation:'manga-sfx',presentationSide:'auto',crop:{enabled:true,x:50,y:16,zoom:1}}
    ]}),listeners:new Set(),saves:0,delay:0,failNext:false};
    const emit=payload=>{for(const fn of mock.listeners)fn(payload)};
    const ctx={onBackendMessage(fn){mock.listeners.add(fn);return()=>mock.listeners.delete(fn)},sendToBackend(data){queueMicrotask(()=>{
      if(data.type==='load_cast_library')emit({type:'cast_result',requestId:data.requestId,data:{...mock.saved,chatId:'chat1',characterId:''}});
      else if(data.type==='save_cast_library'){
        setTimeout(()=>{
          if(mock.failNext){mock.failNext=false;emit({type:'studio_error',requestId:data.requestId,error:'Fixture save rejected'});return}
          mock.saved=api.cleanCastLibrary(data.library);mock.saves++;
          emit({type:'cast_result',requestId:data.requestId,data:mock.saved});
        },mock.delay);
      }
    })}};
    window.workspace=new api.StudioCastWorkspace(ctx,document.querySelector('#test-cast'),()=>[],()=>{},()=>{});
 }''',{'source':JS,'art':ART})
 await page.locator('.cast-card[data-id="crew"]').click()
 await page.locator('[data-cast-action="member"][data-id="shoto"]').click()
 await page.locator('[data-cast-action="member-tab"][data-tab="presentation"]').click()
 await page.locator('[data-cast-action="open-presentation-modal"]').click()
 return page

async def inspect_mobile(browser,width,height):
 page=await setup(browser,width,height)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 modal=page.locator('#ss-cast-dialog')
 assert await modal.get_attribute('data-cast-modal')=='presentation'
 assert await modal.get_attribute('data-cast-mobile-view')=='looks'
 assert await modal.locator('.cast-mobile-picker-tabs').is_visible()
 assert await modal.locator('.cast-picker-looks').is_visible()
 assert not await modal.locator('.cast-catalogue-settings').is_visible()
 assert await modal.locator('.cast-preset-choice').count()==52
 bounds=await page.evaluate('''()=>{
   const modal=document.querySelector('#ss-cast-dialog'), first=modal.querySelector('.cast-preset-choice'),body=modal.querySelector('.cast-picker-looks');
   const b=n=>{const r=n.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}};
   return {viewport:{width:innerWidth,height:innerHeight},modal:b(modal),first:b(first),body:b(body),
    overflow:document.documentElement.scrollWidth>innerWidth+2,bodyScroll:body.scrollHeight>body.clientHeight};
 }''')
 assert not bounds['overflow'],(width,bounds)
 assert bounds['modal']['left']>=-2 and bounds['modal']['right']<=width+2,bounds
 assert bounds['modal']['bottom']<=height+2,bounds
 assert bounds['first']['top']<height-45,('first look not on screen',width,bounds)
 assert bounds['bodyScroll'],('body not scrollable',width,bounds)
 # Filters remain reachable and gallery doesn't trigger page scrolling.
 assert not await modal.locator('#ss-cast-presentation-search').is_visible()
 await modal.locator('[data-cast-action=presentation-search-toggle]').click()
 await modal.locator('#ss-cast-presentation-search').fill('filmstrip')
 assert await modal.locator('.cast-preset-choice:visible').count()==1
 await modal.locator('[data-cast-action=presentation-search-toggle]').click()
 assert await modal.locator('.cast-preset-choice:visible').count()==52
 await modal.locator('#ss-cast-presentation-category').select_option('face')
 assert 0<await modal.locator('.cast-preset-choice').count()<52
 assert await modal.get_attribute('data-cast-mobile-view')=='looks'
 await modal.locator('[data-cast-action="presentation-mobile-tab"][data-mobile-tab="adjust"]').click()
 assert not await modal.locator('.cast-picker-looks').is_visible()
 assert await modal.locator('.cast-catalogue-settings').is_visible()
 await modal.locator('.cast-gallery-stage [data-cast-action="presentation-side"][data-side="right"]').click()
 assert await modal.get_attribute('data-cast-mobile-view')=='adjust'
 assert await modal.locator('.cast-gallery-stage [data-side=right]').get_attribute('aria-pressed')=='true'
 await page.wait_for_function('mock.saved.members[0].presentationSide==="right"')
 slide=modal.locator('[data-cast-picker-crop="y"]')
 assert await slide.is_enabled()
 await slide.fill('73')
 await slide.dispatch_event('change')
 await page.wait_for_function('mock.saved.members[0].crop.y===73')
 await modal.locator('[data-cast-action="presentation-mobile-tab"][data-mobile-tab="looks"]').click()
 assert await modal.locator('.cast-picker-looks').is_visible()
 assert await modal.locator('.cast-preset-choice').count()>1
 assert await modal.locator('#ss-cast-presentation-category').input_value()=='face'
 await modal.locator('[data-cast-action="presentation-mobile-tab"][data-mobile-tab="adjust"]').click()
 assert await modal.locator('[data-cast-picker-crop="y"]').input_value()=='73'
 await modal.locator('[data-cast-action="presentation-mobile-tab"][data-mobile-tab="looks"]').click()
 # Pick a visible style, verify the gallery remains open and close explicitly.
 await modal.locator('.cast-preset-choice').first.click()
 await page.wait_for_function('mock.saved.members[0].presentation !== "manga-sfx"')
 assert await modal.is_visible()
 assert await modal.locator('.cast-preset-choice[aria-pressed=true]').count()==1
 await modal.locator('.dialog-footer [data-cast-action=close-dialog]').click()
 await page.wait_for_function('!document.querySelector("#ss-cast-dialog").open')
 await page.locator('[data-cast-action="open-presentation-modal"]').click()
 assert await modal.get_attribute('data-cast-mobile-view')=='looks'
 assert not errors,errors
 print(f'MOBILE CAST MODAL PASS: {width}×{height}, first look at y={bounds["first"]["top"]:.0f}, stage/crop persisted, filter, reset, no viewport overflow')
 (ROOT/'test-results').mkdir(exist_ok=True)
 await modal.locator('#ss-cast-presentation-category').select_option('scene')
 await page.screenshot(path=str(ROOT/f'test-results/catalogue-{width}.png'))
 await page.close()

async def inspect_desktop(browser):
 page=await setup(browser,1024,850)
 modal=page.locator('#ss-cast-dialog')
 assert not await modal.locator('.cast-mobile-picker-tabs').is_visible()
 assert await modal.locator('.cast-catalogue-settings').is_visible()
 assert await modal.locator('.cast-picker-looks').is_visible()
 assert await modal.locator('.cast-preset-choice').count()==52
 assert not await modal.locator('.cast-picker-crop').is_visible()
 await modal.locator('[data-cast-action=presentation-crop-toggle]').click()
 assert await modal.locator('.cast-picker-crop').is_visible()
 assert await modal.locator('.cast-picker-looks').is_visible()
 await modal.locator('[data-cast-action=presentation-crop-toggle]').click()
 await modal.locator('[data-cast-action=presentation-filter][data-group=scene]').click()
 await page.screenshot(path=str(ROOT/'test-results/catalogue-1024.png'))
 search=modal.locator('#ss-cast-presentation-search')
 await search.fill('rainbound')
 assert await modal.locator('.cast-preset-choice:visible').count()==1
 assert await modal.locator('.cast-preset-count').inner_text()=='1 presentation'
 await search.fill('no such look')
 assert await modal.locator('.cast-catalogue-no-results').is_visible()
 await search.fill('')
 assert await modal.locator('.cast-preset-choice:visible').count()==8
 # A selected tile and the gallery are not reconstructed when saving.
 await modal.locator('[data-cast-action=presentation-filter][data-group=all]').click()
 start_saves=await page.evaluate('mock.saves')
 await page.evaluate('mock.delay=300')
 await page.evaluate('''()=>{const d=document.querySelector('#ss-cast-dialog');d.querySelector('[data-style=sticker]').click();d.querySelector('[data-style=manga-sfx]').click()}''')
 await page.wait_for_function('(n)=>mock.saves===n+2 && mock.saved.members[0].presentation==="manga-sfx"',arg=start_saves)
 assert await modal.is_visible()
 assert await modal.locator('[data-style=manga-sfx]').get_attribute('aria-pressed')=='true'
 # Failed writes remain in the picker and Done retries them.
 await page.evaluate('mock.failNext=true;mock.delay=0')
 await modal.locator('[data-style=sticker]').click()
 await page.wait_for_function('document.querySelector("[data-cast-picker-status]").textContent.includes("Fixture save rejected")')
 assert await modal.locator('[data-style=sticker]').get_attribute('aria-pressed')=='true'
 await modal.locator('.dialog-footer [data-cast-action=close-dialog]').click()
 await page.wait_for_function('mock.saved.members[0].presentation==="sticker" && !document.querySelector("#ss-cast-dialog").open')
 await page.locator('[data-cast-action=open-presentation-modal]').click()
 await modal.locator('.cast-catalogue-current [data-cast-action=style-reset]').click()
 await page.wait_for_function('mock.saved.members[0].presentation==="inherit"')
 assert await modal.locator('[data-style=chapter-tab]').get_attribute('aria-pressed')=='true'
 assert await modal.locator('.cast-catalogue-current [data-cast-action=style-reset]').is_disabled()
 await page.set_viewport_size({'width':390,'height':844})
 assert await modal.locator('#ss-cast-presentation-category').is_visible()
 await page.set_viewport_size({'width':1024,'height':850})
 assert await modal.locator('.cast-preset-filters').is_visible()
 print('DESKTOP CAST MODAL PASS: controls and gallery independently scroll, crop on demand')
 await page.close()

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  try:
   for width,height in [(320,640),(390,844),(430,932)]:await inspect_mobile(browser,width,height)
   await inspect_desktop(browser)
  finally:await browser.close()

if __name__=='__main__':asyncio.run(main())
