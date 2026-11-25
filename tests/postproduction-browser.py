"""Actual compiled Studio with a minimal scoped provider/host fixture. No GPU required."""
import asyncio, os, io, base64
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
fixture=(root/'tests/ui-harness.html').read_text().replace('import { setup } from "../dist/frontend.js"',(root/'dist/frontend.js').read_text().replace('</script','<\\/script'))
fixture=fixture.replace('sendToBackend(message) {','''sendToBackend(message) {
        (window.__postCalls ||= []).push(message);
        if(message.type==='finalize_protect')return;
        if(message.type==='postproduction_capabilities'){later({type:'postproduction_result',requestId:message.requestId,data:{samModels:['sam2.1_hiera_small.safetensors'],reference:true,referenceEnd:true,detectors:['bbox/face_yolov8m.pt','bbox/hand_yolov8s.pt'],upscalers:['Anime.pth'],background:'installed'}});return;}
        if(message.type==='postproduction_source'){later({type:'postproduction_result',requestId:message.requestId,data:{model:'anima-semi-v10.safetensors',prompt:'portrait of an adult character, soft lighting',negativePrompt:'blurry',parameters:{sampler:'euler',scheduler:'simple'},loras:[]}});return;}
        if(message.type==='finalize_recipes'||message.type==='save_finalize_recipe'||message.type==='delete_finalize_recipe'){window.__recipes ||= [];if(message.type==='save_finalize_recipe')window.__recipes=[message.recipe];if(message.type==='delete_finalize_recipe')window.__recipes=[];later({type:'postproduction_result',requestId:message.requestId,data:window.__recipes});return;}
        if(message.type==='save_local_edit'){const id='local-'+window.__postCalls.filter(m=>m.type==='save_local_edit').length;later({type:'edit_result',requestId:message.requestId,data:{id,url:'/api/v1/images/'+id}});return;}
        if(message.type==='finalize_stage'||message.type==='smart_selection'){window.__pending ||= new Map();later({type:'folder_expression_progress',requestId:message.requestId,data:{step:3,totalSteps:10}});const timer=setTimeout(()=>{window.__pending.delete(message.requestId);if(window.__failNext){window.__failNext=false;later({type:'studio_error',requestId:message.requestId,error:'Fixture provider unavailable'});return;}const id=message.type==='smart_selection'?'mask-'+(window.__badMask?'bad':'good'):'candidate-'+window.__postCalls.filter(m=>m.type==='finalize_stage').length;later({type:'folder_expression_result',requestId:message.requestId,data:{id,url:'/api/v1/images/'+id}})},window.__delay||120);window.__pending.set(message.requestId,timer);return;}
        if(message.type==='stop_folder_expression'){clearTimeout(window.__pending?.get(message.requestId));window.__pending?.delete(message.requestId);later({type:'folder_expression_stopped',requestId:message.requestId});return;}
''')
original=Image.open(root/'tests/fixtures/cast-portrait.png').convert('RGBA').resize((510,684))
mask=Image.new('RGB',original.size,'black');ImageDraw.Draw(mask).rectangle((20,20,200,240),fill='white')
def png(im):
 b=io.BytesIO();im.save(b,format='PNG');return b.getvalue()
source=png(original);after=png(ImageEnhance.Brightness(original).enhance(1.15));mask_bytes=png(mask)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in (1440,390,320):
   page=await browser.new_page(viewport={'width':width,'height':850},has_touch=width<=720);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   data_urls={k:'data:image/png;base64,'+base64.b64encode(v).decode() for k,v in {'source':source,'after':after,'mask-good':mask_bytes,'mask-bad':png(Image.new('RGB',(12,12)))}.items()}
   import json
   shim='const fixtureImages=FIXTURE;function fixtureImage(url){return fixtureImages[url.includes(\'mask-good\')?\'mask-good\':url.includes(\'mask-bad\')?\'mask-bad\':url.includes(\'candidate-\')?\'after\':\'source\']}\nconst originalFetch=window.fetch;window.fetch=async (url,opts)=>String(url).startsWith(\'/api/v1/images/\')?new Response(Uint8Array.from(atob(fixtureImage(String(url)).split(\',\')[1]),c=>c.charCodeAt(0)),{headers:{\'Content-Type\':\'image/png\'}}):originalFetch(url,opts);\nnew MutationObserver(()=>{for(const img of document.querySelectorAll(\'.ss-finalize-workspace img[src^="/api/v1/images/"]\')){img.dataset.fixtureId=img.getAttribute(\'src\');img.src=fixtureImage(img.dataset.fixtureId)}}).observe(document.body,{childList:true,subtree:true});const handlers = []'
   await page.set_content(fixture.replace('const handlers = []',shim.replace('FIXTURE',json.dumps(data_urls))));await page.locator('.ss-shell').wait_for(timeout=8000)
   await page.locator('[data-action="studio-view"][data-view="edit"]').click();edit=page.locator('.ss-edit-workspace')
   await edit.locator('[data-edit="file"]').set_input_files({'name':'Fixture portrait.png','mimeType':'image/png','buffer':source});await page.wait_for_function('document.querySelector("[data-edit=meta]")?.textContent.includes("510 × 684")')
   await edit.locator('[data-tool="smart"]').click();await page.wait_for_function('document.querySelector("[data-setting=smart-model]")?.value.includes("sam2")')
   canvas=edit.locator('[data-edit="canvas"]');overlay=edit.locator('[data-edit="overlay"]');before=await canvas.evaluate('el=>el.toDataURL()')
   async def sample(x,y):return await overlay.evaluate('(el,p)=>el.getContext("2d").getImageData(...p,1,1).data[3]',[x,y])
   await overlay.click(position={'x':30,'y':30});await page.wait_for_function('document.querySelector("[data-selection-state]")?.textContent==="Active"')
   assert await sample(50,50)>0 and await sample(400,400)==0;assert await canvas.evaluate('el=>el.toDataURL()')==before
   await edit.locator('[data-setting="mode"]').select_option('subtract');await overlay.click(position={'x':30,'y':30});await page.wait_for_function('document.querySelector("[data-selection-state]")?.textContent==="None"')
   await edit.locator('[data-op="selection-undo"]').click();assert await sample(50,50)>0
   await page.evaluate('window.__badMask=true');await overlay.click(position={'x':30,'y':30});await page.wait_for_function('document.querySelector("[data-edit=status]").textContent.includes("unexpected dimensions")');assert await sample(50,50)>0;await page.evaluate('window.__badMask=false')
   if width!=320:await edit.screenshot(path=str(root/f'test-results/postproduction-smart-{width}.png'))
   await edit.locator('[data-edit="finalize"]').click();f=page.locator('.ss-finalize-workspace');await f.wait_for();await page.wait_for_function('document.querySelector("[data-finalize=status]")?.textContent.includes("Source ready") && document.querySelector(".ss-finalize-capability")?.textContent.includes("2 detectors")')
   assert await f.locator('.ss-finalize-before').evaluate('el=>el.complete&&el.naturalWidth>0')
   # Enable reference guidance and preserve values when switching stages.
   await f.locator('[data-stage-field="reference"]').check();await f.locator('[data-stage-field="guidance"]').fill('3.25');await f.locator('[data-stage-field="end"]').fill('0.65');await f.locator('[data-stage-field="seed"]').fill('77');await f.locator('[data-finalize="lab"]').click()
   await f.locator('[data-finalize="compare"]').click();await page.wait_for_function('document.querySelectorAll("[data-finalize=candidate]").length===3 && document.querySelector("[data-finalize=status]").textContent.includes("Choose a candidate")')
   calls=await page.evaluate('window.__postCalls.filter(m=>m.type==="finalize_stage")');assert len(calls)==3 and len({m['imageId'] for m in calls})==1 and [m['stage']['creativity'] for m in calls]==[.15,.25,.4];assert all(m['stage']['seed']==77 and m['stage']['guidance']==3.25 and m['stage']['end']==.65 for m in calls),calls
   if width!=320:await f.screenshot(path=str(root/f'test-results/postproduction-lab-{width}.png'))
   await f.locator('[data-finalize="candidate"][data-index="1"]').click();await page.evaluate('window.__failNext=true');await f.locator('[data-finalize="run"]').click();await page.wait_for_function('document.querySelector("[data-finalize=status]").textContent.includes("Fixture provider unavailable")');assert await f.locator('[data-finalize="preview"]').count()==1
   await f.locator('[data-finalize="run"]').click();await page.wait_for_function('document.querySelector("[data-finalize=status]").textContent.includes("Final artwork ready")');calls=await page.evaluate('window.__postCalls.filter(m=>m.type==="finalize_stage")');assert calls[-1]['imageId']=='candidate-2' and calls[-1]['stage']['kind']=='upscale' and len(calls)==5,calls
   assert await f.locator('[data-finalize="preview"]').count()==2;await f.locator('[data-finalize="split"]').evaluate('el=>{el.value=73;el.dispatchEvent(new Event("input",{bubbles:true}))}');assert await f.locator('.ss-finalize-compare').evaluate('el=>el.style.getPropertyValue("--ss-split")')=='73%'
   if width!=320:await f.screenshot(path=str(root/f'test-results/postproduction-finalize-{width}.png'))
   geo=await f.evaluate('el=>({w:el.clientWidth,s:el.scrollWidth,pw:el.querySelector(".ss-finalize-panel").clientWidth,ps:el.querySelector(".ss-finalize-panel").scrollWidth})');assert geo['s']<=geo['w']+1 and geo['ps']<=geo['pw']+1,geo
   # Reordering, cancel, and saved recipes remain local to the workspace.
   await f.locator('[data-finalize="reset"]').click();await f.locator('[data-finalize="up"][data-index="1"]').click();assert 'AI upscale' in await f.locator('.ss-finalize-stage-label').first.inner_text()
   page.on('dialog',lambda d:d.accept('My finishing recipe'));await f.locator('[data-finalize="save-recipe"]').click();await page.wait_for_function('window.__recipes?.[0]?.name==="My finishing recipe"')
   await page.evaluate('window.__delay=1500');await f.locator('[data-finalize="run"]').click();await f.locator('[data-finalize="stop"]').click();await page.wait_for_function('document.querySelector("[data-finalize=status]").textContent.includes("Stopped")');assert await f.locator('[data-finalize="preview"]').count()==0
   await page.locator('[data-action="studio-view"][data-view="generate"]').click();assert not await f.is_visible();await page.locator('[data-action="studio-view"][data-view="finalize"]').click();assert await f.is_visible()
   if width==1440:
    await page.locator('[data-action="studio-view"][data-view="generate"]').click()
    await page.locator('.ss-finalize-ref-tune summary').click()
    for index,id in enumerate(('image-32','image-31')):
     await page.locator(f'[data-action="anima-ref-pick"][data-index="{index}"]').click()
     card=page.locator('.ss-library-output').filter(has=page.locator(f'[data-image-id="{id}"]'))
     await card.locator('.ss-library-output-button').click(timeout=5000)
     await page.locator('[data-action="confirm-library-pick"]').click()
    await page.wait_for_function('document.querySelector("[data-role=anima-ref-info]").textContent.includes("Two references stitched")')
    await page.locator('[data-role="anima-ref-guidance"]').fill('3.25');await page.locator('[data-role="anima-ref-end"]').fill('0.7')
    await page.locator('[data-role="positive"]').fill('Two characters side by side')
    await page.locator('.ss-desktop-generate').click()
    await page.wait_for_function('window.__postCalls.some(m=>m.type==="generate"&&m.manualAnimaReference?.ids?.length===2)')
    dispatch=await page.evaluate('window.__postCalls.find(m=>m.type==="generate"&&m.manualAnimaReference?.ids?.length===2)')
    assert dispatch['manualAnimaReference']['ids']==['image-32','image-31'];assert dispatch['input']['parameters']['animaRefGuidance']==3.25 and dispatch['input']['parameters']['animaRefEnd']==.7
    composite=Image.open(io.BytesIO(base64.b64decode(dispatch['manualAnimaReference']['url'].split(',')[1])))
    assert composite.format=='JPEG' and composite.width==1020 and composite.height==684,composite.size
    print('Manual A/B reference picker, actual stitched JPEG and independent conditioning dispatch PASS',flush=True)
   assert not errors,errors
   print(f'Postproduction browser {width}: SAM2 selection and mismatch safety, same-seed Lab, winner chain, retry, split preview, reorder, recipe persistence, cancellation and overflow PASS',flush=True)
   await page.close()
  await browser.close()
if __name__=='__main__':asyncio.run(main())
