"""Cast Wardrobe R7: source-backed crop editing, modal theme, and compact silhouettes.
Uses a minimally viable in-memory Lumiverse host with real Chrome layout.
Run: python tests/cast-wardrobe-r7-browser.py
"""
import asyncio, os, re
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
FRONT=(ROOT/'dist/frontend.js').read_text(encoding='utf-8')
SRC=(ROOT/'src/studio/styles.ts').read_text(encoding='utf-8')
CSS=re.search(r'const STYLES = `(.*?)`\s*const STUDIO_V3_STYLES',SRC,re.S).group(1)
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('CAST_CHROME','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1180,'height':860})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  await page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#121319;color:#f4eef8"><div class="ss-shell" style="--ss-canvas-bg:#151821;--ss-panel-bg:#202532;--ss-panel-hi:#262b3a;--ss-text:#e7e8ef;--ss-muted:#aab1bf;--ss-outline:#515a6c;--ss-accent:#cc9ec1"><div id="host" class="ss-cast-workspace" style="width:100%;height:850px;overflow:auto"></div></div></body></html>''')
  await page.add_style_tag(content=CSS)
  await page.evaluate('''async front=>{
   const u=URL.createObjectURL(new Blob([front],{type:'text/javascript'}));window.api=await import(u);URL.revokeObjectURL(u);
   const style=document.createElement('style');style.textContent=api.CAST_PRESENTATION_CSS;document.head.append(style);
   const lib=api.cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Crew',defaultPresentation:'story'}],members:[{id:'shoto',groupId:'crew',name:'Shoto Todoroki',prefix:'Shoto',presentation:'shonen-burst',images:{neutral:{id:'saved-image'}},crop:{enabled:false,x:50,y:20,zoom:1}}]});
   const subscribers=new Set();window.testHost={lib,requests:[]};
   const ctx={onBackendMessage(fn){subscribers.add(fn);return()=>subscribers.delete(fn)},sendToBackend(message){testHost.requests.push(message);queueMicrotask(()=>{let data;if(message.type==='load_cast_library')data={...testHost.lib,chatId:'chat',characterId:'character'};if(message.type==='save_cast_library'){testHost.lib=api.cleanCastLibrary(message.library);data=testHost.lib}if(data)for(const fn of subscribers)fn({type:'cast_result',requestId:message.requestId,data})})}};
   window.workspace=new api.StudioCastWorkspace(ctx,document.querySelector('#host'),()=>[],()=>{},()=>{});
  }''',FRONT)
  await page.locator('.cast-card').first.wait_for()
  await page.locator('.cast-card').first.click()
  await page.locator('[data-cast-action=member-tab][data-tab=presentation]').click()
  await page.locator('[data-cast-action=open-presentation-modal]').click()
  await page.locator('[data-cast-action=presentation-crop-toggle]').click()
  await page.locator('.cast-picker-crop').wait_for()
  old_bg=await page.locator('.cast-preset-preview').first.evaluate('el=>getComputedStyle(el).backgroundColor')
  assert old_bg=='rgb(21, 24, 33)',f'theme should follow Studio canvas: {old_bg}'
  checkbox=page.locator('[data-cast-picker-crop=enabled]')
  assert not await checkbox.is_checked()
  await checkbox.check()
  await page.wait_for_function("testHost.lib.members[0].crop.enabled===true")
  slider=page.locator('[data-cast-picker-crop=zoom]')
  await slider.fill('1.65');await slider.dispatch_event('change')
  await page.wait_for_function('testHost.lib.members[0].crop.zoom===1.65')
  await page.locator('[data-cast-picker-crop=x]').fill('35');await page.locator('[data-cast-picker-crop=x]').dispatch_event('change')
  await page.wait_for_function('testHost.lib.members[0].crop.x===35')
  value=await page.locator('.cast-preset-preview .ss-cast-design[data-cast-preset=shonen-burst]').first.evaluate('el=>({x:el.style.getPropertyValue("--cast-crop-x"),scale:el.style.getPropertyValue("--cast-crop-scale")})')
  assert value=={'x':'35%','scale':'1.65'},value
  well=page.locator('.cast-crop-well')
  rect=await well.bounding_box();assert rect
  await page.mouse.move(rect['x']+rect['width']/2,rect['y']+rect['height']/2)
  await page.mouse.down();await page.mouse.move(rect['x']+rect['width']/2+12,rect['y']+rect['height']/2+9,steps=4);await page.mouse.up()
  await page.wait_for_function('testHost.lib.members[0].crop.x!==35')
  changed=await page.evaluate('testHost.lib.members[0].crop')
  print('CROP SAVED',changed)
  await page.locator('[data-cast-action=presentation-filter][data-group=standee]').click()
  assert await page.locator('[data-cast-picker-crop=x]').input_value()==str(changed['x'])
  await page.locator('#ss-cast-dialog .dialog-footer [data-cast-action=close-dialog]').click()
  await page.locator('[data-cast-action=open-presentation-modal]').click()
  assert await page.locator('[data-cast-picker-crop=zoom]').input_value()=='1.65'
  assert await page.locator('[data-cast-picker-crop=enabled]').is_checked()
  # Switch Studio's own theme variables. The dialog and preview chrome must follow.
  await page.evaluate('''()=>{
    const host=document.querySelector('.ss-shell');host.style.setProperty('--ss-canvas-bg','#f0ede7');host.style.setProperty('--ss-panel-bg','#fffaf3');host.style.setProperty('--ss-text','#27212b');host.style.setProperty('--ss-outline','#bbb0b7');
  }''')
  light=await page.locator('.cast-preset-preview').first.evaluate('el=>({bg:getComputedStyle(el).backgroundColor,ink:getComputedStyle(el).color})')
  assert light=={'bg':'rgb(240, 237, 231)','ink':'rgb(39, 33, 43)'},light
  assert not errors,errors
  print('PASS: Studio dark/light token inheritance, live crop X/Y/zoom, pointer drag, backend persistence, filter/reopen retention')
  await browser.close()
if __name__=='__main__':asyncio.run(main())
