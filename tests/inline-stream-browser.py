"""Production bundle: streamed inline requests, deduplication, native hydration.
Run with Python Playwright + Chromium. No live provider or host required.
"""
import os, base64
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
code=(ROOT/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ','function ')+ '\nwindow.T={TaggedImageController,defaultStudioBehavior,StoryTheaterController,MiniPlayerController,StudioController};'
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
  # Mixed transport before the canonical ID exists, duplicate slot and new swipe.
  page.evaluate('''()=>{
   window.inline=new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});sent.length=0;
   const check=(b,m)=>{if(!b)throw Error(m)};const one=tag('one'),two=tag('two');
   start('mixed');push('mixed',one,0);
   const reordered=one.replace('request="generate" slot="one"','slot="one"   request="generate"');
   const msg=add('mixed-final',reordered);inline.handleTag({chatId,messageId:msg.id,fullMatch:reordered,attrs:{request:'generate',slot:'one'},content:'a garden',isStreaming:false});
   check(genCalls().length===1,'Unscoped final callback before terminal must not dispatch');
   push('mixed',one.replace('a garden','a different prompt')+two,one.length);
   check(genCalls().length===2,'Conflicting slot suppressed; distinct identical prompt permitted');
   const final=reordered+two;msg.content=final;msg.swipes=[final];emit('GENERATION_ENDED',{generationId:'mixed',messageId:msg.id,content:final,swipeId:0});
   check(settles().length===1,'Canonical attribute reorder settles existing slot');
   inline.handleTag({chatId,messageId:msg.id,fullMatch:reordered,attrs:{request:'generate',slot:'one'},content:'a garden',isStreaming:false});check(genCalls().length===2,'Final replay suppressed');
   start('mixed-new',{targetMessageId:msg.id,targetSwipeId:1});push('mixed-new',one,0);check(genCalls().length===3&&genCalls()[2].swipeId===1,'New generation owns its separate swipe');
   inline.destroy();rows.length=0;sent.length=0;
  }''')
  # ID-only terminal events settle existing reservations from contiguous text.
  page.evaluate('''()=>{
   window.inline=new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});
   const raw=tag('id-only');start('id-only',{targetMessageId:'id-only-reply',targetSwipeId:0});push('id-only',raw,0);
   emit('GENERATION_ENDED',{generationId:'id-only',messageId:'id-only-reply',swipeId:0});
   if(genCalls().length!==1||settles().length!==1||settles()[0].content!==raw)throw Error('ID-only terminal lost reservation');
   inline.destroy();sent.length=0;
  }''')
  # Actual compiled Studio and Locket controllers: queued render previews must
  # survive repeated announcements, concurrent GPU streams, and late results.
  page.evaluate('''()=>{
   const check=(b,m)=>{if(!b)throw Error(m)};
   const miniRoot=document.createElement('div'),studioRoot=document.createElement('div');document.body.append(miniRoot,studioRoot);
   const host={sendToBackend(){},getActiveChat:()=>({chatId:'chat'})};
   const mini=new T.MiniPlayerController(host,{root:miniRoot,destroy(){miniRoot.remove()}},()=>{},()=>{},()=>{},()=>null,T.defaultStudioBehavior(),()=>{});
   const studio=new T.StudioController(host,{root:studioRoot},()=>{},()=>{},T.defaultStudioBehavior(),()=>{});
   const surfaces=[mini,studio];const emit=p=>surfaces.forEach(s=>s.onMessage(p));const make=(color)=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,8,8);return c.toDataURL()};
   const a=make('red'),b=make('green'),c=make('blue');
   const job=(id,attempt,status='generating')=>emit({type:'tagged_image_job',data:{id,clientJobId:attempt,status}});
   const progress=(attempt,preview,step)=>emit({type:'generation_progress',clientJobId:attempt,data:{preview,step,totalSteps:10}});
   const result=(id,attempt,preview)=>emit({type:'tagged_generation_result',clientJobId:attempt,data:{taggedJob:{id,clientJobId:attempt},result:{imageId:attempt,imageDataUrl:preview},outputs:[],total:0,offset:0,limit:12}});
   const studioPreview=()=>studioRoot.querySelector('[data-role="preview-image"]').getAttribute('src');
   job('first','a');progress('a',a,4);job('first','a');
   check(mini.snapshot().preview===a&&mini.snapshot().step===4&&studioPreview()===a,'Repeated job announcement preserves live preview');
   job('second','b');progress('b',b,7);
   check(mini.snapshot().preview===a&&studioPreview()===a,'Background job does not overwrite current preview');
   for(const surface of surfaces)surface.onImageGenerationEvent('complete',{assetId:'a',extensionIdentifier:'swarm_studio',imageId:'early'});
   check(mini.snapshot().jobId==='a'&&studio.currentJobId==='a','Native complete is not authoritative tagged settlement');
   job('first','a','ready');result('first','a',a);
   check(mini.snapshot().jobId==='b'&&mini.snapshot().preview===b&&mini.snapshot().step===7,'Handoff restores cached next preview');
   check(studio.currentJobId==='b'&&studioPreview()===b,'Studio handoff retains next preview after prior output');
   job('second','b-retry');progress('b-retry',c,5);job('second','b','ready');result('second','b',b);
   check(mini.snapshot().jobId==='b-retry'&&mini.snapshot().preview===c,'Old completion cannot retire new attempt');
   check(studio.currentJobId==='b-retry'&&studioPreview()===c,'Studio old completion cannot retire new attempt');
   job('second','b-retry','ready');result('second','b-retry',c);
   check(!mini.snapshot().active&&!studio.generating&&studioPreview()===c,'Final completion settles both surfaces');
   studio.dispose();studioRoot.remove();mini.destroy();
  }''')
  # Automatic rendering and attachment are silent for both output modes.
  # Manual approval and genuine failures still have actionable widgets.
  page.evaluate('''()=>{
   const check=(b,m)=>{if(!b)throw Error(m)};
   for(const output of ['inline','url']){
    window.inline=new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});widgets.length=0;
    const raw=tag('active');add('active-reply',raw);render('active-reply',raw);
    const job={id:'active',key:'active',chatId,messageId:'active-reply',slot:'active',status:'queued',inserted:false,output,tagFingerprint:(()=>{let h=2166136261;for(const v of raw){h=Math.imul(h^v.charCodeAt(0),16777619)}return (h>>>0).toString(36)})(),clientJobId:'attempt',swipeId:0,error:''};
    const state=(status,extra={})=>inline.onMessage({type:'tagged_image_job',data:{...job,status,...extra}});
    state('queued');state('queued');state('generating');
    state('ready',{awaitingSource:true,imageUrl:'/api/v1/images/draft'});
    state('ready',{awaitingSource:false,imageUrl:'/api/v1/images/draft'});
    emit('CHARACTER_MESSAGE_RENDERED',{messageId:job.messageId});
    inline.onMessage({type:'tagged_image_jobs_result',data:[{...job,status:'ready',awaitingSource:true}]});
    check(widgets.length===0&&inline.cleanups.size===0,output+' automatic lifecycle mounted a ribbon');
    state('ready',{error:'Attachment retries exhausted'});
    check(widgets.length===1&&widgets.at(-1).html.includes('Attach image'),output+' attachment recovery missing');
    state('ready',{error:''});check(inline.cleanups.size===0,'Recovered attachment still has ribbon');
    state('failed',{clientJobId:'attempt-two',error:'Provider failed'});
    check(widgets.at(-1).html.includes('Retry'),output+' failure recovery missing');
    inline.destroy();rows.length=0;widgets.length=0;document.querySelector('#chat').replaceChildren();
    window.inline=new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});
    add('active-reply',raw);render('active-reply',raw);
    state('requested',{clientJobId:''});check(widgets.length===1&&widgets.at(-1).html.includes('Generate image'),'Manual approval missing');
    state('queued');check(inline.cleanups.size===0,'Manual approval ribbon should retire after submission');
    inline.destroy();rows.length=0;widgets.length=0;document.querySelector('#chat').replaceChildren();
   }
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
  # A committed job alone must recover delayed native source and DOM, even
  # when the separate reconciliation event was missed entirely.
  page.evaluate('''()=>{
   window.inline=new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});widgets.length=0;
   const raw=tag('missed'),url='https://studio.test/api/v1/image-gen/results/missed',fig=`<figure data-swarm-studio-image="true" data-swarm-studio-job-id="missed"><img src="${url}"></figure>`;
   add('missed-reply','Stale snapshot');render('missed-reply','<p>Stale snapshot</p>');
   const job={id:'missed',key:'missed',chatId,messageId:'missed-reply',slot:'missed',status:'ready',inserted:true,output:'inline',imageUrl:url,imageId:'missed',clientJobId:'attempt',swipeId:0,error:'',updatedAt:1};
   inline.onMessage({type:'tagged_image_job',data:job});
   setTimeout(()=>{rows[0].content=fig;rows[0].swipes=[fig]},250);
   window.missedFig=fig;
  }''')
  page.wait_for_function("widgets.some(w=>w.messageId==='missed-reply'&&w.html.includes('/missed'))")
  page.evaluate("render('missed-reply',missedFig)");page.wait_for_function('inline.cleanups.size===0')
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
