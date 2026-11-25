"""Bubble ownership regression: Cast must never render recovered prose after the host bubble.
Run: python tests/cast-r28-bubble-recovery-browser.py
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
   page=await browser.new_page(viewport={'width':950,'height':800})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
   await page.set_content('''<!doctype html><html><head><base href="http://cast.local/"><style>
   .bubble{background:#1c1e28;border-radius:15px;padding:25px;max-width:650px;color:#eee}
   article{border:1px solid #555;margin:10px;padding:6px;color:#eee}
   .choice-ui{background:#282c38;padding:10px}
   </style></head><body style="background:#101118;--lumiverse-text:#eee"><main id="chat"></main></body></html>''')
   await page.evaluate('''async frontend=>{
    const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));window.api=await import(url);URL.revokeObjectURL(url);
    const suite=window.suite={listeners:new Set(),events:new Map(),messages:[],mount:null};
    suite.library=api.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'G'}],members:[{id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{neutral:{id:'shoto'},confusion:{id:'shoto'}}}]});
    suite.add=(id,source,body)=>{suite.messages.push({id,role:'assistant',content:source});const article=document.createElement('article');article.id=id;article.innerHTML=`<div class="bubble"><div class="body">${body}</div></div><aside class="message-footer">footer</aside>`;document.getElementById('chat').append(article)};
    const first='Shōto watched the city lights pulse as Katsuki considered their choices.';
    const middle='Shōto observed, leaning one hip against the painted iron rail. His left hand rested on the top bar, and his eyes stayed on the promenade.';
    const trailing='Shōto said quietly, his thumb resting a fraction longer at the corner of Katsuki’s mouth before dropping away.';
    const payload='Shoto Todoroki|offering a patrol or early retreat.\\n1|@challenge|Katsuki calls the bluff.|Consequences begin.\\n2|@tactical|Katsuki shoves Shoto.|Tension simmers.';
    const choice='<div class="choice-ui"><strong>4 POSSIBLE ROUTES</strong><small>Shoto · decision awaits</small></div>';
    suite.add('noSlot',first+' <swarm-cast=Unknown-neutral>"Voice"</swarm-cast> '+trailing+'\\n'+payload,`<p>${first}</p>${choice}`);
    suite.add('noSlotPlain',first+' <swarm-cast=Unknown-neutral>\"Voice\"</swarm-cast> '+trailing,`<p>${first}</p>`);
    suite.add('twoSlots',first+' <swarm-cast=Shoto-neutral>"Hawks calls you?"</swarm-cast> '+middle+' <swarm-cast=Shoto-confusion>"He never calls me about them."</swarm-cast> '+trailing+'\\n'+payload,`<p>${first}</p>${choice}`);
    const ctx={getActiveChat:()=>({chatId:'1'}),registerDomDecorator(o){suite.mount=o.render;return()=>{}},dom:{listMessageElements:()=>[...document.querySelectorAll('article')].map(element=>({messageId:element.id,element})),getMessageId:el=>el.closest('article')?.id||null},messages:{getRecent:n=>suite.messages.slice(-n),getContent:id=>suite.messages.find(m=>m.id===id)?.content||''},events:{on(name,fn){if(!suite.events.has(name))suite.events.set(name,new Set());suite.events.get(name).add(fn);return()=>suite.events.get(name).delete(fn)}},onBackendMessage(fn){suite.listeners.add(fn);return()=>suite.listeners.delete(fn)},sendToBackend(message){queueMicrotask(()=>{for(const fn of suite.listeners){if(message.type==='load_cast_library')fn({type:'cast_result',requestId:message.requestId,data:suite.library});if(message.type==='load_cast_roles')fn({type:'cast_display_roles',requestId:message.requestId,chatId:'1',roles:{noSlot:true,noSlotPlain:true,twoSlots:true},sources:Object.fromEntries(suite.messages.map(m=>[m.id,m.content]))})}})}};
    suite.renderer=new api.StudioCastNarrative(ctx);suite.mount?.();
   }''',FRONT)
   await page.wait_for_function("document.querySelectorAll('#twoSlots [data-ss-cast-live]').length===2",timeout=12000)
   results=await page.evaluate('''()=>Object.fromEntries(['noSlot','noSlotPlain','twoSlots'].map(id=>{
    const article=document.getElementById(id),body=article.querySelector('.body'),recoveries=[...article.querySelectorAll('[data-ss-cast-recovered]')];
    const escaped =recoveries.filter(node=>!body.contains(node));
    return[id,{recoveries:recoveries.map(node=>({text:node.textContent,parent:node.parentElement.className,inBody:body.contains(node),insideChoice:!!node.closest('.choice-ui')})),escaped:escaped.length,hasChoice:body.querySelector('.choice-ui')?.textContent,slots:article.querySelectorAll('[data-ss-cast-live]').length,slotsInChoice:article.querySelectorAll('.choice-ui [data-ss-cast-live]').length,bodyText:body.innerText,tailText:article.querySelector('.message-footer').innerText}]}))''')
   print(results)
   assert results['noSlot']['escaped']==0 and not results['noSlot']['recoveries'], 'unowned Cast packets must never append prose to message wrapper'
   assert results['noSlotPlain']['escaped']==0, 'recovery of an unmatched member must stay inside the original bubble'
   assert results['twoSlots']['slotsInChoice']==0, 'source-position guesses must not mount portraits inside foreign widgets'
   assert results['twoSlots']['escaped']==0, 'recoverable paragraphs must remain inside original message bubble'
   assert all(not n['insideChoice'] for n in results['twoSlots']['recoveries']), 'Cast must not insert prose inside foreign widget'
   assert '4 POSSIBLE ROUTES' in results['twoSlots']['hasChoice']
   assert not errors,errors
   print('PASS: recovered prose never escapes a nested message bubble or invades foreign widget')
  finally:await browser.close()
if __name__=='__main__':asyncio.run(main())
