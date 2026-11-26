"""Compiled Studio diagnostic settings: live capture, delta reads, export and cleanup."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
JS=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ','function ')+'\nwindow.T={StudioController,defaultStudioBehavior,STYLES};'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
    for w,h in [(1440,900),(390,844),(320,640)]:
        page=browser.new_page(viewport={'width':w,'height':h},has_touch=w<700,reduced_motion='reduce',accept_downloads=True)
        page.set_default_timeout(6000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.set_content('<!doctype html><body style="margin:0"><main id="root" style="height:100dvh"></main></body>')
        page.evaluate('''()=>{const store=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{if(window.denyClipboard)throw Error('denied');window.copied=text}}})}''')
        page.add_script_tag(content=JS)
        page.evaluate('''()=>{const style=document.createElement('style');style.textContent=T.STYLES;document.head.append(style);
          window.calls=[];window.captureId='worker-1';window.drop=0;window.records=[];window.hold=false;
          window.emit=(action,fields={})=>records.push('[Swarm Studio timing] '+JSON.stringify({action,atMs:1000+records.length,attemptId:'attempt-one',stage:'general_generation',...fields}));
          emit('provider-dispatch');emit('provider-first-progress',{sinceDispatchMs:3100});
          const ctx={getActiveChat:()=>({chatId:'chat'}),sendToBackend(m){if(m.type!=='read_studio_diagnostics')return;calls.push(structuredClone(m));if(hold)return;const last=drop+records.length,reset=m.captureId!==captureId||m.after<drop||m.after>last;const data={available:true,captureId,reset,lastSequence:last,dropped:drop,lines:records.slice(reset?0:m.after-drop)};queueMicrotask(()=>studio.onMessage({type:'studio_diagnostics_result',requestId:m.requestId,data}))}};
          window.studio=new T.StudioController(ctx,{root:document.querySelector('#root')},()=>{},()=>{},T.defaultStudioBehavior(),()=>{});
        }''')
        assert page.evaluate('calls.length')==0
        page.locator('[data-action=toggle-config]').click();page.locator('[data-settings-tab=diagnostics]').click()
        panel=page.locator('[data-settings-panel=diagnostics]');raw=panel.locator('[data-role=diagnostic-raw]');status=panel.locator('[data-role=diagnostic-status]')
        expect(status).to_contain_text('2 events retained');expect(panel.locator('tbody')).to_contain_text('3.10 s');expect(panel.locator('tbody')).to_contain_text('provider-first-progress')
        assert panel.evaluate('e=>e.scrollWidth<=e.clientWidth+2')
        # Pause polling; capture continues in the backend. A manual refresh uses the cursor.
        panel.locator('[data-action=diagnostic-live]').click();page.evaluate('emit("provider-summary",{outcome:"returned",sinceDispatchMs:15000,firstProgressMs:3100,lastProgressToResultMs:4200})')
        page.wait_for_timeout(3100);expect(status).to_contain_text('paused');assert 'provider-summary' not in raw.input_value()
        panel.locator('[data-action=diagnostic-refresh]').click();expect(status).to_contain_text('3 events retained');expect(panel.locator('tbody')).to_contain_text('15.00 s');expect(panel.locator('tbody')).to_contain_text('4.20 s')
        assert page.evaluate('calls.at(-1).after')==2
        trace=raw.input_value();assert trace.count('provider-dispatch')==1
        panel.locator('[data-action=diagnostic-copy]').click();expect(panel.locator('[data-role=diagnostic-export-status]')).to_have_text('Trace copied.');assert page.evaluate('copied')==trace+'\n'
        with page.expect_download() as download:
            panel.locator('[data-action=diagnostic-export]').click()
        assert download.value.suggested_filename.startswith('lumiswarm-timing-');assert Path(download.value.path()).read_text()==trace+'\n'
        page.evaluate('window.denyClipboard=true');panel.locator('[data-action=diagnostic-copy]').click();expect(panel.locator('[data-role=diagnostic-export-status]')).to_contain_text('Trace selected');assert raw.evaluate('e=>e.selectionStart===0&&e.selectionEnd===e.value.length')
        # A dropped old event is removed from the frontend snapshot as well.
        page.evaluate('records.shift();drop++;emit("manual-result-published")');panel.locator('[data-action=diagnostic-refresh]').click();expect(status).to_contain_text('1 older events rolled off');assert 'provider-dispatch' not in raw.input_value()
        # Resume and verify polling while visible; close stops both polling and late response application.
        panel.locator('[data-action=diagnostic-live]').click();page.evaluate('emit("swarm-reported-timing")');expect(raw).to_have_value(page.evaluate('records.join("\\n")'),timeout=5500)
        page.evaluate('hold=true');panel.locator('[data-action=diagnostic-refresh]').click();pending=page.evaluate('calls.at(-1).requestId');page.locator('[data-action=close-settings]').last.click();count=page.evaluate('calls.length')
        page.evaluate('''id=>studio.onMessage({type:'studio_diagnostics_result',requestId:id,data:{available:true,captureId:'bad',reset:true,lastSequence:1,dropped:0,lines:['[Swarm Studio timing] stale']}})''',pending)
        page.wait_for_timeout(3100);assert page.evaluate('calls.length')==count
        # Backend restart resets the cursor; capture gathered while hidden is available on reopen.
        page.evaluate('''()=>{hold=false;captureId='worker-2';drop=0;records=[];emit('provider-dispatch',{attemptId:'second-attempt'})}''')
        page.locator('[data-action=toggle-config]').click();expect(status).to_contain_text('1 events retained');assert 'second-attempt' in raw.input_value() and 'stale' not in raw.input_value() and 'attempt-one' not in raw.input_value()
        page.locator('[data-settings-tab=general]').click();count=page.evaluate('calls.length');page.wait_for_timeout(3100);assert page.evaluate('calls.length')==count
        page.locator('[data-settings-tab=diagnostics]').click();page.evaluate('studio.dispose()');count=page.evaluate('calls.length');page.wait_for_timeout(3100);assert page.evaluate('calls.length')==count
        assert not errors,errors
        print(f'Studio diagnostics {w}px: live, pause, incremental capture, rollover, copy, download, restart, hidden/disposed cleanup PASS',flush=True);page.close()
    browser.close()
