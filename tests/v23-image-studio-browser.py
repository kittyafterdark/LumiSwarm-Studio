"""Real Chromium checks for the image inspector and region-edit canvas.

Runs against Studio's existing mock host/backend, replacing only the mock SVG's
bitmap response with a generated raster. No running SwarmUI installation needed.
Usage: python tests/v23-image-studio-browser.py
"""
from base64 import b64encode
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'tests/ui-harness.html').read_text(encoding='utf-8')
bundle = (ROOT / 'dist/frontend.js').read_text(encoding='utf-8').replace('</script', '<\\/script')
anchor = 'import { setup } from "../dist/frontend.js"'
assert html.count(anchor) == 1
html = html.replace(anchor, bundle)

# Decodeable bitmap: the saved-output harness intentionally uses SVG placeholders.
image = Image.new('RGB', (320, 240), '#33394b')
draw = ImageDraw.Draw(image)
draw.ellipse((45, 28, 240, 223), fill='#ad92c2')
draw.rectangle((0, 211, 320, 240), fill='#202532')
bitmap = BytesIO()
image.save(bitmap, format='PNG')
raster = 'data:image/png;base64,' + b64encode(bitmap.getvalue()).decode('ascii')

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                 args=['--no-sandbox', '--disable-dev-shm-usage'])
    try:
        for width in (320, 390, 1440):
            page = browser.new_page(viewport={'width': width, 'height': 850}, has_touch=width < 721)
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.set_content(html, wait_until='domcontentloaded')
            page.locator('.ss-shell').wait_for()
            page.locator('.ss-history-item').first.wait_for(state='attached')
            page.locator('.ss-history-item').first.evaluate('(el) => el.click()')
            inspector = page.locator('[data-role="inspector"]')
            assert inspector.is_visible()
            assert inspector.locator('[data-role="inspector-model"]').text_content() == 'anima-semi-v10.safetensors'
            assert page.locator('[data-action="edit-region"]').last.is_enabled()
            assert inspector.locator('[data-role="inspector-summary-facts"]').is_visible()
            # One distinct workspace entry, four balanced SVG shortcuts, no overflow.
            tools = inspector.locator('.ss-inspector-actions')
            assert tools.locator('button').count() == 5
            assert tools.locator('button svg').count() == 6, tools.inner_html()
            assert tools.locator('[data-action="edit-artwork"]').is_enabled()
            geometry = tools.evaluate("""el => ({w:el.clientWidth,scroll:el.scrollWidth,entry:el.firstElementChild.getBoundingClientRect().width,shortcuts:[...el.querySelectorAll('.ss-inspector-tool')].map(b=>({w:b.getBoundingClientRect().width,h:b.getBoundingClientRect().height,scroll:b.scrollWidth,client:b.clientWidth}))})""")
            assert geometry['scroll'] <= geometry['w'] + 1, geometry
            assert abs(geometry['entry'] - geometry['w']) <= 1, geometry
            assert max(b['w'] for b in geometry['shortcuts']) - min(b['w'] for b in geometry['shortcuts']) <= 1, geometry
            assert all(b['scroll'] <= b['client'] + 1 and b['h'] >= 32 for b in geometry['shortcuts']), geometry
            if width != 320:
                (ROOT/'test-results').mkdir(exist_ok=True)
                inspector.screenshot(path=str(ROOT/f'test-results/inspector-tools-{width}.png'))
            pane = lambda name: inspector.locator(f'[data-inspector-pane="{name}"]')
            inspector.locator('[data-action="inspector-tab"][data-inspector-tab="prompt"]').click()
            assert pane('prompt').is_visible() and not pane('overview').is_visible()
            assert 'cinematic lighting' in pane('prompt').text_content()
            inspector.locator('[data-action="inspector-tab"][data-inspector-tab="details"]').click()
            assert pane('details').is_visible()
            assert pane('details').locator('[data-role="inspector-presets"]').text_content() == 'Cinematic'
            inspector.locator('[data-action="inspector-tab"][data-inspector-tab="overview"]').click()
            inspector.locator('[data-action="inspector-send-toggle"]').click()
            assert inspector.locator('[data-role="inspector-send-menu"]').is_visible()
            assert inspector.locator('[data-action="inspector-send-toggle"]').get_attribute('aria-expanded') == 'true'
            inspector.locator('[data-action="inspector-send-toggle"]').click()
            assert not inspector.locator('[data-role="inspector-send-menu"]').is_visible()
            inspector.locator('[data-action="zoom-in"]').click()
            assert '125%' in inspector.locator('[data-role="zoom-label"]').text_content()
            inspector.locator('[data-action="zoom-reset"]').click()
            assert inspector.locator('[data-role="zoom-label"]').text_content() == 'Fit'
            assert not errors, (width, errors)

            # Preserve the source data URL and app routing: only mock its raster fetch.
            page.evaluate('''(raster) => {
                const original = window.fetch.bind(window);
                window.fetch = (url, options) =>
                    typeof url === 'string' && url.startsWith('data:image/svg+xml')
                        ? original(raster, options) : original(url, options);
            }''', raster)
            inspector.locator('[data-action="edit-region"]').click()
            editor = page.locator('.ss-inpaint-dialog')
            assert editor.is_visible()
            mask = editor.locator('canvas.ss-inpaint-mask')
            mask.wait_for(state='visible')
            assert editor.locator('.ss-inpaint-surface').is_visible()
            assert editor.locator('.ss-inpaint-tool-rail').is_visible()
            generate = editor.get_by_role('button', name='Generate variant')
            assert generate.is_disabled(), 'cannot generate without a painted mask'
            size = editor.locator('.ss-inpaint-range input[type="range"]').first
            size.evaluate('(el)=>{el.value="12";el.dispatchEvent(new Event("input",{bubbles:true}))}')
            assert editor.locator('.ss-inpaint-cursor').is_visible(), 'size slider shows a live ring'
            assert editor.locator('.ss-inpaint-cursor').get_attribute('data-size-preview') == 'true'
            assert 'cinematic lighting' in editor.locator('.ss-inpaint-settings-section textarea').input_value(), 'uses rendered source prompt'
            buttons = editor.locator('.ss-inpaint-tool-rail')
            buttons.get_by_role('button', name='Hide mask overlay').click()
            assert editor.locator('.ss-inpaint-surface').get_attribute('data-mask-visible') == 'false'
            buttons.get_by_role('button', name='Show mask overlay').click()
            assert editor.locator('.ss-inpaint-surface').get_attribute('data-mask-visible') == 'true'
            editor.get_by_role('button', name='Zoom in').click()
            assert editor.locator('.ss-inpaint-zoom-value').text_content() == '150%'
            editor.get_by_role('button', name='Fit image to canvas').click()
            assert editor.locator('.ss-inpaint-zoom-value').text_content() == '100%'
            bounding = mask.bounding_box()
            assert bounding and bounding['width'] > 100 and bounding['height'] > 100, (width, bounding)
            x = bounding['x'] + bounding['width'] * .45
            y = bounding['y'] + bounding['height'] * .45
            page.mouse.move(x, y)
            page.mouse.down()
            page.mouse.move(x + 20, y + 14, steps=8)
            page.mouse.up()
            page.wait_for_timeout(75)
            assert generate.is_enabled(), 'paint enables generation'
            assert 'px' in editor.locator('.ss-inpaint-range > span:last-child').first.text_content()
            # Undo and clear are functional mask operations, not decorative controls.
            buttons.get_by_role('button', name='Undo').click()
            assert generate.is_disabled(), 'undo removes the first stroke'
            page.mouse.move(x, y)
            page.mouse.down()
            page.mouse.move(x + 14, y + 10, steps=5)
            page.mouse.up()
            assert generate.is_enabled()
            buttons.get_by_role('button', name='Clear mask').click()
            assert generate.is_disabled(), 'clear disables generation again'
            buttons.get_by_role('button', name='Undo').click()
            assert generate.is_enabled(), 'undo restores a cleared mask'
            generate.click()
            page.wait_for_timeout(650)
            assert 'Variant saved' in editor.locator('[role="status"]').text_content(), (
                width, editor.locator('[role="status"]').text_content())
            assert editor.get_by_role('button', name='Show masked source').is_visible()
            assert not editor.locator('.ss-inpaint-tool-rail').is_visible(), 'result preview hides editing rail'
            editor.get_by_role('button', name='Show masked source').click()
            assert editor.locator('.ss-inpaint-tool-rail').is_visible()
            editor.get_by_role('button', name='Close region editor').click()
            editor.wait_for(state='detached', timeout=2000)
            assert not errors, (width, errors)
            print(f'{width}px: Inspector tabs, metadata/actions, raster mask, zoom, undo, clear, generate and compare passed')
            page.close()
    finally:
        browser.close()
