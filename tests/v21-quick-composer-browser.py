"""Offline UI regression for Composer height, friendly model label, and menu toggling.
Run with: python tests/v21-quick-composer-browser.py (requires Python Playwright + Chromium).
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'tests/ui-harness.html').read_text(encoding='utf8')
bundle = (ROOT / 'dist/frontend.js').read_text(encoding='utf8').replace('</script', '<\\/script')
anchor = 'import { setup } from "../dist/frontend.js"'
assert html.count(anchor) == 1
html = html.replace(anchor, bundle)
# Real bootstrap includes chatVisuals models; the generic UI fixture omits that
# member. Inject only the actual bootstrap metadata shape for this test.
fixture_anchor = 'connections: [{ id: "swarm-1", name: "Local SwarmUI"'
assert html.count(fixture_anchor) == 1
html = html.replace(fixture_anchor,
    'chatVisuals: { models: [{ id: "anima-semi-v10.safetensors", label: "Anima Semi v1.0" }], '
    'studioConnectionId: "swarm-1", studioModel: "anima-semi-v10.safetensors" },\n            ' + fixture_anchor)

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                 args=['--no-sandbox','--disable-dev-shm-usage'])
    try:
        for width in [360, 390, 1440]:
            page = browser.new_page(viewport={'width':width,'height':820}, has_touch=width<500)
            errors = []
            page.on('pageerror', lambda exc: errors.append(str(exc)))
            page.set_content(html, wait_until='domcontentloaded')
            page.locator('.ss-shell').wait_for()
            page.locator('[data-action="close-studio"]').first.click()
            mini = page.locator('[data-role="miniplayer"]')
            if width < 500:
                page.locator('.ss-mini-preview').click()
                page.locator('[data-role="mobile-quick-create"]').evaluate(
                    "el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))}")
                page.locator('[data-action="close-studio"]').first.click()
            page.locator('.ss-mini-preview').click()
            page.locator('[data-action="mini-compose"]').click()
            conn = page.locator('[data-role="mini-connection"]')
            assert conn.inner_text() == 'Anima Semi v1.0', f'{width}: friendly label: {conn.inner_text()!r}'
            positive = page.locator('[data-role="mini-prompt"]')
            negative = page.locator('[data-role="mini-negative"]')
            positive.fill('A preserved portrait prompt')
            negative.fill('Unwanted blur')
            expanded = mini.bounding_box()['height']
            assert 390 < expanded <= 520, (width, 'open height', expanded)
            page.locator('[data-action="mini-toggle-negative"]').click()
            collapsed = mini.bounding_box()['height']
            assert collapsed < expanded - 90, (width, 'height did not shrink', expanded, collapsed)
            assert not page.locator('.ss-mini-negative-field').is_visible()
            assert positive.input_value() == 'A preserved portrait prompt'
            page.locator('[data-action="mini-toggle-negative"]').click()
            reopened = mini.bounding_box()['height']
            assert reopened > collapsed + 90, (width, 'height did not restore', reopened, collapsed)
            assert negative.input_value() == 'Unwanted blur'
            menu = page.locator('[data-role="mini-context-menu"]')
            opener = page.locator('[data-action="mini-show-menu"]').last
            opener.click()
            assert menu.is_visible(), (width,'first menu click did not open')
            assert opener.get_attribute('aria-expanded') == 'true'
            opener.click()
            assert not menu.is_visible(), (width,'second click did not close')
            assert opener.get_attribute('aria-expanded') == 'false'
            opener.click()
            assert menu.is_visible(), (width,'third click did not reopen')
            page.keyboard.press('Escape')
            assert not menu.is_visible()
            assert not errors, (width, errors)
            if width == 1440:
                screenshot = ROOT / 'docs/screenshots/v21-composer-negative-open.png'
                page.screenshot(path=str(screenshot))
                page.locator('[data-action="mini-toggle-negative"]').click()
                screenshot = ROOT / 'docs/screenshots/v21-composer-negative-collapsed.png'
                page.screenshot(path=str(screenshot))
            print(f'{width}px: composer {expanded:.0f}px -> {collapsed:.0f}px -> {reopened:.0f}px; friendly model and menu toggling PASS')
            page.close()
        # A short viewport should still give a meaningful shrink when possible,
        # without clipping the footer behind a hardcoded full-height wrapper.
        short = browser.new_page(viewport={'width':390,'height':500}, has_touch=True)
        short.set_content(html, wait_until='domcontentloaded')
        short.locator('.ss-shell').wait_for()
        short.locator('[data-action="close-studio"]').first.click()
        short.locator('.ss-mini-preview').click()
        short.locator('[data-role="mobile-quick-create"]').evaluate(
            "el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))}")
        short.locator('[data-action="close-studio"]').first.click()
        short.locator('.ss-mini-preview').click()
        short.locator('[data-action="mini-compose"]').click()
        open_short = short.locator('[data-role="miniplayer"]').bounding_box()['height']
        short.locator('[data-action="mini-toggle-negative"]').click()
        closed_short = short.locator('[data-role="miniplayer"]').bounding_box()['height']
        assert open_short - closed_short >= 85, (open_short, closed_short)
        assert short.locator('[data-action="mini-generate"]').is_visible()
        short.close()
        print(f'390×500 short viewport: {open_short:.0f}px -> {closed_short:.0f}px; footer reachable PASS')
        # Missing metadata label must fall back to the friendly connection name.
        no_label_html = html.replace('chatVisuals: { models: [{ id: "anima-semi-v10.safetensors", label: "Anima Semi v1.0" }],', 'chatVisuals: { models: [],')
        assert no_label_html != html
        page = browser.new_page(viewport={'width':900,'height':800})
        page.set_content(no_label_html, wait_until='domcontentloaded')
        page.locator('.ss-shell').wait_for()
        page.locator('[data-action="close-studio"]').first.click()
        page.locator('.ss-mini-preview').click()
        page.locator('[data-action="mini-compose"]').click()
        assert page.locator('[data-role="mini-connection"]').inner_text() == 'Local SwarmUI'
        print('metadata fallback to connection name: PASS')
        page.close()
    finally:
        browser.close()
