"""Compiled Studio with stateful mock for the relocated Chat Visuals editor."""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright

root = Path(__file__).resolve().parents[1]
fixture = (root/'tests/ui-harness.html').read_text().replace('<head>', '<head><base href="http://studio.local/">').replace('import { setup } from "../dist/frontend.js"', (root/'dist/frontend.js').read_text().replace('</script','<\\/script'))
fixture = fixture.replace('    const handlers = []', '''    const handlers = []; window.visualsMock = {calls:[],fail:false};
    let personaProfile={id:"profile-1",name:"User visual",positivePrompt:"brown hair",sourcePresetId:""};
    let personaProfiles=[personaProfile,{id:"profile-2",name:"Alternate",positivePrompt:"grey eyes",sourcePresetId:""},...Array.from({length:10},(_,i)=>({id:`profile-${i+3}`,name:`Persona ${i+3} visual identity`,positivePrompt:`Appearance ${i+3}`,sourcePresetId:""}))];
    let personaEnabled=true;
''')
fixture = fixture.replace('      sendToBackend(message) {', '''      sendToBackend(message) {
        visualsMock.calls.push(structuredClone(message));
        if(message.type==='bind_persona_visual_preset') {personaEnabled=message.binding.enabled;message={...message,type:'get_chat_visuals'};}
        if(['save_chat_visuals','save_character_look','save_persona_visual_preset'].includes(message.type)) {
          if(visualsMock.fail){later({type:'studio_error',operation:message.type,requestId:message.requestId,error:'Mock save rejection'});return;}
          const folder=outputFolders.find(f=>f.id==='character:char-1');
          if(message.type==='save_chat_visuals') { const {positivePrompt,negativePrompt,checkpoint,enabled,stackPresetId,stackSnapshot}=message; Object.assign(folder.binding,{positivePrompt,negativePrompt,checkpoint,enabled,stackPresetId,stackSnapshot}); }
          if(message.type==='save_character_look') {folder.binding.looks=folder.binding.looks.filter(l=>l.id!==message.look.id);folder.binding.looks.push(message.look);folder.binding.activeLookId=message.look.id;}
          if(message.type==='save_persona_visual_preset') {personaProfile={...message.preset,id:message.preset.id||'profile-new'};personaProfiles=personaProfiles.filter(p=>p.id!==personaProfile.id);personaProfiles.push(personaProfile);personaEnabled=message.bindingEnabled;}
          message={...message,type:'get_chat_visuals'};
        }
''')
fixture = fixture.replace('thumbnailUrl: "", triggerWords: ["formal outfit"]', 'thumbnailUrl: "/api/v1/images/visuals-formal-thumb", triggerWords: ["formal outfit"]', 1)
fixture = fixture.replace('personaPresets: [], personaBinding: { presetId: "", enabled: true }, activePersonaPreset: null,','personaPresets: personaProfiles, personaBinding: { presetId: personaProfile.id, enabled: personaEnabled }, activePersonaPreset: personaProfile,')

async def main():
  async with async_playwright() as p:
    browser = await p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    out = root/'test-results'; out.mkdir(exist_ok=True)
    for width in (1440,390,320):
      page = await browser.new_page(viewport={'width':width,'height':860},has_touch=width<=720)
      page.set_default_timeout(8000)
      errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
      await page.route('**/api/v1/image-gen/**',lambda r:r.fulfill(status=200,content_type='application/json',body='{"presets":[]}'))
      await page.route('**/api/v1/images/visuals-formal-thumb',lambda r:r.fulfill(status=200,content_type='image/svg+xml',body='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100" height="120" fill="#52606f"/><path d="M20 120L26 40L43 30L50 43L57 30L74 40L80 120" fill="#242630"/><path d="M43 30L50 43L57 30L50 92Z" fill="#d5d5e0"/></svg>'))
      await page.set_content(fixture,wait_until='domcontentloaded',timeout=20000)
      await page.locator('.ss-shell').wait_for()
      nav=page.locator('.ss-view-nav [data-view="visuals"]'); await nav.click()
      pane=page.locator('[data-studio-page="visuals"]')
      pos=pane.locator('[data-role="character-positive"]')
      await page.wait_for_function("document.querySelector('[data-studio-page=visuals] [data-role=character-positive]')?.value.includes('white hair')")
      assert await pane.locator('.ss-chat-visuals-tab').count()==2
      assert await page.locator('.ss-view-nav [data-view="lore"]').inner_text()=='Lore'
      assert await pane.locator('[data-role="character-title"]').inner_text()=='Lior'
      assert await pane.locator('[data-role="character-look-cards"] button').count()==2
      if width==1440:
        await page.wait_for_function("document.querySelector('[data-id=formal] img')?.naturalWidth > 0")
      assert await pane.locator('[data-id="default"] .ss-visual-card-initial').inner_text()=='D' 
      assert await pane.locator('[data-action="visual-select-look"][data-id="default"]').get_attribute('aria-pressed')=='true'
      assert not await pane.locator('[data-role="character-checkpoint"]').is_visible()
      await pane.locator('summary',has_text='Model & reference settings').click()
      assert await pane.locator('[data-role="character-checkpoint"]').is_visible()
      await pane.locator('summary',has_text='Model & reference settings').click()
      assert await page.locator('.ss-launcher .ss-chat-visuals-page').count()==0
      assert await pane.locator('.ss-lore-drawer-link').count()==0
      assert not await page.locator('.ss-commandbar').is_visible()
      assert await pos.evaluate('(el)=>parseFloat(getComputedStyle(el).fontSize)>=13')
      assert await pane.locator('[data-role="character-checkpoint"]').evaluate('(el)=>parseFloat(getComputedStyle(el).fontSize)>=13')
      assert await pane.locator('.ss-chat-visuals-scroll').evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
      columns=await pane.locator('[data-visual-panel="character"]').evaluate('(el)=>getComputedStyle(el).gridTemplateColumns.split(" ").length')
      assert columns==(2 if width==1440 else 1),(width,columns)
      await pane.locator('[data-role="character-editor-body"]').evaluate('(el)=>el.scrollTop=0')
      assert await pane.locator('[data-role="character-editor-body"]').evaluate('(el)=>el.getBoundingClientRect().bottom<=el.nextElementSibling.getBoundingClientRect().top+1')
      if width in (1440,390): await page.locator('.ss-shell').screenshot(path=str(out/f'visuals-character-{width}.png'))
      await pos.fill('silver hair, green eyes')
      await page.locator('.ss-view-nav [data-view="generate"]').click(); await nav.click()
      assert await pos.input_value()=='silver hair, green eyes'
      # Failed saves preserve drafts, successful saves keep original action contracts.
      await page.evaluate('visualsMock.fail=true')
      await pane.locator('[data-action="save-character-visuals"]').click()
      await pane.locator('[data-role="chat-visuals-status"][data-error="true"]').wait_for()
      assert await pos.input_value()=='silver hair, green eyes'
      await page.evaluate('visualsMock.fail=false')
      await pane.locator('[data-action="save-character-visuals"]').click()
      await page.wait_for_function("document.querySelector('[data-role=save-character-visuals]')?.textContent==='Character visuals bound'")
      assert await page.evaluate("visualsMock.calls.findLast(c=>c.type==='save_chat_visuals').positivePrompt")=='silver hair, green eyes'
      if width<=720:
        await pane.locator('[data-action="visuals-character-section"][data-section="looks"]').click()
        assert not await pos.is_visible()
      await pane.locator('[data-action="visual-select-look"][data-id="formal"]').click()
      assert await pane.locator('[data-role="character-look"]').input_value()=='formal'
      assert await pane.locator('[data-action="visual-select-look"][data-id="formal"]').get_attribute('aria-pressed')=='true'
      assert await pane.locator('[data-action="visual-select-look"][data-id="default"] .ss-visual-card-active').inner_text()=='Active'
      await pane.locator('summary',has_text='Recognition & continuity').click()
      assert await pane.locator('[data-role="look-aliases"]').input_value()=='gala, formalwear'
      await pane.locator('summary',has_text='Recognition & continuity').click()
      await pane.locator('[data-role="look-outfit"]').fill('white linen suit')
      assert await pane.locator('.ss-look-editor-section .ss-chat-visuals-section-head > div').evaluate('(el)=>el.clientWidth>=180')
      if width==390:
        await pane.locator('[data-role="look-editor-body"]').evaluate('(el)=>el.scrollTop=0')
        await page.locator('.ss-shell').screenshot(path=str(out/'visuals-looks-390.png'))
      assert await pane.locator('[data-role="look-editor-body"]').evaluate('(el)=>el.getBoundingClientRect().bottom<=el.nextElementSibling.getBoundingClientRect().top+1')
      await pane.locator('[data-action="save-character-look"]').click()
      await page.wait_for_function("document.querySelector('[data-role=look-active-state]')?.textContent==='Active'")
      assert await page.evaluate("visualsMock.calls.findLast(c=>c.type==='save_character_look').look.outfitPrompt")=='white linen suit'
      await pane.locator('[data-visual-tab="persona"]').click()
      pp=pane.locator('[data-role="persona-positive"]')
      directory=pane.locator('.ss-persona-directory')
      editor=pane.locator('.ss-persona-editor')
      rail=directory.locator('[data-role="persona-profile-cards"]')
      assert await directory.locator('[data-role="persona-profile-count"]').inner_text()=='12 saved profiles'
      assert await rail.locator('button').count()==12
      assert await directory.locator('[data-action="new-persona-visual"]').is_visible()
      db,eb=await directory.bounding_box(),await editor.bounding_box()
      if width==1440:
        assert db['x']+db['width']<=eb['x']+1 and eb['width']>db['width']*1.5
        assert await rail.evaluate('(el)=>el.scrollHeight>el.clientHeight && el.scrollWidth<=el.clientWidth+1')
      else:
        assert db['y']+db['height']<=eb['y']+1 and abs(db['width']-eb['width'])<=1
        assert await rail.evaluate('(el)=>el.scrollWidth>el.clientWidth && el.scrollHeight<=el.clientHeight+1')
      await rail.locator('[data-id="profile-12"]').click()
      assert await pp.input_value()=='Appearance 12'
      assert await editor.locator('[data-role="persona-title"]').inner_text()=='Persona 12 visual identity'
      assert await editor.locator('[data-role="persona-caption"]').inner_text()=='Binding target: User'
      assert await rail.locator('[data-id="profile-12"]').evaluate('(el)=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return a.top>=b.top-1&&a.bottom<=b.bottom+1&&a.left>=b.left-1&&a.right<=b.right+1}')
      assert await page.evaluate("!visualsMock.calls.some(c=>c.type==='save_persona_visual_preset')")
      await pane.locator('[data-action="visual-select-profile"][data-id="profile-2"]').click()
      assert await pp.input_value()=='grey eyes'
      await pane.locator('[data-action="visual-select-profile"][data-id="profile-1"]').click()
      await pp.fill('short black hair')
      await pane.locator('[data-role="persona-editor-body"]').evaluate('(el)=>el.scrollTop=0')
      assert await pane.locator('[data-role="persona-editor-body"]').evaluate('(el)=>el.getBoundingClientRect().bottom<=el.nextElementSibling.getBoundingClientRect().top+1')
      if width in (1440,390): await page.locator('.ss-shell').screenshot(path=str(out/f'visuals-persona-{width}.png'))
      await pane.locator('[data-action="save-persona-visual"]').click()
      await page.wait_for_function("document.querySelector('[data-role=persona-binding-state]')?.dataset.state==='bound'")
      assert await page.evaluate("visualsMock.calls.findLast(c=>c.type==='save_persona_visual_preset').preset.positivePrompt")=='short black hair'
      page.once('dialog',lambda dialog:dialog.accept('New test persona'))
      await directory.locator('[data-action="new-persona-visual"]').click()
      await page.wait_for_function("document.querySelector('[data-role=persona-title]')?.textContent==='New test persona'")
      assert await directory.locator('[data-role="persona-profile-count"]').inner_text()=='13 saved profiles'
      assert await page.evaluate("visualsMock.calls.findLast(c=>c.type==='save_persona_visual_preset').preset.name")=='New test persona'
      await page.locator('.ss-view-nav [data-view="generate"]').click()
      pill=page.locator('[data-role="active-persona-visual-pill"]')
      await pill.wait_for()
      assert await pill.get_attribute('aria-pressed')=='true'
      if width==1440: await pill.screenshot(path=str(out/'persona-pill-enabled.png'))
      enabled=await pill.evaluate('(el)=>[getComputedStyle(el).backgroundColor,getComputedStyle(el).borderStyle,getComputedStyle(el,"::before").backgroundColor]')
      await pill.click()
      assert await pill.get_attribute('aria-pressed')=='false'
      disabled=await pill.evaluate('(el)=>[getComputedStyle(el).backgroundColor,getComputedStyle(el).borderStyle,getComputedStyle(el,"::before").backgroundColor]')
      assert enabled!=disabled and disabled[1]=='dashed'
      if width==1440: await pill.screenshot(path=str(out/'persona-pill-disabled.png'))
      assert await page.evaluate("visualsMock.calls.findLast(c=>c.type==='bind_persona_visual_preset').binding.enabled") is False
      await pill.click()
      assert await pill.get_attribute('aria-pressed')=='true'
      assert await pill.evaluate('(el)=>getComputedStyle(el).borderStyle')==enabled[1]
      await nav.click()
      await pane.locator('[data-visual-tab="persona"]').click()
      await page.set_viewport_size({'width':390 if width==1440 else 1100,'height':860})
      assert await nav.get_attribute('aria-current')=='page'
      assert await pp.is_visible()
      await page.locator('[data-action="close-studio"]').first.click()
      await page.locator('.ss-launcher-visuals-button').click()
      await page.locator('.ss-quick-visuals [data-q=edit]').click()
      await page.locator('.ss-view-nav [data-view="visuals"][aria-current="page"]').wait_for()
      assert await page.locator('.ss-chat-visuals-page').count()==1
      assert not errors,errors
      await page.close(); print(f'Visuals workspace {width}px: PASS',flush=True)
    await browser.close()

if __name__=='__main__': asyncio.run(main())
