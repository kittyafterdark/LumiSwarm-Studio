import assert from 'node:assert/strict'
import {cleanCastLibrary,castRegistryKey,castRegistryEntries,castRegistryReconcile,castRegistryAttach,castRegistryCopyOutfit,castRegistryCompatible,castWardrobeView,castWardrobes,castMergeWardrobe,castLibraryForChat,castResolveWardrobe,castPrompt,castCreateWardrobe,renderCastTags} from '../dist/frontend.js'
const source={id:'broad-k',groupId:'broad',name:'Katsuki',prefix:'katsuki',identityPrompt:'scar',images:{neutral:{id:'casual'},joy:{id:'casual-joy'}},defaultExpression:'neutral'}
const target={...source,id:'duo-k',groupId:'duo',prefix:'katsuki',presentation:'portrait',presentationSide:'right',crop:{enabled:true,x:22,y:30,zoom:1.4}}
let lib=cleanCastLibrary({groups:[{id:'broad',name:'Broad cast',inject:true},{id:'duo',name:'Duo',inject:true},{id:'third',name:'Third',inject:true}],members:[source,target],chatGroups:{a:'broad',b:'duo',c:'third'}})
const get=(id,l=lib)=>l.members.find(m=>m.id===id)
const add=castCreateWardrobe(get('broad-k'),'default',{name:'Recovery',outfit:'compression sleeve',mode:'fresh',inheritReference:false})
const view=castWardrobeView(add.member,add.key);view.images.neutral={id:'recovery-neutral',url:'/api/v1/images/recovery-neutral'}
const updated=castMergeWardrobe(add.member,add.key,view)
let next=structuredClone(lib);next.members[0]=updated;lib=castRegistryReconcile(lib,cleanCastLibrary(next))
assert.equal(castRegistryEntries(lib).length,2,'Matching names alone must not merge')
assert(castRegistryCompatible(get('duo-k'),get('broad-k')))
const old=structuredClone(get('duo-k'))
lib=castRegistryAttach(lib,'broad-k','duo','unused','link','duo-k')
assert.equal(castRegistryEntries(lib).length,1)
assert.equal(get('duo-k').id,old.id);assert.equal(get('duo-k').prefix,old.prefix);assert.deepEqual(get('duo-k').crop,old.crop);assert.equal(get('duo-k').presentation,'portrait');assert.equal(get('duo-k').presentationSide,'right')
assert.equal(castResolveWardrobe(castLibraryForChat(lib,'b'),'katsuki-neutral','recovery').image.id,'recovery-neutral')
assert.match(renderCastTags('<swarm-cast=katsuki-neutral>"Hi."</swarm-cast>',castLibraryForChat(lib,'b'),s=>s),/casual/)
assert.throws(()=>castRegistryAttach(lib,'broad-k','duo','dupe','link'),/already linked/)
lib=castRegistryAttach(lib,'duo-k','third','third-k','fork')
assert.equal(castRegistryEntries(lib).length,2);assert.notEqual(castRegistryKey(get('third-k')),castRegistryKey(get('duo-k')))
next=structuredClone(lib);next.members.find(m=>m.id==='duo-k').preferredWardrobe='recovery';next.members.find(m=>m.id==='duo-k').presentationSide='left';next.members.find(m=>m.id==='duo-k').identityPrompt='updated scar';next.members.find(m=>m.id==='duo-k').images.neutral={id:'new-casual',url:'/api/v1/images/new-casual'}
lib=castRegistryReconcile(lib,cleanCastLibrary(next));assert.equal(get('broad-k').images.neutral.id,'new-casual');assert.equal(get('broad-k').identityPrompt,'updated scar');assert.equal(get('broad-k').presentationSide,'auto');assert.equal(get('broad-k').preferredWardrobe,undefined);assert.equal(get('third-k').images.neutral.id,'casual');assert.match(castPrompt(castLibraryForChat(lib,'b')),/Preferred starting outfits.*katsuki wardrobe=recovery/);assert.doesNotMatch(castPrompt(castLibraryForChat(lib,'a')),/Preferred starting outfits/)
next=structuredClone(lib);next.members[0].identityPrompt='A';next.members[1].identityPrompt='B';assert.throws(()=>castRegistryReconcile(lib,next),/Conflicting edits/)
assert(!castRegistryCompatible(get('third-k'),get('broad-k')))
assert.throws(()=>castRegistryAttach(lib,'third-k','broad','unused','link','broad-k'),/different historical/)
lib=castRegistryCopyOutfit(lib,'broad-k','recovery','third-k','Second recovery');assert.equal(castWardrobeView(get('third-k'),'second-recovery').images.neutral.id,'recovery-neutral');assert.equal(get('third-k').images.neutral.id,'casual');assert.equal(castWardrobes(get('broad-k')).length,2)
assert.throws(()=>castRegistryCopyOutfit(lib,'broad-k','recovery','third-k','Second recovery'),/unique outfit/)
next=structuredClone(lib);next.members=next.members.filter(m=>m.id!=='broad-k');lib=castRegistryReconcile(lib,next);assert(!lib.stash?.length,'Remaining linked member retains identity');assert.equal(castRegistryKey(get('duo-k')),'broad-k')
next=structuredClone(lib);next.groups=next.groups.filter(g=>g.id!=='duo');next.members=next.members.filter(m=>m.groupId!=='duo');lib=castRegistryReconcile(lib,cleanCastLibrary(next));assert.equal(lib.stash.length,1);assert.equal(lib.stash[0].groupId,'');assert.equal(castWardrobeView(lib.stash[0],'recovery').images.neutral.id,'recovery-neutral');assert.equal(castRegistryEntries(lib).length,2);assert.equal(castResolveWardrobe(castLibraryForChat(lib,'b'),'katsuki-neutral','recovery'),undefined)
lib=castRegistryAttach(lib,lib.stash[0].id,'broad','return-k','link');assert.equal(lib.stash,undefined);assert.equal(castRegistryKey(get('return-k')),'broad-k');assert.equal(castWardrobeView(get('return-k'),'recovery').images.neutral.id,'recovery-neutral')
assert.equal(JSON.stringify(cleanCastLibrary(lib)),JSON.stringify(lib))
console.log('Cast Registry: migration, explicit linkage, stable packet keys, shared wardrobe/identity edits, isolated direction, fork, copy, conflict rejection, archive/relink: PASS')
