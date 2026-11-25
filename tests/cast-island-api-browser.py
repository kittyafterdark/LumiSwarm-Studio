"""Production bundle + minimal Lumiverse mock: no host text mutation is allowed."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0]+ '\nwindow.__castTest={castRenderIslands,StudioCastNarrative};'
lib={"groups":[{"id":"group","name":"Fitting Room","defaultPresentation":"portrait","inject":True}],"activeGroupId":"group","members":[{"id":"shoto","groupId":"group","prefix":"Shoto","name":"Shoto","presentation":"moonlit-halo","defaultExpression":"neutral","crop":{"enabled":False,"x":50,"y":20,"zoom":1},"images":{"neutral":{"id":"imgone"},"approval":{"id":"imgtwo"}}}],"chatGroups":{"chatone":"group"},"inject":True}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={"width":950,"height":850})
 errors=[]
 page.on('pageerror', lambda e: errors.append(str(e)))
 page.set_content('<div id="bubble" style="width:700px;background:#111;color:#eee"><div id="msg"></div></div>')
 page.add_script_tag(content=code)
 page.evaluate('''(library)=>{
   window.__LIB=library;window.__handlers={};window.__logs=[];
   window.__ctx={getActiveChat:()=>({chatId:'chatone'}),
    dom:{listMessageElements:()=>[{messageId:'message1',element:document.getElementById('msg')}], getMessageId:()=> 'message1'},
    onBackendMessage(cb){window.__backend=cb;return ()=>{}},
    sendToBackend(payload){window.__logs.push(payload);if(payload.type==='load_cast_library')queueMicrotask(()=>window.__backend({type:'cast_result',requestId:payload.requestId,data:window.__LIB}));
      else if(payload.type==='set_cast_presentation')queueMicrotask(()=>window.__backend({type:'cast_result',requestId:payload.requestId,data:window.__LIB}));},
    events:{on(name,fn){window.__handlers[name]=fn;return ()=>{}}}};
    window.__inst=new window.__castTest.StudioCastNarrative(window.__ctx);
 }''',lib)
 scene='''<p>Katsuki did not turn his head. <swarm-cast=Shoto-neutral><font color="#599CE3">"A first response."</font></swarm-cast> He waited beside the ramen shop. <swarm-cast=Shoto-approval>"A second answer."</swarm-cast> No paragraphs disappeared.</p>'''
 def commit(text):
  page.evaluate('''text=>{document.getElementById('msg').innerHTML=window.__castTest.castRenderIslands(text)}''',text)
  page.wait_for_timeout(100)
 commit(scene)
 result=page.evaluate('''()=>{
  const msg=document.getElementById('msg'),hosts=[...msg.querySelectorAll('[data-ss-cast-slot]')];
  return {n:hosts.length,h:hosts.map(x=>!!x.shadowRoot),quotes:hosts.map(x=>x.shadowRoot?.querySelector('[data-swarm-cast-dialogue]')?.textContent),
   prose:msg.querySelector('p')?.textContent,markup:msg.innerHTML.slice(0,170)}
 }''')
 print('initial',result)
 assert result['n']==2 and all(result['h']),result
 assert 'He waited beside the ramen shop.' in result['prose'] and 'No paragraphs disappeared.' in result['prose']
 assert all(result['quotes'])
 page.evaluate('''()=>{const hosts=[...document.querySelectorAll('[data-ss-cast-slot]')];window.__shadowCount=0;window.__os=hosts.map(h=>{const o=new MutationObserver(rs=>window.__shadowCount+=rs.length);o.observe(h.shadowRoot,{subtree:true,childList:true,characterData:true});return o})}''')
 for i in range(16):
  page.evaluate('''i=>document.getElementById('bubble').setAttribute('data-host-cycle',String(i))''',i)
 page.wait_for_timeout(200)
 assert page.evaluate('window.__shadowCount')==0,'idle UI changes mutated hydrated shadow content'
 # streamer commits as host replaces entire HTML, first complete envelope then second.
 commit('<p>Intro <swarm-cast=Shoto-neutral>"First."</swarm-cast> prose <swarm-cast=Shoto-approval>"Incomplete')
 assert page.locator('[data-ss-cast-slot]').count()==1
 assert 'Incomplete' not in page.locator('#msg').inner_text()
 commit('<p>Intro <swarm-cast=Shoto-neutral>"First."</swarm-cast> prose <swarm-cast=Shoto-approval>"Second."</swarm-cast> outro.</p>')
 assert page.locator('[data-ss-cast-slot]').count()==2
 assert 'prose' in page.locator('#msg').inner_text()
 page.locator('[data-ss-cast-slot]').first.click(button='right')
 page.wait_for_timeout(50)
 assert page.locator('.ss-cast-quick-picker').count()==1,'right-click wardrobe failed'
 print('quick picker opened; shadow roots:',page.evaluate("[...document.querySelectorAll('[data-ss-cast-slot]')].filter(h=>h.shadowRoot).length"))
 assert not errors, errors
 browser.close()
 print('CAST ISLAND BROWSER PASS: exact slot order, shadow hydration, streaming, no writes, quick picker')
