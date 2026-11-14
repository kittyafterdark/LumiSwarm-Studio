"""Source-aware Chromium regression: satin Locket, progress-only ring, menu and rail."""
from pathlib import Path
from base64 import b64encode
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
html = (ROOT/'tests/ui-harness.html').read_text(encoding='utf-8')
bundle = (ROOT/'dist/frontend.js').read_text(encoding='utf-8').replace('</script','<\\/script')
anchor = 'import { setup } from "../dist/frontend.js"'
assert html.count(anchor)==1
html = html.replace(anchor,bundle)
# Optional portrait art for the human screenshot review. The test works offline without it.
import os
ref = Path(os.environ.get('SWARM_ORB_TEST_ART', ''))
if ref.is_file():
  art = 'data:image/png;base64,' + b64encode(ref.read_bytes()).decode('ascii')
else:
  placeholder = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#27232f"/><circle cx="64" cy="47" r="24" fill="#b19ec9"/><path d="M18 128 Q20 75 64 78 Q109 75 110 128" fill="#8f819f"/></svg>'
  art = 'data:image/svg+xml;base64,' + b64encode(placeholder.encode()).decode('ascii')
with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  try:
    for width in [360,390,1440]:
      page=browser.new_page(viewport={'width':width,'height':820},has_touch=width<500)
      errors=[]
      page.on('pageerror',lambda err: errors.append(str(err)))
      page.set_content(html,wait_until='domcontentloaded')
      page.locator('.ss-shell').wait_for()
      page.locator('[data-action="close-studio"]').first.click()
      orb=page.locator('[data-role="miniplayer"]')
      assert orb.get_attribute('data-collapsed')=='true'
      style=orb.evaluate('el=>{const s=getComputedStyle(el),p=getComputedStyle(el,"::before");return {border:s.borderTopWidth,background:s.backgroundImage,shadow:s.boxShadow,pseudo:p.content,radius:s.borderRadius}}')
      assert style['border']=='2px',(width,style)
      assert style['background']=='none',(width,style)
      assert style['pseudo']=='none',(width,style)
      assert 'gradient' not in style['shadow'],(width,style)
      badge=page.locator('.ss-mini-satellite')
      assert badge.is_visible(), (width,'satellite not visible')
      orb.evaluate('(el)=>{el.dataset.state="running";el.dataset.indeterminate="false";el.style.setProperty("--ss-mini-progress","50%") }')
      active=orb.evaluate('el=>{const s=getComputedStyle(el,"::before");return {content:s.content,background:s.backgroundImage,animation:s.animationName}}')
      assert active['content'] in ('""',"''"), (width,active)
      assert 'conic-gradient' in active['background'] and '50%' in active['background'],(width,active)
      orb.evaluate('(el)=>{el.dataset.indeterminate="true"}')
      indeterminate=orb.evaluate('el=>getComputedStyle(el,"::before").animationName')
      assert 'ss-mini-ring-working' in indeterminate, (width,indeterminate)
      orb.evaluate('(el)=>{el.dataset.state="idle";el.dataset.indeterminate="false"}')
      assert orb.evaluate('el=>getComputedStyle(el,"::before").content')=='none'
      # Live portrait reference is used for visualization only, without changing source assets.
      page.locator('[data-role="mini-image"]').evaluate('(el,src)=>{el.src=src;el.hidden=false;const p=el.previousElementSibling;if(p)p.hidden=true}',art)
      if width == 1440:
        box=orb.bounding_box(); assert box
        rect={'x':max(0,box['x']-15),'y':max(0,box['y']-15),'width':box['width']+36,'height':box['height']+36}
        target=ROOT/'docs/screenshots/v22-satin-locket.png'
        page.screenshot(path=str(target),clip=rect)
        with Image.open(target) as im:
          im.resize((im.width*4,im.height*4),Image.Resampling.LANCZOS).save(ROOT/'docs/screenshots/v22-satin-locket-detail.png')
      # Same user-visible interaction chain as v21, including the context menu.
      if width < 500:
        # Mobile Quick Create is opt-in; preserve that production contract.
        page.locator('.ss-mini-preview').click()
        page.locator('[data-role="mobile-quick-create"]').evaluate("el=>{el.checked=true;el.dispatchEvent(new Event('change',{bubbles:true}))}")
        page.locator('[data-action="close-studio"]').first.click()
      page.locator('.ss-mini-preview').click()
      assert orb.get_attribute('data-quick-view')=='rail'
      page.locator('[data-action="mini-show-menu"]').first.click()
      assert page.locator('[data-role="mini-context-menu"]').is_visible()
      page.keyboard.press('Escape')
      assert not page.locator('[data-role="mini-context-menu"]').is_visible()
      page.locator('[data-action="mini-compose"]').click()
      assert orb.get_attribute('data-quick-view')=='composer'
      page.locator('[data-role="mini-prompt"]').fill('Satin locket draft stays')
      page.locator('[data-action="mini-close-compose"]').click()
      assert orb.get_attribute('data-quick-view')=='rail'
      page.locator('.ss-mini-preview').click()
      assert orb.get_attribute('data-collapsed')=='true'
      assert not errors,(width,errors)
      print(f'{width}px: satin orb, progress-only ring, menu, rail & composer OK')
      page.close()
  finally: browser.close()
