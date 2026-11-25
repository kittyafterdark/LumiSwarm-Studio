import assert from 'node:assert/strict'
import {CAST_ATMOSPHERES,CAST_PRESENTATION_ENTRIES,cleanCastAtmosphereSettings,castAtmosphereVisual,cleanCastLibrary,castRenderIslands,renderCastTags,castPrompt} from '../dist/frontend.js'
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const raw={activeGroupId:'g',inject:true,groups:[{id:'g',inject:true,defaultPresentation:'vn-hero',defaultBackground:'room',backgrounds:[{key:'room',id:'world'}]}],members:[{id:'actor',groupId:'g',prefix:'mina',name:'Mina',images:{neutral:{id:'sprite'}}}]}
const old=cleanCastLibrary(raw),settings=cleanCastAtmosphereSettings({enabled:true,intensity:70,actor:55})
assert.equal(old.groups[0].atmosphere,undefined)
const lib=cleanCastLibrary({...raw,groups:[{...raw.groups[0],atmosphere:settings}]})
assert.deepEqual(cleanCastLibrary(lib),lib)
const packet=(attr='')=>`Before <swarm-cast=mina-neutral background=room${attr?' '+attr:''}><font color="#ff90ca">"Hello."</font></swarm-cast> after.`
const base=renderCastTags(packet(),old,esc)
assert.equal(renderCastTags(packet(),lib,esc),base)
for(const attr of ['atmosphere=none','atmosphere=unknown'])assert.equal(renderCastTags(packet(attr),lib,esc),base)
assert.equal(renderCastTags(packet('atmosphere=moonlight'),old,esc),base)
for(const p of CAST_ATMOSPHERES.filter(p=>p.key!=='none')){
 const input=packet(`atmosphere="${p.key}"`),html=renderCastTags(input,lib,esc)
 assert.match(html,new RegExp(`data-cast-atmosphere="${p.key}"`));assert.match(html,/--cast-atmosphere-wash:linear-gradient/);assert.match(html,/--cast-world:url\(\/api\/v1\/images\/world\)/);assert.match(html,/--cast-atmosphere-actor:brightness/);assert.match(html,/--cast-atmosphere-scene:brightness\([\d.]+\) contrast\([\d.]+\)/);assert.match(html,/color:#ff90ca/);assert.equal((html.match(/Hello\./g)||[]).length,1);assert.match(castRenderIslands(input),new RegExp(`data-ss-cast-atmosphere="${p.key}"`));assert.ok(html.startsWith('Before ')&&html.endsWith(' after.'))
}
for(const p of CAST_PRESENTATION_ENTRIES){
 const candidate=cleanCastLibrary({...lib,members:[{...lib.members[0],presentation:p.id}]})
 const html=renderCastTags(packet('atmosphere=moonlight'),candidate,esc)
 assert.equal(html.includes('data-cast-atmosphere='),p.composition==='scene',p.id)
}
assert.equal(castRenderIslands('`'+packet('atmosphere=moonlight')+'`'),'`'+packet('atmosphere=moonlight')+'`')
assert.match(castPrompt(lib),/atmosphere=KEY/);assert.doesNotMatch(castPrompt(old),/atmosphere=KEY/)
assert.equal(castAtmosphereVisual('none',settings),null);assert.equal(castAtmosphereVisual('moonlight',{...settings,intensity:0}),null)
assert.equal(cleanCastAtmosphereSettings({intensity:900,actor:-30,transitions:'true',animations:true,colorA:'red; url(evil)'}).intensity,100)
assert.equal(cleanCastAtmosphereSettings({intensity:900,actor:-30,transitions:'true',animations:true,colorA:'red; url(evil)'}).actor,0)
const safe=castAtmosphereVisual('custom',{...settings,colorA:'#FFCC00',colorB:'red; url(evil)',actor:0});assert.match(safe.css,/#ffcc00/);assert.doesNotMatch(safe.css,/evil/);assert.match(safe.css,/brightness\(1\) saturate\(1\) sepia\(0\) hue-rotate\(0deg\)/);assert.equal(safe.animations,false);assert.equal(safe.transitions,false)
const moon=castAtmosphereVisual('moonlight',{...settings,intensity:100,actor:0});assert.match(moon.css,/--cast-atmosphere-scene:brightness\(0.49\) contrast\(1.23\)/);assert.match(moon.css,/--cast-atmosphere-actor:brightness\(1\).*contrast\(1\)/);
const bad=packet('atmosphere="x;style=evil"');assert.equal(renderCastTags(bad,lib,esc),bad)
console.log('Atmosphere presets, strict CSS values, original rendering, scene-only behavior, packet parsing and motion defaults: PASS')
