"""Real Chromium crop-dialog regression for Swarm Studio, with a mocked Lumiverse avatar API.

Usage: python tests/v24-avatar-crop-browser.py
Requires Python Playwright and a Chromium executable. No live SwarmUI account is touched.
"""
from pathlib import Path
from PIL import Image
from io import BytesIO
import os
from base64 import b64encode
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
BUNDLE=(ROOT/'dist/frontend.js').read_text(encoding='utf-8').replace('</script', '<\\/script')
ORIGINAL=Image.open(ROOT/'tests/fixtures/studio-avatar.webp').convert('RGB') if (ROOT/'tests/fixtures/studio-avatar.webp').exists() else Image.new('RGB',(704,960),'#504054')
with BytesIO() as output:
    ORIGINAL.save(output,format='PNG')
    SOURCE=output.getvalue()

B64=b64encode(SOURCE).decode('ascii')
MOCK_FETCH='''<script>
window.uploadedAvatarParts=[];
const sourceData=Uint8Array.from(atob('''+repr(B64)+'''), c=>c.charCodeAt(0));
window.fetch = async (url,options) => {
 const path=String(url);
 if(path.includes('/api/v1/images/saved-one')) return new Response(sourceData,{status:200,headers:{'Content-Type':'image/png'}});
 if(path.includes('/api/v1/personas/persona-1/avatar')) {
  window.uploadedAvatarParts.push([...options.body.entries()].map(([name, file])=>({name,size:file.size,type:file.type})));
  return new Response('{"id":"persona-1"}',{status:200,headers:{'Content-Type':'application/json'}});
 }
 if(path.includes('/api/v1/image-gen/export')) return new Response('{}',{status:404,headers:{'Content-Type':'application/json'}});
 return new Response('{}',{status:200,headers:{'Content-Type':'application/json'}});
}
</script>'''
HTML='''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;width:100%;height:100%;background:#0c0b10}</style>'''+MOCK_FETCH+'''</head><body><main id="root"></main><script type="module">'''+BUNDLE+'''
const sheet=document.createElement('style'); sheet.textContent=STYLES+STUDIO_V3_STYLES; document.head.append(sheet);
const root=document.querySelector('#root');root.style.height='100dvh';root.style.setProperty('--lumiverse-accent','#aca5fa');
window.controller=new StudioController({sendToBackend(){}},{root},()=>{},()=>{},defaultStudioBehavior(),()=>{});
controller.state.permissions={characters:true,personas:true,images:true,imageGen:true};
controller.state.activeChat={id:'chat-1',character_id:'char-1'};
controller.state.chatVisuals={activePersona:{id:'persona-1',name:'Test persona'}};
controller.state.connection={id:'swarm-1',model:'fixture',provider:'swarmui'};
controller.setCurrentImage({id:'saved-one',src:'/api/v1/images/saved-one',url:'/api/v1/images/saved-one',label:'Preview art',details:{model:'fixture',width:704,height:960}});
controller.openInspector();
</script></body></html>'''

def rect(page, selector):
    return page.locator(selector).bounding_box()

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        for width in (390,1440):
            page=browser.new_page(viewport={'width':width,'height':850},device_scale_factor=1)
            errors=[]
            uploaded=[]
            page.on('pageerror',lambda e: errors.append(str(e)))
            page.set_content(HTML, wait_until="domcontentloaded")
            page.locator('[data-action="set-persona-picture"]').wait_for(state='attached')
            page.locator('[data-action="inspector-send-toggle"]').click()
            page.locator('[data-action="set-persona-picture"]').click()
            dialog=page.locator('.ss-avatar-crop')
            dialog.wait_for(state='visible')
            page.wait_for_function("document.querySelector('[data-crop=apply]')?.disabled === false")
            assert dialog.locator('h2').inner_text()=='Set persona picture'
            assert dialog.locator('[data-crop-readout="zoom"]').inner_text()=='100%'
            modal=rect(page,'.ss-avatar-crop')
            canvas=rect(page,'.ss-avatar-crop canvas')
            stage=rect(page,'.ss-avatar-crop-stage')
            settings=rect(page,'.ss-avatar-crop-settings')
            assert modal['x']>=0 and modal['x']+modal['width'] <= width+1,(width,'modal',modal)
            assert canvas['x'] >= 0 and canvas['x']+canvas['width'] <= width+1,(width,'canvas',canvas)
            assert canvas['width'] > (220 if width < 680 else 350), (width,'canvas size',canvas)
            assert abs(modal['x'] + modal['width']/2-width/2)<3,(width,'centering',modal)
            if width < 680:
                assert settings['y'] > stage['y'],(width,'mobile stacked stage',stage,settings)
            else:
                assert settings['x'] > stage['x'],(width,'desktop side controls',stage,settings)
            page.locator('[data-crop="zoom"]').fill('1.5')
            assert dialog.locator('[data-crop-readout="zoom"]').inner_text()=='150%'
            page.locator('[data-crop="reset"]').click()
            assert dialog.locator('[data-crop-readout="zoom"]').inner_text()=='100%'
            page.locator('[data-crop="zoom"]').fill('1.4')
            canvas=rect(page,'.ss-avatar-crop canvas')
            x,y=canvas['x']+canvas['width']/2,canvas['y']+canvas['height']/2
            page.mouse.move(x,y)
            page.mouse.down()
            page.mouse.move(x+33,y+18,steps=7)
            page.mouse.up()
            assert dialog.locator('[data-crop="x"]').input_value() != '0'
            assert not uploaded
            if os.environ.get("STUDIO_SCREENSHOT_DIR"):
                out=Path(os.environ["STUDIO_SCREENSHOT_DIR"])/f"v24-avatar-crop-{width}.png"
                out.parent.mkdir(parents=True,exist_ok=True)
                page.screenshot(path=str(out))
            page.locator('[data-crop="apply"]').click()
            page.wait_for_function("document.querySelector('.ss-avatar-crop')===null")
            uploaded=page.evaluate('window.uploadedAvatarParts')
            assert len(uploaded)==1, (width, 'upload count',len(uploaded))
            assert {part['name'] for part in uploaded[0]} == {'original_avatar','avatar'}, 'Original + crop included'
            # The same themed crop editor must also work for character avatars.
            menu=page.locator('[data-role="inspector-send-menu"]')
            if not menu.is_visible(): page.locator('[data-action="inspector-send-toggle"]').click()
            page.locator('[data-action="set-character-picture"]').click()
            dialog.wait_for(state='visible')
            assert dialog.locator('h2').inner_text()=='Set character picture'
            page.keyboard.press('Escape')
            dialog.wait_for(state='detached')
            assert not page.evaluate('window.uploadedAvatarParts.filter(row=>row.some(part=>part.name==="character")).length'), 'Cancel does not upload'
            assert not errors, (width,errors)
            print(f'{width}px: styled modal geometry, sliders, reset, drag, and original + crop upload passed')
            page.close()
    finally:
        browser.close()
