"""Production-bundle browser regression for Expressions Maker upscale preflight ribbon.
The connected SwarmUI backend is mocked; no model download or local backend needed.
"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
BUNDLE=(ROOT/'dist/frontend.js').read_text('utf8')
CSS=(ROOT/'src/studio/styles.ts').read_text('utf8').split('const STYLES = `',1)[1].split('\n`\n\nconst STUDIO_V3_STYLES',1)[0]

async def check(browser,width):
    page=await browser.new_page(viewport={'width':width,'height':820},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda error: errors.append(str(error)))
    await page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://studio.local/"></head><body style="margin:0;background:#111115;color:#f3edf4"><div class="ss-shell" style="height:100dvh;--ss-canvas-bg:#111115;--ss-panel-bg:#191820;--ss-panel-hi:#24222d;--ss-header-bg:#191820;--ss-field-bg:#292733;--ss-text:#efedf3;--ss-muted:#b5aabd;--ss-outline:#555064;--ss-border-subtle:#383441;--ss-accent:#af9df0;--ss-accent-soft:#3d304c;--ss-accent-line:#8177b3"></div></body></html>''')
    await page.add_style_tag(content=CSS)
    await page.evaluate('''async (bundle) => {
      const url=URL.createObjectURL(new Blob([bundle],{type:'text/javascript'}));
      const api=await import(url);URL.revokeObjectURL(url);
      window.requests=[];window.modelStatus={status:'installed',mode:'model',model:'4x-UltraSharp.pth',available:2};
      const member={id:'shoto',name:'Shoto',prefix:'Shoto',images:{neutral:{id:'image-1',url:'data:image/png;base64,iVBORw0KGgo='}},settings:null};
      window.dialog=api.openCharacterExpressions(document.querySelector('.ss-shell'),{
        cast:{member,save:async()=>{},publish:async()=>{}},
        folder:{id:'cast:shoto',name:'Shoto',imageIds:['image-1'],binding:null,updatedAt:0},
        family:'',model:'base.safetensors',workflows:[],inheritedRecipe:{},samplers:[],schedulers:[],deleteDrafts:false,
        pickImage:()=>{},refresh:()=>{},
        request:async (type)=>{
          window.requests.push(type);
          if(type==='load_expression_bank')return [];
          if(type==='load_expression_enhance_options')return {mode:'model',factor:2};
          if(type==='check_expression_upscale_model')return {...window.modelStatus};
          if(type==='load_expression_set')return null;
          if(type==='save_expression_set')return null;
          return {};
        }
      });
    }''',BUNDLE)
    await page.locator('.ss-expression-step').nth(1).click()
    ribbon=page.locator('.ss-expression-upscale-check')
    await page.wait_for_function("document.querySelector('.ss-expression-upscale-check')?.dataset.status === 'installed'")
    assert '4x-UltraSharp.pth is available' in await ribbon.inner_text()
    if width==390: await page.screenshot(path='/mnt/data/Lumiswarm-Upscaler-Model-Ribbon-Mobile.png')
    count=await page.locator('.ss-expression-card').count()
    assert count>0, count
    await page.evaluate("window.modelStatus={status:'missing',mode:'model',model:'4x-UltraSharp.pth',available:1}")
    await ribbon.get_by_role('button',name='Check model').click()
    await page.wait_for_function("document.querySelector('.ss-expression-upscale-check')?.dataset.status === 'missing'")
    assert 'not present' in await ribbon.inner_text()
    assert await page.locator('.ss-expression-card').count()==count
    await page.evaluate("window.modelStatus={status:'workflow',mode:'saved',model:''}")
    await ribbon.get_by_role('button',name='Check model').click()
    await page.wait_for_function("document.querySelector('.ss-expression-upscale-check')?.dataset.status === 'workflow'")
    assert 'no single upscaler' in await ribbon.inner_text()
    await page.evaluate("window.modelStatus={status:'unavailable'}")
    await ribbon.get_by_role('button',name='Check model').click()
    await page.wait_for_function("document.querySelector('.ss-expression-upscale-check')?.dataset.status === 'unavailable'")
    assert 'Could not check' in await ribbon.inner_text()
    assert await page.evaluate("window.requests.filter(x=>x==='check_expression_upscale_model').length")>=4
    assert not errors, errors
    bounds=await page.evaluate('''()=>{const x=document.querySelector('.ss-expression-upscale-check').getBoundingClientRect();return {left:x.left,right:x.right,viewport:innerWidth,pageWidth:document.documentElement.scrollWidth}}''')
    assert bounds['left'] >= -2 and bounds['right'] <= width+2 and bounds['pageWidth'] <= width+2,bounds
    print(f'PASS: Expressions Maker Enhance ribbon at {width}px, ready/missing/workflow/offline + card preservation')
    await page.close()

async def main():
    async with async_playwright() as p:
      browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
      try:
        for width in (390,1200): await check(browser,width)
      finally: await browser.close()

if __name__=='__main__':asyncio.run(main())
