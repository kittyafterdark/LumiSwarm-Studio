import assert from 'node:assert/strict'
import {cleanCastLibrary,castPrompt,renderCastTags,CAST_PRESENTATION_ENTRIES,CAST_PRESENTATION_CSS,castLibraryForChat} from '../dist/frontend.js'
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const input={activeGroupId:'g',inject:true,chatGroups:{chat:'g',other:'h'},groups:[
 {id:'g',name:'Crew',defaultPresentation:'vn-hero',defaultBackground:'plaza',backgrounds:[{key:'Plaza',name:'Evening <street>',id:'world1',aliases:['sidewalk','none','roof']},{key:'roof',name:'Roof',id:'world2'},{key:'plaza',id:'duplicate'},{key:'bad',id:'https://unsafe.test/x'},{key:'none',id:'forbidden'}]},
 {id:'h',name:'Other',defaultPresentation:'vn-hero',backgrounds:[{key:'plaza',id:'world3'}]}],members:[
 {id:'s',groupId:'g',name:'Shoto',prefix:'shoto',images:{joy:{id:'p1'},neutral:{id:'p2'}}},
 {id:'m',groupId:'g',name:'Mina',prefix:'mina',images:{joy:{id:'p3'}},presentation:'postcard-rebellion'},
 {id:'o',groupId:'g',name:'Other',prefix:'other',images:{joy:{id:'p4'}},presentation:'overlap-materia'},
 {id:'h-s',groupId:'h',name:'Shoto',prefix:'shoto',images:{joy:{id:'p5'}}}]}
const lib=cleanCastLibrary(input)
assert.deepEqual(lib.groups[0].backgrounds.map(bg=>[bg.key,bg.id,bg.aliases]),[['plaza','world1',['sidewalk']],['roof','world2',[]]])
assert.deepEqual(cleanCastLibrary(lib),lib,'persisted roundtrip')
const packet=(key='shoto-joy',bg='')=>`Before <swarm-cast=${key}${bg?' background='+bg:''}><font color="#72B9FF">"Speak."</font></swarm-cast> after.`
for(const [key,bg,id] of [['shoto-joy','plaza','world1'],['shoto-neutral','"sidewalk"','world1'],['mina-joy',"'roof'",'world2'],['shoto-joy','','world1'],['shoto-joy','unknown','world1']]){
 const html=renderCastTags(packet(key,bg),lib,esc)
 assert.match(html,new RegExp(`--cast-world:url\\(/api/v1/images/${id}\\)`))
 assert.match(html,/color:#72B9FF/)
 assert.equal((html.match(/Speak\./g)||[]).length,1)
 assert.ok(html.startsWith('Before ')&&html.endsWith(' after.'))
 assert.ok(!html.includes('<street>'))
 assert.equal(renderCastTags(html,lib,esc),html)
}
for(const [key,bg] of [['shoto-joy','none'],['other-joy','plaza']]){
 const html=renderCastTags(packet(key,bg),lib,esc);assert.doesNotMatch(html,/--cast-world:url/);assert.match(html,/Speak\./)
}
assert.match(renderCastTags(packet('shoto-joy','plaza'),castLibraryForChat(lib,'other'),esc),/images\/world3/)
const noDefault=cleanCastLibrary({...lib,groups:lib.groups.map(g=>({...g,defaultBackground:''}))})
assert.doesNotMatch(renderCastTags(packet('shoto-joy','missing'),noDefault,esc),/--cast-world:url/)
for(const bad of ['https://evil.test/x','gen:plaza','"a;bad"','"bad\" onerror=x"']){
 const raw=packet('shoto-joy',bad);assert.equal(renderCastTags(raw,lib,esc),raw,'unsupported grammar must not resolve arbitrary generation or URLs')
}
assert.match(castPrompt(lib),/Available saved scene keys: plaza, roof/)
assert.equal(CAST_PRESENTATION_ENTRIES.filter(e=>e.origin==='atelier').length,20)
assert.equal(CAST_PRESENTATION_ENTRIES.filter(e=>e.composition==='scene').length,8)
assert.equal(CAST_PRESENTATION_ENTRIES.filter(e=>e.origin==='atelier'&&e.composition==='overlap').length,10)
for(const key of ['corner-popout','angled-cutout'])assert.equal(CAST_PRESENTATION_ENTRIES.find(e=>e.id===key).composition,'panel')
assert.ok(!CAST_PRESENTATION_ENTRIES.some(e=>e.id==='vn-standee'))
assert.equal(cleanCastLibrary({groups:[{id:'g',defaultPresentation:'vn-standee'}]}).groups[0].defaultPresentation,'overlap-console')
assert.doesNotMatch(CAST_PRESENTATION_CSS,/data:image\/|\.lab-toolbar|\.card-footer/,'No gallery UI or sample art in production')
console.log('CAST WORLDS CONTRACT PASS: all 20 curated looks, scene scope, aliases, defaults, opt-out, rejected URLs/prompts, immutable dialogue and legacy migration')
