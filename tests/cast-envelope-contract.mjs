import assert from 'node:assert/strict'
import {cleanCastLibrary,renderCastTags,castPrompt} from '../dist/frontend.js'
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const library=cleanCastLibrary({activeGroupId:'g',inject:true,groups:[{id:'g',name:'Crew'}],members:[
 {id:'shoto',groupId:'g',name:'Shoto',prefix:'Shoto',presentation:'portrait',images:{neutral:{id:'portrait-a'}}},
 {id:'katsuki',groupId:'g',name:'Katsuki',prefix:'Katsuki',presentation:'story',images:{neutral:{id:'portrait-b'}}}
]})
const prompt=castPrompt(library)
assert.match(prompt,/closing <\/swarm-cast> is ALWAYS mandatory/)
assert.match(prompt,/<swarm-cast=Shoto-neutral><font color="#599CE3">/)
const sentence='"He did not ask for permission."'
const tag=content=>`<swarm-cast=Shoto-neutral>${content}</swarm-cast>`
const out=renderCastTags(`Earlier. ${tag(`<font color="#599CE3">${sentence}</font>`)} Then Katsuki whispered "Wrong."`,library,escape)
assert.equal(out.match(/data-swarm-cast-dialogue/g)?.length,1,'One caption')
assert.match(out,/color:#599CE3/)
assert.match(out,/“He did not ask for permission.”/)
assert.match(out,/Then Katsuki whispered "Wrong\."/)
assert.doesNotMatch(out,/<\/swarm-cast>|<font/i,'Original delimiters and wrapper consumed')
assert.equal(renderCastTags(out,library,escape),out,'Idempotent')
for(const body of [
 '"Dialogue."', '\n"Dialogue."\n',
 '<font color="#599CE3">"Dialogue."</font>',
 '<font color=\'#FFC524\'>"Dialogue."</font>',
 '“A dialogue\nwith a deliberate break.”',
]){
 const result=renderCastTags(tag(body),library,escape)
 assert.equal((result.match(/data-swarm-cast-dialogue/g)||[]).length,1,'One caption for bounded packet')
 const caption=result.match(/data-swarm-cast-dialogue[^>]*>([^<]*)</)?.[1] || ''; assert.match(caption,/dialogue/i,'Bounded body is the only caption')
 assert.doesNotMatch(result,/<\/swarm-cast>/)
}
const tandem=renderCastTags(`${tag('"First."')}<swarm-cast=Katsuki-neutral>"Second."</swarm-cast>`,library,escape)
assert.equal((tandem.match(/data-swarm-cast-dialogue/g)||[]).length,2)
assert.equal((tandem.match(/First\./g)||[]).length,1)
assert.equal((tandem.match(/Second\./g)||[]).length,1)
const escaped=renderCastTags('&lt;swarm-cast=Shoto-neutral&gt;<font color="#599CE3">"Escaped."</font>&lt;/swarm-cast&gt;',library,escape)
assert.match(escaped,/data-swarm-cast-dialogue/,'Escaped source packets decoded')
assert.doesNotMatch(escaped,/&lt;\/swarm-cast&gt;/)
const mixed=renderCastTags('<swarm-cast=Shoto-neutral> "Unclosed." Then a paragraph. <swarm-cast=Katsuki-neutral>"Bounded."</swarm-cast>',library,escape)
assert.match(mixed,/<swarm-cast=Shoto-neutral>/,'Unclosed opening tag is untouched')
assert.match(mixed,/“Bounded.”/)
assert.equal((mixed.match(/data-swarm-cast-dialogue/g)||[]).length,1,'Only closed packet mounts')
const unknown=tag('"Safe."').replace('Shoto-neutral','Unknown-neutral')
assert.equal(renderCastTags(unknown,library,escape),unknown,'Unknown packet retained')
for(const code of ['`'+tag('"Literal."')+'`','```xml\n'+tag('"Literal."')+'\n```']){
 assert.equal(renderCastTags(code,library,escape),code,'Code examples are left alone')
}
const braille='<swarm-cast=Shoto-neutral><font⠀color="#599CE3">"The⠀lighting⠀on⠀this⠀stretch⠀is⠀better."</font></swarm-cast>'
const clean=renderCastTags(braille,library,escape)
assert.match(clean,/color:#599CE3/)
assert.match(clean,/The lighting on this stretch is better\./)
assert.equal((clean.match(/data-swarm-cast-dialogue/g)||[]).length,1)
assert.equal(renderCastTags('<swarm-cast=Shoto-neutral>"Incomplete."',library,escape),'<swarm-cast=Shoto-neutral>"Incomplete."')
console.log('Strict Cast packet PASS: close-tag ownership, braille colors, code, unknowns, escaped source, incomplete inert and no duplicate text')
