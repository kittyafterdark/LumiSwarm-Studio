"""Exercise real compiled Studio with mocked lore and generation dispatch."""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright
import runpy
root=Path(__file__).resolve().parents[1]
fixture=runpy.run_path(str(root/'tests/visual-lore-atelier-browser.py'))['fixture']
fixture=fixture.replace("window.loreMock={identities,calls:[],fail:false,available:true};", """
    identities.rooftop={enabled:true,entityType:'location',positivePrompt:'school rooftop'};
    records.book1.push({id:'ritsu',comment:'Ritsu',keys:['ritsu'],folder:'Characters'},{id:'takano',comment:'Takano',keys:['takano'],folder:'Characters'});
    identities.ritsu={enabled:true,entityType:'character',positivePrompt:'brown hair'};
    identities.takano={enabled:true,entityType:'character',positivePrompt:'dark hair'};
    window.loreMock={identities,calls:[],fail:false,available:true,generated:[]};
""").replace('      sendToBackend(message) {','      sendToBackend(message) {\n        if(message.type==="generate") loreMock.generated.push(structuredClone(message));')

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    out=root/'test-results';out.mkdir(exist_ok=True)
    for width in (1440,390,320):
      page=await browser.new_page(viewport={'width':width,'height':860},has_touch=width<=720)
      page.set_default_timeout(8000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      await page.route('**/api/v1/images/**',lambda route:route.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#35434e"/></svg>'))
      await page.set_content(fixture,wait_until='domcontentloaded');await page.locator('.ss-shell').wait_for()
      lore=page.locator('.ss-view-nav [data-view="lore"]');await lore.click()
      pane=page.locator('[data-studio-page="lore"]');await pane.locator('[data-role="visual-lore-directory"]').wait_for()
      async def select(id, add=True):
        # Search reveals entries in collapsed folders. Mobile returns to the library first.
        if width<=720 and await pane.locator('[data-action="lore-back"]').is_visible(): await pane.locator('[data-action="lore-back"]').click()
        await pane.locator('[data-role="visual-lore-search"]').fill(id if id!='manor' else 'Victoria Manor')
        await pane.locator(f'[data-entry-id="{id}"]').click()
        await page.wait_for_function(f"document.querySelector('[data-entry-id=\"{id}\"]')?.dataset.selected==='true'")
        use=pane.locator('[data-action="lore-toggle-manual"]')
        if add: await use.click();assert await use.get_attribute('aria-pressed')=='true'
        return use
      await select('manor');await select('ritsu');await select('takano')
      assert await pane.locator('[data-role="lore-manual-count"]').inner_text()=='3 selected for Generate'
      # Disabled profile cannot be added; selected entries survive a book switch.
      use=await select('uniform',False);assert await use.is_disabled()
      if width<=720: await pane.locator('[data-action="lore-back"]').click()
      await pane.locator('[data-role="visual-lore-search"]').fill('')
      await pane.locator('[data-role="visual-lore-book"]').select_option('book2')
      await pane.locator('[data-entry-id="rooftop"]').wait_for();await select('rooftop')
      assert await pane.locator('[data-role="lore-manual-count"]').inner_text()=='4 selected for Generate'
      if width==390: await page.locator('.ss-shell').screenshot(path=str(out/'manual-lore-selection.png'))
      await pane.locator('[data-action="lore-return-generate"]').click()
      btn=page.locator('[data-action="lore-provenance"]');await btn.wait_for();assert await btn.inner_text()=='4'
      await btn.click();panel=page.locator('[data-role="lore-provenance"]');await panel.wait_for(state='visible')
      assert await panel.locator('.ss-lore-provenance-book').all_inner_texts()==['Source: The Winter Estate','Source: Hero Archive']
      assert await panel.locator('li').all_inner_texts()==['Victoria Manor','Ritsu','Takano','Rooftop training grounds']
      assert await panel.locator('.ss-lore-provenance-heading').count()==3
      box=await panel.bounding_box();assert box and box['x']>=0 and box['x']+box['width']<=width+1 and box['y']>=0 and box['y']+box['height']<=861,box
      if width in (1440,390): await page.screenshot(path=str(out/f'manual-lore-provenance-{width}.png'))
      await page.keyboard.press('Escape');await panel.wait_for(state='hidden')
      await page.wait_for_function("document.querySelector('[data-action=lore-provenance]')?.getAttribute('aria-expanded')==='false'")
      await page.locator('[data-role="positive"]').fill('A quiet room')
      # There may be two generate buttons; only the visible one is used.
      await page.locator('[data-action="generate"]:visible').first.click()
      await page.wait_for_function('loreMock.generated.length===1')
      payload=await page.evaluate('loreMock.generated[0]')
      assert len(payload['manualLore'])==4
      assert payload['profileInput']['prompt']=='A quiet room'
      assert 'Victoria Manor' not in payload['input']['prompt']
      await page.wait_for_function("!document.querySelector('[data-role=preview-loading]') || document.querySelector('[data-role=preview-loading]').hidden")
      await lore.click();await pane.locator('[data-role="lore-manual-count"]').wait_for();await pane.locator('[data-action="lore-clear-manual"]').click()
      assert await pane.locator('[data-role="lore-manual-count"]').inner_text()=='0 selected for Generate'
      await pane.locator('[data-action="lore-return-generate"]').click();assert await btn.inner_text()=='0'
      assert not errors,errors
      await page.close();print(f'Manual Lore provenance {width}px: PASS')
    await browser.close()
if __name__=='__main__': asyncio.run(main())
