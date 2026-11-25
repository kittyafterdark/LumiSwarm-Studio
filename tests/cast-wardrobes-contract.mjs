import assert from 'node:assert/strict'
import {cleanCastLibrary,castWardrobes,castWardrobeView,castMergeWardrobe,castMoveWardrobeAssets,castResolveWardrobe,castPrompt,renderCastTags,castRenderIslands} from '../dist/frontend.js'
const library=cleanCastLibrary({activeGroupId:'bnha',inject:true,groups:[{id:'bnha',name:'BNHA',inject:true}],members:[{id:'k',groupId:'bnha',name:'Katsuki',prefix:'katsuki',identityPrompt:'blond hair',referenceImageId:'casual-ref',images:{neutral:{id:'casual-neutral'},joy:{id:'casual-joy'},'patrol-neutral':{id:'hero-neutral'},'patrol-confident':{id:'hero-confident'}}}]})
let member=library.members[0]
const original=structuredClone(member.images), rows=castWardrobes(member)
assert.equal(rows[0].key,'default'); assert.equal(Object.keys(rows[0].slots).length,4)
rows.push({key:'patrol',name:'Dynamight',outfitPrompt:'hero costume',referenceImageId:'hero-ref',defaultExpression:'neutral',slots:{},aliases:{},settings:rows[0].settings})
rows.push({key:'empty',name:'Formal',outfitPrompt:'suit',referenceImageId:'',defaultExpression:'neutral',slots:{},aliases:{},settings:rows[0].settings})
member.wardrobes=rows; member.wardrobes=castMoveWardrobeAssets(member,'default','patrol',{'patrol-neutral':'neutral','patrol-confident':'confident'})
assert.deepEqual({...member.images},original)
const read=()=>cleanCastLibrary(library)
const resolve=(label,wardrobe)=>castResolveWardrobe(read(),`katsuki-${label}`,wardrobe)
assert.equal(resolve('neutral','patrol').image.id,'hero-neutral')
assert.equal(resolve('joy','patrol').image.id,'hero-neutral')
assert.equal(resolve('joy','default').image.id,'casual-joy')
assert.equal(resolve('joy','empty'),undefined); assert.equal(resolve('joy','missing'),undefined)
const packet=(key,wardrobe='')=>`<swarm-cast=katsuki-${key}${wardrobe?' wardrobe='+wardrobe:''}>"Hello."</swarm-cast>`
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
assert.match(renderCastTags(packet('patrol-confident'),read(),escape),/hero-confident/)
assert.match(renderCastTags(packet('joy','patrol'),read(),escape),/hero-neutral/)
// Capsule's decorative face follows the historical outfit default, not the active expression.
const capsule=read();capsule.members[0].presentation='overlap-capsule'
for(const [key,outfit,actor,face] of [['confident','patrol','hero-confident','hero-neutral'],['patrol-confident','','hero-confident','hero-neutral'],['joy','default','casual-joy','casual-neutral']]){
 const html=renderCastTags(packet(key,outfit),capsule,escape);assert.match(html,new RegExp('data-cast-default-image="/api/v1/images/'+face+'"'));assert.match(html,new RegExp('src="/api/v1/images/'+actor+'"'));assert.equal((html.match(/data-cast-asset=/g)||[]).length,1);assert.match(html,new RegExp('--cast-badge-image:url\\(&quot;/api/v1/images/'+face+'&quot;\\)'));
}

assert.equal(renderCastTags(packet('joy','empty'),read(),escape),packet('joy','empty'))
assert.match(castRenderIslands(packet('joy','patrol')), /data-ss-cast-wardrobe="patrol"/)
const view=castWardrobeView(member,'patrol'); assert.deepEqual(Object.keys(view.images).sort(),['confident','neutral']);assert.equal(view.referenceImageId,'hero-ref')
view.images.joy={id:'hero-joy',url:'/api/v1/images/hero-joy'};view.referenceImageId='another-hero-ref'
member=castMergeWardrobe(member,'patrol',view);library.members[0]=member
assert.equal(resolve('joy','patrol').image.id,'hero-joy');assert.equal(resolve('joy','default').image.id,'casual-joy')
assert.equal(member.images['patrol-confident'].id,'hero-confident');assert.equal(castWardrobeView(member,'default').referenceImageId,'casual-ref')
assert.equal(castWardrobeView(member,'patrol').referenceImageId,'another-hero-ref')
assert.throws(()=>castMoveWardrobeAssets(member,'default','patrol',{joy:'joy'}),/unique/)
let cleaned=read();assert.equal(JSON.stringify(cleanCastLibrary(cleaned)),JSON.stringify(cleaned))
let prompt=castPrompt(cleaned,[{role:'assistant',content:packet('joy','patrol')},{role:'user',content:packet('joy','default')},{role:'assistant',content:'`'+packet('joy','default')+'`'}]);assert.match(prompt,/Most recently established outfits[^.]+katsuki wardrobe=patrol/);assert.doesNotMatch(prompt,/katsuki-patrol-confident/);assert.match(prompt,/katsuki-confident wardrobe=patrol/)
console.log('Wardrobe migration, stable historical keys, isolated references, scoped merge, exact fallback, packet envelopes and history guidance: ok')
