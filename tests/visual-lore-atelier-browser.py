"""Real Studio runtime + native lore mock. Run with Python Playwright/Chromium."""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright

root=Path(__file__).resolve().parents[1]
markup=(root/'tests/ui-harness.html').read_text()
compiled=(root/'dist/frontend.js').read_text()
fixture=markup.replace("<head>", '<head><base href="http://studio.local/">').replace('import { setup } from "../dist/frontend.js"',compiled.replace('</script','<\\/script'))
fixture=fixture.replace('    const handlers = []', '''
    const handlers = []; window.loreHandlers=handlers;
    const identities = {
      manor: {enabled:true,entityType:'location',aliases:['the estate','winter manor'],positivePrompt:'Victorian manor, towering arched windows, ivy-covered limestone, winter garden, soft morning light',negativePrompt:'modern furniture, neon signs, skyscrapers',checkpoint:'anima-semi-v10.safetensors',checkpointFamily:'anima',preferredAspect:'16:9',stackPresetId:'old-stack',stackSnapshot:[{name:'legacy.safetensors',weight:0.7,enabled:true}],referenceImageId:'image-32',referenceImageUrl:'',notes:'Keep the west wing in shadow.',recipe:{steps:24},updatedAt:1},
      uniform: {enabled:false,entityType:'outfit',aliases:['winter coat'],positivePrompt:'navy wool coat, silver buttons',negativePrompt:'',stackPresetId:'',referenceImageId:'',notes:''},
      lantern: {enabled:true,entityType:'object',aliases:['brass lamp'],positivePrompt:'antique brass lantern',negativePrompt:'',referenceImageId:'image-31'},
    }
    const books=[{id:'book1',name:'The Winter Estate',folder:'Story worlds'},{id:'book2',name:'Hero Archive',folder:'Story worlds'},{id:'empty',name:'Empty book'}];
    const records={book1:[{id:'manor',comment:'Victoria Manor',keys:['manor','estate'],folder:'Architecture'},{id:'uniform',comment:'Winter uniform',keys:['uniform'],folder:'Wardrobe'},{id:'lantern',comment:'Brass lantern',keys:['lantern'],folder:'Objects'},{id:'garden',comment:'location | Glass conservatory',keys:['conservatory'],folder:'Architecture'},{id:'gate',comment:'North gate',keys:['gate'],tags:['location']},{id:'rules',comment:'Narrative rules',keys:['rules']}],book2:[{id:'rooftop',comment:'Rooftop training grounds',keys:['rooftop']}],empty:[]};
    window.loreMock={identities,calls:[],fail:false,available:true};
    const loreResponse=(bookId,entryId)=>{
      const book=books.find(b=>b.id===bookId)||books[0];
      const entries=records[book.id].map(e=>({...e,activated:['manor','uniform','garden'].includes(e.id),hasVisualIdentity:!!identities[e.id],visualEnabled:identities[e.id]?.enabled===true,entityType:identities[e.id]?.entityType||'',aliases:identities[e.id]?.aliases||[],referenceImageId:identities[e.id]?.referenceImageId||''}));
      const selected=entries.find(e=>e.id===entryId)||entries[0];
      return {available:loreMock.available,books,bookId:book.id,entries,entryId:selected?.id||'',selected:selected?{...selected,identity:identities[selected.id]||null}:null,stackPresets:[{id:'ink-stack',name:'Ink + rim light'}],models:[{id:'anima-semi-v10.safetensors',label:'Anima'}]};
    };
''')
fixture=fixture.replace("permissions: { imageGen: true, metadata: true, images: true, chats: true }", "permissions: { imageGen: true, metadata: true, images: true, chats: true, chatMutation: true }")
fixture=fixture.replace('      sendToBackend(message) {','''      sendToBackend(message) {
        if (['get_visual_lore','save_visual_lore'].includes(message.type)) {
          loreMock.calls.push(structuredClone(message));
          if (message.type==='save_visual_lore') {
            if(loreMock.fail){ later({type:'studio_error',operation:message.type,requestId:message.requestId,error:'Simulated write rejection'}); return; }
            identities[message.entryId]=structuredClone(message.identity);
          }
          later({type:'visual_lore_result',requestId:message.requestId,data:loreResponse(message.bookId,message.entryId)}); return;
        }
''')

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    out=root/'test-results';out.mkdir(exist_ok=True)
    for width in (1440, 390, 320):
      page=await browser.new_page(viewport={'width':width,'height':860},has_touch=width<=720)
      page.set_default_timeout(8000)
      errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      # Supply a tiny landscape reference without depending on the live image service.
      await page.route('**/api/v1/images/**',lambda route:route.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#253f50"/><path d="M65 240V113l135-88 135 88v127Z" fill="#c5b9a4"/><path d="M170 240v-85a30 30 0 0 1 60 0v85" fill="#35434e"/><path d="M90 240h220" stroke="#e0d8cc" stroke-width="5"/></svg>'))
      await page.set_content(fixture,wait_until="domcontentloaded",timeout=20000)
      await page.locator('.ss-shell').wait_for()
      nav=page.locator('.ss-view-nav [data-view="lore"]')
      await nav.click();pane=page.locator('[data-studio-page="lore"]')
      await pane.locator('[data-role="visual-lore-directory"]').wait_for()
      assert await nav.get_attribute('aria-current')=='page'
      assert await pane.locator('[data-role="lore-active"]').inner_text()=='1'
      assert await pane.locator('[data-entry-id="uniform"] .ss-lore-badge').inner_text()=='Native active'
      assert await pane.locator('optgroup[label="Story worlds"] option').count()==2
      if width==390: await page.locator('.ss-shell').screenshot(path=str(out/'visual-lore-folders-mobile.png'))
      folder=pane.locator('.ss-lore-folder-toggle',has_text='Architecture')
      assert await folder.get_attribute('aria-expanded')=='true'
      await folder.click()
      assert await pane.locator('[data-entry-id="garden"]').is_hidden()
      await pane.locator('[data-role="visual-lore-search"]').fill('conservatory')
      assert await pane.locator('[data-entry-id="garden"]').is_visible()
      await pane.locator('[data-role="visual-lore-search"]').fill('')
      assert await folder.get_attribute('aria-expanded')=='false'
      await folder.press('Enter')
      assert await pane.locator('[data-entry-id="garden"]').is_visible()
      await pane.locator('[data-role="visual-lore-filter"]').select_option('location')
      assert await pane.locator('.ss-visual-lore-entry').count()==3
      await pane.locator('[data-entry-id="garden"]').click()
      await page.wait_for_function("document.querySelector('[data-role=visual-lore-selected-name]')?.textContent==='location | Glass conservatory'")
      assert await pane.locator('[data-role="visual-lore-type"]').input_value()=='location'
      if width<=720: await pane.locator('[data-action="lore-back"]').click()
      await pane.locator('[data-role="visual-lore-filter"]').select_option('unclassified')
      assert await pane.locator('.ss-visual-lore-entry').count()==1
      await pane.locator('[data-entry-id="rules"]').click()
      await page.wait_for_function("document.querySelector('[data-role=visual-lore-selected-name]')?.textContent==='Narrative rules'")
      assert await pane.locator('[data-role="visual-lore-type"]').input_value()==''
      await pane.locator('[data-action="save-visual-lore"]').click()
      assert 'Choose an entity type' in await pane.locator('[data-role="visual-lore-status"]').inner_text()
      if width<=720: await pane.locator('[data-action="lore-back"]').click()
      await pane.locator('[data-role="visual-lore-filter"]').select_option('all')
      await pane.locator('[data-role="visual-lore-search"]').fill('winter manor')
      assert await pane.locator('.ss-visual-lore-entry').count()==1
      await pane.locator('[data-role="visual-lore-search"]').fill('')
      await pane.locator('[data-role="visual-lore-filter"]').select_option('active')
      assert await pane.locator('.ss-visual-lore-entry').count()==1
      await pane.locator('[data-role="visual-lore-filter"]').select_option('all')
      if width<=720:
        assert not await page.locator('.ss-commandbar').is_visible()
        assert not await pane.locator('.ss-lore-editor').is_visible()
        if width==390: await page.locator('.ss-shell').screenshot(path=str(out/'visual-lore-mobile-library.png'))
      await pane.locator('[data-entry-id="manor"]').click()
      await page.wait_for_function("document.querySelector('[data-role=visual-lore-selected-name]')?.textContent==='Victoria Manor'")
      assert await pane.locator('.ss-lore-editor').is_visible()
      assert await pane.locator('[data-role="visual-lore-stack"]').input_value()=='old-stack'
      assert await pane.locator('[data-role="visual-lore-selected-name"]').inner_text()=='Victoria Manor'
      if width==1440: await page.locator('.ss-shell').screenshot(path=str(out/'visual-lore-desktop.png'))
      if width==390: await page.locator('.ss-shell').screenshot(path=str(out/'visual-lore-mobile-editor.png'))
      field=pane.locator('[data-role="visual-lore-positive"]')
      await field.fill('new visual direction')
      await pane.locator('[data-role="lore-model-overrides"] > summary').click()
      await pane.locator('[data-role="lore-positive-moss"]').locator('xpath=ancestor::details[1]/summary').click()
      moss_override=pane.locator('[data-role="lore-positive-moss"]')
      await moss_override.fill('A manor with distinct MOSS caption')
      await pane.locator('[data-role="lore-negative-moss"]').fill('neon lights')
      await page.locator('.ss-view-nav [data-view="generate"]').click()
      await nav.click()
      assert await field.input_value()=='new visual direction'
      await pane.locator('[data-action="refresh-visual-lore"]').click()
      assert 'Save or discard' in await pane.locator('[data-role="visual-lore-status"]').inner_text()
      await page.evaluate('loreMock.fail=true')
      await pane.locator('[data-action="save-visual-lore"]').click()
      await pane.locator('[data-role="visual-lore-status"][data-error="true"]').wait_for()
      assert await field.input_value()=='new visual direction'
      assert 'Simulated write rejection' in await pane.locator('[data-role="visual-lore-status"]').inner_text()
      assert await moss_override.input_value()=='A manor with distinct MOSS caption'
      await page.evaluate('loreMock.fail=false')
      await pane.locator('[data-action="save-visual-lore"]').click()
      await page.wait_for_function("document.querySelector('[data-role=visual-lore-status]')?.textContent==='Visual identity saved.'")
      assert await page.evaluate("loreMock.identities.manor.modelPrompts.moss.positivePrompt")=='A manor with distinct MOSS caption'
      assert await page.evaluate("loreMock.identities.manor.modelPrompts.moss.negativePrompt")=='neon lights'
      assert await pane.locator('[data-role="lore-model-count"]').inner_text()=='1 customized'
      await pane.locator('[data-role="lore-model-overrides"] > summary').click()
      await pane.locator('[data-role="lore-positive-moss"]').locator('xpath=ancestor::details[1]/summary').click()
      assert await moss_override.input_value()=='A manor with distinct MOSS caption'
      if width==1440:
        await moss_override.scroll_into_view_if_needed()
        await page.locator('.ss-shell').screenshot(path=str(out/'visual-lore-model-overrides.png'))
      assert await page.evaluate("loreMock.identities.manor.recipe.steps")==24
      assert await page.evaluate("loreMock.identities.manor.stackSnapshot[0].name")== 'legacy.safetensors'
      # A late reply from another request cannot overwrite our selection/draft.
      await page.evaluate("loreHandlers.forEach(h=>h({type:'visual_lore_result',requestId:'unrelated',data:{available:false}}))")
      assert await field.input_value()=='new visual direction'
      if width==1440:
        await pane.locator('[data-action="lore-pick-image"]').click()
        await page.locator('dialog.ss-expression-picker[open]').wait_for()
        picker=page.locator('dialog.ss-expression-picker')
        await picker.locator('[data-role="library-output-check"][data-image-id="image-31"]').check()
        await picker.locator('[data-action="confirm-library-pick"]').click()
        await picker.wait_for(state='detached')
        assert await pane.locator('[data-role="visual-lore-reference-id"]').input_value()=='image-31'
        await pane.locator('[data-action="lore-discard"]').click()
        assert await pane.locator('[data-role="visual-lore-reference-id"]').input_value()=='image-32'
        await pane.locator('[data-role="visual-lore-preview"]').scroll_into_view_if_needed()
        await page.locator('.ss-shell').screenshot(path=str(out/'visual-lore-reference.png'))
      if width<=720: await pane.locator('[data-action="lore-back"]').click()
      await pane.locator('[data-role="visual-lore-book"]').select_option('empty')
      await page.wait_for_function("document.querySelector('[data-role=lore-count]')?.textContent==='0'")
      assert await pane.locator('[data-role="visual-lore-form"]').is_hidden()
      await pane.locator('[data-role="visual-lore-book"]').select_option('book2')
      await pane.locator('[data-entry-id="rooftop"]').wait_for()
      await pane.locator('[data-entry-id="rooftop"]').click()
      assert await pane.locator('[data-role="visual-lore-selected-name"]').inner_text()=='Rooftop training grounds'
      assert await pane.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
      assert await pane.locator('.ss-lore-editor').evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
      # Rotation/resizing must keep the current Studio page selected.
      await page.set_viewport_size({'width': 1100 if width<=720 else 390,'height':860})
      await page.wait_for_timeout(150)
      assert await nav.get_attribute('aria-current')=='page'
      # The drawer Visuals shortcut launches Studio; Lore remains a sibling tab.
      await page.locator('[data-action="close-studio"]').first.click()
      await page.locator('.ss-launcher-visuals-button').click()
      await page.locator('.ss-quick-visuals [data-q=edit]').click()
      await page.locator('.ss-view-nav [data-view="visuals"][aria-current="page"]').wait_for()
      await page.locator('.ss-view-nav [data-view="lore"]').click()
      await page.locator('.ss-view-nav [data-view="lore"][aria-current="page"]').wait_for()
      assert await page.locator('[data-role="visual-lore-root"]').count()==1
      assert not errors,errors
      await page.close()
      print(f'Visual Lore workspace {width}px: PASS')
    await browser.close()

if __name__=='__main__': asyncio.run(main())
