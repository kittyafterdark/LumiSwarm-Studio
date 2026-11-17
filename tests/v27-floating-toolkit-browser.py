"""Playwright regression for separate orb/rail menus, Quick Create settings, and preview coexistence."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

root=Path(__file__).resolve().parents[1]
markup=(root/'tests/ui-harness.html').read_text()
compiled=(root/'dist/frontend.js').read_text()
fixture=markup.replace('import { setup } from "../dist/frontend.js"',compiled.replace('</script','<\\/script'))
fixture=fixture.replace('sendToBackend(message) {', 'sendToBackend(message) { (window.__studioCalls ||= []).push(message);')

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in (1440,390,320):
      page=await browser.new_page(viewport={'width':width,'height':820},has_touch=width<=720)
      errors=[]
      page.on('pageerror',lambda e: errors.append(str(e)))
      await page.set_content(fixture)
      await page.locator('.ss-shell').wait_for()
      if width<=720: await page.locator('[data-role="mobile-quick-create"]').evaluate('el=>{el.checked=true;el.dispatchEvent(new Event("change",{bubbles:true}))}')
      await page.locator('[data-action="close-studio"]').first.click()
      await page.locator('.ss-mini-preview').click()
      mini=page.locator('.ss-miniplayer')
      assert await mini.get_attribute('data-collapsed')=='false'
      icon=page.locator('[data-action="mini-studio"] svg')
      assert await icon.evaluate('el=>getComputedStyle(el).stroke') != 'none'
      # The portrait keeps the original menu; the strip gets its own actions.
      await page.locator('.ss-mini-preview').click(button='right')
      assert await page.locator('[data-role="mini-context-menu"]').is_visible()
      assert await page.locator('[data-role="mini-strip-menu"]').is_hidden()
      assert await page.locator('[data-action="mini-menu-library"]').is_visible()
      await page.keyboard.press('Escape')
      # strip menu distinct from old orb context menu
      await page.locator('[data-action="mini-show-menu"]').click()
      assert await page.locator('[data-role="mini-strip-menu"]').is_visible()
      assert await page.locator('[data-role="mini-context-menu"]').is_hidden()
      assert await page.locator('[data-action="mini-strip-upscale"]').is_disabled()
      # At the bottom edge the menu opens upward, leaving its own launcher clickable.
      more=page.locator('[data-action="mini-show-menu"]')
      button_box=await more.bounding_box()
      menu_box=await page.locator('[data-role="mini-strip-menu"]').bounding_box()
      assert menu_box['y']+menu_box['height']<=button_box['y'], (width,'menu obscures its trigger')
      await more.click()
      assert await page.locator('[data-role="mini-strip-menu"]').is_hidden()
      await more.click()
      assert await page.locator('[data-role="mini-strip-menu"]').is_visible()
      await page.locator('[data-action="mini-strip-pin"]').click()
      assert await page.locator('[data-action="mini-toggle-pin"]').get_attribute('aria-pressed')=='true'
      await page.locator('.ss-mini-preview').click()
      assert await mini.get_attribute('data-collapsed')=='false','pinned keeps rail open'
      await page.locator('[data-action="mini-toggle-pin"]').click()
      assert await page.locator('[data-action="mini-toggle-pin"]').get_attribute('aria-pressed')=='false'
      # quick create settings should retain prompt draft
      await page.locator('[data-action="mini-compose"]').click()
      quick=page.locator('.ss-mini-quick')
      assert await quick.is_visible()
      await page.locator('[data-role="mini-prompt"]').fill('render me a beautiful nebula')
      await page.locator('[data-action="mini-settings"]').click()
      assert await quick.get_attribute('data-screen')=='settings'
      assert await page.locator('[data-role="mini-settings-screen"]').is_visible()
      await page.locator('[data-quick-param="aspect"]').select_option('16:9')
      assert await page.locator('[data-quick-param="width"]').input_value()=='1344'
      assert await page.locator('[data-quick-param="height"]').input_value()=='768'
      await page.locator('[data-quick-param="steps"]').fill('34')
      await page.locator('[data-quick-param="cfgScale"]').fill('5.5')
      await page.locator('[data-quick-param="sampler"]').fill('euler')
      await page.locator('[data-quick-param="seed"]').fill('2468')
      await page.screenshot(path=str(root/f'docs/screenshots/v27-quick-settings-{width}.png'))
      await page.locator('[data-action="mini-save-settings"]').click()
      assert await quick.get_attribute('data-screen')=='compose'
      assert await page.locator('[data-role="mini-prompt"]').input_value()=='render me a beautiful nebula'
      # dragging Quick Create by header
      if width==1440:
        before=await quick.bounding_box()
        header=await quick.locator('[data-role="mini-quick-drag"]').bounding_box()
        await page.mouse.move(header['x']+58,header['y']+16)
        await page.mouse.down()
        await page.mouse.move(header['x']-37,header['y']+67,steps=6)
        await page.mouse.up()
        after=await quick.bounding_box()
        assert after['x'] < before['x']-25, (before,after)
      # Return to rail so the detached editor cannot cover the Preview button.
      await page.locator('[data-action="mini-close-compose"]').click()
      # Preview stays visible when its Quick Create control is clicked
      await page.locator('[data-action="mini-toggle-preview"]').click()
      assert await page.locator('.ss-mini-easel').is_visible()
      await page.locator('[data-action="easel-compose"]').click()
      assert await page.locator('.ss-mini-easel').is_visible(), 'preview did not close'
      assert await quick.is_visible()
      await page.screenshot(path=str(root/f'docs/screenshots/v27-both-panels-{width}.png'))
      # real generate request inherits override and keeps same live preview
      await page.locator('[data-action="mini-generate"]').click()
      await page.wait_for_function('window.__studioCalls?.some(m=>m.type==="generate"&&m.recordHints?.source==="miniplayer")', timeout=5000)
      params=await page.evaluate('window.__studioCalls.findLast(m=>m.type==="generate"&&m.recordHints?.source==="miniplayer").input.parameters')
      assert all((params[k]==v for k,v in {'width':1344,'height':768,'steps':34,'cfgScale':5.5,'sampler':'euler','seed':2468}.items())),params
      await page.wait_for_function('document.querySelector(".ss-miniplayer")?.dataset.state==="done"',timeout=9000)
      await page.locator('[data-action="mini-close-compose"]').click()
      await page.locator('[data-action="mini-show-menu"]').click()
      assert await page.locator('[data-action="mini-strip-upscale"]').is_enabled()
      await page.locator('[data-action="mini-strip-upscale"]').click()
      await page.wait_for_timeout(250)
      assert await page.locator('.ss-shell').is_visible(), 'upscale opens full Studio'
      if width==1440:
        assert await page.locator('.ss-upscale-dialog').count() >= 1, 'upscale workspace opens for newest image'
      assert not errors,(width, errors)
      await page.close()
    await browser.close()
  print('v27 orb/strip menu, pin, Quick Create settings, drag, preview coexistence, real generation params, upscale: PASS')

asyncio.run(main())
