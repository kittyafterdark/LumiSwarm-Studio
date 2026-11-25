"""R27 regression: Cast never restores a different extension's consumed UI payload.
Run: python tests/cast-r27-foreign-payload-browser.py
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
   page=await browser.new_page(viewport={'width':980,'height':800})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
   await page.set_content('<!doctype html><html><head><base href="http://cast.local/"></head><body style="background:#101118;color:#eee;--lumiverse-text:#eee"><main id="chat"></main></body></html>')
   await page.evaluate('''async frontend=>{
    const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));
    window.api=await import(url);URL.revokeObjectURL(url);
    const suite=window.suite={listeners:new Set(),events:new Map(),messages:[],mount:null};
    suite.library=api.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'G'}],members:[{id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{neutral:{id:'shoto'},confusion:{id:'shoto'}}}]});
    suite.add=(id,source,html)=>{suite.messages.push({id,role:'assistant',content:source});const article=document.createElement('article');article.id=id;article.innerHTML=html;document.getElementById('chat').append(article)};
    const a='Shōto noticed the gathering crowd near the overpass. ';const b='"We can take another street."';
    const routes='Shōto Todoroki|Stands inches from Katsuki on the lit overpass, calmly offering either patrol or early retreat.\\n1|@challenge|Katsuki calls the bluff right there on the overpass before commuters arrive.|Public exposure becomes immediate.\\n2|@tactical|Katsuki shoves Shōto toward the koban route.|Tension simmers.\\n3|@intimate|Katsuki grabs Shōto by the collar.|The patrol ends early.';
    suite.add('choice',''+a+'<swarm-cast=Shoto-neutral>'+b+'</swarm-cast>\\n\\n<!-- CHOICE_PAYLOAD_START -->\\n'+routes+'\\n<!-- CHOICE_PAYLOAD_END -->',`<p>${a}</p><div class="choice-ui"><strong>4 POSSIBLE ROUTES</strong><small>Shōto Todoroki · decision awaits</small></div>`);
    suite.add('choicePlain',a+'<swarm-cast=Shoto-neutral>'+b+'</swarm-cast>\\n'+routes,`<p>${a}</p><div class="choice-ui"><strong>4 POSSIBLE ROUTES</strong></div>`);
    const ordinary='Katsuki walked on, looking back once to make certain Shōto was keeping pace beside him.';
    suite.add('prose',a+'<swarm-cast=Shoto-neutral>'+b+'</swarm-cast> '+ordinary,`<p>${a}</p>`);
    const between='Shōto crossed the bridge slowly while the train lights washed the railing in silver. He checked Katsuki’s expression before speaking again.';
    suite.add('middle',a+'<swarm-cast=Shoto-neutral>'+b+'</swarm-cast> '+between+' <swarm-cast=Shoto-confusion>"What did you say?"</swarm-cast>',`<p>${a}</p>`);
    const ctx={getActiveChat:()=>({chatId:'1'}),registerDomDecorator(o){suite.mount=o.render;return()=>{}},dom:{listMessageElements:()=>[...document.querySelectorAll('article')].map(element=>({messageId:element.id,element})),getMessageId:el=>el.closest('article')?.id||null},messages:{getRecent:n=>suite.messages.slice(-n),getContent:id=>suite.messages.find(m=>m.id===id)?.content||''},events:{on(name,fn){if(!suite.events.has(name))suite.events.set(name,new Set());suite.events.get(name).add(fn);return()=>suite.events.get(name).delete(fn)}},onBackendMessage(fn){suite.listeners.add(fn);return()=>suite.listeners.delete(fn)},sendToBackend(message){queueMicrotask(()=>{for(const fn of suite.listeners){if(message.type==='load_cast_library')fn({type:'cast_result',requestId:message.requestId,data:suite.library});if(message.type==='load_cast_roles')fn({type:'cast_display_roles',requestId:message.requestId,chatId:'1',roles:{choice:true,choicePlain:true,prose:true,middle:true},sources:Object.fromEntries(suite.messages.map(m=>[m.id,m.content]))})}})}};
    suite.renderer=new api.StudioCastNarrative(ctx);suite.mount?.();
   }''',FRONT)
   await page.wait_for_function("document.querySelectorAll('#middle [data-ss-cast-live]').length===2 && document.querySelectorAll('#choice [data-ss-cast-live]').length===1",timeout=12000)
   results=await page.evaluate('''()=>Object.fromEntries(['choice','choicePlain','prose','middle'].map(id=>{const e=document.getElementById(id);return[id,{text:e.innerText,html:e.innerHTML,quotes:[...e.querySelectorAll('[data-ss-cast-live]')].map(h=>h.shadowRoot.querySelector('[data-swarm-cast-dialogue]')?.textContent)}]}))''')
   for label in ('choice','choicePlain'):
    body=results[label]['text']
    assert '4 POSSIBLE ROUTES' in body, (label,body)
    assert '|@challenge|' not in body and '|@tactical|' not in body and 'Stands inches from Katsuki' not in body,(label,body)
    assert len(results[label]['quotes'])==1,(label,results[label])
   assert 'Katsuki walked on, looking back once' in results['prose']['text'],results['prose']
   assert 'the train lights washed the railing in silver' in results['middle']['text'],results['middle']
   assert results['middle']['text'].count('Shōto crossed the bridge slowly')==1,results['middle']
   assert len(results['middle']['quotes'])==2,results['middle']
   assert not errors,errors
   print('PASS: Cast preserves prose, restores interior narration, and never rehydrates choice payloads')
  finally:await browser.close()
if __name__=='__main__':asyncio.run(main())
