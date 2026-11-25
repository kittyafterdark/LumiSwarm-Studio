"""Regression for consecutive live directives, real Cast hydration, and Theater.
Uses the compiled runtime with the staging-shaped DOM/SDK. No network or model.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CODE=(ROOT/'dist/frontend.js').read_text('utf8').rsplit('export {',1)[0].replace('export function ','function ')+'''\nwindow.T={StudioCastNarrative,cleanCastLibrary,castRenderIslands,stageCueProject,theaterSnapshot,theaterSequence,theaterAssemble,theaterLiveVerified,STYLES};'''
FIXTURE={'groups':[{'id':'crew','name':'Crew','defaultPresentation':'vn-hero','defaultBackground':'wrong-room','backgrounds':[{'key':'wrong-room','id':'wrong-img','name':'Wrong room'},{'key':'izakaya-booth','id':'izakaya-img','name':'Izakaya booth'},{'key':'rooftop','id':'roof-img','name':'Rooftop'}]}],'activeGroupId':'crew','chatGroups':{'chat1':'crew'},'members':[{'id':'actor','groupId':'crew','prefix':'shoto','name':'Shōto','defaultExpression':'neutral','presentation':'vn-hero','images':{'neutral':{'id':'neutral-image'}}}]}
SETUP=r'''raw=>{
 const t=T,store=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}});
 const style=document.createElement('style');style.textContent=t.STYLES;document.head.append(style);
 window.state={library:t.cleanCastLibrary(raw),listeners:new Set(),events:new Map(),rows:[],calls:[]};
 window.packet='<swarm-cast=shoto-neutral><font color="#599CE3">"Stay."</font></swarm-cast>';
 window.directed='<font⠀color="#599CE3">"Earlier."</font>\n\n⠀[[scene:⠀izakaya-booth]]\n[[lighting: golden-hour]]\n\n'+packet;
 // Use the real pre-render transforms, then the host's Markdown line-break
 // shape. No prebuilt card or manually authored inherited attributes.
 window.render=source=>t.castRenderIslands(t.stageCueProject(source,'render')).split(/\n\s*\n/).filter(x=>x.trim()).map(p=>'<p>'+p.replace(/\n/g,'<br>')+'</p>').join('');
 window.add=(id,content,is_user=false)=>{state.rows.push({id,chat_id:'chat1',content,is_user,swipe_id:0});mount(id)};
 window.mount=id=>{const m=state.rows.find(x=>x.id===id);let a=document.querySelector('[data-id="'+id+'"]');if(!a){a=document.createElement('article');a.dataset.id=id;document.querySelector('#chat').append(a)}const html=m.is_user?'<p>'+m.content+'</p>':render(m.content);a.innerHTML='<div data-component="MessageContent">'+html+'</div>'};
 add('m0',packet);add('m1',directed);add('m2','A quiet beat.',true);add('m3',packet);
 add('m4','[[scene: missing-room]]\n[[lighting: moonlight]]\n\n'+packet);add('m5',packet);
 add('m6','[[scene: rooftop]]\n\n'+packet);add('m7',packet);
 window.ctx={getActiveChat:()=>({chatId:'chat1'}),dom:{listMessageElements:()=>[...document.querySelectorAll('#chat article')].reverse().map(element=>({messageId:element.dataset.id,element}))},messages:{listMessageIds:()=>state.rows.map(m=>m.id),getRecent:limit=>structuredClone(state.rows.slice(-limit))},onBackendMessage(cb){state.listeners.add(cb);return()=>state.listeners.delete(cb)},events:{on(name,cb){state.events.set(name,cb);return()=>state.events.delete(name)}},sendToBackend(p){state.calls.push(p);queueMicrotask(()=>{const reply=p.type==='load_cast_library'?{type:'cast_result',requestId:p.requestId,data:state.library}:p.type==='load_cast_card_overrides'?{type:'cast_card_overrides_result',requestId:p.requestId,chatId:p.chatId,data:{},preferences:{}}:null;if(reply)for(const cb of state.listeners)cb(reply)})}};
 window.narrative=new t.StudioCastNarrative(ctx);window.card=id=>document.querySelector('[data-id="'+id+'"] [data-ss-cast-slot]')?.shadowRoot?.querySelector('[data-swarm-cast]');window.slot=id=>document.querySelector('[data-id="'+id+'"] [data-ss-cast-slot]');window.scene=id=>card(id)?.style.getPropertyValue('--cast-world')||'';window.mood=id=>card(id)?.dataset.castAtmosphere||'';window.refresh=()=>{for(const cb of state.listeners)cb({type:'cast_library_changed',library:state.library})};window.resolver=key=>narrative.theaterScene('chat1',key);
}'''
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for w,h in [(1440,900),(390,844),(320,640)]:
  if os.environ.get('THEATER_WIDTH') and w!=int(os.environ['THEATER_WIDTH']):continue
  page=browser.new_page(viewport={'width':w,'height':h},has_touch=w<700,reduced_motion='reduce');page.set_default_timeout(8000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('**/api/v1/images/**',lambda r:r.fulfill(content_type='image/png',body=(ROOT/'tests/fixtures/cast-portrait.png').read_bytes()))
  page.set_content('<!doctype html><base href="http://studio.local/"><main id="chat" style="max-width:800px;margin:auto"></main>');page.add_script_tag(content=CODE);page.evaluate(SETUP,FIXTURE)
  page.wait_for_function("card('m7')&&card('m1')")
  assert page.evaluate("scene('m0').includes('wrong-img')&&scene('m1').includes('izakaya-img')&&scene('m3').includes('izakaya-img')&&mood('m1')==='golden-hour'&&mood('m3')==='golden-hour'")
  assert page.evaluate("scene('m4')===''&&scene('m5')===''&&mood('m4')==='moonlight'&&mood('m5')==='moonlight'&&scene('m6').includes('roof-img')&&mood('m6')===''&&mood('m7')==='' ")
  assert page.evaluate("slot('m1').getAttribute('data-ss-cast-background')===null&&slot('m1').getAttribute('data-ss-cast-atmosphere')===null")
  assert page.evaluate("!document.querySelector('[data-id=m1]').innerText.includes('[[scene:')&&!document.querySelector('[data-id=m1]').innerText.includes('[[lighting:')")
  assert page.evaluate("T.theaterSequence(ctx,resolver).frames.filter(f=>f.kind==='cast').map(f=>f.mood).join(',')==='none,golden-hour,golden-hour,moonlight,moonlight,none,none'")
  # Source cue paragraph can arrive as literal Markdown with <br>; not an intertitle.
  fallback=page.evaluate(r'''()=>{const el=document.createElement('div');el.innerHTML='<p>[[scene: izakaya-booth]]<br>[[lighting: golden-hour]]</p><p>They sat down.</p>';const raw=T.theaterSnapshot('fallback',el),frames=T.theaterAssemble(['fallback'],new Map([['fallback',raw]]),resolver);return {cues:raw.filter(f=>f.cueOnly).length,frames:frames.map(f=>[f.text,f.sceneKey,f.mood]),verified:T.theaterLiveVerified(raw,'[[scene: izakaya-booth]]\n[[lighting: golden-hour]]\n\nThey sat down.\n\n').length}}''')
  assert fallback=={'cues':2,'frames':[['They sat down.','izakaya-booth','golden-hour']],'verified':3},fallback
  # A new background is still pending until a real saved asset arrives.
  page.evaluate("state.library.groups[0].backgrounds.push({key:'missing-room',id:'new-img',name:'New room',aliases:[]});refresh()")
  page.wait_for_function("scene('m4').includes('new-img')&&scene('m5').includes('new-img')")
  # Swiping a preceding message changes the next card without changing its identity.
  page.evaluate(r'''()=>{window.oldSlot=slot('m3');const m=state.rows.find(x=>x.id==='m1');m.content='[[scene: rooftop]]\n[[lighting: dawn]]\n\n'+packet;m.swipe_id=1;mount('m1');state.events.get('MESSAGE_SWIPED')?.({chatId:'chat1'})}''')
  page.wait_for_function("scene('m3').includes('roof-img')&&mood('m3')==='dawn'&&oldSlot===slot('m3')")
  # Virtualized predecessor: reconstruct from canonical recent assistant history.
  page.evaluate("document.querySelector('[data-id=m1]').remove()")
  page.wait_for_function("scene('m3').includes('roof-img')&&mood('m3')==='dawn'")
  page.evaluate("state.rows.find(x=>x.id==='m1').content='[[scene: izakaya-booth]]\\n[[lighting: golden-hour]]\\n\\n'+packet;state.events.get('MESSAGE_SWIPED')?.({chatId:'chat1'})")
  page.wait_for_function("scene('m3').includes('izakaya-img')&&mood('m3')==='golden-hour'")
  # Inherited metadata survives a viewport starting after the directing turn.
  assert page.evaluate("T.theaterSequence(ctx,resolver).frames.find(f=>f.messageId==='m3'&&f.kind==='cast').mood==='golden-hour'")
  assert page.evaluate("T.theaterSequence(ctx,resolver).frames.find(f=>f.messageId==='m3'&&f.kind==='cast').sceneKey==='izakaya-booth'")
  assert page.evaluate("""()=>{const el=document.createElement('div');el.innerHTML='<p>[[scene: izakaya-booth]]<br>[[lighting: golden-hour]]</p>';const frames=T.theaterSnapshot('user',el,false);return frames.length===1&&!frames[0].cueOnly}""")
  assert not errors,errors
  page.evaluate('narrative.destroy()');page.close();print(f'Stage cue projection {w}px PASS: chat hide, card scene/light inheritance, pending asset, swipe, virtualized history, Markdown line breaks, Theater playback',flush=True)
 browser.close()
