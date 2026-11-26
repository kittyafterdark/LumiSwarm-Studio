"""Production bundle: streamed inline requests, deduplication, native hydration.
Run with Python Playwright + Chromium. No live provider or host required.
"""
import os, base64
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ','function ')+ '\nwindow.T={TaggedImageController,defaultStudioBehavior,StoryTheaterController};'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(1440,900),(390,844),(320,640)]:
  page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce');page.set_default_timeout(6000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content('<!doctype html><body><main id="chat"></main></body>')
  page.evaluate('''()=>{const storage=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}})}''')
  page.add_script_tag(content=code)
  page.evaluate('''()=>{
   window.events=new Map();window.backends=new Set();window.sent=[];window.rows=[];window.widgets=[];window.chatId='chat';
   window.emit=(name,data)=>{for(const fn of events.get(name)||[])fn({chatId,...data})};
   window.receive=data=>{for(const fn of backends)fn(data)};
   window.render=(id,html)=>{let node=document.querySelector(`[data-id="${id}"]`);if(!node){node=document.createElement('article');node.dataset.id=id;document.querySelector('#chat').append(node)}node.innerHTML='<div data-component="MessageContent">'+html+'</div>'};
   window.add=(id,content)=>{let m={id,chat_id:chatId,content,is_user:false,swipe_id:0,swipes:[content]};rows.push(m);return m};
   window.ctx={getActiveChat:()=>({chatId}),sendToBackend:p=>sent.push(structuredClone(p)),onBackendMessage:f=>{backends.add(f);return()=>backends.delete(f)},events:{on(n,f){if(!events.has(n))events.set(n,new Set());events.get(n).add(f);return()=>events.get(n).delete(f)}},dom:{listMessageElements:()=>[...document.querySelectorAll('article')].reverse().map(element=>({messageId:element.dataset.id,element}))},messages:{getRecent:n=>structuredClone(rows.slice(-n)),getContent:id=>rows.find(m=>m.id===id)?.content??null,listMessageIds:()=>rows.map(m=>m.id),renderWidget:(p,f)=>{widgets.push(p);return()=>{} }},composer:{getState:()=>({mounted:true,chatId,text:''}),setText:()=>{},send:async()=>{},onChange:()=>()=>{}},host:{surfaces:{list:()=>[{id:'action-regenerate',kind:'command',invocable:true}],invoke:async()=>{}}}};
   window.inline=new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});
   window.genCalls=()=>sent.filter(p=>p.type==='tag_generate');window.settles=()=>sent.filter(p=>p.type==='settle_tagged_generation');
   window.tag=(slot,request='generate')=>`<swarm-image request="${request}" slot="${slot}" aspect="4:3">a garden</swarm-image>`;
   window.push=(g,token,offset,type='text')=>emit('STREAM_TOKEN_RECEIVED',{generationId:g,token,offset,type});
   window.start=(g,extra={})=>emit('GENERATION_STARTED',{generationId:g,generationType:'normal',...extra});
  }''')
  page.evaluate('''()=>{
   const check=(b,m)=>{if(!b)throw Error(m)};
   start('a');let a=tag('a'),b=tag('b'),fenced='```html\\n'+tag('example')+'\\n```\\n',parser=tag('parser','parse'),prefix=fenced+parser+'\\n';
   push('a',tag('hidden'),0,'reasoning');push('a',prefix+a.slice(0,-5),0);check(genCalls().length===0,'Incomplete / example / parser request');push('a',a.slice(-5),prefix.length+a.length-5);check(genCalls().length===1,'Complete packet dispatched before terminal');
   check(genCalls()[0].messageId==='inline-stream:a'&&genCalls()[0].generationId==='a'&&genCalls()[0].isStreaming,'Provisional identity');
   push('a',a,prefix.length);check(genCalls().length===1,'Replayed token');
   inline.handleTag({chatId,messageId:'provisional',fullMatch:a,attrs:{request:'generate',slot:'a'},content:'a garden',isStreaming:true});check(genCalls().length===1,'Parallel host interceptor');
   emit('GENERATION_IN_PROGRESS',{generationId:'a',targetMessageId:'real',targetSwipeId:1});push('a',b,prefix.length+a.length);check(genCalls().length===2,'Second packet');
   const final=prefix+a+b;emit('GENERATION_ENDED',{generationId:'a',messageId:'real',content:final});check(settles().length===1&&settles()[0].messageId==='real'&&settles()[0].swipeId===1,'Separate final proof');
   emit('GENERATION_ENDED',{generationId:'a',messageId:'real',content:final});check(settles().length===1,'Duplicate terminal');
   // Older sequence-only host, including reasoning tokens in the same sequence.
   start('seq',{targetMessageId:'seq-real'});emit('STREAM_TOKEN_RECEIVED',{generationId:'seq',seq:1,token:tag('thought'),type:'reasoning'});emit('STREAM_TOKEN_RECEIVED',{generationId:'seq',seq:2,token:tag('seq')});emit('STREAM_TOKEN_RECEIVED',{generationId:'seq',seq:2,token:tag('seq')});check(genCalls().length===3,'Sequence-only stream');
   start('gap');emit('STREAM_TOKEN_RECEIVED',{generationId:'gap',seq:4,token:tag('gap')});check(genCalls().length===3,'Missing prefix');
   start('quiet',{generationType:'quiet'});push('quiet',tag('quiet'),0);start('imp',{generationType:'impersonate'});push('imp',tag('imp'),0);check(genCalls().length===3,'Non-assistant streams');
   start('bg',{targetMessageId:'bg-real',targetSwipeId:2,backgroundSwipe:true});push('bg',tag('bg'),0);check(genCalls().length===4&&genCalls()[3].swipeId===2,'Known background swipe');
   emit('STREAM_TOKEN_RECEIVED',{chatId:'other-chat',generationId:'bg',token:tag('foreign'),offset:tag('bg').length});check(genCalls().length===4,'Foreign chat');
   inline.destroy();check([...events.values()].every(s=>s.size===0),'Inline listener cleanup');
  }''')
  # A confirmed native attachment arrives before the selected-source API and
  # native message DOM hydrate. The fallback must appear without another LLM
  # event, and retire when the native figure finally renders.
  page.evaluate('''()=>{
   window.inline=new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});
   window.hydrateTag=tag('hydrate');window.hydrateUrl='https://studio.test/api/v1/image-gen/results/ready';window.hydrateFig=`<figure data-swarm-studio-image="true" data-swarm-studio-job-id="hydrate"><img src="${hydrateUrl}"></figure>`;
   add('hydrate-reply','Previous stale snapshot.');render('hydrate-reply','<p>Previous stale snapshot.</p>');
   const job={id:'hydrate',key:'key',chatId,messageId:'inline-stream:hydrate',generationId:'hydrate',awaitingSource:true,slot:'hydrate',status:'ready',inserted:false,imageId:'ready',imageUrl:hydrateUrl,output:'inline',clientJobId:'attempt',swipeId:0,error:'',updatedAt:1};
   inline.onMessage({type:'tagged_image_job',data:job});inline.onMessage({type:'tagged_image_job',data:{...job,messageId:'hydrate-reply',awaitingSource:false,inserted:true,updatedAt:2}});
   inline.onMessage({type:'tagged_message_reconciled',data:{jobId:'hydrate',clientJobId:'attempt',chatId,messageId:'hydrate-reply',swipeId:0,previousContent:hydrateTag,content:hydrateFig,imageUrl:hydrateUrl}});
   setTimeout(()=>{const m=rows[0];m.content=hydrateFig;m.swipes=[hydrateFig]},250);
  }''')
  page.wait_for_function("widgets.some(w=>w.messageId==='hydrate-reply'&&w.html.includes(hydrateUrl))")
  page.evaluate('''()=>{render('hydrate-reply',hydrateFig)}''')
  page.wait_for_function('inline.cleanups.size===0')
  page.evaluate('''()=>{inline.destroy();rows.length=0;document.querySelector('#chat').replaceChildren()}''')
  # Two confirmed attachments arrive before the original terminal text.
  page.evaluate('''asset=>{
   window.asset=asset;window.theater=new T.StoryTheaterController(ctx);add('old','The story begins.');render('old','<p>The story begins.</p>');theater.open();
   window.raw='Before.\\n\\n'+tag('one')+'\\n\\n'+tag('two')+'\\n\\nAfter.';window.fig1=`<figure data-swarm-studio-image="true" data-swarm-studio-job-id="one"><img src="${asset}" alt="First scene"></figure>`;window.fig2=fig1.replace('one','two').replace('First scene','Second scene');window.mid=raw.replace(tag('one'),fig1);window.final=mid.replace(tag('two'),fig2);
   add('reply','');render('reply','');start('theater',{targetMessageId:'reply',targetSwipeId:0});push('theater',raw,0);
   const m=rows.find(m=>m.id==='reply');m.content=final;m.swipes=[final];
   // Reverse notification order checks transitive matching, not event arrival order.
   for(const [before,after] of [[mid,final],[raw,mid]])receive({type:'tagged_message_reconciled',data:{chatId,messageId:'reply',swipeId:0,previousContent:before,content:after}});
   if(!theater.liveInlineContentMatches('reply',raw,final,0)||theater.liveInlineContentMatches('reply',raw,final,1))throw Error('Swipe-scoped attachment proof');
   render('reply','<p>Before.</p>'+fig1+fig2+'<p>After.</p>');emit('GENERATION_ENDED',{generationId:'theater',messageId:'reply',content:raw});
  }''','data:image/webp;base64,'+base64.b64encode((ROOT/'docs/readme/gallery/library.webp').read_bytes()).decode())
  page.wait_for_function("theater.frames.filter(f=>f.messageId==='reply'&&f.kind==='cg').length===2 && theater.liveSettles.size===0",timeout=6000)
  assert page.evaluate("theater.frames.filter(f=>f.messageId==='reply').map(f=>f.kind)")==['narration','cg','cg','narration']
  page.evaluate('theater.destroy()');assert page.evaluate('[...events.values()].every(s=>s.size===0)&&backends.size===0');assert not errors,errors
  print(f'Inline stream and Theater CG hydration {width}px PASS',flush=True);page.close()
 browser.close()
