"""Live browser contract for the toolkit and portal-easel; runs against built frontend."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

root = Path(__file__).resolve().parents[1]
markup = (root / 'tests/ui-harness.html').read_text()
compiled = (root / 'dist/frontend.js').read_text()
fixture = markup.replace('import { setup } from "../dist/frontend.js"', compiled.replace('</script', '<\\/script'))
assert fixture != markup

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--disable-dev-shm-usage'])
        for width in [1440, 900, 390, 320]:
            page = await browser.new_page(viewport={'width':width,'height':820}, has_touch=width<=720)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            await page.set_content(fixture)
            await page.locator('.ss-shell').wait_for()
            if width<=720:
                await page.locator('[data-role="mobile-quick-create"]').evaluate('el=>{el.checked=true;el.dispatchEvent(new Event("change",{bubbles:true}))}')
            await page.locator('[data-action="close-studio"]').first.click()
            mini = page.locator('.ss-miniplayer')
            assert await mini.get_attribute('data-collapsed') == 'true'
            # Satin orb is present; preview isn't forced open on tapping it.
            await page.locator('.ss-mini-preview').click()
            assert await mini.get_attribute('data-quick-view') == 'rail'
            assert await page.locator('.ss-mini-easel').is_hidden()
            assert await page.locator('.ss-mini-actions .ss-mini-button').count()==6
            if width>720:
                assert await mini.get_attribute('data-rail-layout')=='vertical'
            await page.locator('[data-action="mini-toggle-preview"]').click()
            easel=page.locator('.ss-mini-easel')
            assert await easel.is_visible(), f'{width} open easel'
            assert await page.locator('[data-action="mini-toggle-preview"]').get_attribute('aria-pressed')=='true'
            r=await easel.bounding_box()
            assert r and r['x'] >= 0 and r['x'] + r['width'] <= width+1, (width,r)
            assert r['y']>=0 and r['y']+r['height']<=821, (width,r)
            await page.screenshot(path=str(root / f'docs/screenshots/v26-easel-open-{width}.png'))
            await page.locator('[data-action="mini-toggle-preview"]').click()
            assert await easel.is_hidden(), f'{width} preview toggles independently'
            await page.locator('[data-action="mini-toggle-preview"]').click()
            assert await easel.is_visible()
            # Dynamic view resized from handle + moves from header; independent native widget size.
            if width>720:
                before=await easel.bounding_box()
                handle=page.locator('[data-role="mini-easel-resize"]')
                h=await handle.bounding_box()
                await page.mouse.move(h['x']+h['width']*.5,h['y']+h['height']*.5)
                await page.mouse.down(); await page.mouse.move(h['x']+40,h['y']+35,steps=6); await page.mouse.up()
                after=await easel.bounding_box()
                assert after['width']>before['width'], (before,after)
            await page.locator('[data-action="easel-close"]').click()
            assert await easel.is_hidden()
            await page.locator('[data-action="mini-compose"]').click()
            assert await mini.get_attribute('data-quick-view')=='composer'
            assert await page.locator('.ss-mini-quick').is_visible(), 'Quick Create lives beside the toolkit'
            assert await page.locator('.ss-mini-actions').is_visible(), 'toolkit remains visible while composing'
            await page.screenshot(path=str(root / f'docs/screenshots/v26-composer-open-{width}.png'))
            await page.locator('[data-role="mini-prompt"]').fill('quick creation draft')
            await page.locator('[data-action="mini-close-compose"]').click()
            await page.locator('[data-action="mini-compose"]').click()
            assert await page.locator('[data-role="mini-prompt"]').input_value()=='quick creation draft'
            await page.locator('[data-action="mini-close-compose"]').click()
            if width <= 720:
                await page.locator('[data-action="mini-toggle-preview"]').click()
                assert await easel.is_visible()
                await page.locator('[data-action="mini-compose"]').click()
                assert await easel.is_visible(), 'mobile Quick Create keeps the preview available'
                assert await page.locator('.ss-mini-quick').is_visible(), 'mobile panels coexist'
                await page.locator('[data-action="mini-close-compose"]').click()
                assert await easel.is_visible(), 'preview remains when Quick Create closes'
                await page.locator('.ss-mini-preview').click()
                assert await mini.get_attribute('data-collapsed') == 'true'
                assert await easel.is_hidden(), 'orb collapse closes preview'
                await page.locator('.ss-mini-preview').click()
            if width == 1440:
                # Generate with the harness's *real mocked backend*; assert the portal
                # receives the same progress/output as Studio and the orb.
                await page.locator('[data-action="mini-toggle-preview"]').click()
                await page.locator('[data-action="easel-generate"]').click()
                await page.wait_for_function('document.querySelector(".ss-miniplayer")?.dataset.state === "done"', timeout=9000)
                assert await page.locator('[data-role="mini-easel-image"]').is_visible(), 'real output reaches easel'
                assert await page.locator('[data-role="mini-image"]').is_visible(), 'same output reaches orb'
                assert await page.locator('[data-role="mini-easel-progress-label"]').inner_text() == 'Complete'
                await page.screenshot(path=str(root / 'docs/screenshots/v26-easel-rendered-1440.png'))
                await page.locator('[data-action="easel-close"]').click()
            await page.locator('[data-action="mini-library"]').click()
            assert await page.locator('[data-role="output-library"]').is_visible()
            await page.locator('[data-action="close-output-library"]').first.click()
            await page.locator('[data-action="close-studio"]').first.click()
            await page.locator('[data-action="mini-studio"]').click()
            assert await page.locator('.ss-shell').is_visible()
            assert not errors, (width,errors)
            await page.screenshot(path=str(root / f'docs/screenshots/v26-easel-{width}.png'))
            await page.close()
        await browser.close()
    print('v26 floating easel toolkit/preview/gallery/studio/drag/resize: PASS')

asyncio.run(main())
