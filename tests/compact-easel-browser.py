"""Run with Python Playwright + Chromium. Real frontend, mocked host/provider."""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

root = Path(__file__).resolve().parents[1]
markup = (root / 'tests/ui-harness.html').read_text()
compiled = (root / 'dist/frontend.js').read_text()
fixture = markup.replace('import { setup } from "../dist/frontend.js"', compiled.replace('</script', '<\\/script'))
# Hold the provider's completion event so progress can be observed deterministically.
fixture = fixture.replace('}), 350)', '}), 2200)').replace('sendToBackend(message) {', 'sendToBackend(message) { (window.__easelCalls ||= []).push(message);')
fixture = fixture.replace("permissions: { imageGen: true, metadata: true, images: true, chats: true }", "permissions: { imageGen: true, metadata: true, images: true, chats: true, chatMutation: true }")
assert fixture != markup

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        for width in (1440, 390, 320):
            page = await browser.new_page(viewport={'width': width, 'height': 820}, has_touch=width<=720)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.set_content(fixture)
            await page.locator('.ss-shell').wait_for()
            if width<=720:
                await page.locator('[data-role="mobile-quick-create"]').evaluate('el=>{el.checked=true;el.dispatchEvent(new Event("change",{bubbles:true}))}')
            await page.locator('[data-action="close-studio"]').first.click()
            await page.locator('.ss-mini-preview').click()
            await page.locator('[data-action="mini-toggle-preview"]').click()
            easel = page.locator('.ss-mini-easel')
            await easel.wait_for()
            # Resize the actual floating surface, not the viewport. On desktop
            # also test pointer-driven resize and the saved footprint.
            if width == 1440:
                r = await easel.bounding_box()
                handle = await easel.locator('[data-role="mini-easel-resize"]').bounding_box()
                await page.mouse.move(handle['x']+8, handle['y']+8)
                await page.mouse.down()
                await page.mouse.move(handle['x']+8+286-r['width'],handle['y']+8+320-r['height'],steps=5)
                await page.mouse.up()
                assert abs((await easel.bounding_box())['width']-286)<=2
            else:
                await easel.evaluate('el=>{el.style.width="286px";el.style.height="320px"}')
            compact=easel.locator('[data-role="mini-easel-compact-status"]')
            full=easel.locator('[data-role="mini-easel-status"]')
            assert await compact.is_visible() and await full.is_hidden()
            assert await easel.locator('.ss-mini-easel-tags').is_hidden()
            assert await easel.locator('.ss-mini-easel-stage-caption').is_hidden()
            assert await easel.locator('.ss-mini-easel-identity small').is_hidden()
            buttons=easel.locator('.ss-mini-easel-footer button')
            for button in await buttons.all():
                assert await button.get_attribute('aria-label')
                bounds=await button.bounding_box()
                assert 27<=bounds['width']<=37, bounds
                if width<=720: assert bounds['height']>=36
            assert await easel.locator('[data-action="easel-append"] > span').is_hidden()
            assert await easel.locator('[data-role="mini-easel-generate-label"]').is_hidden()
            assert await easel.locator('[data-action="easel-generate"] [data-easel-stop]').is_hidden()
            geo=await easel.evaluate('el=>({w:el.clientWidth, scroll:el.scrollWidth, h:el.clientHeight, stage:el.querySelector(".ss-mini-easel-stage").getBoundingClientRect().height})')
            assert geo['scroll']<=geo['w']+1 and geo['stage']>=geo['h']*.70,geo
            if width==1440:
                # Use the real Quick Create draft and real mocked dispatch.
                await easel.locator('[data-action="easel-compose"]').click()
                await page.locator('[data-role="mini-prompt"]').fill('compact preview fixture')
                await page.locator('[data-action="mini-close-compose"]').click()
                await easel.get_by_role('button',name='Generate image').click()
                await page.wait_for_function('document.querySelector(".ss-mini-easel-compact-status")?.textContent.includes("35%")',timeout=6000)
                assert await easel.get_by_role('button',name='Stop generation').is_visible()
                assert await easel.locator('[data-action="easel-generate"] [data-easel-stop]').is_visible()
                assert await easel.locator('[data-role="mini-easel-image"]').is_visible()
                assert await easel.locator('[data-role="mini-easel-image"]').evaluate('el=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return a.top>=b.top-1&&a.bottom<=b.bottom+1&&a.left>=b.left-1&&a.right<=b.right+1}')
                assert await easel.locator('[data-role="mini-easel-progress-bar"]').evaluate('el=>el.style.width')=='35%'
                await easel.screenshot(path='/mnt/data/easel-compact-running.png' if os.environ.get('EASEL_CAPTURE') else str(root/'test-results/easel-compact-running.png'))
                await easel.get_by_role('button',name='Stop generation').click()
                await page.wait_for_function('window.__easelCalls?.some(m=>m.type==="interrupt_generation")')
                await page.wait_for_function('document.querySelector(".ss-mini-easel")?.dataset.state==="done"',timeout=6000)
                assert await compact.inner_text()=='Complete'
                assert await easel.get_by_role('button',name='Append latest artwork to chat').is_enabled()
                # Enlarge, restoring full labels and metadata automatically.
                await easel.evaluate('el=>{el.style.width="460px";el.style.height="520px"}')
                assert await full.is_visible() and await compact.is_hidden()
                assert await easel.locator('.ss-mini-easel-tags').is_visible()
                assert await easel.locator('[data-role="mini-easel-generate-label"]').is_visible()
                # Height alone can trigger compact mode, even on a wide surface.
                await easel.evaluate('el=>el.style.height="320px"')
                assert await compact.is_visible() and await full.is_hidden()
            assert not errors,(width,errors)
            await page.close()
        await browser.close()
    print('Compact easel: pointer resize, progress, real action transport, restored labels, touch sizes and narrow geometry PASS')

if __name__ == '__main__':
    (root/'test-results').mkdir(exist_ok=True)
    asyncio.run(main())
