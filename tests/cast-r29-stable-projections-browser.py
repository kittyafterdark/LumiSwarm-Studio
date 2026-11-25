"""Stable settled-message identity under disagreeing host source projections.
No host mutation should cause Cast to move a painted slot or a recovered paragraph.
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
  try:
   page=await browser.new_page(viewport={'width':1000,'height':800})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
   await page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body style="color:white;background:#111;--lumiverse-text:white"><main id="chat"><article id="a"><div class="bubble"><div class="body"><p>The city was full of pedestrians, and Katsuki watched the intersection carefully.</p><p>The street fell quiet while they looked across the bridge at the oncoming train.</p></div></div></article></main></body></html>')
   await page.evaluate('''async frontend=>{
     const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));window.api=await import(url);URL.revokeObjectURL(url);
     const first='The city was full of pedestrians, and Katsuki watched the intersection carefully.';
     const middle='Shōto observed, leaning one hip against the painted iron rail. He watched Katsuki and tried not to smile.';
     const after='The street fell quiet while they looked across the bridge at the oncoming train.';
     const source=first+' <swarm-cast=Shoto-neutral><font color="#599CE3">"Your neck is red."</font></swarm-cast> '+middle+' <swarm-cast=Shoto-confusion>"Are you listening?"</swarm-cast> '+after;
     const suite=window.suite={source,first,middle,after,projection:0,events:new Map(),callbacks:new Set(),writes:0};
     suite.library=api.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Group'}],members:[{id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{neutral:{id:'p1'},confusion:{id:'p1'}}}]});
     suite.send=(payload)=>{for(const fn of suite.callbacks)fn(payload)};
     suite.signal=(event,payload={})=>{for(const fn of suite.events.get(event)||[])fn(payload)};
     suite.snapshot=()=>({
      mounts:[...document.querySelectorAll('#a [data-ss-cast-live]')],
      recovered:[...document.querySelectorAll('#a [data-ss-cast-recovered]')],
      text:document.querySelector('#a .body').innerText,
      quote:[...document.querySelectorAll('#a [data-ss-cast-live]')].map(h=>h.shadowRoot.querySelector('[data-swarm-cast-dialogue]')?.textContent),
     });
     const ctx={getActiveChat:()=>({chatId:'1'}),registerDomDecorator(){return()=>{}},
      dom:{listMessageElements:()=>[{messageId:'a',element:document.getElementById('a')}],getMessageId:el=>el.closest('article')?.id||null},
      messages:{getRecent:n=>[{id:'a',role:'assistant',content:suite.projection%2===0?suite.source:'The city was full of pedestrians.'}],getContent:id=>suite.projection%2===0?suite.source:'The city was full of pedestrians.'},
      events:{on(name,fn){if(!suite.events.has(name))suite.events.set(name,new Set());suite.events.get(name).add(fn);return()=>suite.events.get(name).delete(fn)}},
      onBackendMessage(fn){suite.callbacks.add(fn);return()=>suite.callbacks.delete(fn)},
      sendToBackend(message){queueMicrotask(()=>{if(message.type==='load_cast_library')suite.send({type:'cast_result',requestId:message.requestId,data:suite.library});if(message.type==='load_cast_roles')suite.send({type:'cast_display_roles',requestId:message.requestId,chatId:'1',roles:{a:true},sources:{a:suite.projection%2===0?suite.source:'The city was full of pedestrians.'}})})}};
     suite.renderer=new api.StudioCastNarrative(ctx);
   }''', FRONT)
   await page.wait_for_function('document.querySelectorAll("#a [data-ss-cast-live]").length===2',timeout=12000)
   initial=await page.evaluate('''()=>{const s=suite.snapshot();return {quotes:s.quote,middle:s.text.includes(suite.middle),recoveries:s.recovered.length}}''')
   print('INITIAL',initial)
   assert initial['quotes']==['"Your neck is red."','"Are you listening?"'],initial
   assert initial['middle'],'missing middle narration initially'
   await page.evaluate('''()=>{
      suite.nodes=suite.snapshot().mounts;
      suite.middleNodes=suite.snapshot().recovered;
      const observer=new MutationObserver(records=>{for(const r of records)if(r.type==='childList'||r.type==='characterData')suite.writes++});
      observer.observe(document.querySelector('#a .body'),{subtree:true,childList:true,characterData:true});suite.probe=observer;
   }''')
   for i in range(16):
    await page.evaluate('''()=>{suite.projection++;suite.signal('CHARACTER_MESSAGE_RENDERED',{messageId:'a'})}''')
    await page.wait_for_timeout(60)
   result=await page.evaluate('''()=>{
     const s=suite.snapshot();suite.probe.disconnect();return {writes:suite.writes,quotes:s.quote,sameMounts:s.mounts.length===suite.nodes.length&&s.mounts.every((n,i)=>n===suite.nodes[i]),recovered:s.recovered.length,middleCount:(s.text.match(/Shōto observed/g)||[]).length,paragraphCount:(s.text.match(/The street fell quiet/g)||[]).length};
   }''')
   print('AFTER PROJECTION FLIPS',result)
   assert result['sameMounts'] and result['quotes']==initial['quotes'] and result['middleCount']==1 and result['paragraphCount']==1,result
   assert result['writes']==0,'a fully painted unchanged message must not be rewritten during competing host source projections'
   # A new response streaming in another bubble must not revive older mounts.
   await page.evaluate('''()=>{
      suite.writes=0;
      suite.probe=new MutationObserver(records=>{for(const r of records)if(r.type==='childList'||r.type==='characterData')suite.writes++});
      suite.probe.observe(document.querySelector('#a .body'),{subtree:true,childList:true,characterData:true});
      suite.signal('GENERATION_STARTED',{generationId:'another-message',chatId:'1'});
   }''')
   for i in range(6):
    await page.evaluate('''()=>{suite.projection++;suite.signal('CHARACTER_MESSAGE_RENDERED',{messageId:'a'})}''')
    await page.wait_for_timeout(45)
   await page.evaluate('''()=>{suite.signal('GENERATION_STOPPED',{generationId:'another-message',chatId:'1'});suite.probe.disconnect()}''')
   old_stream_writes=await page.evaluate('suite.writes')
   print('UNRELATED STREAM DOM WRITES',old_stream_writes)
   assert old_stream_writes==0, 'a stream in a different bubble must not disturb settled Cast mounts'
   # A real edit must invalidate the pinned source, not freeze old dialogue.
   await page.evaluate('''()=>{
     suite.source=suite.source.replace('"Your neck is red."','"You forgot your gloves."');
     suite.projection=0;
     document.querySelector('#a .body').innerHTML=`<p>${suite.first}</p><p>${suite.after}</p>`;
     suite.signal('MESSAGE_EDITED',{messageId:'a'});
   }''')
   await page.wait_for_function('''[...document.querySelectorAll('#a [data-ss-cast-live]')].some(h=>h.shadowRoot.textContent.includes('You forgot your gloves.'))''',timeout=10000)
   edited=await page.evaluate('''()=>suite.snapshot().quote''')
   assert '"You forgot your gloves."' in edited and '"Your neck is red."' not in edited,edited
   # A member's saved presentation change must rebuild the right layout once.
   before=await page.evaluate('''()=>[...document.querySelectorAll('#a [data-ss-cast-live]')].map(h=>h.shadowRoot.querySelector('.ss-cast-shadow-content')?.innerHTML)''')
   await page.evaluate('''()=>{
      suite.library.members[0].presentation='sticker';
      suite.send({type:'cast_library_changed',library:suite.library});
   }''')
   await page.wait_for_timeout(180)
   after=await page.evaluate('''()=>[...document.querySelectorAll('#a [data-ss-cast-live]')].map(h=>h.shadowRoot.querySelector('.ss-cast-shadow-content')?.innerHTML)''')
   print('EDIT',edited,'LIBRARY CHANGE',before!=after,'BEFORE',repr(before)[:350],'AFTER',repr(after)[:350])
   assert before!=after,'a changed member presentation must invalidate and rebuild its layout'
   assert not errors,errors
   print('PASS: stable source, zero idle DOM changes, edit and wardrobe invalidation')
  finally:await browser.close()
if __name__=='__main__':asyncio.run(main())
