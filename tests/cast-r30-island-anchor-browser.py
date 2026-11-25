"""Regression: an unverified Cast anchor must not split a host prose text node.
The source is intentionally different from the DOM after host sanitization;
its stable source progress previously selected a character halfway through prose.
"""
import asyncio, os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
FRONT=Path(os.environ.get('CAST_FRONT',str(ROOT/'dist/frontend.js'))).read_text(encoding='utf-8')
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True, executable_path=os.environ.get('CAST_CHROME','/usr/bin/chromium'),args=['--no-sandbox'])
  try:
   page=await browser.new_page(viewport={'width':1000,'height':800})
   errors=[];page.on('pageerror',lambda error: errors.append(str(error)))
   await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
   await page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body><article id="a"><div class="bubble"><div class="body"><p id="first"></p><p id="second"></p></div></div></article></body></html>')
   await page.evaluate('''async frontend=>{
      const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));const api=await import(url);URL.revokeObjectURL(url);
      const first="Katsuki did not turn his head. He kept his gaze fixed on the traffic signal ahead, where the amber glow caught the polished edge of a delivery van's mirror, and dropped his voice into the flat register reserved for incompetent interns and reporters who crowded the crime-scene tape. You're got four meters of pavement on your left, Icy-Hot.";
      const second="He paused just long enough for a pair of office workers stepping out of a ramen shop to register who was passing and whip their phones up in unison, then added in the exact same level, civic-minded cadence,";
      const source="Katsuki did not turn his head. He had been watching the orange pedestrian light. His shoulders relaxed, but the conversation continued while a reporter arrived from the opposite side of the plaza, with a new question to ask about their patrol plans and public appearances. <swarm-cast=Shoto-neutral><font color='#599CE3'>\\\"There's a bicycle lane two meters left.\\\"</font></swarm-cast> The late train announced itself and both heroes waited beside the railing before proceeding.";
      const suite=window.suite={first,second,source,events:new Map(),callbacks:new Set()};
      document.querySelector('#first').textContent=first;document.querySelector('#second').textContent=second;
      const library=api.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Group'}],members:[{id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{neutral:{id:'p1'}}}]});
      const ctx={getActiveChat:()=>({chatId:'1'}),registerDomDecorator(){return()=>{}},
      dom:{listMessageElements:()=>[{messageId:'a',element:document.getElementById('a')}],getMessageId:el=>el.closest('article')?.id||null},
      messages:{getRecent:n=>[{id:'a',role:'assistant',content:source}],getContent:id=>source},
      events:{on(name,fn){if(!suite.events.has(name))suite.events.set(name,new Set());suite.events.get(name).add(fn);return()=>suite.events.get(name).delete(fn)}},
      onBackendMessage(fn){suite.callbacks.add(fn);return()=>suite.callbacks.delete(fn)},
      sendToBackend(message){queueMicrotask(()=>{for(const fn of suite.callbacks){if(message.type==='load_cast_library')fn({type:'cast_result',requestId:message.requestId,data:library});if(message.type==='load_cast_roles')fn({type:'cast_display_roles',requestId:message.requestId,chatId:'1',roles:{a:true},sources:{a:source}})}})}};
      suite.renderer=new api.StudioCastNarrative(ctx);
   }''',FRONT)
   await page.wait_for_timeout(500)
   result=await page.evaluate('''()=>({
      before:document.querySelector('#first').textContent,
      after:document.querySelector('#second').textContent,
      whole:document.querySelector('#a .body').innerText,
      mounts:document.querySelectorAll('#a [data-ss-cast-live]').length,
      quote:[...document.querySelectorAll('#a [data-ss-cast-live]')].map(h=>h.shadowRoot.textContent.includes("bicycle lane"))
   })''')
   print('MID-WORD REGRESSION:',{k:(len(v) if k=='whole' else v) for k,v in result.items()})
   first=await page.evaluate('suite.first');second=await page.evaluate('suite.second')
   assert result['before']==first,'Cast split or removed characters in the original first paragraph'
   assert result['after']==second,'Cast split or removed characters in the original second paragraph'
   assert 'crowded the crime-scene tape' in result['before']
   assert result['whole'].count('crowded the crime-scene tape')==1
   assert result['mounts']==1 and result['quote']==[True],'The island did not mount at a safe narrative block'
   assert not errors,errors
   print('PASS: guessed source anchors do not split prose; portrait is a separate block')
  finally: await browser.close()
if __name__=='__main__':asyncio.run(main())
