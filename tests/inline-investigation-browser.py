from pathlib import Path
from playwright.sync_api import sync_playwright
import json, os
root=Path(__file__).resolve().parents[1]
code=(root/'dist/frontend.js').read_text().rsplit('export {',1)[0].replace('export function ','function ')+ '\nwindow.T={TaggedImageController,defaultStudioBehavior};'
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if Path('/usr/bin/chromium').exists() else p.chromium.executable_path),args=['--no-sandbox','--disable-dev-shm-usage'])
 page=b.new_page();page.set_content('<main></main>');page.evaluate('''()=>{let id=0;Object.defineProperty(window.crypto,'randomUUID',{configurable:true,value:()=>`00000000-0000-4000-8000-${String(++id).padStart(12,'0')}`})}''');page.add_script_tag(content=code)
 cases=page.evaluate('''()=>{
 const tag=slot=>`<swarm-image request="generate" slot="${slot}" aspect="4:3">harbor at dusk</swarm-image>`;
 const cases=[];
 for(const kind of ['normal','wrong-owner-id-only','missing-terminal-wrong-swipe','remount-unscoped-stream','stale-terminal-then-correct','explicit-generation-final-remount','idless-ambiguous-two-matches','idless-existing-new-swipe']){
   let sent=[],rows=[],events=new Map();const chatId='chat-1',g='front-'+kind,raw=tag(g),old='old-'+kind,final='final-'+kind;
   const ctx={getActiveChat:()=>({chatId}),sendToBackend:p=>sent.push(structuredClone(p)),events:{on(n,f){events.set(n,f);return()=>events.delete(n)}},messages:{getRecent:()=>structuredClone(rows),getContent:id=>rows.find(m=>m.id===id)?.content??null,renderWidget:()=>()=>{}}};
   const create=()=>new T.TaggedImageController(ctx,T.defaultStudioBehavior(),()=>{},()=>false,()=>{});
   let c=create(); const emit=(n,p)=>events.get(n)?.({chatId,...p});
   if(kind==='wrong-owner-id-only') rows.push({id:old,chat_id:chatId,content:'Previous reply',role:'assistant',swipe_id:0,swipes:['Previous reply'],metadata:{}});
   if(kind==='idless-existing-new-swipe') rows.push({id:final,chat_id:chatId,content:'Previous reply',role:'assistant',swipe_id:0,swipes:['Previous reply'],metadata:{}});
   if(kind==='missing-terminal-wrong-swipe') rows.push({id:final,chat_id:chatId,content:raw,role:'assistant',swipe_id:0,swipes:[raw,'Other'],metadata:{}});
   const start=kind==='wrong-owner-id-only'?{targetMessageId:old,targetSwipeId:0}:['missing-terminal-wrong-swipe','idless-existing-new-swipe'].includes(kind)?{targetMessageId:final,targetSwipeId:1}:{};
   emit('GENERATION_STARTED',{generationId:g,generationType:'normal',...start});emit('STREAM_TOKEN_RECEIVED',{generationId:g,token:raw,offset:0,type:'text'});
   const early=sent.length;
   if(kind==='idless-existing-new-swipe'){rows[0].swipes.push(raw);rows[0].swipe_id=1;rows[0].content=raw;}
   else if(kind!=='missing-terminal-wrong-swipe')rows.push({id:final,chat_id:chatId,content:raw,role:'assistant',swipe_id:0,swipes:[raw],metadata:{}});
   if(kind==='normal')emit('GENERATION_ENDED',{generationId:g,messageId:final,content:raw,swipeId:0});
   if(kind==='wrong-owner-id-only')emit('GENERATION_ENDED',{generationId:g,swipeId:0});
   if(kind==='idless-ambiguous-two-matches'){rows.push({id:'extra-'+kind,chat_id:chatId,content:raw,role:'assistant',swipe_id:0,swipes:[raw],metadata:{}});emit('GENERATION_ENDED',{generationId:g,swipeId:0});}
   if(kind==='idless-existing-new-swipe')emit('GENERATION_ENDED',{generationId:g,swipeId:1});
   if(kind==='explicit-generation-final-remount'){c.destroy();c=create();const hash=v=>{let h=2166136261;for(const ch of v)h=Math.imul(h^ch.charCodeAt(0),16777619);return (h>>>0).toString(36)};c.onMessage({type:'tagged_image_job',data:{id:'existing-job',chatId,messageId:final,slot:g,generationId:g,tagFingerprint:hash(raw),swipeId:0,status:'ready',awaitingSource:true,inserted:false,error:'',imageUrl:'/api/v1/images/already-saved'}});}
   if(kind==='stale-terminal-then-correct'){
     rows.at(-1).content='Actual '+raw;rows.at(-1).swipes=['Actual '+raw];
     emit('GENERATION_ENDED',{generationId:g,messageId:final,content:'Stale '+raw,swipeId:0});
     emit('GENERATION_ENDED',{generationId:g,messageId:final,content:'Actual '+raw,swipeId:0});
   }
   if(kind==='remount-unscoped-stream'){c.destroy();c=create();c.handleTag({chatId,messageId:final,fullMatch:raw,attrs:{request:'generate',slot:g,aspect:'4:3'},content:'harbor at dusk',isStreaming:true})}
   c.handleTag({chatId,messageId:final,fullMatch:raw,attrs:{request:'generate',slot:g,aspect:'4:3'},content:'harbor at dusk',isStreaming:false,swipeId:kind==='idless-existing-new-swipe'?1:0,...(kind==='explicit-generation-final-remount'?{generationId:g}:{})});
   cases.push({kind,slot:g,rows,early,sent});c.destroy();
 }return cases;
}''')
 for c in cases:
  print(c['kind'],[(x['type'],x.get('messageId'),x.get('generationId'),x.get('swipeId'),x.get('isStreaming')) for x in c['sent']])
 b.close()
 Path(__file__).with_name('inline-investigation-traces.json').write_text(json.dumps(cases,indent=2))
