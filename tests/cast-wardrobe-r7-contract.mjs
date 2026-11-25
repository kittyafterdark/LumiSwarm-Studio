import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {CAST_PRESENTATION_ENTRIES,CAST_PRESENTATION_CSS,renderCastTags,cleanCastLibrary} from '../dist/frontend.js'

const generator=readFileSync(new URL('../scripts/build-cast-presets.py',import.meta.url),'utf8')
const studio=readFileSync(new URL('../src/studio/cast.ts',import.meta.url),'utf8')
const theme=readFileSync(new URL('../src/studio/styles.ts',import.meta.url),'utf8')
assert.equal(CAST_PRESENTATION_ENTRIES.length,50)
// The fixes must replace their original source rules, not create new layers.
for(const name of ['shonen-burst-figure','shonen-burst-balloon','tarot-arch-frame','synth-stage','open-horizon-rule','manga-figure-center','manga-floating-card','persona-card','versus-banner-dock','vhs-sub-floating']){
 const rules=CAST_PRESENTATION_CSS.match(new RegExp('\\.ss-cast-design \\.'+name+'\\{','g'))||[]
 assert.equal(rules.length,1,`One canonical ${name} rule`)
}
assert.match(generator,/def tailor\(selector:/)
assert.match(generator,/tailor\('\.shonen-burst-figure'/)
assert.match(generator,/cast-material-redesign\.css/)
assert.match(generator,/tailor\('\.synth-stage'/)
assert.match(generator,/tailor\('\.open-horizon-rule'/)
assert.match(generator,/tailor\('\.tarot-arch-frame'/)
const tarot=CAST_PRESENTATION_CSS.match(/\.ss-cast-design \.tarot-arch-frame::before\{([^}]*)\}/)?.[1]||''
assert.doesNotMatch(tarot,/THE BEWILDERED/,'No hardcoded emotion title')
const editorial=CAST_PRESENTATION_ENTRIES.find(item=>item.id==='editorial-magazine')
assert.ok(editorial)
assert.doesNotMatch(editorial.markup,/District Patrol Log/,'No invented roleplay-specific attribution')
assert.match(editorial.markup,/%CAST_EXPRESSION%/)
assert.ok(!CAST_PRESENTATION_ENTRIES.some(item=>item.id==='vn-standee'),'Retired by user selection')
const vn=CAST_PRESENTATION_ENTRIES.find(item=>item.id==='vn-hero')
assert.ok(vn?.markup.includes('vn-script'))
assert.doesNotMatch(vn.markup,/>Next</,'No false button affordance')
for(const id of ['chapter-tab','moonlit-halo','polaroid-side']){
 const entry=CAST_PRESENTATION_ENTRIES.find(item=>item.id===id)
 assert.ok(entry?.markup.includes('data-swarm-cast-dialogue="true"'))
 assert.equal((entry.markup.match(/data-cast-asset/g)||[]).length,1)
}
assert.match(studio,/function pickerCropEditor\(/)
assert.match(studio,/function refreshPickerCrop\(/)
assert.match(studio,/data-cast-picker-crop="enabled"/)
assert.match(studio,/member\.crop\.x=Math\.max\(0,Math\.min\(100/)
assert.match(studio,/refreshPickerCrop\(\);void persist\(\)\.catch\(report\)/)
assert.match(theme,/\.cast-picker-crop\{[^}]*var\(--ss-panel-hi\)/)
assert.match(theme,/\.cast-preset-preview\{[^}]*var\(--ss-canvas-bg\)/)
assert.match(theme,/\.dialog::backdrop\{background:color-mix\(in srgb,var\(--ss-canvas-bg\)/)
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const lib=cleanCastLibrary({activeGroupId:'g',groups:[{id:'g',name:'Group'}],members:[{id:'shoto',groupId:'g',name:'Shoto Todoroki',prefix:'Shoto',presentation:'shonen-burst',images:{neutral:{id:'test-image'}}}]})
const result=renderCastTags('<swarm-cast=Shoto-neutral> <font color="#FFC524">"Stay here."</font></swarm-cast>',lib,escape)
assert.equal((result.match(/data-cast-asset/g)||[]).length,1)
assert.equal((result.match(/data-swarm-cast-dialogue/g)||[]).length,1)
assert.match(result,/color:#FFC524/)
console.log('Cast Wardrobe R7 PASS: canonical composition fixes, metadata cleanup, locked references, themed crop editor, authored text/colors')
