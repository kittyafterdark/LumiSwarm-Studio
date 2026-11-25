import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';

const source = (await readFile(new URL('../src/backend.ts', import.meta.url), 'utf8')).replaceAll('\r\n', '\n');
const helper = source.slice(source.indexOf('// Permanent provenance;'), source.indexOf('// Older hosts'));
assert.ok(helper.includes('studioReferenceSnapshot'));
const store = new Map(), jobs = [];
let id = 0, active = false;
const spindle = { permissions: { has: () => false }, uuid: { v4: async () => `00000000-0000-4000-8000-${String(++id).padStart(12, '0')}` }, userStorage: {
    getJson: async (key, options) => structuredClone(store.get(key) ?? options.fallback),
    setJson: async (key, value) => { await new Promise(resolve => setTimeout(resolve, 1)); store.set(key, structuredClone(value)); },
} };
const bindings = { spindle, sessions: new Map(), sessionKey: () => "fixture-session",
    asRecord: x => x && typeof x === 'object' && !Array.isArray(x) ? x : {}, asString: x => typeof x === 'string' ? x : '',
    backendUuid: async () => { if (!spindle.uuid) throw new Error('uuid-v1 missing'); return spindle.uuid.v4(); },
    parseSwarmImageMetadata: value => typeof value === 'string' ? JSON.parse(value) : value,
    getConnection: async () => ({ api_url: 'https://swarm.test' }), normalizeBaseUrl: value => value,
    listLibraryOutputs: async () => ({ outputs: active ? [{ id: 'image-final', owner_chat_id: 'chat' }] : [], folders: active ? [{ id: 'favorite', imageIds: ['image-final'] }] : [] }),
    loadTaggedImageJobs: async () => jobs, readGenesisJobs: async () => [], finalizeProtected: user => new Set(user === "fixture-user" && active ? ["image-final"] : []), generationControllers: new Map(), folderExpressionControllers: new Map(), FAVORITES_FOLDER_ID: 'favorite',
};
const api = new Function(...Object.keys(bindings), stripTypeScriptTypes(helper, { mode: 'transform' }) + '\nreturn {tagStudioGeneration,rememberStudioAsset,studioReferenceSnapshot,auditStudioReferences};')(...Object.values(bindings));
const input = { parameters: { rawRequestOverride: JSON.stringify({ param_map: { maskblur: 12, extra_metadata: { custom: 'kept' } } }) }, studioStage: 'expression_draft' };
const draft = await api.tagStudioGeneration(input, 'fixture-user');
assert.equal(JSON.parse(input.parameters.rawRequestOverride).maskblur, 12);
assert.equal(JSON.parse(input.parameters.rawRequestOverride).extra_metadata.custom, 'kept');
assert.equal(draft.studio_origin, 'lumiswarm'); assert.equal(draft.studio_stage, 'expression_draft');
assert.ok(Object.values(draft).every(value => typeof value === 'string'));
await api.rememberStudioAsset({ studioMetadata: draft }, { imageId: 'image-draft', swarmPath: 'draft.png', swarmPathVerified: true }, input, 'fixture-user');
const finalInput = { studioParentImageId: 'image-draft', studioStage: 'upscale_result' };
const final = await api.tagStudioGeneration(finalInput, 'fixture-user');
assert.equal(final.studio_parent_id, draft.studio_asset_id); assert.equal(final.studio_pipeline_id, draft.studio_pipeline_id);
await Promise.all(Array.from({ length: 8 }, async (_, index) => {
    const metadata = index === 0 ? final : await api.tagStudioGeneration({}, 'fixture-user');
    await api.rememberStudioAsset({ studioMetadata: metadata }, { imageId: index === 0 ? 'image-final' : `parallel-${index}`, swarmPath: `${index}.png`, swarmPathVerified: true }, {}, 'fixture-user');
}));
assert.equal(store.get('studio-assets-v1.json').length, 9, 'concurrent ledger writes preserve every asset');
const snapshot = await api.studioReferenceSnapshot('fixture-user');
assert.equal(snapshot.schema, 1); assert.equal(snapshot.complete, false); assert.equal(snapshot.claims.length, 9);
assert.ok(snapshot.claims.every(claim => !claim.usableCopyVerified && !claim.persisted), 'missing Lumi records stay distinct from originals');
assert.ok(snapshot.claims.some(claim => claim.assetId === draft.studio_asset_id), 'deleted Lumi drafts retain provenance');
active = true;
const referenced = await api.studioReferenceSnapshot('fixture-user');
assert.ok(referenced.claims.find(claim => claim.imageId === 'image-final').references.includes('favorite'));
assert.ok(referenced.claims.find(claim => claim.imageId === 'image-final').references.includes('finalize-workspace'));
assert.ok(referenced.claims.find(claim => claim.imageId === 'image-final').references.includes('chat-owned'));
spindle.permissions.has = name => ['characters','personas','chats'].includes(name);
for (const name of ['characters','personas','chats']) spindle[name] = { list: async options => { assert.equal(options.userId,'fixture-user'); return {data:[{id:'host-record',image_id:'image-final'}],total:1}; } };
spindle.chat = {getMessages:async()=>[{content:'fixture image-final'}]};
spindle.images = {readBinary:async(id,user)=>{assert.equal(user,'fixture-user');return new Uint8Array([1,2,3]);}};
const audited = await api.studioReferenceSnapshot('fixture-user');
const verified = audited.claims.find(claim=>claim.imageId==='image-final');
assert.equal(verified.copyCheck.status,'readable-bytes');
assert.equal(verified.usableCopyVerified,false,'raw byte reads do not prove image decoding');
assert.ok(verified.references.includes('host-chat-messages'));
assert.equal(audited.complete,false);
assert.ok(audited.referenceAudit.some(check=>check.source==='opaque-or-third-party-bindings'&&check.status==='unavailable'));
// Full message mode must retain archived swipe extras and page beyond 200 messages.
spindle.host = {capabilities:{'chat-lean-messages-v1':1}};
spindle.characters = {list:async options=>{assert.equal(options.includeSystem,true);return {data:[{id:'system-container'}],total:1};},get:async()=>({visual:'image-final'}),getGallery:async()=>[{image:'image-final'}]};
spindle.personas = {list:async()=>({data:[{id:'persona'}],total:1}),get:async()=>({avatar:'image-final',originalPath:'draft.png'})};
spindle.chats = {list:async()=>({data:[{id:'group-chat'}],total:1}),get:async()=>({type:'group'})};
const offsets=[];
spindle.chat.getMessages=async(chat,options)=>{
 assert.equal(chat,'group-chat');assert.equal(options.light,false);assert.equal(options.includeExtra,true);assert.equal(options.ownMetadataOnly,false);offsets.push(options.offset);
 return options.offset===0?Array.from({length:200},()=>({content:'active',swipes:[{content:'old',extra:{image:'image-final'}}]})):[{extra:{retained:'image-draft'}}];
};
const coverage = await api.auditStudioReferences(store.get('studio-assets-v1.json'),'fixture-user');
assert.deepEqual(offsets,[0,200]);
assert.ok(coverage.references.get(final.studio_asset_id).includes('host-character-gallery'));
assert.ok(coverage.references.get(final.studio_asset_id).includes('host-personas-detail'));
assert.ok(coverage.references.get(draft.studio_asset_id).includes('host-chat-messages'));
assert.ok(coverage.references.get(draft.studio_asset_id).includes('swarm-path:host-personas-detail'),'physical path dependencies are distinguishable from Lumi UUID bindings');
assert.ok(coverage.checks.some(check=>check.source==='chat-messages-and-swipes'&&check.status==='checked-all-returned-variants'&&check.records===201));
spindle.characters.get=async()=>{throw new Error('permission denied');};
const partial = await api.auditStudioReferences(store.get('studio-assets-v1.json'),'fixture-user');
assert.ok(partial.checks.some(check=>check.source==='characters'&&check.status==='partial-or-denied'));
assert.ok(partial.checks.some(check=>check.source==='characters-detail'&&check.status==='partial-or-unavailable'));
const unsaved={parameters:{rawRequestOverride:JSON.stringify({donotsave:true})}};
const unsavedTag=await api.tagStudioGeneration(unsaved,'fixture-user');
assert.equal(JSON.parse(unsaved.parameters.rawRequestOverride).donotsave,true);assert.equal(unsavedTag.studio_storage,'lumi_only');
await assert.rejects(()=>api.tagStudioGeneration({parameters:{workflow:{nodes:[]},rawRequestOverride:'{"donotsave":true}'}},'fixture-user'),/custom Comfy/);
for (const [stage,surface,expected] of [['general_generation','quick_create','quick_create'],['general_generation','main_studio','general_generation'],['inpaint_variant','inline','inline_inpaint_variant'],['upscale_result','inline','inline_upscale_result'],['background_removed','inline','inline_background_removed'],['upscale_result','expression','upscale_result']]) {
 const input={studioStage:stage,studioSurface:surface,studioParentImageId:'image-draft'};
 const tag=await api.tagStudioGeneration(input,'fixture-user');
 assert.equal(tag.studio_stage,expected);assert.equal(tag.studio_surface,surface);assert.equal(tag.studio_parent_id,draft.studio_asset_id);assert.equal(tag.studio_pipeline_id,draft.studio_pipeline_id);
 assert.equal(JSON.parse(input.parameters.rawRequestOverride).extra_metadata.studio_stage,expected);
}
spindle.uuid = undefined;
await assert.rejects(() => api.tagStudioGeneration({}, 'fixture-user'), /uuid-v1/);
console.log('Lumi metadata, parent lineage, concurrent durable registry, deleted-draft history, conservative snapshot and missing host UUID: PASS');
