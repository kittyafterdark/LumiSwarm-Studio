"""R8: actual Cast right-click wardrobe tabs, theme tokens, shared member crop,
serialized targeted saves and preservation of dialogue/scroll stability.
Run: python tests/cast-wardrobe-r8-browser.py
"""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
FRONT=(ROOT/'dist/frontend.js').read_text(encoding='utf-8')
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path=os.environ.get('CAST_CHROME','/usr/bin/chromium'),args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':970,'height':810})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  await page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="margin:0;background:#11131b;color:#f2eaf5;--lumiverse-surface-raised:#211d2b;--lumiverse-fill-subtle:#2a2531;--lumiverse-text:#f2eaf5;--lumiverse-text-muted:#b9aeba;--lumiverse-border:#575062;--lumiverse-accent:#9dcdb2"><main id="chat" style="max-width:680px;margin:30px auto"></main></body></html>''')
  await page.evaluate('''async frontend=>{
    const u=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));window.api=await import(u);URL.revokeObjectURL(u);
    const style=document.createElement('style');style.textContent=api.CAST_PRESENTATION_CSS;document.head.append(style);
    const lib=api.cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Crew',defaultPresentation:'portrait'}],members:[
      {id:'shoto',groupId:'crew',name:'Shoto Todoroki',prefix:'Shoto',presentation:'vn-hero',crop:{enabled:false,x:50,y:20,zoom:1},images:{confusion:{id:'saved-image'},joy:{id:'saved-joy'}}},
      {id:'katsuki',groupId:'crew',name:'Katsuki Bakugo',prefix:'Katsuki',presentation:'chapter-tab',crop:{enabled:true,x:22,y:44,zoom:1.6},images:{neutral:{id:'saved-image'}}}
    ]});
    window.suite={lib,received:[],events:new Map(),callbacks:new Set(),messages:[],mountCallback:null};const s=window.suite;
    function emit(payload){for(const fn of s.callbacks)fn(payload)}
    const source='<swarm-cast=Shoto-confusion> <font color="#599CE3">"Your neck is red."</font></swarm-cast>';
    s.messages.push({id:'msg1',role:'assistant',content:source});
    const article=document.createElement('article');article.id='msg1';article.innerHTML='<p>&lt;swarm-cast=Shoto-confusion&gt; <font color="#599CE3">"Your neck is red."</font></p>';document.querySelector('#chat').append(article);
    const ctx={getActiveChat:()=>({chatId:'chat-1'}),registerDomDecorator(arg){s.mountCallback=arg.render;return()=>{}},
      dom:{listMessageElements:()=>[{messageId:'msg1',element:document.querySelector('#msg1')}],getMessageId:el=>el.closest('article')?.id||null},
      messages:{getContent:id=>s.messages.find(m=>m.id===id)?.content||null,getRecent:n=>s.messages.slice(-n)},
      events:{on(name,fn){if(!s.events.has(name))s.events.set(name,new Set());s.events.get(name).add(fn);return()=>s.events.get(name).delete(fn)}},
      onBackendMessage(fn){s.callbacks.add(fn);return()=>s.callbacks.delete(fn)},
      sendToBackend(message){s.received.push(structuredClone(message));queueMicrotask(()=>{
        if(message.type==='load_cast_library')emit({type:'cast_result',requestId:message.requestId,data:s.lib});
        else if(message.type==='load_cast_roles')emit({type:'cast_display_roles',requestId:message.requestId,chatId:'chat-1',roles:{msg1:true},sources:{msg1:source}});
        else if(message.type==='set_cast_crop'||message.type==='set_cast_presentation'){
          const member=s.lib.members.find(m=>m.id===message.memberId);
          if(message.type==='set_cast_crop')member.crop={...message.crop};else member.presentation=message.presentation;
          s.lib=api.cleanCastLibrary(s.lib);
          emit({type:'cast_library_changed',library:s.lib});
          // Simulate asynchronous backend response, including overlapping user edits.
          setTimeout(()=>emit({type:'cast_result',requestId:message.requestId,data:s.lib}),25);
        }
      })}
    };
    s.narrative=new api.StudioCastNarrative(ctx);s.mountCallback?.();
  }''',FRONT)
  await page.locator('#msg1 [data-cast-preset=vn-hero]').wait_for()
  await page.locator('#msg1 [data-cast-preset=vn-hero] .atelier-curated .vn').click(button='right')
  picker=page.locator('.ss-cast-quick-picker');await picker.wait_for()
  assert await picker.locator('[role=tab]').count()==2
  assert await picker.locator('[data-cast-quick-tab=looks]').get_attribute('aria-selected')=='true'
  assert await picker.locator('[data-cast-quick-tab=crop]').get_attribute('aria-selected')=='false'
  dark=await picker.evaluate('''el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,accent:getComputedStyle(el).getPropertyValue('--cq-accent').trim()})''')
  assert dark['background']=='rgb(33, 29, 43)',dark
  assert dark['color']=='rgb(242, 234, 245)',dark
  assert dark['accent']=='#9dcdb2',dark
  await picker.locator('[data-cast-quick-tab=crop]').click()
  assert await picker.locator('[data-cast-quick-tab=crop]').get_attribute('aria-selected')=='true'
  assert await picker.locator('.ss-cast-quick-list').is_hidden()
  assert await picker.locator('select[aria-label="Preview expression"]').input_value()=='confusion'
  assert await picker.locator('.ss-cast-quick-crop-well img').get_attribute('src')=='/api/v1/images/saved-image'
  assert await picker.locator('.ss-cast-quick-crop-field').count()==3
  if os.environ.get('CAST_SCREENSHOT_DIR'):
   path=Path(os.environ['CAST_SCREENSHOT_DIR']);path.mkdir(parents=True,exist_ok=True)
   await picker.screenshot(path=str(path/'quick-crop-dark.png'))
  toggle=picker.locator('input[aria-label="Enable shared crop"]');await toggle.check()
  await page.wait_for_function("suite.lib.members[0].crop.enabled===true")
  x=picker.locator('input[aria-label="Horizontal crop"]')
  zoom=picker.locator('input[aria-label="Zoom crop"]')
  await zoom.fill('1.7');await zoom.dispatch_event('change')
  await x.fill('41');await x.dispatch_event('change')
  await page.wait_for_function('suite.lib.members[0].crop.x===41 && suite.lib.members[0].crop.zoom===1.7')
  # Verify the user can drag the image, with no src churn during drag.
  well=picker.locator('.ss-cast-quick-crop-well')
  await page.evaluate('''()=>{window.srcUpdates=0;window.assetObserver=new MutationObserver(items=>{for(const item of items)if(item.attributeName==='src')srcUpdates++});assetObserver.observe(document.querySelector('.ss-cast-quick-crop-well img'),{attributes:true,attributeFilter:['src']})}''')
  bounds=await well.bounding_box();assert bounds
  await page.mouse.move(bounds['x']+bounds['width']/2,bounds['y']+bounds['height']/2)
  await page.mouse.down();await page.mouse.move(bounds['x']+bounds['width']/2+23,bounds['y']+bounds['height']/2+15,steps=8);await page.mouse.up()
  await page.wait_for_function('suite.lib.members[0].crop.x!==41')
  current=await page.evaluate('''()=>({crop:suite.lib.members[0].crop,other:suite.lib.members[1].crop,source:suite.messages[0].content,srcUpdates})''')
  assert current['srcUpdates']==0,current
  assert current['other']=={'enabled':True,'x':22,'y':44,'zoom':1.6},current
  assert '<font color="#599CE3">' in current['source']
  await page.wait_for_function("document.querySelector('.ss-cast-quick-status')?.textContent === 'Crop saved to Cast'")
  # Reopen, verify crop persistence, switch expression preview, restore theme.
  await picker.locator('.ss-cast-quick-close').click()
  await page.locator('#msg1 [data-cast-preset=vn-hero] .atelier-curated .vn').click(button='right')
  picker=page.locator('.ss-cast-quick-picker');await picker.locator('[data-cast-quick-tab=crop]').click()
  assert float(await picker.locator('input[aria-label="Zoom crop"]').input_value())==1.7
  assert int(await picker.locator('input[aria-label="Horizontal crop"]').input_value())==current['crop']['x']
  await picker.locator('select[aria-label="Preview expression"]').select_option('joy')
  assert await picker.locator('.ss-cast-quick-crop-well img').get_attribute('src')=='/api/v1/images/saved-joy'
  await page.evaluate('''()=>{const body=document.body;body.style.setProperty('--lumiverse-surface-raised','#fffaf2');body.style.setProperty('--lumiverse-text','#24222a');body.style.setProperty('--lumiverse-text-muted','#756c78');body.style.setProperty('--lumiverse-border','#bcb4b9');body.style.setProperty('--lumiverse-accent','#256b59')}''')
  light=await picker.evaluate('''el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color,accent:getComputedStyle(el).getPropertyValue('--cq-accent').trim()})''')
  assert light['background']=='rgb(255, 250, 242)' and light['color']=='rgb(36, 34, 42)' and light['accent']=='#256b59',light
  if os.environ.get('CAST_SCREENSHOT_DIR'):
   path=Path(os.environ['CAST_SCREENSHOT_DIR']);path.mkdir(parents=True,exist_ok=True)
   await picker.screenshot(path=str(path/'quick-crop-light.png'))
  await picker.locator('[data-cast-quick-tab=looks]').click()
  await picker.locator('select[aria-label=Composition]').select_option('face')
  assert await picker.locator('[data-cast-quick-style=editorial-square]').count()==1
  await picker.locator('[data-cast-quick-style=editorial-square]').click()
  await page.wait_for_function("document.querySelector('#msg1 [data-cast-preset=editorial-square]')")
  assert await picker.count()==0
  assert await page.locator('#msg1 [data-swarm-cast-dialogue]').count()==1
  quoteColor=await page.locator('#msg1 [data-swarm-cast-dialogue]').evaluate('el=>getComputedStyle(el).color')
  assert quoteColor=='rgb(89, 156, 227)',quoteColor
  # Native contextmenu only intercepted on a Cast expression.
  untouched=await page.evaluate('''()=>{let e=new MouseEvent('contextmenu',{bubbles:true,cancelable:true});document.querySelector('#chat').dispatchEvent(e);return e.defaultPrevented}''')
  assert not untouched
  # Bottom-edge/right-edge menus must reclamp when switching to the taller Crop tab.
  await page.set_viewport_size({'width':360,'height':600})
  await page.evaluate('''()=>{const el=document.querySelector('#msg1 [data-swarm-cast]');el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:350,clientY:592}))}''')
  tiny=page.locator('.ss-cast-quick-picker');await tiny.wait_for()
  await tiny.locator('[data-cast-quick-tab=crop]').click()
  bbox=await tiny.bounding_box()
  assert bbox and bbox['x']>=7 and bbox['y']>=7 and bbox['x']+bbox['width']<=361 and bbox['y']+bbox['height']<=601,bbox
  if os.environ.get('CAST_SCREENSHOT_DIR'):
   path=Path(os.environ['CAST_SCREENSHOT_DIR']);path.mkdir(parents=True,exist_ok=True)
   await tiny.screenshot(path=str(path/'quick-crop-360.png'))
  await tiny.locator('.ss-cast-quick-close').click()
  result=await page.evaluate('''()=>({shoto:suite.lib.members[0],other:suite.lib.members[1],messages:suite.received.filter(m=>m.type==='set_cast_crop')})''')
  assert result['shoto']['presentation']=='editorial-square'
  assert result['other']['presentation']=='chapter-tab'
  assert len(result['messages'])>=3
  # Scroll should not dirty a settled expression or initiate additional saves.
  pre=await page.evaluate('suite.received.length')
  await page.evaluate('''async()=>{for(let i=0;i<100;i++){document.dispatchEvent(new Event('scroll',{bubbles:true}));}await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}''')
  assert await page.evaluate('suite.received.length')==pre
  await page.evaluate('suite.narrative.destroy()')
  assert not errors,errors
  print('R8 browser PASS: quick Looks/Crop tabs, dark/light host tokens, expression-aware crop, drag without src churn, targeted serialized persistence, reopening, narration color, previous-member isolation and scroll stability')
  await browser.close()
if __name__=='__main__':asyncio.run(main())
