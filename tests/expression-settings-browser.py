"""Production-bundle settings drawer geometry and interaction regression."""
import asyncio, io, base64
from PIL import Image
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
BUNDLE=(ROOT/'dist/frontend.js').read_text('utf8')
(ROOT/'test-results').mkdir(exist_ok=True)
CSS=(ROOT/'src/studio/styles.ts').read_text('utf8').split('const STYLES = `',1)[1].split('\n`\n\nconst STUDIO_V3_STYLES',1)[0]

async def check(browser,width,host_width=None):
    page=await browser.new_page(viewport={'width':width,'height':820},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda error: errors.append(str(error)))
    await page.set_content('''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><base href="http://studio.local/"></head><body style="margin:0;background:#111115;color:#f3edf4"><div class="ss-shell" style="height:100dvh;--ss-canvas-bg:#111115;--ss-panel-bg:#191820;--ss-panel-hi:#24222d;--ss-header-bg:#191820;--ss-field-bg:#292733;--ss-text:#efedf3;--ss-muted:#b5aabd;--ss-outline:#555064;--ss-border-subtle:#383441;--ss-accent:#af9df0;--ss-accent-soft:#3d304c;--ss-accent-line:#8177b3"></div></body></html>''')
    await page.add_style_tag(content=CSS)
    cutout=Image.new('RGBA',(9,9),(0,0,0,0))
    for y in range(1,8):
      for x in range(1,8):cutout.putpixel((x,y),(30,190,120,255))
    buffer=io.BytesIO();cutout.save(buffer,format='PNG')
    await page.route('**/api/v1/images/cutout',lambda route:route.fulfill(body=buffer.getvalue(),content_type='image/png',headers={'Access-Control-Allow-Origin':'*'}))
    portrait='data:image/png;base64,'+base64.b64encode((ROOT/'tests/fixtures/cast-portrait.png').read_bytes()).decode()
    await page.evaluate('''async ([bundle,portrait]) => {
      const url=URL.createObjectURL(new Blob([bundle],{type:'text/javascript'}));
      const api=await import(url);URL.revokeObjectURL(url);
      window.requests=[];window.modelStatus={status:'installed',mode:'model',model:'4x-UltraSharp.pth',available:2};
      const member={id:'shoto',name:'Shoto',prefix:'Shoto',identityPrompt:'inherited identity',images:{neutral:{id:'image-1',url:portrait}},settings:null};
      window.dialog=api.openCharacterExpressions(document.querySelector('.ss-shell'),{
        cast:{member,save:async()=>{},publish:async()=>{}},
        folder:{id:'cast:shoto',name:'Shoto',imageIds:['image-1'],binding:null,updatedAt:0},
        family:'',model:'base.safetensors',workflows:[],checkpoints:[{name:'anima-other.safetensors',title:'Anima other',architecture:'anima'}],loras:[{name:'added.safetensors',title:'Added LoRA',defaultWeight:.8,triggerPhrase:'added trigger'}],stacks:[{id:'saved',name:'Saved stack',items:[{name:'saved.safetensors',title:'Saved LoRA',weight:.6,enabled:true,useTrigger:false}]}],inheritedRecipe:{},samplers:[],schedulers:[],presets:[{title:"Alien Stage",description:"",paramMap:{}}],deleteDrafts:false,
        pickImage:()=>{},refresh:()=>{},
        request:async (type,fields)=>{
          window.requests.push(type);
          if(type==='render_folder_expression'){window.renderPayload=fields;return {id:'rendered',url:portrait}};
          if(type==='process_folder_expression'){window.processPayload=fields;return {id:'cutout',url:'/api/v1/images/cutout'}};
          if(type==='save_local_edit'){window.despillPayload=fields;return {id:'despilled',url:'/api/v1/images/despilled'}};
          if(type==='check_expression_background_model')return {status:'installed'};
          if(type==='load_expression_bank')return [];
          if(type==='load_expression_enhance_options')return {mode:'model',factor:2};
          if(type==='check_expression_upscale_model')return {...window.modelStatus};
          if(type==='load_expression_set')return null;
          if(type==='save_expression_set')return null;
          return {};
        }
      });
    }''',[BUNDLE,portrait])
    if host_width:
      await page.locator('.ss-expression-dialog').evaluate('(el,w)=>el.style.setProperty("--app-scaled-viewport-width",w+"px")',host_width)
    await page.get_by_role('button',name='Generation settings',exact=True).click()
    panel=page.locator('.ss-expression-overlay-panel')
    body=page.locator('.ss-expression-overlay-body')
    assert await panel.evaluate("e=>e.getBoundingClientRect().width<=640.5")
    assert await panel.evaluate("e=>e.getBoundingClientRect().right<=e.closest('dialog').getBoundingClientRect().right+1")
    assert await panel.locator('.ss-expression-overlay-bottom').evaluate("e=>e.getBoundingClientRect().bottom<=e.closest('dialog').getBoundingClientRect().bottom+1 && e.getBoundingClientRect().bottom<=innerHeight+1")
    metrics=await body.evaluate("""e=>{const bounds=s=>e.querySelector(s).getBoundingClientRect();const a=bounds('.ss-expression-canvas'),b=bounds('.ss-expression-render-fields');return {overflow:e.scrollWidth-e.clientWidth,left:a.left-b.left,right:a.right-b.right,cols:getComputedStyle(e.querySelector('.ss-expression-ratio-presets')).gridTemplateColumns.split(' ').length,track:getComputedStyle(e.querySelector('input[type=range]'),'::-webkit-slider-runnable-track').backgroundColor}}""")
    assert metrics['overflow']<=1 and abs(metrics['left'])<=1 and abs(metrics['right'])<=1, metrics
    assert metrics['cols']==(3 if (host_width or width)<500 else 6),metrics
    await panel.get_by_role('button',name='3:4 aspect ratio',exact=True).click()
    await panel.get_by_role('slider',name='height slider').evaluate("e=>{e.value='1024';e.dispatchEvent(new Event('input',{bubbles:true}))}")
    assert await panel.get_by_role('spinbutton',name='width in pixels').input_value()=='768'
    assert await panel.get_by_role('spinbutton',name='height in pixels').input_value()=='1024'
    await panel.get_by_role('combobox',name='Checkpoint',exact=True).select_option('anima-other.safetensors')
    await panel.get_by_role('button',name='Character',exact=True).click()
    assert await panel.get_by_role('textbox',name='Character positive prompt',exact=True).input_value()=='inherited identity'
    await panel.get_by_role('textbox',name='Character positive prompt',exact=True).fill('manual identity')
    await panel.get_by_role('textbox',name='Outfit prompt',exact=True).fill('blue hoodie')
    await panel.get_by_role('button',name='LoRAs',exact=True).click()
    await panel.get_by_role('combobox',name='Saved stack',exact=True).select_option('saved')
    await panel.get_by_role('combobox',name='Installed LoRAs',exact=True).select_option('added.safetensors')
    await panel.get_by_role('button',name='Remove',exact=True).first.click()
    await panel.get_by_role('spinbutton',name='Weight',exact=True).fill('0.75')
    await panel.get_by_role('textbox',name='Trigger text',exact=True).fill('custom trigger')
    await panel.get_by_role('checkbox',name='Use trigger',exact=True).check()
    await panel.get_by_role('button',name='Style',exact=True).click()
    await panel.get_by_role('textbox',name='Shared prompt prefix',exact=True).fill('solo, cowboy shot')
    picker=panel.get_by_role('combobox',name='Insert Swarm preset')
    await picker.select_option('Alien Stage');await picker.select_option('Alien Stage')
    assert await panel.get_by_role('textbox',name='Shared prompt prefix',exact=True).input_value()=='solo, cowboy shot, <preset:Alien Stage>'
    assert await panel.locator('.ss-expression-ratio-button[aria-pressed=true]').count()==1
    await body.evaluate('e=>e.scrollTop=0')
    await panel.get_by_role('textbox',name='Shared prompt prefix',exact=True).evaluate('e=>e.blur()')
    if not host_width and width in (1440,390):
      await page.screenshot(path=str(ROOT/f'test-results/expression-settings-{width}.png'))
    await panel.get_by_role('button',name='Done',exact=True).click()
    await page.get_by_role('button',name='Generation settings',exact=True).click()
    assert await panel.get_by_role('textbox',name='Shared prompt prefix',exact=True).input_value()=='solo, cowboy shot, <preset:Alien Stage>'
    await panel.get_by_role('button',name='Rendering',exact=True).click()
    assert await panel.get_by_role('spinbutton',name='width in pixels').input_value()=='768'
    assert await panel.get_by_role('combobox',name='Checkpoint',exact=True).input_value()=='anima-other.safetensors'
    await panel.get_by_role('button',name='LoRAs',exact=True).click()
    assert await panel.get_by_role('spinbutton',name='Weight',exact=True).input_value()=='0.75'
    if not host_width and width in (1440,390):
      await page.screenshot(path=str(ROOT/f'test-results/expression-loras-{width}.png'))
    await panel.get_by_role('button',name='Done',exact=True).click()
    await page.get_by_role('button',name='Render joy',exact=True).click()
    await page.wait_for_function('window.renderPayload')
    payload=await page.evaluate('window.renderPayload.renderOverrides')
    assert payload['identity']=='manual identity' and payload['outfit']=='blue hoodie' and payload['checkpoint']=='anima-other.safetensors',payload
    assert len(payload['stack'])==1 and payload['stack'][0]['name']=='added.safetensors' and payload['stack'][0]['weight']==.75 and payload['stack'][0]['useTrigger'],payload
    scroll=page.locator('.ss-expression-scroll')
    nav=page.locator('.ss-expression-quick-actions')
    await scroll.evaluate("e=>e.scrollTop=0")
    await nav.wait_for(state="hidden")
    assert not await nav.is_visible()
    await scroll.evaluate('e=>e.scrollTop=e.scrollHeight')
    await nav.wait_for(state='visible')
    metrics=await nav.evaluate("e=>{const r=e.getBoundingClientRect(),d=e.closest('dialog').getBoundingClientRect(),f=e.closest('dialog').querySelector('.ss-expression-footer').getBoundingClientRect();return {width:r.width,available:d.width,center:Math.abs((r.left+r.right-d.left-d.right)/2),gap:f.top-r.bottom,scroll:e.scrollWidth-e.clientWidth}}")
    assert metrics['width']<=metrics['available'] and metrics['center']<2 and metrics['gap']>=0 and metrics['gap']<25 and metrics['scroll']<=2,metrics
    assert await nav.get_by_role('button').count()==4
    if not host_width and width in (1440,390):
      await page.screenshot(path=str(ROOT/f'test-results/expression-quick-actions-{width}.png'))
    before=await scroll.evaluate('e=>e.scrollTop')
    await nav.get_by_role('button',name='Select all expressions',exact=True).click()
    assert await nav.get_by_role('button',name='Select all expressions',exact=True).is_disabled()
    assert await page.locator('.ss-expression-card[data-selected=false]').count()==0
    await nav.get_by_role('button',name='Deselect all expressions',exact=True).click()
    assert await nav.get_by_role('button',name='Deselect all expressions',exact=True).is_disabled()
    assert await page.locator('.ss-expression-card[data-selected=true]').count()==0
    assert abs(await scroll.evaluate('e=>e.scrollTop')-before)<2
    await nav.get_by_role('button',name='Open generation settings',exact=True).click()
    assert await panel.get_by_role('button',name='Character',exact=True).is_visible()
    await panel.get_by_role('button',name='Done',exact=True).click()
    assert abs(await scroll.evaluate('e=>e.scrollTop')-before)<2
    await nav.get_by_role('button',name='Add custom expression',exact=True).click()
    await panel.get_by_role('textbox',name='Expression name').fill('Wistful')
    await panel.get_by_role('textbox',name='Direction').fill('distant gaze')
    await panel.get_by_role('button',name='Add expression',exact=True).click()
    assert await page.locator('.ss-expression-card').filter(has_text='Wistful').count()==1
    await nav.get_by_role('button',name='Select all expressions',exact=True).click()
    await page.get_by_role('button',name='Next / Skip',exact=True).click()
    assert await page.locator('.ss-expression-steps [aria-current=step]').get_attribute('aria-label')=='Enhance'
    assert not await nav.is_visible()
    await page.get_by_role('button',name='Next / Skip',exact=True).click()
    checkbox=page.get_by_role('checkbox',name='Despill after background removal')
    assert not await checkbox.is_checked()
    await checkbox.check()
    assert await page.get_by_role('combobox',name='Spill color').input_value()=='green'
    await page.get_by_role('button',name='Remove background selected',exact=True).click()
    await page.wait_for_function('window.despillPayload')
    png=await page.evaluate('window.despillPayload.png')
    cleaned=Image.open(io.BytesIO(base64.b64decode(png.split(',',1)[1]))).convert('RGBA')
    assert cleaned.size==cutout.size and cleaned.getchannel('A').tobytes()==cutout.getchannel('A').tobytes()
    assert cleaned.getpixel((1,1))==(30,141,120,255) and cleaned.getpixel((4,4))==(30,190,120,255)
    assert await page.evaluate('window.despillPayload.sourceId')=='cutout'
    assert not errors,errors
    print(f'PASS: expression settings at {width}px (host {host_width or width}px): aligned fields, responsive ratios, linked dimensions, reopen')
    await page.close()

async def main():
    async with async_playwright() as p:
      browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
      try:
        for width in (1440,390,320): await check(browser,width)
        await check(browser,1440,360)
      finally: await browser.close()

if __name__=='__main__':asyncio.run(main())
