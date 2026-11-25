"""Bounded Cast packet end-to-end through the actual R20 Shadow DOM renderer.
Run: python tests/cast-envelope-browser.py (uses locally installed Chromium / Python Playwright).
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
  page=await browser.new_page(viewport={'width':980,'height':860})
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.route('**/api/v1/images/**',lambda route:route.fulfill(content_type='image/png',body=ART))
  await page.set_content('''<!doctype html><html><head><base href="http://cast.local/"></head><body style="background:#101118;color:#efeff5;--lumiverse-text:#efeff5;--lumiverse-prose-dialogue:#bbb"><main id="chat" style="max-width:660px;margin:24px auto"></main></body></html>''')
  await page.evaluate('''async frontend=>{
    const url=URL.createObjectURL(new Blob([frontend],{type:'text/javascript'}));
    window.api=await import(url);URL.revokeObjectURL(url);
    const s=window.suite={events:new Map(),callbacks:new Set(),messages:[],received:[],mount:null};
    s.lib=api.cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Crew',defaultPresentation:'story'}],members:[
      {id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'vn-hero',images:{neutral:{id:'p1'},confusion:{id:'p1'}}},
      {id:'katsuki',groupId:'g',name:'Katsuki',prefix:'Katsuki',presentation:'chapter-tab',images:{neutral:{id:'p2'}}}]});
    s.emit=(payload)=>{for(const fn of s.callbacks)fn(payload)};
    s.add=(id,source,html)=>{
      s.messages.push({id,role:'assistant',content:source});const article=document.createElement('article');article.id=id;
      article.style.cssText='margin:12px 0;padding:12px;line-height:1.6;';article.innerHTML=html;
      document.getElementById('chat').append(article);
    };
    s.source1=`Shoto checked the windows.\n\n<swarm-cast=Shoto-neutral><font color="#599CE3">"He's allowed to take pictures on a public thoroughfare."</font></swarm-cast>\n\nKatsuki folded his arms. "That's rich," he said.\n\n<swarm-cast=Katsuki-neutral><font color="#FFC524">"You are impossible."</font></swarm-cast>\n\nThe van drove away.`;
    s.add('first',s.source1,`<p>Shoto checked the windows.</p><p>&lt;swarm-cast=Shoto-neutral&gt;<font color="#599CE3">"He's allowed to take pictures on a public thoroughfare."</font>&lt;/swarm-cast&gt;</p><p>Katsuki folded his arms. "That's rich," he said.</p><p>&lt;swarm-cast=Katsuki-neutral&gt;<font color="#FFC524">"You are impossible."</font>&lt;/swarm-cast&gt;</p><p>The van drove away.</p>`);
    s.source2=`Before.\n\n<swarm-cast=Shoto-neutral>"This is the ONLY bounded line."</swarm-cast>\n\n"Unrelated next paragraph." After.`;
    s.add('sanitized',s.source2,'<p>Before.</p><p>\u200b</p><p>"Unrelated next paragraph." After.</p>');
    s.source3='<swarm-cast=Shoto-neutral>"A single packet."</swarm-cast>';
    s.add('tagonly',s.source3,'<p>\u200b</p>');
    s.source4=`Shoto said "Repeat." at the bus stop. <swarm-cast=Shoto-neutral>"Repeat."</swarm-cast> The light finally changed.`;
    s.add('repeated',s.source4,'<p>Shoto said "Repeat." at the bus stop. "Repeat." The light finally changed.</p>');
    s.source5=`First passage. <swarm-cast=Shoto-neutral><font⠀color="#599CE3">"The⠀lighting⠀on⠀this⠀stretch⠀is⠀better."</font></swarm-cast> Shōto remarked. <swarm-cast=Katsuki-neutral><font⠀color="#FFC524">"Then⠀stop⠀staring."</font></swarm-cast> The streetlamps flickered.`;
    s.add('braille',s.source5,'<p>First passage.</p><p>​</p><p>Shōto remarked.</p><p>​</p><p>The streetlamps flickered.</p>');
    s.source6='<swarm-cast=Shoto-neutral><font⠀color="#599CE3">"Incomplete."</font>';
    s.add('legacy',s.source6,'<p>&lt;swarm-cast=Shoto-neutral&gt;"Incomplete."</p>');
    s.source7='<swarm-cast=Shoto-neutral><font⠀color="#599CE3">"Not complete yet."</font>';
    s.add('stream',s.source7,'<p>streaming tokens</p>');
    s.source8=`<swarm-cast=Shoto-confusion><font⠀color="#599CE3">"Hawks⠀calls⠀you⠀about⠀the⠀noodle⠀shop⠀photos?"</font></swarm-cast>⠀Shōto⠀asked,⠀turning⠀his⠀head⠀slightly⠀as⠀they⠀reached⠀the⠀midpoint⠀of⠀the⠀overpass,⠀where⠀the⠀safety⠀mesh⠀rose⠀high⠀above⠀their⠀heads⠀and⠀filtered⠀the⠀headlights⠀of⠀an⠀incoming⠀local⠀train⠀into⠀moving⠀bars⠀of⠀white⠀across⠀the⠀concrete.⠀<swarm-cast=Shoto-neutral><font⠀color="#599CE3">"He⠀never⠀calls⠀me⠀about⠀them.⠀Maybe⠀he⠀thinks⠀you're⠀the⠀one⠀starting⠀rumors."</font></swarm-cast>`;
    s.add('interleaved',s.source8,`<p>&lt;swarm-cast=Shoto-confusion&gt;<font color="#599CE3">"Hawks calls you about the noodle shop photos?"</font>&lt;/swarm-cast&gt; Shōto asked, turning his head slightly as they reached the midpoint of the overpass, where the safety mesh rose high above their heads and filtered the headlights of an incoming local train into moving bars of white across the concrete. &lt;swarm-cast=Shoto-neutral&gt;<font color="#599CE3">"He never calls me about them. Maybe he thinks you're the one starting rumors."</font>&lt;/swarm-cast&gt;</p>`);

    // Simulate the ACTUAL browser parser: unknown opening tags nest because
    // </swarm-cast> cannot close <swarm-cast=Shoto-...>. A sanitizer then
    // destroys the entire nested subtree, including ordinary narration.
    s.source9='Before crossing. '+s.source8+' Everyone crossed the bridge safely and kept walking toward the station.';
    s.add('rawsanitized',s.source9,'<p>Before crossing. '+s.source8+' Everyone crossed the bridge safely and kept walking toward the station.</p>');
    const raw=document.getElementById('rawsanitized');
    for(const node of [...raw.querySelectorAll('*')])if(node.tagName.startsWith('SWARM-CAST='))node.remove();

    s.signal=(event,payload={})=>{for(const fn of s.events.get(event)||[])fn(payload)};
    const ctx={getActiveChat:()=>({chatId:'chat-1'}),registerDomDecorator(arg){s.mount=arg.render;return()=>{}},
    dom:{listMessageElements:()=>[...document.querySelectorAll('article')].map(el=>({messageId:el.id,element:el})),getMessageId:el=>el.closest('article')?.id||null},
    messages:{getContent:id=>s.messages.find(m=>m.id===id)?.content||null,getRecent:n=>s.messages.slice(-n)},
    events:{on(name,fn){if(!s.events.has(name))s.events.set(name,new Set());s.events.get(name).add(fn);return()=>s.events.get(name).delete(fn)}},
    onBackendMessage(fn){s.callbacks.add(fn);return()=>s.callbacks.delete(fn)},
    sendToBackend(message){s.received.push(message);queueMicrotask(()=>{
      if(message.type==='load_cast_library')s.emit({type:'cast_result',requestId:message.requestId,data:s.lib});
      if(message.type==='load_cast_roles')s.emit({type:'cast_display_roles',requestId:message.requestId,chatId:'chat-1',roles:{first:true,sanitized:true,tagonly:true,repeated:true,braille:true,legacy:true,stream:true,interleaved:true,rawsanitized:true},sources:{first:s.source1,sanitized:s.source2,tagonly:s.source3,repeated:s.source4,braille:s.source5,legacy:s.source6,stream:s.source7,interleaved:s.source8,rawsanitized:s.source9}});
    })}};
    s.renderer=new api.StudioCastNarrative(ctx);s.mount?.();
  }''',FRONT)
  await page.wait_for_function("document.querySelectorAll('#first [data-ss-cast-live]').length===2 && document.querySelectorAll('#sanitized [data-ss-cast-live]').length===1 && document.querySelectorAll('#tagonly [data-ss-cast-live]').length===1 && document.querySelectorAll('#repeated [data-ss-cast-live]').length===1",timeout=12000)
  inspect=await page.evaluate('''()=>{
    const detail=id=>{
      const el=document.getElementById(id);
      const hosts=[...el.querySelectorAll('[data-ss-cast-live]')];
      const quotes=hosts.map(host=>host.shadowRoot?.querySelector('[data-swarm-cast-dialogue]'));
      return {text:el.innerText,quotes:quotes.map(q=>q?.textContent),colors:quotes.map(q=>q?getComputedStyle(q).color:null),hidden:quotes.map(q=>q?.hidden),images:hosts.map(h=>h.shadowRoot?.querySelectorAll('img').length),closeTags:el.innerText.includes('</swarm-cast>')}
    };return {first:detail('first'),sanitized:detail('sanitized'),tagonly:detail('tagonly'),repeated:detail('repeated')}
  }''')
  print('BOUNDED',inspect)
  assert len(inspect['first']['quotes'])==2,inspect
  assert inspect['first']['quotes'][0].count('public thoroughfare')==1 and inspect['first']['quotes'][1].count('impossible')==1,inspect
  assert 'rgb(89, 156, 227)'==inspect['first']['colors'][0] and 'rgb(255, 197, 36)'==inspect['first']['colors'][1],inspect
  assert not inspect['first']['closeTags'] and not any(inspect['first']['hidden']),inspect
  assert inspect['sanitized']['quotes']==['"This is the ONLY bounded line."'] and inspect['tagonly']['quotes']==['"A single packet."'],inspect
  assert 'Unrelated next paragraph.' in inspect['sanitized']['text'] and '"Unrelated next paragraph."' not in inspect['sanitized']['quotes'],inspect
  assert 'Shoto said \"Repeat.\" at the bus stop.' in inspect['repeated']['text'], 'Original distinct same-text quote must survive'
  braille=await page.evaluate("""()=>{const el=document.getElementById('braille');return [...el.querySelectorAll('[data-ss-cast-live]')].map(h=>{const q=h.shadowRoot.querySelector('[data-swarm-cast-dialogue]');return {text:q.textContent,color:getComputedStyle(q).color,hidden:q.hidden}})}""")
  print('BRAILLE',braille)
  assert len(braille)==2 and not any(q['hidden'] for q in braille),braille
  assert [q['color'] for q in braille]==['rgb(89, 156, 227)','rgb(255, 197, 36)'],braille
  assert 'The lighting on this stretch is better.' in braille[0]['text'] and 'Then stop staring.' in braille[1]['text'],braille
  assert await page.evaluate("document.querySelectorAll('#legacy [data-ss-cast-live]').length")==0,'Legacy opening-only tags must never mount'
  interleaved=await page.evaluate("""()=>{const root=document.getElementById('interleaved');const mounts=[...root.querySelectorAll('[data-ss-cast-live]')];return {text:root.innerText,quotes:mounts.map(el=>el.shadowRoot.querySelector('[data-swarm-cast-dialogue]').textContent),names:mounts.map(el=>el.dataset.swarmCast)}}""")
  print('INTERLEAVED',interleaved)
  assert len(interleaved['quotes'])==2, interleaved
  assert 'Shōto asked, turning his head slightly' in interleaved['text'], 'Intervening prose vanished'
  assert 'headlights of an incoming local train into moving bars of white across the concrete' in interleaved['text'], 'Long intervening prose was truncated'
  assert interleaved['text'].count('Shōto asked')==1, 'Intervening prose duplicated'
  assert interleaved['quotes']==['"Hawks calls you about the noodle shop photos?"',"\"He never calls me about them. Maybe he thinks you're the one starting rumors.\""], interleaved
  raw=await page.evaluate("""()=>{const root=document.getElementById('rawsanitized');return {text:root.innerText,quotes:[...root.querySelectorAll('[data-ss-cast-live]')].map(el=>el.shadowRoot.querySelector('[data-swarm-cast-dialogue]').textContent)}}""")
  print('SANITIZER RECOVERY',raw)
  assert len(raw['quotes'])==2 and 'Shōto asked, turning his head slightly' in raw['text'] and 'filtered the headlights of an incoming local train' in raw['text'], raw
  assert 'Everyone crossed the bridge safely and kept walking toward the station.' in raw['text'] and 'Before crossing.' in raw['text'], raw
  assert raw['text'].count('Shōto asked')==1, 'Source-backed recovery duplicated a paragraph'
  # A live incomplete streaming tag must not be printed, and prose BEFORE it
  # must remain native. Once closed, its expression appears during streaming.
  await page.evaluate("""()=>{
    suite.signal('GENERATION_STARTED',{messageId:'stream'});
    const message=suite.messages.find(m=>m.id==='stream');
    message.content='The crossing light changed. <swarm-cast=Shoto-neutral><font⠀color="#599CE3">"Only half the quote';
    document.getElementById('stream').innerHTML='<p>The crossing light changed. &lt;swarm-cast=Shoto-neutral&gt;&lt;font⠀color="#599CE3"&gt;"Only half the quote</p>';
    suite.signal('STREAM_TOKEN_RECEIVED',{});suite.mount?.();
  }""")
  await page.wait_for_timeout(180)
  pending=await page.evaluate("""()=>({text:document.getElementById('stream').innerText,mounts:document.querySelectorAll('#stream [data-ss-cast-live]').length})""")
  print('PENDING',pending)
  assert pending['mounts']==0 and 'The crossing light changed.' in pending['text'] and '<swarm-cast' not in pending['text'], pending
  await page.evaluate("""()=>{suite.signal('GENERATION_STARTED',{messageId:'stream'});suite.messages.find(m=>m.id==='stream').content='<swarm-cast=Shoto-neutral><font⠀color="#599CE3">"Complete⠀but⠀still⠀streaming."</font></swarm-cast>';document.getElementById('stream').innerHTML='<p>tokens arrived</p>';suite.signal('STREAM_TOKEN_RECEIVED',{});suite.mount?.()}""")
  await page.wait_for_timeout(220)
  assert await page.evaluate("document.querySelectorAll('#stream [data-ss-cast-live]').length")==1,'Completed envelope should mount while streaming'
  await page.evaluate("""()=>{document.getElementById('stream').innerHTML='<p>\u200b</p>';suite.signal('GENERATION_ENDED',{messageId:'stream'});suite.mount?.()}""")
  await page.wait_for_function("document.querySelectorAll('#stream [data-ss-cast-live]').length===1",timeout=10000)
  completed=await page.evaluate("""()=>{const q=document.querySelector('#stream [data-ss-cast-live]').shadowRoot.querySelector('[data-swarm-cast-dialogue]');return {text:q.textContent,color:getComputedStyle(q).color,hidden:q.hidden}}""")
  assert completed['color']=='rgb(89, 156, 227)' and completed['hidden'] is False and 'Complete but still streaming.' in completed['text'],completed
  print('STREAM',completed)
  # Incrementally stream two closed expressions with ordinary prose between.
  # This is the production hazard: token-by-token host commits may replace
  # the whole message while Cast must not erase/duplicate a paragraph.
  await page.evaluate("""()=>{
    suite.signal('GENERATION_STARTED',{messageId:'stream'});
    const first='Before the train. <swarm-cast=Shoto-neutral>"First line."</swarm-cast> Shōto spoke quietly. ';
    const incomplete='<swarm-cast=Shoto-confusion>"Second';
    suite.messages.find(m=>m.id==='stream').content=first+incomplete;
    document.getElementById('stream').innerHTML='<p>Before the train. &lt;swarm-cast=Shoto-neutral&gt;"First line."&lt;/swarm-cast&gt; Shōto spoke quietly. &lt;swarm-cast=Shoto-confusion&gt;"Second</p>';
    suite.signal('STREAM_TOKEN_RECEIVED',{});suite.mount?.();
  }""")
  await page.wait_for_function("document.querySelectorAll('#stream [data-ss-cast-live]').length===1")
  during=await page.evaluate("""()=>({text:document.getElementById('stream').innerText,quotes:[...document.querySelectorAll('#stream [data-ss-cast-live]')].map(h=>h.shadowRoot.querySelector('[data-swarm-cast-dialogue]').textContent)})""")
  print('PROGRESSIVE ONE',during)
  assert during['quotes']==['"First line."'] and during['text'].count('Shōto spoke quietly.')==1 and '<swarm-cast' not in during['text'],during
  await page.evaluate("""()=>{
    const full='Before the train. <swarm-cast=Shoto-neutral>"First line."</swarm-cast> Shōto spoke quietly. <swarm-cast=Shoto-confusion>"Second line."</swarm-cast> Everyone heard.';
    suite.messages.find(m=>m.id==='stream').content=full;
    document.getElementById('stream').innerHTML='<p>Before the train. &lt;swarm-cast=Shoto-neutral&gt;"First line."&lt;/swarm-cast&gt; Shōto spoke quietly. &lt;swarm-cast=Shoto-confusion&gt;"Second line."&lt;/swarm-cast&gt; Everyone heard.</p>';
    suite.signal('STREAM_TOKEN_RECEIVED',{});suite.mount?.();
  }""")
  await page.wait_for_function("document.querySelectorAll('#stream [data-ss-cast-live]').length===2")
  during=await page.evaluate("""()=>({text:document.getElementById('stream').innerText,quotes:[...document.querySelectorAll('#stream [data-ss-cast-live]')].map(h=>h.shadowRoot.querySelector('[data-swarm-cast-dialogue]').textContent)})""")
  print('PROGRESSIVE TWO',during)
  assert during['quotes']==['"First line."','"Second line."'] and during['text'].count('Shōto spoke quietly.')==1 and 'Everyone heard.' in during['text'] and '<swarm-cast' not in during['text'],during
  await page.evaluate("""()=>{suite.signal('GENERATION_ENDED',{messageId:'stream'});suite.mount?.()}""")
  await page.wait_for_timeout(120)
  assert await page.evaluate("document.querySelectorAll('#stream [data-ss-cast-live]').length")==2, 'Final commit must retain two stable mounts'
  # An existing complete packet cannot haunt a regenerated same-ID message.
  await page.evaluate("""()=>{
    suite.signal('GENERATION_STARTED',{messageId:'tagonly'});
    suite.source3='<swarm-cast=Shoto-neutral>"A new, unfinished replacement."';
    suite.messages.find(m=>m.id==='tagonly').content=suite.source3;
    document.getElementById('tagonly').innerHTML='<p>new source is incomplete</p>';
    suite.mount?.();
  }""")
  await page.wait_for_timeout(100)
  assert await page.evaluate("document.querySelectorAll('#tagonly [data-ss-cast-live]').length")==0,'Old packet hidden during same-ID regeneration'
  await page.evaluate("""()=>{suite.signal('GENERATION_ENDED',{messageId:'tagonly'});suite.mount?.()}""")
  await page.wait_for_timeout(200)
  assert await page.evaluate("document.querySelectorAll('#tagonly [data-ss-cast-live]').length")==0,'Old source must not be recovered after incomplete replacement'
  print('STALE-SOURCE protection passed')
  # Sanitizing the final HTML must not erase the saved quote or produce duplicate slots.
  await page.evaluate('''()=>{const a=document.getElementById('first');a.replaceChildren(document.createElement('p'));a.firstChild.textContent=`Shoto checked the windows. Katsuki folded his arms. "That's rich," he said. The van drove away.`;suite.mount?.()}''')
  await page.wait_for_function("document.querySelectorAll('#first [data-ss-cast-live]').length===2")
  final=await page.evaluate('''()=>[...document.querySelectorAll('#first [data-ss-cast-live]')].map(h=>({text:h.shadowRoot.querySelector('[data-swarm-cast-dialogue]').textContent,hidden:h.shadowRoot.querySelector('[data-swarm-cast-dialogue]').hidden}))''')
  assert len(final)==2 and not any(q['hidden'] for q in final),final
  await page.evaluate('''()=>{window.mut=0;const observer=new MutationObserver(records=>{mut+=records.length});for(const h of document.querySelectorAll('[data-ss-cast-live]'))observer.observe(h.shadowRoot,{subtree:true,childList:true,characterData:true,attributes:true});for(let i=0;i<100;i++)window.dispatchEvent(new Event('scroll'));}''')
  await page.wait_for_timeout(350)
  assert await page.evaluate('mut')==0,'Scroll must not re-render Cast shadow content'
  assert not errors,errors
  print('CAST ENVELOPE CHROMIUM PASS: bounded styling, multi speaker, sanitizer, tag-only, no unrelated quote, no repaint')
  await browser.close()

if __name__=='__main__': asyncio.run(main())
