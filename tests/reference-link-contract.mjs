import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
const source=(await readFile(new URL('../src/backend.ts',import.meta.url),'utf8')).replaceAll('\r\n','\n');
const helper=source.slice(source.indexOf('// Permanent provenance;'),source.indexOf('// Older hosts'));
const files=new Map(),secrets=new Map(),posts=[];let sequence=0,api,responseStatus=200;
const metadata={studio_schema:'1',studio_origin:'lumiswarm',studio_asset_id:'00000000-0000-4000-8000-000000000001',studio_pipeline_id:'00000000-0000-4000-8000-000000000001',studio_parent_id:'',studio_stage:'expression_draft',studio_retention:'candidate',studio_created_at:String(Date.now())};
const scope=JSON.stringify(['http://swarm.fixture','local',true]);
files.set('studio-assets-v1.json',[{metadata,assetId:metadata.studio_asset_id,imageId:metadata.studio_asset_id,swarmPath:'raw/a.png',swarmPathVerified:true,scope}]);
const spindle={permissions:{has:name=>name==='cors_proxy'},userStorage:{getJson:async(key,options)=>structuredClone(files.get(key)??options.fallback),setJson:async(key,value)=>files.set(key,structuredClone(value))},
 enclave:{get:async key=>secrets.get(key),put:async(key,value)=>secrets.set(key,value),delete:async key=>secrets.delete(key)},images:{readBinary:async()=>new Uint8Array([1,2,3])},
 sendToFrontend(message,user){if(message.type==='verify_snapshot_copies')queueMicrotask(()=>{
   api.receiveStudioCopyVerification(message.requestId,message.data.claims.map(claim=>({...claim,usableCopyVerified:true,copyCheck:{...claim.copyCheck,status:'decoded-original',width:1,height:1}})),'another-user');
   assert.ok(api.pending.has(message.requestId),'other users cannot supply copy verification');
   api.receiveStudioCopyVerification(message.requestId,message.data.claims.map(claim=>({...claim,usableCopyVerified:true,copyCheck:{...claim.copyCheck,status:'decoded-original',width:1,height:1}})),user);
 });},
 cors:async(url,options)=>{posts.push({url,options});return {status:responseStatus};},
};
const bindings={spindle,asRecord:x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{},asString:x=>typeof x==='string'?x:'',backendUuid:async()=>`00000000-0000-4000-8000-${String(++sequence+10).padStart(12,'0')}`,
 listLibraryOutputs:async()=>({outputs:[{id:metadata.studio_asset_id,width:1,height:1}],total:1,folders:[]}),loadTaggedImageJobs:async()=>[],readGenesisJobs:async()=>[],finalizeProtected:()=>new Set(),generationControllers:new Map(),folderExpressionControllers:new Map(),FAVORITES_FOLDER_ID:'favorite'};
api=new Function(...Object.keys(bindings),stripTypeScriptTypes(helper,{mode:'transform'})+'\nreturn {validateStudioReferencePairing,studioReferenceLinkAction,receiveStudioCopyVerification,pending:studioCopyVerifications};')(...Object.values(bindings));
const code={version:1,url:'http://studio.fixture/__studio/lumi-bridge/push',token:'a'.repeat(64),scope,expiresAt:Date.now()+30*86400000};
assert.throws(()=>api.validateStudioReferencePairing({...code,url:'http://u:p@studio.fixture/__studio/lumi-bridge/push'}),/Invalid/);
assert.throws(()=>api.validateStudioReferencePairing({...code,url:'http://studio.fixture/other'}),/Invalid/);
assert.throws(()=>api.validateStudioReferencePairing({...code,expiresAt:0}),/Invalid/);
try {
 const otherScope=JSON.stringify(['http://localhost:7801','local',true]);
 const otherId='00000000-0000-4000-8000-000000000002';
 files.get('studio-assets-v1.json').push({metadata:{...metadata,studio_asset_id:otherId},assetId:otherId,imageId:otherId,swarmPath:'raw/b.png',swarmPathVerified:true,scope:otherScope});
 const paired=await api.studioReferenceLinkAction('pair',JSON.stringify(code),'alice');assert.equal(paired.paired,true);
 for(let attempt=0;attempt<100&&!posts.length;attempt++)await new Promise(resolve=>setTimeout(resolve,5));
 assert.equal(posts.length,1);const body=JSON.parse(posts[0].options.body);
 assert.equal(posts[0].options.headers.Authorization,'Bearer '+code.token);assert.equal(body.sourceUserId,'alice');assert.equal(body.scope,scope);
 assert.equal(body.snapshot.claims[0].usableCopyVerified,true);assert.equal(body.snapshot.complete,false,'decode does not make reference coverage complete');
 assert.equal(body.snapshot.claims[0].copyCheck.status,'decoded-original');
 assert.equal(body.snapshot.claims.length,2,'scope differences must not silently erase claims');
 assert.equal(body.snapshot.claims[1].scope,otherScope,'source scope must never be rewritten to receiver');
 assert.ok(body.snapshot.referenceAudit.some(check=>check.source==='swarm-connection-scope'&&check.status==='mismatch'&&check.reason.includes(otherScope)));

 assert.equal(JSON.stringify(files.get('studio-reference-link-v1.json')).includes(code.token),false,'token is enclave-only');
 assert.equal(secrets.get('studio-reference-link-token'),code.token);
 assert.equal(api.pending.size,0);
 await new Promise(resolve=>setTimeout(resolve,0));
 const published=await api.studioReferenceLinkAction('status',null,'alice');assert.equal(published.claimCount,2);
 responseStatus=400;
 const rejected=await api.studioReferenceLinkAction('refresh',null,'alice');
 assert.match(rejected.error,/accept 2 claims.*HTTP 400/);assert.equal(rejected.claimCount,2,'failure retains the last successful publication count');
 const registry=files.get('studio-assets-v1.json');files.delete('studio-assets-v1.json');const before=posts.length;
 const unreadable=await api.studioReferenceLinkAction('refresh',null,'alice');
 assert.match(unreadable.error,/registry.*unreadable/);assert.equal(posts.length,before,'missing registry must never publish a successful empty feed');files.set('studio-assets-v1.json',registry);

} finally {await api.studioReferenceLinkAction('disconnect',null,'alice');}
assert.equal(secrets.has('studio-reference-link-token'),false);
console.log('Lumi pairing validation, enclave secret storage, scoped publication, account-bound decode proof and disconnect cleanup: PASS');
