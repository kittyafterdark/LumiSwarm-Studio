"""Chromium 390/1440 smoke and workflow-interaction test for the Studio AI upscaler.
No live model or SwarmUI required; uses the real built frontend and a mocked backend.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import os
from base64 import b64encode

ROOT=Path(__file__).resolve().parents[1]
BUNDLE=(ROOT/'dist/frontend.js').read_text(encoding='utf-8').replace('</script','<\\/script')
ART = 'data:image/webp;base64,' + b64encode((ROOT/'tests/fixtures/studio-avatar.webp').read_bytes()).decode('ascii')
HTML='''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;background:#0c0b10;min-height:100vh}</style></head>
<body><main id="root"></main><script type="module">'''+BUNDLE+'''
const sheet=document.createElement('style');sheet.textContent=STYLES+STUDIO_V3_STYLES;document.head.append(sheet);
const root=document.querySelector('#root');root.style.height='100dvh';root.style.setProperty('--lumiverse-accent','#aca5fa');
window.fixtureRequests=[];
window.controller=new StudioController({sendToBackend(payload){
  window.fixtureRequests.push(payload);
  if(payload.type==='load_upscale_options')setTimeout(()=>controller.onMessage({type:'upscale_options_result',requestId:payload.requestId,data:{
    models:['4x-UltraSharp.pth','RealESRGAN_x4plus_anime_6B.pth'],recommended:'RealESRGAN_x4plus_anime_6B.pth',
    workflows:[{name:'Portrait/Inpaint'}],settings:{mode:'model',factor:2,model:'',workflow:'',imageParam:'',graph:''}
  }}),8);
  if(payload.type==='load_upscale_workflow')setTimeout(()=>controller.onMessage({type:'upscale_workflow_result',requestId:payload.requestId,
    data:{name:payload.name,parameters:[{id:'image-input',name:'Input source',type:'image'}]}}),8);
}}, {root},()=>{},()=>{},defaultStudioBehavior(),()=>{});
controller.state.permissions={characters:true,personas:true,images:true,imageGen:true};
controller.state.activeChat={id:'chat-1',character_id:'char-1'};
controller.state.connection={id:'swarm-1',model:'fixture',provider:'swarmui'};
const art='''+repr(ART)+''';
controller.setCurrentImage({id:'saved-one',src:art,url:art,label:'Preview art',details:{model:'fixture',parameters:{width:704,height:960}}});
controller.openInspector();
</script></body></html>'''

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        for width in (390,1440):
            page=browser.new_page(viewport={'width':width,'height':850})
            errors=[]
            page.on('pageerror',lambda error: errors.append(str(error)))
            page.set_content(HTML,wait_until='domcontentloaded')
            page.locator('[data-action="upscale-output"]').last.click()
            dialog=page.locator('.ss-upscale-dialog')
            dialog.wait_for(state='visible')
            page.wait_for_function("document.querySelector('[data-upscale=model]')?.value === 'RealESRGAN_x4plus_anime_6B.pth'")
            assert dialog.locator('[data-upscale="model"]').input_value()=='RealESRGAN_x4plus_anime_6B.pth'
            assert dialog.locator('[data-upscale="factor"]').input_value()=='2'
            modal=dialog.bounding_box();panel=dialog.locator('.ss-upscale-panel').bounding_box();stage=dialog.locator('.ss-upscale-stage').bounding_box()
            assert modal['x']>=-1 and modal['x']+modal['width']<=width+1,(width,'dialog offscreen',modal)
            if width<721: assert panel['y']>stage['y'],(width,'mobile panels overlap',stage,panel)
            else: assert panel['x']>stage['x'],(width,'desktop panels overlap',stage,panel)
            button=dialog.locator('[data-upscale="run"]')
            assert button.is_enabled()
            if os.environ.get('STUDIO_SCREENSHOT_DIR'):
                out=Path(os.environ['STUDIO_SCREENSHOT_DIR'])/f'v25-ai-upscale-{width}.png'
                out.parent.mkdir(parents=True,exist_ok=True)
                page.screenshot(path=str(out))
            # Model mode runs the installed recommendation, not an interpolation fallback.
            button.click()
            submitted=page.evaluate('window.fixtureRequests.filter(r=>r.type==="upscale_output")')
            assert len(submitted)==1 and submitted[0]['settings']['mode']=='model',submitted
            assert submitted[0]['settings']['model']=='RealESRGAN_x4plus_anime_6B.pth'
            assert submitted[0]['imageId']=='saved-one'
            # Recover the modal after a backend error and switch modes.
            page.evaluate('''() => {
                const req=window.fixtureRequests.findLast(r=>r.type==='upscale_output');
                controller.onMessage({type:'studio_error',operation:'upscale_output',requestId:req.requestId,error:'ComfyUI backend model unavailable'});
            }''')
            assert button.is_enabled()
            assert 'ComfyUI backend model unavailable' in dialog.locator('[data-upscale="feedback"]').inner_text()
            dialog.locator('input[value="saved"]').check()
            dialog.locator('[data-upscale="workflow"]').select_option('Portrait/Inpaint')
            page.wait_for_function("document.querySelector('[data-upscale=image-param]')?.value==='image-input'")
            button.click()
            submitted=page.evaluate('window.fixtureRequests.filter(r=>r.type==="upscale_output")')
            assert submitted[1]['settings']['mode']=='saved' and submitted[1]['settings']['imageParam']=='image-input',submitted[1]
            page.evaluate('''() => {
                const req=window.fixtureRequests.findLast(r=>r.type==='upscale_output');
                controller.onMessage({type:'studio_error',operation:'upscale_output',requestId:req.requestId,error:'saved workflow fixture'});
            }''')
            dialog.locator('input[value="custom"]').check()
            dialog.locator('[data-upscale="graph"]').fill('{"1":{"class_type":"SwarmLoadImageB64","inputs":{}},"2":{"class_type":"SaveImage","inputs":{}}}')
            assert button.is_enabled()
            button.click()
            submitted=page.evaluate('window.fixtureRequests.filter(r=>r.type==="upscale_output")')
            assert submitted[2]['settings']['mode']=='custom' and 'SwarmLoadImageB64' in submitted[2]['settings']['graph']
            page.evaluate('''() => {
                const req=window.fixtureRequests.findLast(r=>r.type==='upscale_output');
                controller.onMessage({type:'studio_error',operation:'upscale_output',requestId:req.requestId,error:'custom workflow fixture'});
            }''')
            dialog.locator('[data-upscale="cancel"]').click()
            dialog.wait_for(state='detached')
            assert not errors,(width,errors)
            print(f'{width}px: upscale layout, model discovery, AI submission, saved workflow, custom JSON, recovery and close passed')
            page.close()
    finally:browser.close()
