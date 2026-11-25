"""Compiled Studio settings smoke: history marker mode, persistence and host reconciliation."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import os
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ', 'function ')+'''
window.t={StudioController,defaultStudioBehavior,storedStudioBehavior,persistStudioBehavior,STYLES};'''
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_EXECUTABLE','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in (1440,390,320):
        page=browser.new_page(viewport={'width':width,'height':850 if width>320 else 690})
        errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
        page.set_content('<html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#101017"><main id="root" style="height:100dvh"></main></body></html>')
        page.evaluate("""()=>{const store=new Map();Object.defineProperty(window,'localStorage',{value:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}})}""")
        page.add_script_tag(content=JS)
        page.evaluate('''()=>{const style=document.createElement('style');style.textContent=t.STYLES;document.head.append(style);window.changes=[];window.studio=new t.StudioController({sendToBackend(){}},{root:document.querySelector('#root')},()=>{},()=>{},t.storedStudioBehavior(),next=>{changes.push(next);t.persistStudioBehavior(next);studio.setBehavior(next)});}''')
        page.locator('[data-action="toggle-config"]').click();page.locator('[data-settings-tab="generation"]').click()
        field=page.locator('[data-role="history-image-markers"]');expect(field).to_have_value('keep');field.select_option('strip');expect(field).to_have_value('strip')
        assert page.evaluate('changes.at(-1).historyImageMarkers')=='strip'
        assert page.evaluate('t.storedStudioBehavior().historyImageMarkers')=='strip'
        page.evaluate('studio.setBehavior({...t.defaultStudioBehavior(),historyImageMarkers:"keep"})');expect(field).to_have_value('keep')
        field.select_option('strip');expect(field).to_have_value('strip')
        assert field.evaluate('e=>{const r=e.getBoundingClientRect();return r.left>=-1 && r.right<=innerWidth+1}')
        assert not errors,errors
        print(f'History markers settings {width}px: default, selection, persistence, host reconciliation: PASS',flush=True);page.close()
    browser.close()
