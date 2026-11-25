"""Production-shaped STREAM_TOKEN_RECEIVED: generationId + token + seq, no saved content updates.
Runs real compiled frontend and Shadow DOM renderer in Chromium.
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
  page=await browser.new_page(viewport={'width':880,'height':800})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  await page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="background:#111;color:white;--lumiverse-text:white"><main id="chat"><article id="old">Previously saved assistant message.</article><article id="live"> </article></main></body></html>''')
  await page.evaluate('''async frontend=>{
    const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));window.api=await import(url);URL.revokeObjectURL(url);
    const s=window.suite={events:new Map(),callbacks:new Set(),mount:null,received:[],messages:[{id:'old',role:'assistant',content:'Previously saved assistant message.'},{id:'user',role:'user',content:'Tell me more.'}]};
    s.lib=api.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Crew',defaultPresentation:'story'}],members:[{id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'open-horizon',images:{neutral:{id:'p1'},confusion:{id:'p1'}}}]});
    s.emit=payload=>{for(const fn of s.callbacks)fn(payload)};
    s.signal=(event,payload={})=>{for(const fn of s.events.get(event)||[])fn(payload)};
    s.display=(html)=>{document.getElementById('live').innerHTML=html};
    s.getQuotes=()=>[...document.querySelectorAll('#live [data-ss-cast-live]')].map(h=>h.shadowRoot.querySelector('[data-swarm-cast-dialogue]')?.textContent);
    const ctx={getActiveChat:()=>({chatId:'chat-1'}),registerDomDecorator(arg){s.mount=arg.render;return()=>{}},
    dom:{listMessageElements:()=>[...document.querySelectorAll('article')].map(el=>({messageId:el.id,element:el})),getMessageId:el=>el.closest('article')?.id||null},
    messages:{getContent:id=>s.messages.find(m=>m.id===id)?.content||'',getRecent:n=>s.messages.slice(-n)},
    events:{on(name,fn){if(!s.events.has(name))s.events.set(name,new Set());s.events.get(name).add(fn);return()=>s.events.get(name).delete(fn)}},
    onBackendMessage(fn){s.callbacks.add(fn);return()=>s.callbacks.delete(fn)},
    sendToBackend(message){s.received.push(message);queueMicrotask(()=>{
      if(message.type==='load_cast_library')s.emit({type:'cast_result',requestId:message.requestId,data:s.lib});
      if(message.type==='load_cast_roles')s.emit({type:'cast_display_roles',requestId:message.requestId,chatId:'chat-1',roles:{old:true,live:false},sources:{old:'Previously saved assistant message.'}});
    })}};
    s.renderer=new api.StudioCastNarrative(ctx);s.mount?.();
  }''',FRONT)
  await page.wait_for_timeout(150)
  await page.evaluate('''()=>{
    suite.signal('GENERATION_STARTED',{generationId:'gen-1',chatId:'chat-1',generationType:'normal'});
    const token='The overpass was quiet. <swarm-cast=Shoto-confusion><font⠀color="#599CE3">"Hawks calls';
    suite.display('<p>The overpass was quiet. <swarm-cast=Shoto-confusion><font⠀color="#599CE3">"Hawks calls</p>');
    suite.signal('STREAM_TOKEN_RECEIVED',{generationId:'gen-1',chatId:'chat-1',token,seq:1});
  }''')
  await page.wait_for_timeout(140)
  pending=await page.evaluate('''()=>({text:document.getElementById('live').innerText,quotes:suite.getQuotes(),debug:document.querySelectorAll('#live [data-ss-cast-live]').length})''')
  print('BEFORE CLOSED',pending)
  assert pending['quotes']==[] and '<swarm-cast' not in pending['text'] and 'overpass' in pending['text'] and 'Hawks calls' not in pending['text'],pending
  await page.evaluate('''()=>{
    const token='⠀you⠀about⠀the⠀noodle⠀shop⠀photos?"</font></swarm-cast> Shōto asked, crossing the bridge. ';
    suite.display('<p>The overpass was quiet. <swarm-cast=Shoto-confusion><font color="#599CE3">"Hawks calls you about the noodle shop photos?"</font></swarm-cast> Shōto asked, crossing the bridge.</p>');
    suite.signal('STREAM_TOKEN_RECEIVED',{generationId:'gen-1',chatId:'chat-1',token,seq:2});
  }''')
  await page.wait_for_timeout(200)
  first=await page.evaluate('''()=>({text:document.getElementById('live').innerText,quotes:suite.getQuotes(), colors:[...document.querySelectorAll('#live [data-ss-cast-live]')].map(h=>getComputedStyle(h.shadowRoot.querySelector('[data-swarm-cast-dialogue]')).color)})''')
  print('FIRST COMPLETE',first)
  assert len(first['quotes'])==1 and 'Hawks calls you about the noodle shop photos?' in first['quotes'][0],first
  assert 'Hawks calls you about the noodle shop photos?' not in first['text'], 'Native first quote duplicated outside Shadow DOM: '+repr(first)
  assert first['colors']==['rgb(89, 156, 227)'] and first['text'].count('Shōto asked')==1,first
  await page.evaluate('''()=>{
    const token='<swarm-cast=Shoto-neutral>"He never calls me about them."</swarm-cast> The lights went green.';
    suite.display('<p>The overpass was quiet. <swarm-cast=Shoto-confusion><font color="#599CE3">"Hawks calls you about the noodle shop photos?"</font></swarm-cast> Shōto asked, crossing the bridge. <swarm-cast=Shoto-neutral>"He never calls me about them."</swarm-cast> The lights went green.</p>');
    suite.signal('STREAM_TOKEN_RECEIVED',{generationId:'gen-1',chatId:'chat-1',token,seq:3});
  }''')
  await page.wait_for_timeout(200)
  second=await page.evaluate('''()=>({text:document.getElementById('live').innerText,quotes:suite.getQuotes()})''')
  print('SECOND COMPLETE',second)
  assert len(second['quotes'])==2 and second['text'].count('Shōto asked')==1 and 'The lights went green.' in second['text'],second
  assert 'Hawks calls you about the noodle shop photos?' not in second['text'] and 'He never calls me about them.' not in second['text'], 'Duplicate live quote in native text: '+repr(second)
  await page.evaluate('''()=>{suite.signal('STREAM_TOKEN_RECEIVED',{generationId:'gen-1',chatId:'chat-1',token:' DUPLICATE',seq:3});suite.signal('STREAM_TOKEN_RECEIVED',{generationId:'gen-1',chatId:'chat-1',type:'reasoning',token:' SECRET',seq:4});}''')
  await page.wait_for_timeout(70)
  assert await page.evaluate("suite.getQuotes().length")==2
  await page.evaluate('''()=>{
    suite.display('<p>\u200b</p>');
    suite.signal('GENERATION_ENDED',{generationId:'gen-1',chatId:'chat-1',messageId:'live',content:'The overpass was quiet. <swarm-cast=Shoto-confusion><font⠀color="#599CE3">"Hawks⠀calls⠀you⠀about⠀the⠀noodle⠀shop⠀photos?"</font></swarm-cast> Shōto asked, crossing the bridge. <swarm-cast=Shoto-neutral>"He never calls me about them."</swarm-cast> The lights went green.'});
    suite.mount?.();
  }''')
  await page.wait_for_timeout(200)
  final=await page.evaluate('''()=>({text:document.getElementById('live').innerText,quotes:suite.getQuotes()})''')
  print('FINAL HANDOFF',final)
  assert len(final['quotes'])==2 and final['text'].count('Shōto asked')==1,final
  assert not errors,errors
  await browser.close()
  print('CAST R26 NO-DUPLICATE REAL HTML TEST PASS')
if __name__=='__main__':asyncio.run(main())
