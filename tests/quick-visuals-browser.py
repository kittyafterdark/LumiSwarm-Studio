"""Compiled drawer quick access: stateful mock, scoped writes, stale replies and failure recovery."""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright

root=Path(__file__).resolve().parents[1]
fixture=(root/'tests/ui-harness.html').read_text().replace('<head>', '<head><base href="http://studio.local/">').replace('import { setup } from "../dist/frontend.js"', (root/'dist/frontend.js').read_text().replace('</script','<\\/script'))
fixture=fixture.replace('    const handlers = []', '''    const handlers = [];
    const storage = new Map(); Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)}});
    const stackItems=[{name:'anima/ink.safetensors',title:'Ink',weight:.7,enabled:true,useTrigger:true,sourceUrl:''}];
    const quickMock=window.quickMock={calls:[],fail:false,hold:false,events:{},chatId:'chat-1',characterId:'char-1',personaId:'persona-1',personaBinding:{presetId:'p1',enabled:true},stacks:[{id:'portrait-stack',name:'Anima portrait',items:stackItems},{id:'ink-stack',name:'Ink + rim light',items:stackItems}]};
''')
fixture=fixture.replace('      events: { on() { return () => {} } },','      events: { on(name,fn) { (quickMock.events[name] ||= []).push(fn); return () => {} } },')
fixture=fixture.replace('      sendToBackend(message) {', '''      sendToBackend(message) {
        if(message.type==='set_tag_prompt_mode') {
          quickMock.calls.push(structuredClone(message));
          if(quickMock.failComposition){later({type:'studio_error',requestId:message.requestId,error:'Composition rejection'});return;}
          quickMock.promptMode=message.promptMode;
          later({type:'tag_automation_result',requestId:message.requestId,data:{promptMode:message.promptMode,promptFamily:'anima',requestMode:'parser',parserModel:'test-model'}});return;
        }
        if(message.type==='load_cast_library') {
          later({type:'cast_result',requestId:message.requestId,data:{chatId:quickMock.chatId,groups:[{id:'crew',name:'Current Crew',defaultPresentation:'chapter-tab'},{id:'other',name:'Other Crew'}],chatGroups:{'chat-1':'crew'},members:[]}});return;
        }
        if(['get_quick_visuals','set_quick_visuals'].includes(message.type)) {
          quickMock.calls.push(structuredClone(message));
          if(quickMock.hold){quickMock.held=message;return;}
          const folder=outputFolders.find(f=>f.binding?.characterId===quickMock.characterId);
          if(message.type==='set_quick_visuals') {
            if(quickMock.fail){later({type:'studio_error',requestId:message.requestId,operation:message.type,error:'Mock rejection'});return;}
            if(message.action==='look')folder.binding.activeLookId=message.lookId;
            if(message.action==='character-enabled')folder.binding.enabled=message.enabled;
            if(message.action==='stack'){folder.binding.stackPresetId=message.presetId;folder.binding.stackSnapshot=quickMock.stacks.find(s=>s.id===message.presetId)?.items||[];}
            if(message.action==='stack-current'){folder.binding.stackPresetId='';folder.binding.stackSnapshot=stackItems;}
            if(message.action==='persona')quickMock.personaBinding={presetId:message.presetId,enabled:message.enabled};
            if(message.action==='save-stack')quickMock.stacks.push({id:'new-stack',name:message.name,items:stackItems});
          }
          const data={activeChat:quickMock.chatId?{id:quickMock.chatId,characterId:quickMock.characterId,characterName:'Lior'}:null,activePersona:quickMock.personaId?{id:quickMock.personaId,name:'Gabi'}:null,characterFolder:folder||null,characterStyleName:'Ink & watercolor',personaBinding:quickMock.personaBinding,personaPresets:[{id:'p1',name:'Everyday',positivePrompt:'silver hair'},{id:'p2',name:'Hero costume',positivePrompt:'blue hair'}],stackPresets:quickMock.stacks,studioStack:stackItems};
          quickMock.lastData=structuredClone(data);
          later({type:'quick_visuals_result',requestId:message.requestId,data:structuredClone(data)});return;
        }
''')
fixture=fixture.replace('    drawerRoot.querySelector("button").click()','    window.emitQuick=(payload)=>handlers.forEach(fn=>fn(payload));')
fixture=fixture.replace('#drawer { display: block; position: fixed; inset: 0; padding: 16px; overflow: auto; }','#drawer { display: block; position: fixed; inset: 0 auto 0 0; width: min(360px,100vw); padding: 4px; box-sizing:border-box; overflow: auto; }')

async def main():
  async with async_playwright() as p:
    browser=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    out=root/'test-results';out.mkdir(exist_ok=True)
    for width in (1440,390,320):
      page=await browser.new_page(viewport={'width':width,'height':860},has_touch=width<=720)
      page.set_default_timeout(8000); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
      await page.route('**/api/v1/image-gen/**',lambda r:r.fulfill(status=200,content_type='application/json',body='{"presets":[]}'))
      await page.set_content(fixture,wait_until='domcontentloaded',timeout=20000)
      q=page.locator('.ss-quick-visuals');role=lambda name:q.locator(f'[data-q="{name}"]')
      entry=page.locator('.ss-launcher'); launch=entry.locator('.ss-launcher-visuals-button')
      cards=page.locator('.ss-drawer-cards')
      assert await entry.is_visible() and not await q.is_visible()
      assert await entry.evaluate("el=>el.querySelectorAll('.ss-launcher-corner').length===4 && el.offsetHeight>=520 && getComputedStyle(el).overflow==='hidden' && el.querySelector('.ss-launcher-emblem').getBoundingClientRect().width>=112")
      entry_before=await entry.bounding_box()
      if width==390: await entry.screenshot(path=str(out/'quick-visuals-home-390.png'))
      await launch.click()
      assert await q.is_visible() and not await entry.is_visible()
      await role('character-state').filter(has_text='Bound').wait_for()
      await page.wait_for_function("!document.querySelector('[data-q=look]').disabled")
      assert await role('look').input_value()=='default'
      assert await role('persona').input_value()=='p1'
      assert await role('stack').input_value()=='portrait-stack'
      assert await q.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
      assert await role('look').evaluate('(el)=>parseFloat(getComputedStyle(el).fontSize)>=13')
      assert await q.locator('summary').count()==2
      assert await q.locator('h2').all_text_contents()==['Visuals','Settings']
      assert await role('character-style').inner_text()=='Style: Ink & watercolor'
      assert await role('refresh').locator('svg').count()==1
      assert await q.locator('[data-q=save-section]').count()==0
      assert await q.locator('summary').evaluate_all("els=>els.every(el=>getComputedStyle(el).listStyleType==='none' && getComputedStyle(el).display==='flex' && getComputedStyle(el,'::marker').content==='\"\"' && el.querySelector('svg.ss-quick-chevron'))")
      assert not await role('character-card').evaluate('el=>el.open')
      assert not await role('persona-card').evaluate('el=>el.open')
      await role('persona-card').locator('summary').focus()
      await page.keyboard.press('Enter')
      assert await role('persona-card').evaluate('el=>el.open')
      await role('persona-card').locator('summary').click()
      if width==390:
        await q.locator('h2').first.click() # Remove keyboard focus from the disclosure for the overview render.
        await page.wait_for_timeout(200) # Allow chevrons to reach their final orientation.
        await q.screenshot(path=str(out/'quick-visuals-390.png'))
      await role('character-card').locator('summary').click()
      await role('persona-card').locator('summary').click()
      await role('back').click()
      assert await entry.is_visible() and not await q.is_visible()
      after=await entry.bounding_box()
      assert abs(after['height']-entry_before['height'])<1 and abs(after['width']-entry_before['width'])<1
      assert await launch.evaluate('el=>el===document.activeElement')
      await launch.click()
      await page.wait_for_function("!document.querySelector('[data-q=look]').disabled")
      assert await role('persona-card').evaluate('el=>el.open')
      await role('look').select_option('formal')
      await page.wait_for_function("document.querySelector('[data-q=look]').value==='formal' && !document.querySelector('[data-q=look]').disabled")
      assert await page.evaluate("quickMock.calls.findLast(c=>c.action==='look').characterId")=='char-1'
      await page.evaluate('quickMock.fail=true')
      await role('look').select_option('default')
      await q.locator('[data-q=status][data-error=true]').wait_for()
      assert await role('look').input_value()=='formal'
      await page.evaluate('quickMock.fail=false')
      await role('character-enabled').uncheck()
      await role('character-state').filter(has_text='Paused').wait_for()
      await role('persona').select_option('p2')
      await page.wait_for_function("document.querySelector('[data-q=persona]').value==='p2' && !document.querySelector('[data-q=persona]').disabled")
      await role('persona-enabled').uncheck()
      await role('persona-state').filter(has_text='Paused').wait_for()
      await role('stack').select_option('ink-stack')
      await page.wait_for_function("document.querySelector('[data-q=stack]').value==='ink-stack' && !document.querySelector('[data-q=stack]').disabled")
      await role('stack').select_option('__studio_current__')
      await page.wait_for_function("document.querySelector('[data-q=stack]').value==='__custom_snapshot__' && !document.querySelector('[data-q=stack]').disabled")
      assert not await entry.is_visible()
      await q.locator('.ss-quick-widget').click()
      assert await page.evaluate("JSON.parse(localStorage.getItem('swarm-studio-behavior-v3')).widgetEnabled") is False
      assert await page.locator('.host-widget').evaluate_all('els=>els.every(el=>el.hidden || getComputedStyle(el).display==="none")')
      await q.locator('.ss-quick-widget').click()
      await q.locator('[data-q-scale="75"]').click()
      assert await q.locator('[data-q-scale="75"]').get_attribute('aria-pressed')=='true'
      assert await page.locator('html').get_attribute('data-swarm-studio-inline-scale')=='75'
      assert await page.evaluate("JSON.parse(localStorage.getItem('swarm-studio-behavior-v3')).inlineImageScale")==75
      await role('composition').select_option('pov')
      await page.wait_for_function("!document.querySelector('[data-q=composition]').disabled && JSON.parse(localStorage.getItem('swarm-studio-behavior-v3')).tagPromptMode==='pov'")
      assert await page.evaluate("quickMock.calls.findLast(c=>c.type==='set_tag_prompt_mode').promptMode")=='pov'
      await page.evaluate('quickMock.failComposition=true')
      await role('composition').select_option('multi')
      await q.locator('[data-q=settings-status][data-error=true]').wait_for()
      assert await role('composition').input_value()=='pov'
      await page.evaluate('quickMock.failComposition=false')
      await role('composition').select_option('multi')
      await page.wait_for_function("!document.querySelector('[data-q=composition]').disabled && JSON.parse(localStorage.getItem('swarm-studio-behavior-v3')).tagPromptMode==='multi'")
      # Ignore unsolicited results, then invalidate old context when the host switches chats.
      await page.evaluate("emitQuick({type:'quick_visuals_result',requestId:'stale',data:{}})")
      assert await role('look').input_value()=='formal'
      await page.evaluate("quickMock.chatId='';quickMock.characterId='';quickMock.personaId='';(quickMock.events.CHAT_SWITCHED||[]).forEach(fn=>fn())")
      await role('character-state').filter(has_text='No chat').wait_for()
      await role('persona-state').filter(has_text='No persona').wait_for()
      assert await role('persona').is_disabled()
      assert not await role('character-fields').is_visible()
      await page.evaluate("quickMock.chatId='chat-1';quickMock.characterId='char-1';quickMock.personaId='persona-1';(quickMock.events.CHAT_SWITCHED||[]).forEach(fn=>fn())")
      await role('character-fields').wait_for()
      await role('cast').click()
      await page.locator('.ss-view-nav [data-view="cast"][aria-current="page"]').wait_for()
      await page.locator('.ss-cast-workspace .workspace-head h1').filter(has_text='Current Crew').wait_for()
      await page.locator('[data-action="close-studio"]').first.click()
      await role('styles').click()
      await page.locator('.ss-view-nav [data-view="styles"][aria-current="page"]').wait_for()
      assert await page.locator('[data-role="widget-enabled"]').is_checked()
      assert await page.locator('[data-role="tag-prompt-mode"]').input_value()=='multi'
      assert await page.locator('[data-action="set-inline-image-scale"][data-scale="75"]').get_attribute('data-active')=='true'
      # Changes inside Studio reflect back into the quick controls.
      await page.locator('[data-role="widget-enabled"]').evaluate('el=>{el.checked=false;el.dispatchEvent(new Event("change",{bubbles:true}))}')
      await page.locator('[data-action="close-studio"]').first.click()
      assert not await role('widget').is_checked()
      await role('edit').click()
      await page.locator('.ss-view-nav [data-view="visuals"][aria-current="page"]').wait_for()
      assert await page.locator('.ss-chat-visuals-page').count()==1
      await page.locator('[data-action="close-studio"]').first.click()
      assert await q.is_visible()
      await role('back').click()
      assert await entry.is_visible() and not await q.is_visible()
      assert not errors,errors
      await page.close();print(f'Quick visuals {width}px: PASS',flush=True)
    await browser.close()

if __name__=='__main__':asyncio.run(main())
