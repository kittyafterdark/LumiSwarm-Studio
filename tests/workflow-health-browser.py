"""Real Chromium smoke test for the reusable Workflow Health component.

Renders both model health ribbons against a minimal Lumiverse host, exercising
state changes, retained check actions, mobile geometry, and action isolation.
"""
import asyncio
from playwright.async_api import async_playwright
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BUNDLE=(ROOT/'dist/frontend.js').read_text('utf8')
CSS=(ROOT/'src/studio/styles.ts').read_text('utf8').split('const STYLES = `',1)[1].split('\n`\n\nconst STUDIO_V3_STYLES',1)[0]

async def verify(browser, width):
    page = await browser.new_page(viewport={"width": width, "height": 820})
    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    await page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://studio.local/"></head>
      <body style="margin:0;background:#111115;color:#f3edf4"><div class="ss-shell" style="height:100dvh;
      --ss-canvas-bg:#111115;--ss-panel-bg:#191820;--ss-panel-hi:#24222d;--ss-header-bg:#191820;--ss-field-bg:#292733;
      --ss-text:#efedf3;--ss-muted:#b5aabd;--ss-outline:#555064;--ss-border-subtle:#383441;
      --ss-accent:#af9df0;--ss-accent-soft:#3d304c;--ss-accent-line:#8177b3"></div></body></html>''')
    await page.add_style_tag(content=CSS)
    await page.evaluate('''async bundle => {
      const url=URL.createObjectURL(new Blob([bundle],{type:'text/javascript'}));
      const api=await import(url);URL.revokeObjectURL(url);
      window.requests=[];
      window.upscaleState={status:'installed',mode:'model',model:'4x-UltraSharp.pth',available:2};
      window.backgroundState='installed';
      const member={id:'shoto',name:'Shoto',prefix:'Shoto',images:{neutral:{id:'image-1',url:'data:image/png;base64,iVBORw0KGgo='}},settings:null};
      window.dialog=api.openCharacterExpressions(document.querySelector('.ss-shell'),{
        cast:{member,save:async()=>{},publish:async()=>{}},
        folder:{id:'cast:shoto',name:'Shoto',imageIds:['image-1'],binding:null,updatedAt:0},
        family:'',model:'base.safetensors',workflows:[],inheritedRecipe:{},samplers:[],schedulers:[],deleteDrafts:false,
        pickImage:()=>{},refresh:()=>{},
        request:async type=>{
          window.requests.push(type);
          if(type==='load_expression_bank')return [];
          if(type==='load_expression_enhance_options')return {mode:'model',factor:2};
          if(type==='check_expression_upscale_model')return {...window.upscaleState};
          if(type==='check_expression_background_model')return {status:window.backgroundState};
          if(type==='load_expression_set')return null;
          if(type==='save_expression_set')return null;
          return {};
        }
      });
    }''', BUNDLE)
    await page.locator('.ss-expression-step').nth(1).click()
    upscale=page.locator('.ss-expression-upscale-check')
    await page.wait_for_function("document.querySelector('.ss-expression-upscale-check')?.dataset.status==='installed'")
    assert await upscale.get_by_role('button', name='Check model').is_visible()
    assert '4x-UltraSharp.pth is available' in await upscale.inner_text()
    style='''node => {
      const css=getComputedStyle(node);
      return {rail:css.borderLeftWidth,padding:css.paddingLeft,
        title:getComputedStyle(node.querySelector('strong')).fontSize,
        message:getComputedStyle(node.querySelector('[role=status]')).fontSize,
        button:getComputedStyle(node.querySelector('.ss-button')).minHeight}
    }'''
    upscale_style=await upscale.evaluate(style)
    cards=await page.locator('.ss-expression-card').count()
    assert cards>0
    await page.locator('.ss-expression-step').nth(2).click()
    background=page.locator('.ss-expression-background-check')
    await page.wait_for_function("document.querySelector('.ss-expression-background-check')?.dataset.status==='installed'")
    assert 'BiRefNet is ready' in await background.inner_text()
    assert await background.get_by_role('button', name='Check model').is_visible()
    assert await background.get_by_text('Download weights').is_hidden()
    assert await background.evaluate(style)==upscale_style, (await background.evaluate(style),upscale_style)
    assert await page.locator('.ss-expression-card').count()==cards

    await page.evaluate("window.backgroundState='missing'")
    await background.get_by_role('button', name='Check model').click()
    await page.wait_for_function("document.querySelector('.ss-expression-background-check')?.dataset.status==='missing'")
    assert 'birefnet.safetensors' in await background.inner_text()
    assert await background.get_by_text('Download weights').is_visible()
    assert 'Stability Matrix/Models/BackgroundRemoval' in await background.inner_text()

    await page.evaluate("window.backgroundState='unsupported'")
    await background.get_by_role('button', name='Check model').click()
    await page.wait_for_function("document.querySelector('.ss-expression-background-check')?.dataset.status==='unsupported'")
    assert 'native BiRefNet' in await background.inner_text()

    await page.evaluate("window.backgroundState='installed'")
    await background.get_by_role('button', name='Check model').click()
    await page.wait_for_function("document.querySelector('.ss-expression-background-check')?.dataset.status==='installed'")
    assert await background.get_by_text('Download weights').is_hidden()
    assert await background.get_by_role('button', name='Check model').is_visible()
    assert await page.locator('.ss-expression-card').count()==cards
    assert await page.evaluate("window.requests.filter(x=>x==='check_expression_background_model').length")>=4

    bounds=await background.evaluate('''node => ({left:node.getBoundingClientRect().left,
      right:node.getBoundingClientRect().right,pageWidth:document.documentElement.scrollWidth,viewport:innerWidth})''')
    assert bounds['left']>=-2 and bounds['right']<=width+2 and bounds['pageWidth']<=width+2, bounds
    assert not errors, errors
    if width==390:
        await page.screenshot(path=str(ROOT / 'docs/screenshots/workflow-health-mobile.png'))
    await page.close()
    print(f'PASS: Workflow Health ready/missing/unsupported, matching geometry and preserved gallery at {width}px')

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        try:
            for width in (390,1200): await verify(browser,width)
        finally:
            await browser.close()

if __name__=='__main__': asyncio.run(main())
