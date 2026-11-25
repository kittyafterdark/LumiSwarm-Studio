"""Regression: a sanitized multi-packet reply must not form a wall of portraits.
Only native block anchors or source-backed missing prose may determine placement.
"""
import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
FRONT=Path(os.environ.get('CAST_FRONT',str(ROOT/'dist/frontend.js'))).read_text('utf8')
ART=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()

def scene():
    prose=[
      "The first native paragraph describes the busy intersection and the traffic signals while the two heroes are quietly planning their evening route.",
      "A full intermediate paragraph follows the first statement. The nearby commuters begin to notice the pair and the crossing light remains stubbornly red.",
      "Another long connecting paragraph should be reconstructed here. The city train rattles overhead while the conversation grows more personal and direct.",
      "The next native paragraph survives the sanitizer untouched. It describes the canal bridge, the benches, and the last shoppers crossing toward the station.",
      "The final missing connective paragraph remembers the corner shop and a passing bicycle, followed by the unhurried sound of footsteps on stone.",
      "The last native paragraph also survives the host transformation. Their patrol ends beside the precinct gate as the streetlights turn on above the street.",
    ]
    expressions=['neutral','approval','amusement','joy','confusion']
    src=prose[0]
    for i,exp in enumerate(expressions):
      src+='\n\n'+f'<swarm-cast=Shoto-{exp}><font⠀color="#599CE3">"Statement {i+1}: this dialogue is owned by a single complete Cast packet."</font></swarm-cast>'+'\n\n'+prose[i+1]
    return src,prose

async def main():
    source,prose=scene()
    async with async_playwright() as p:
      browser=await p.chromium.launch(headless=True,executable_path=os.getenv('CAST_CHROME','/usr/bin/chromium'),args=['--no-sandbox'])
      try:
       page=await browser.new_page(viewport={'width':1050,'height':900})
       errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
       await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
       await page.set_content('<!doctype html><html><head><base href="http://cast.local/"><style>body{background:#111;color:white;font:16px sans-serif}p{margin:15px 0}.body{width:850px}</style></head><body><article id="a"><div class="bubble"><div id="body" class="body"></div></div></article></body></html>')
       await page.evaluate('''async ({frontend,source,prose})=>{
         const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));const api=await import(url);URL.revokeObjectURL(url);
         const body=document.querySelector('#body');
         for(const idx of [0,3,5]){const p=document.createElement('p');p.dataset.prose=idx;p.textContent=prose[idx];body.append(p)}
         const library=api.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Group'}],members:[{id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{neutral:{id:'p1'},approval:{id:'p1'},amusement:{id:'p1'},joy:{id:'p1'},confusion:{id:'p1'}}}]});
         const suite=window.suite={source,prose,events:new Map(),listeners:new Set(),writes:0};
         const observer=new MutationObserver(records=>{suite.writes+=records.length});observer.observe(body,{childList:true,characterData:true,subtree:true});suite.observer=observer;
         const ctx={getActiveChat:()=>({chatId:'1'}),registerDomDecorator(){return()=>{}},
           dom:{listMessageElements:()=>[{messageId:'a',element:document.querySelector('#a')}],getMessageId:el=>el.closest('article')?.id||null},
           messages:{getRecent:n=>[{id:'a',role:'assistant',content:source}],getContent:id=>source},
           events:{on(name,fn){if(!suite.events.has(name))suite.events.set(name,new Set());suite.events.get(name).add(fn);return()=>suite.events.get(name).delete(fn)}},
           onBackendMessage(fn){suite.listeners.add(fn);return()=>suite.listeners.delete(fn)},
           sendToBackend(message){queueMicrotask(()=>{for(const fn of suite.listeners){if(message.type==='load_cast_library')fn({type:'cast_result',requestId:message.requestId,data:library});if(message.type==='load_cast_roles')fn({type:'cast_display_roles',requestId:message.requestId,chatId:'1',roles:{a:true},sources:{a:source}})}})}};
         suite.renderer=new api.StudioCastNarrative(ctx);
       }''',{'frontend':FRONT,'source':source,'prose':prose})
       await page.wait_for_timeout(550)
       result=await page.evaluate('''()=>{
         const elements=[...document.querySelector('#body').children];
         const seq=elements.filter(e=>!e.hasAttribute('data-ss-cast-leading')).map(e=>e.hasAttribute('data-ss-cast-live') ? 'cast-'+e.shadowRoot?.textContent.match(/Statement (\\d+)/)?.[1] : e.hasAttribute('data-ss-cast-recovered') ? 'recovered-'+window.suite.prose.findIndex(t=>e.textContent.includes(t)) : 'prose-'+e.dataset.prose);
         return {seq,quotes:[...document.querySelectorAll('#body [data-ss-cast-live]')].map(e=>e.shadowRoot?.textContent.match(/Statement (\\d+)/)?.[1]),natives:[0,3,5].map(i=>document.querySelector(`[data-prose="${i}"]`)?.textContent),recovered:[...document.querySelectorAll('#body [data-ss-cast-recovered]')].map(e=>e.textContent),visible:document.querySelector('#body').innerText};
       }''')
       print('SEQUENCE:',result['seq'])
       expected=['prose-0','cast-1','recovered-1','cast-2','recovered-2','cast-3','prose-3','cast-4','recovered-4','cast-5','prose-5']
       assert result['seq']==expected,(result['seq'],expected)
       assert result['natives']==[prose[i] for i in (0,3,5)],'Native paragraphs were changed'
       assert len(result['recovered'])==3,'Missing paragraphs not recovered exactly once'
       assert result['quotes']==['1','2','3','4','5'],'Cast did not render all five packets'
       await page.evaluate('''()=>{window.suite.writes=0;for(let i=0;i<16;i++){const el=document.querySelector('#a');el.style.setProperty('--host-noise',String(i))}}''')
       await page.wait_for_timeout(80)
       writes=await page.evaluate('window.suite.writes')
       print('Routine host-style churn, DOM writes:',writes)
       assert not errors,errors
       print('PASS: native prose and recovered prose interleave in source order with five unique portraits')
      finally: await browser.close()

if __name__=='__main__': asyncio.run(main())
