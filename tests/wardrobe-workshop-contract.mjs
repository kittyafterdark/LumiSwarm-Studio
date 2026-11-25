import assert from 'node:assert/strict'
import {cleanCastLibrary,castWardrobes,castWardrobeView,castCreateWardrobe,castMergeWardrobe,castResolveWardrobe,expressionAlternateLabel,stageCueProject} from '../dist/frontend.js'
const lib=cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Crew',inject:true}],members:[{id:'actor',groupId:'crew',name:'Katsuki',prefix:'katsuki',referenceImageId:'old-ref',images:{neutral:{id:'casual-neutral'},joy:{id:'casual-joy'}},settings:{slots:[{label:'smug',direction:'smirk'}],generation:{prefix:'cowboy shot'},workshop:{overrides:{outfit:'black shirt',identity:'blond hair',checkpoint:'a.safetensors'},method:'anima'}}}]})
const base=lib.members[0], original=JSON.stringify(base)
let {member,key}=castCreateWardrobe(base,'default',{name:'Sleepwear',outfit:'sleepwear',mode:'fresh',inheritReference:false})
assert.equal(JSON.stringify(base),original)
assert.equal(key,'sleepwear');assert.deepEqual(Object.keys(castWardrobeView(member,key).images),[])
assert.equal(castWardrobeView(member,key).referenceImageId,'');assert.equal(castWardrobeView(member,key).settings.workshop,undefined)
assert.ok(castWardrobeView(member,key).settings.slots.some(s=>s.label==='smug'))
assert.equal(castWardrobes(member)[1].outfitPrompt,'sleepwear')
const alt=expressionAlternateLabel('joy',['joy','joy-alt-1']);assert.equal(alt,'joy-alt-2')
const view=castWardrobeView(member,key);view.images.joy={id:'sleep-joy',url:'/api/v1/images/sleep-joy'};view.images['joy-alt-1']={id:'sleep-joy-alt',url:'/api/v1/images/sleep-joy-alt'};view.settings.workshop={overrides:{outfit:'blue pajamas',identity:'blond hair',stack:[]},method:''}
member=castMergeWardrobe(member,key,view);lib.members[0]=member
const reloaded=cleanCastLibrary(lib);assert.equal(castResolveWardrobe(reloaded,'katsuki-joy','default').image.id,'casual-joy');assert.equal(castResolveWardrobe(reloaded,'katsuki-joy',key).image.id,'sleep-joy');assert.equal(castResolveWardrobe(reloaded,'katsuki-joy-alt-1',key).image.id,'sleep-joy-alt')
assert.equal(castWardrobeView(reloaded.members[0],key).settings.workshop.overrides.outfit,'blue pajamas');assert.equal(castWardrobeView(reloaded.members[0],'default').settings.workshop.overrides.outfit,'black shirt')
let copied=castCreateWardrobe(reloaded.members[0],key,{name:'Variant set',outfit:'other',mode:'settings',inheritReference:false});assert.deepEqual(Object.keys(castWardrobeView(copied.member,copied.key).images),[]);assert.equal(castWardrobeView(copied.member,copied.key).settings.workshop.overrides.outfit,undefined);assert.equal(castWardrobeView(copied.member,copied.key).settings.workshop.overrides.identity,'blond hair')
let duplicate=castCreateWardrobe(reloaded.members[0],key,{name:'Copy',outfit:'other',mode:'copy',inheritReference:true});assert.equal(castWardrobeView(duplicate.member,duplicate.key).images.joy.id,'sleep-joy');assert.notEqual(castWardrobes(duplicate.member).find(w=>w.key===key).slots.joy,castWardrobes(duplicate.member).find(w=>w.key===duplicate.key).slots.joy)
const edit=castWardrobeView(duplicate.member,duplicate.key);edit.images.joy={id:'copy-joy',url:'/api/v1/images/copy-joy'};duplicate.member=castMergeWardrobe(duplicate.member,duplicate.key,edit);assert.equal(castWardrobeView(duplicate.member,key).images.joy.id,'sleep-joy')
assert.throws(()=>castCreateWardrobe(member,key,{name:'Sleepwear',outfit:'',mode:'fresh',inheritReference:false}),/unique/)
const raw='Before.\n\n[[atmosphere: rain intensity=70]]\n\nAfter.\n\n<stage-fx effect="sparkles" target="Shōto" />\n\nEnd.'
const render=stageCueProject(raw,'render'),prompt=stageCueProject(raw,'prompt');assert.equal((render.match(/data-ss-stage-cue=/g)||[]).length,2);assert.doesNotMatch(prompt,/atmosphere|stage-fx/);assert.match(prompt,/Before\.[\s]+After\.[\s]+End\./);assert.equal(stageCueProject(render,'render'),render)
for(const protectedContent of ['```xml\n[[atmosphere: rain]]\n```','<div>\n\n[[atmosphere: rain]]\n\n</div>','<!--\n\n[[stage-fx: magic]]\n\n-->','    [[stage-fx: magic]]','> [[stage-fx: magic]]','[[stage-fx: magic','[[stage-fx: magic onclick=x]]','<swarm-cast=katsuki-joy>\n\n[[stage-fx: magic]]\n\n</swarm-cast>'])for(const mode of ['render','prompt'])assert.equal(stageCueProject(protectedContent,mode),protectedContent)
console.log('Independent wardrobe creation, custom directions, reference isolation, named alts, copied settings and artwork, cue projection/context protection: PASS')
