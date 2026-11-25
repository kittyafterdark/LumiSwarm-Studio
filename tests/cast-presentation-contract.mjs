import assert from 'node:assert/strict'
import {
 CAST_PRESENTATION_ENTRIES, CAST_COMPOSITIONS, CAST_PRESENTATION_CSS,
 cleanCastLibrary, renderCastTags,
} from '../dist/frontend.js'

const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]))
assert.equal(CAST_PRESENTATION_ENTRIES.length,50,'30 retained + 20 curated looks')
assert.equal(new Set(CAST_PRESENTATION_ENTRIES.map(entry=>entry.id)).size,50)
assert.deepEqual(CAST_PRESENTATION_ENTRIES.filter(entry=>entry.origin==='approved').map(entry=>entry.id),['chapter-tab','moonlit-halo','polaroid-side'])
for(const group of CAST_COMPOSITIONS) assert.ok(CAST_PRESENTATION_ENTRIES.some(entry=>entry.composition===group.id),group.name)
assert.match(CAST_PRESENTATION_CSS,/\.ss-cast-design \.moonlit-portrait/)
assert.match(CAST_PRESENTATION_CSS,/\.ss-cast-design .*\.manga-core/)
assert.match(CAST_PRESENTATION_CSS,/\.ss-cast-design \.atelier-curated \.vn-script/)
assert.doesNotMatch(CAST_PRESENTATION_CSS,/\n\s*body\s*\{/,'Doctype global CSS never enters host')

for(const preset of CAST_PRESENTATION_ENTRIES){
 const library=cleanCastLibrary({activeGroupId:'crew',groups:[{id:'crew',name:'Actors',defaultPresentation:preset.id}],members:[{id:'hero',groupId:'crew',name:'Test <script> Hero',prefix:'Hero',images:{confusion:{id:'portrait-image'}},presentation:preset.id,crop:{enabled:true,x:30,y:70,zoom:1.2}}]})
 assert.equal(library.groups[0].defaultPresentation,preset.id,`Stored cast default: ${preset.id}`)
 assert.equal(library.members[0].presentation,preset.id,`Stored override: ${preset.id}`)
 const markup=renderCastTags('<swarm-cast=Hero-confusion> <font color="#599CE3">"Your neck is red."</font></swarm-cast>',library,escape)
 assert.match(markup,new RegExp(`data-cast-preset="${preset.id}"`))
 assert.equal((markup.match(/data-swarm-cast-dialogue/g)||[]).length,1,preset.id+' quote slot')
 assert.equal((markup.match(/data-cast-asset/g)||[]).length,1,preset.id+' image slot')
 assert.equal((markup.match(/Your neck is red\./g)||[]).length,1,preset.id+' original dialogue')
 assert.ok(!markup.includes('<script>'),preset.id+' escaped member name')
 assert.ok(!markup.includes('<font'),preset.id+' consumed font source')
 assert.match(markup,/color:#599CE3/,preset.id+' authored quote color')
 assert.equal(renderCastTags(markup,library,escape),markup,preset.id+' no double replacement')
}
console.log('Cast composition catalog PASS: 50 named styles, storage round trips, 8 families, one trusted image/quote, safe HTML, authored font colors and legacy idempotence')
