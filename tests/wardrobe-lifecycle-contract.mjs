import assert from 'node:assert/strict'
import {cleanCastLibrary,castRegistryAttach,castRegistryCopyOutfit,castWardrobes,castActiveWardrobes,castWardrobeLifecycle,castWardrobeView,castMergeWardrobe,castMoveWardrobeAssets,castCreateWardrobe,castLibraryForChat,castPrompt,castResolveWardrobe,renderCastTags} from '../dist/frontend.js'
let lib=cleanCastLibrary({groups:[{id:'one',name:'One',inject:true},{id:'two',name:'Two',inject:true},{id:'three',name:'Three',inject:true}],members:[{id:'actor',groupId:'one',name:'Actor',prefix:'actor',preferredWardrobe:'winter',images:{neutral:{id:'casual'},wjoy:{id:'coat'},wneutral:{id:'coat-neutral'},other:{id:'coat'}},wardrobes:[{key:'default',name:'Everyday',slots:{neutral:'neutral'}},{key:'winter',name:'Winter',referenceImageId:'winter-ref',slots:{joy:'wjoy',neutral:'wneutral'},aliases:{happy:'wjoy'},settings:{slots:[{label:'joy',direction:'smile'}]}},{key:'other',name:'Other',slots:{joy:'other'}}]}],chatGroups:{a:'one',b:'two',c:'three'}})
lib=castRegistryAttach(lib,'actor','two','linked','link');lib=castRegistryAttach(lib,'actor','three','fork','fork');lib.members.find(m=>m.id==='linked').preferredWardrobe='winter'
const before=structuredClone(lib),get=(id,l=lib)=>l.members.find(m=>m.id===id),history=[{role:'assistant',content:'<swarm-cast=actor-neutral wardrobe=other>old</swarm-cast> <swarm-cast=actor-joy wardrobe=winter>hi</swarm-cast>'}]
assert.throws(()=>castWardrobeLifecycle(lib,'actor','default','remove'),/additional outfit/)
assert.throws(()=>castWardrobeLifecycle(lib,'actor','winter','archive','winter'),/replacement/)
lib=castWardrobeLifecycle(lib,'actor','winter','archive','other')
assert.equal(before.members[0].wardrobes[1].archived,undefined)
for(const id of ['actor','linked']){const member=get(id);assert.equal(castWardrobes(member)[1].archived,true);assert.equal(member.preferredWardrobe,'other');assert.equal(JSON.stringify(member.images),JSON.stringify(get(id,before).images));assert.deepEqual(castActiveWardrobes(member).map(w=>w.key),['default','other']);assert.throws(()=>castMergeWardrobe(member,'winter',castWardrobeView(member,'winter')),/archived/);assert.throws(()=>castMoveWardrobeAssets(member,'winter','other',{neutral:'neutral'}),/different wardrobe/);assert.throws(()=>castCreateWardrobe(member,'winter',{name:'test',outfit:'',mode:'fresh',inheritReference:false}),/unique/)}
assert.equal(castWardrobes(get('fork'))[1].archived,undefined)
for(const chat of ['a','b']){const scoped=castLibraryForChat(lib,chat);assert.equal(castResolveWardrobe(scoped,'actor-happy','winter').image.id,'coat');assert.match(renderCastTags('<swarm-cast=actor-joy wardrobe=winter>hi</swarm-cast>',scoped,s=>s),/coat/);assert.doesNotMatch(castPrompt(scoped,history),/wardrobe=winter|winter \(Winter\)|Most recently established outfits/)}
assert.throws(()=>castRegistryCopyOutfit(lib,'actor','winter','fork','Another'),/unique/)
assert.deepEqual(cleanCastLibrary(lib),lib)
lib=castWardrobeLifecycle(lib,'linked','winter','restore');assert.equal(castWardrobes(get('actor'))[1].archived,undefined);assert.match(castPrompt(castLibraryForChat(lib,'a'),history),/wardrobe=winter/);assert.equal(get('actor').preferredWardrobe,'other')
assert.throws(()=>castWardrobeLifecycle(lib,'actor','winter','restore'),/status changed/)
lib=castWardrobeLifecycle(lib,'linked','winter','remove','default')
for(const id of ['actor','linked']){const member=get(id);assert.deepEqual(castWardrobes(member).map(w=>w.key),['default','other']);assert.deepEqual(Object.keys(member.images).sort(),['neutral','other']);assert.equal(member.images.other.id,'coat');assert.equal(member.preferredWardrobe,'other')}
assert.equal(get('fork').images.wjoy.id,'coat');assert.equal(castResolveWardrobe(castLibraryForChat(lib,'a'),'actor-joy','winter'),undefined);assert.equal(castResolveWardrobe(castLibraryForChat(lib,'a'),'actor-joy','other').image.id,'coat');assert.deepEqual(cleanCastLibrary(lib),lib)
console.log('Wardrobe lifecycle: linked archive/restore/remove, original protection, prompt/continuity exclusion, historical rendering, stale workshop/move/copy rejection, shared physical file preservation, fork isolation: PASS')

// Local visibility is membership-owned, even while all shared fields reconcile.
let local=structuredClone(before)
const localMember=(id)=>local.members.find(m=>m.id===id)
const localPrompt=(chat)=>castPrompt(castLibraryForChat(local,chat),history)
const imageSnapshot=JSON.stringify(localMember('actor').images)
assert.throws(()=>castWardrobeLifecycle(local,'actor','default','hide'),/additional outfit/)
local=castWardrobeLifecycle(local,'actor','winter','hide','other')
assert.deepEqual(localMember('actor').hiddenWardrobes,['winter']);assert.equal(localMember('linked').hiddenWardrobes,undefined)
assert.equal(localMember('actor').preferredWardrobe,'other');assert.equal(localMember('linked').preferredWardrobe,'winter')
assert.equal(JSON.stringify(localMember('actor').images),imageSnapshot)
assert.deepEqual(castWardrobes(localMember('actor')),castWardrobes(localMember('linked')))
assert.deepEqual(castActiveWardrobes(localMember('actor')).map(w=>w.key),['default','other'])
assert.deepEqual(castActiveWardrobes(localMember('linked')).map(w=>w.key),['default','winter','other'])
assert.doesNotMatch(localPrompt('a'),/wardrobe=winter|winter \(Winter\)/);assert.match(localPrompt('b'),/wardrobe=winter/)
assert.equal(castResolveWardrobe(castLibraryForChat(local,'a'),'actor-happy','winter').image.id,'coat')
assert.match(renderCastTags('<swarm-cast=actor-joy wardrobe=winter>hi</swarm-cast>',castLibraryForChat(local,'a'),s=>s),/coat/)
assert.throws(()=>castMergeWardrobe(localMember('actor'),'winter',castWardrobeView(localMember('actor'),'winter')),/hidden/)
assert.throws(()=>castMoveWardrobeAssets(localMember('actor'),'winter','other',{neutral:'neutral'}),/different wardrobe/)
assert.throws(()=>castWardrobeLifecycle(local,'actor','winter','hide'),/visibility changed/)
assert.deepEqual(cleanCastLibrary(local),local)
// A registry copy can still access an outfit hidden only in the source production.
assert.ok(castWardrobes(castRegistryCopyOutfit(local,'actor','winter','fork','Spare winter').members.find(m=>m.id==='fork')).some(row=>row.key==='spare-winter'))
const expanded=cleanCastLibrary({...local,groups:[...local.groups,{id:'four',name:'Four'}]})
const linkedFresh=castRegistryAttach(expanded,'actor','four','fresh','link');assert.equal(linkedFresh.members.find(m=>m.id==='fresh').hiddenWardrobes,undefined)
// Global archive and restore must not alter local visibility.
local=castWardrobeLifecycle(local,'linked','winter','archive','default')
assert.equal(castWardrobes(localMember('actor'))[1].archived,true)
assert.deepEqual(localMember('actor').hiddenWardrobes,['winter']);assert.equal(localMember('linked').preferredWardrobe,undefined)
local=castWardrobeLifecycle(local,'linked','winter','restore')
assert.doesNotMatch(localPrompt('a'),/wardrobe=winter/);assert.match(localPrompt('b'),/wardrobe=winter/)
local=castWardrobeLifecycle(local,'actor','winter','unhide')
assert.equal(localMember('actor').hiddenWardrobes,undefined);assert.equal(localMember('actor').preferredWardrobe,'other');assert.match(localPrompt('a'),/wardrobe=winter/)
local=castWardrobeLifecycle(local,'linked','winter','hide');assert.equal(localMember('actor').hiddenWardrobes,undefined)
// Global removal clears stale local visibility keys, so a newly created outfit is not hidden by accident.
local=castWardrobeLifecycle(local,'actor','winter','remove')
assert.equal(localMember('linked').hiddenWardrobes,undefined);assert.equal(localMember('actor').images.wjoy,undefined);assert.equal(localMember('fork').images.wjoy.id,'coat')
const dirty=structuredClone(before);dirty.members[0].hiddenWardrobes=['default','winter','winter','missing'];dirty.members[0].preferredWardrobe='winter';const clean=cleanCastLibrary(dirty);assert.deepEqual(clean.members[0].hiddenWardrobes,['winter']);assert.equal(clean.members[0].preferredWardrobe,undefined)
// A global replacement may not re-enable a cast's locally hidden outfit.
let fallback=castWardrobeLifecycle(before,'linked','other','hide');fallback=castWardrobeLifecycle(fallback,'actor','winter','archive','other');assert.equal(fallback.members.find(m=>m.id==='linked').preferredWardrobe,undefined);assert.equal(fallback.members.find(m=>m.id==='actor').preferredWardrobe,'other')
console.log('Cast-local visibility: independent hide/show, prompt/continuity exclusion, historical render, global archive/restore, fresh links, stale key cleanup, protected default and replacement fallback: PASS')
