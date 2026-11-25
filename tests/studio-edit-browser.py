"""Real Studio frontend with mocked image uploads and provider processing."""
import asyncio, os, base64, io
from pathlib import Path
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
root=Path(__file__).resolve().parents[1]
markup=(root/'tests/ui-harness.html').read_text()
compiled=(root/'dist/frontend.js').read_text()
fixture=markup.replace('import { setup } from "../dist/frontend.js"',compiled.replace('</script','<\\/script'))
fixture=fixture.replace('sendToBackend(message) {','''sendToBackend(message) {
        (window.__editCalls ||= []).push(message);
        if(message.type==='load_cast_library'){window.__editCast ||= cleanCastLibrary({groups:[{id:'crew',name:'Fixture Cast',backgrounds:[{key:'room',name:'Room',id:'room-art'}]}],members:[{id:'shoto',groupId:'crew',name:'Shoto',prefix:'shoto',images:{joy:{id:'shoto-joy'}}}],chatGroups:{'chat-1':'crew'}});later({type:'cast_result',requestId:message.requestId,data:{...window.__editCast,chatId:'chat-1'}});return;}
        if(message.type==='save_local_edit'){window.__lastEditedPNG=message.png;const id='edit-saved-'+(window.__editCalls.filter(m=>m.type==='save_local_edit').length);later({type:'edit_result',requestId:message.requestId,data:{id,url:'/api/v1/images/'+id}});return;}
        if(message.type==='replace_cast_edit'){const m=window.__editCast.members.find(m=>m.id===message.memberId);if(m?.images[message.expression]?.id!==message.sourceId){later({type:'studio_error',requestId:message.requestId,error:'Stale target'});return;}m.images[message.expression]={id:message.imageId,url:'/api/v1/images/'+message.imageId};later({type:'cast_library_changed',library:window.__editCast,editChanged:true});later({type:'edit_result',requestId:message.requestId,data:{id:message.imageId}});return;}
        if(message.type==='load_upscale_options'){later({type:'upscale_options_result',requestId:message.requestId,data:{models:['Anime.pth'],recommended:'Anime.pth',workflows:[],settings:{mode:'model',factor:2,model:'Anime.pth'}}});return;}
        if(message.type==='upscale_output'){later({type:'upscale_output_result',requestId:message.requestId,data:{id:'edit-enhanced',url:'/api/v1/images/edit-enhanced',sourceId:message.imageId}});return;}
        if(message.type==='process_edit_background'){later({type:'folder_expression_progress',requestId:message.requestId,data:{step:4,totalSteps:8}});setTimeout(()=>later({type:'folder_expression_result',requestId:message.requestId,data:{id:'edit-processed',url:'/api/v1/images/edit-processed'}}),300);return;}
''')
portrait=Image.open(root/'tests/fixtures/cast-portrait.png').convert('RGBA').resize((510,684));d=ImageDraw.Draw(portrait);d.rectangle((18,18,36,36),fill=(0,255,70,255));d.rectangle((470,18,488,36),fill=(0,255,70,255))
buf=io.BytesIO();portrait.save(buf,format='PNG');source=buf.getvalue()
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in (1440,390,320):
   page=await browser.new_page(viewport={'width':width,'height':850},has_touch=width<=720)
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   # Serve image bytes through an explicit same-origin fetch mock; no network required.
   fixture_with_fetch=fixture.replace('const handlers = []', 'const originalFetch=window.fetch;window.fetch=async (url,opts)=>String(url).startsWith("/api/v1/images/")?new Response(Uint8Array.from(atob("'+base64.b64encode(source).decode()+'"),c=>c.charCodeAt(0)),{headers:{"Content-Type":"image/png"}}):originalFetch(url,opts);const handlers = []')
   await page.set_content(fixture_with_fetch)
   await page.locator('.ss-shell').wait_for(timeout=8000)
   await page.locator('[data-action="studio-view"][data-view="edit"]').click(timeout=8000)
   edit=page.locator('.ss-edit-workspace');await edit.wait_for()
   await edit.locator('[data-edit="file"]').set_input_files({'name':'Shoto · Joy.png','mimeType':'image/png','buffer':source})
   await page.wait_for_function('document.querySelector("[data-edit=meta]")?.textContent.includes("510 × 684")',timeout=6000)
   await page.wait_for_function('document.querySelector(".ss-edit-workspace")?.dataset.editBusy==="false"')
   overlay=edit.locator('[data-edit="overlay"]');canvas=edit.locator('[data-edit="canvas"]')
   box=await overlay.bounding_box();assert box['width']>50 and box['height']>60,box
   await overlay.click(position={'x':27*box['width']/510,'y':27*box['height']/684})
   await page.wait_for_function('!document.querySelector("[data-op=clear]").disabled',timeout=4000)
   assert await overlay.evaluate('el=>getComputedStyle(el).backgroundColor')=='rgba(0, 0, 0, 0)'
   assert await edit.locator('.ss-edit-range input[type=range]').evaluate_all('(nodes)=>nodes.length>0&&nodes.every(n=>getComputedStyle(n).backgroundColor==="rgba(0, 0, 0, 0)"&&getComputedStyle(n).appearance==="none"&&getComputedStyle(n).borderTopWidth==="0px")')
   # SVG-first selection actions keep their names, tooltips and real mask behavior.
   tools=edit.locator('.ss-edit-selection-tools')
   assert await tools.locator('[data-selection-state]').inner_text()=='Active'
   assert await tools.locator('.ss-edit-selection-row button svg').count()==5
   for action in ('selection-undo','selection-redo','select-all','invert','deselect','grow','shrink'):
    button=tools.locator(f'[data-op="{action}"]')
    assert await button.get_attribute('aria-label') and await button.get_attribute('title')
    assert await button.locator('svg').count()==1
   before=await canvas.evaluate('el=>el.toDataURL()')
   async def mask_alpha(x,y):return await overlay.evaluate('(el,p)=>el.getContext("2d").getImageData(...p,1,1).data[3]',[x,y])
   await tools.locator('[data-op="select-all"]').click();assert await mask_alpha(479,27)>0
   await tools.locator('[data-op="invert"]').click();assert await tools.locator('[data-selection-state]').inner_text()=='None'
   await tools.locator('[data-op="selection-undo"]').click();assert await mask_alpha(479,27)>0
   await tools.locator('[data-op="selection-undo"]').click();assert await mask_alpha(479,27)==0 and await mask_alpha(27,27)>0
   await tools.locator('[data-op="grow"]').click();await tools.locator('[data-op="shrink"]').click()
   await tools.locator('[data-op="selection-undo"]').click();await tools.locator('[data-op="selection-undo"]').click()
   await tools.locator('[data-setting="feather"]').evaluate('(el)=>{el.value="2";el.dispatchEvent(new Event("input",{bubbles:true}))}')
   await tools.locator('[data-op="feather"]').click()
   await tools.locator('[data-op="selection-undo"]').click()
   await tools.locator('[data-op="deselect"]').click();assert await tools.locator('[data-selection-state]').inner_text()=='None'
   await tools.locator('[data-op="selection-undo"]').click();assert await mask_alpha(27,27)>0
   assert await canvas.evaluate('el=>el.toDataURL()')==before
   geometry=await tools.evaluate('el=>({width:el.clientWidth,scroll:el.scrollWidth,icons:[...el.querySelectorAll(".ss-edit-selection-row button")].map(b=>b.getBoundingClientRect().width)})')
   assert geometry['scroll']<=geometry['width']+1 and min(geometry['icons'])>=30,geometry
   # Undo a mistaken selection, not the underlying artwork. Redo restores the mask.
   await edit.locator('[data-op="selection-undo"]').click()
   assert await edit.locator('[data-op="clear"]').is_disabled()
   assert await edit.locator('[data-edit="undo"]').is_disabled()
   await edit.locator('[data-op="selection-redo"]').click()
   assert not await edit.locator('[data-op="clear"]').is_disabled()
   if width!=320:
    await edit.screenshot(path=str(root/f'test-results/studio-edit-{width}.png'))
    await edit.locator('[data-tool="lasso"]').click()
    await tools.locator('[data-op="deselect"]').click()
    if width==1440:await edit.screenshot(path=str(root/'test-results/studio-edit-lasso-1440.png'))
    await tools.locator('[data-op="selection-undo"]').click()
    await edit.locator('[data-tool="wand"]').click()
   await edit.locator('[data-op="clear"]').click()
   async def alpha(x,y):return await canvas.evaluate('(el,p)=>el.getContext("2d").getImageData(...p,1,1).data[3]',[x,y])
   assert await alpha(27,27)==0 and await alpha(479,27)==255
   await edit.locator('[data-edit="undo"]').click();assert await alpha(27,27)==255
   await edit.locator('[data-edit="redo"]').click();assert await alpha(27,27)==0
   await edit.locator('[data-tool="erase"]').click()
   slider=edit.locator('[data-setting="brush"]')
   await slider.evaluate('(el)=>{el.value="64";el.dispatchEvent(new Event("input",{bubbles:true}))}')
   ring=edit.locator('[data-edit="brush-cursor"]')
   assert await ring.is_visible()
   ratio=await ring.evaluate('el=>el.getBoundingClientRect().width/el.parentElement.getBoundingClientRect().width')
   assert abs(ratio-64/510)<.003,ratio
   # Actual paint and erase both use the indicated diameter, with independent pixel history.
   await edit.locator('[data-tool="brush"]').click()
   box=await overlay.bounding_box()
   await overlay.click(position={'x':27*box['width']/510,'y':27*box['height']/684})
   assert await alpha(27,27)==255
   await edit.locator('[data-edit="undo"]').click();assert await alpha(27,27)==0
   await edit.locator('[data-tool="erase"]').click()
   box=await overlay.bounding_box()
   await overlay.click(position={'x':479*box['width']/510,'y':27*box['height']/684})
   assert await alpha(479,27)==0
   await edit.locator('[data-edit="undo"]').click();assert await alpha(479,27)==255
   if width==1440:
    box=await overlay.bounding_box();await page.mouse.move(box['x']+box['width']*.5,box['y']+box['height']*.5)
    assert await ring.is_visible()
    await edit.screenshot(path=str(root/'test-results/studio-edit-brush-1440.png'))
    await edit.locator('[data-tool="liquify"]').click()
    # Warp and undo using a location with a defined edge/color; exact pre-stroke bytes return.
    before=await canvas.evaluate('el=>el.toDataURL()');box=await overlay.bounding_box()
    await page.mouse.move(box['x']+box['width']*(479/510),box['y']+box['height']*(27/684))
    await page.mouse.down();await page.mouse.move(box['x']+box['width']*.86,box['y']+box['height']*.05,steps=8);await page.mouse.up()
    assert await canvas.evaluate('el=>el.toDataURL()')!=before
    await edit.locator('[data-edit="undo"]').click();assert await canvas.evaluate('el=>el.toDataURL()')==before
   await edit.locator('[data-tool="wand"]').click()
   await page.locator('[data-action="studio-view"][data-view="generate"]').click()
   await page.locator('[data-action="studio-view"][data-view="edit"]').click();assert await alpha(27,27)==0
   await edit.locator('[data-edit="save"]').click();await page.wait_for_function('window.__lastEditedPNG && document.querySelector("[data-edit=status]")?.textContent.includes("Saved in Output Library")',timeout=8000)
   saved=Image.open(io.BytesIO(base64.b64decode((await page.evaluate('window.__lastEditedPNG')).split(',')[1])))
   assert saved.size==(510,684) and saved.mode=='RGBA' and saved.getpixel((27,27))[3]==0 and saved.getpixel((479,27))[3]==255
   geo=await edit.evaluate('el=>({width:el.clientWidth,scroll:el.scrollWidth,rail:el.querySelector(".ss-edit-rail").scrollWidth,railWidth:el.querySelector(".ss-edit-rail").clientWidth})');assert geo['scroll']<=geo['width']+1 and geo['rail']<=geo['railWidth']+1,geo
   await edit.locator('[data-tool="crop"]').click();await edit.locator('[data-op="rotate"]').click();assert await canvas.evaluate('el=>[el.width,el.height]')==[684,510]
   await edit.locator('[data-edit="undo"]').click();assert await canvas.evaluate('el=>[el.width,el.height]')==[510,684]
   if width==1440:
    await edit.locator('[data-tool="background"]').click();await edit.locator('[data-op="gpu"]').click();await page.wait_for_function('document.querySelector("[data-edit=status]")?.textContent.includes("Processed copy ready")',timeout=8000)
    assert await page.evaluate('window.__editCalls.some(m=>m.type==="process_edit_background"&&m.imageId.startsWith("edit-saved-"))')
    await edit.locator('[data-edit="undo"]').click();assert await alpha(27,27)==0
   # Open a real Cast member from the workspace and replace one expression.
   page.on('dialog',lambda dialog:dialog.accept())
   await page.locator('[data-action="studio-view"][data-view="cast"]').click()
   await page.locator('.cast-card[data-id="crew"]').click(timeout=6000)
   await page.locator('[data-cast-action="edit-expression-art"][data-expression="joy"]').click(timeout=6000)
   await page.wait_for_function('document.querySelector("[data-edit=title]")?.textContent==="Shoto · Joy" && document.querySelector(".ss-edit-workspace")?.dataset.editBusy==="false"',timeout=6000)
   assert await edit.locator('[data-edit="replace"]').inner_text()=='Replace expression'
   await edit.locator('[data-tool="wand"]').click()
   box=await overlay.bounding_box();await overlay.click(position={'x':27*box['width']/510,'y':27*box['height']/684});await edit.locator('[data-op="clear"]').click()
   await edit.locator('[data-edit="replace"]').click()
   await page.wait_for_function('document.querySelector("[data-edit=status]")?.textContent.includes("Replacement saved")',timeout=6000)
   assert await page.evaluate('window.__editCalls.some(m=>m.type==="replace_cast_edit"&&m.sourceId==="shoto-joy"&&m.expression==="joy"&&m.memberId==="shoto")')
   if width==1440:
    # The existing upscale dialog returns its result to Edit, not Generate.
    await edit.locator('[data-tool="upscale"]').click();await edit.locator('[data-op="gpu"]').click()
    await page.locator('.ss-upscale-dialog [data-upscale="run"]').click(timeout=6000)
    await page.wait_for_function('document.querySelector("[data-edit=status]")?.textContent.includes("Processed copy ready")',timeout=6000)
    assert await page.evaluate('window.__editCalls.some(m=>m.type==="upscale_output"&&m.imageId.startsWith("edit-saved-"))')
    # Existing Inpaint receives the selection mask. No GPU is required to verify this.
    await edit.locator('[data-tool="wand"]').click();box=await overlay.bounding_box();await overlay.click(position={'x':27*box['width']/510,'y':27*box['height']/684})
    await edit.locator('[data-tool="inpaint"]').click();await edit.locator('[data-op="gpu"]').click()
    await page.locator('.ss-inpaint-dialog').wait_for(timeout=6000)
    await page.wait_for_function('document.querySelector(".ss-inpaint-dialog canvas")?.width>300',timeout=6000)
    assert await page.locator('.ss-inpaint-dialog canvas').nth(1).evaluate('e=>e.getContext("2d").getImageData(27,27,1,1).data[3]')>0
   assert not errors,(width,errors)
   print(f'Studio Edit browser {width}: native PNG, selection, history, workspace persistence, responsive rail, save PASS',flush=True)
   await page.close()
  await browser.close()
if __name__=='__main__':
 (root/'test-results').mkdir(exist_ok=True);asyncio.run(main())
