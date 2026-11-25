import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const shared=await readFile(new URL('../src/state/cast.ts',import.meta.url),'utf8')
const subset=shared.slice(shared.indexOf('type CastAtmosphereKey'),shared.indexOf('interface StudioCastGroup'))+'\n'+shared.slice(shared.indexOf('function castDialogue('),shared.indexOf('// Recover only Studio'))
const js=stripTypeScriptTypes(subset,{mode:'transform'})
const parser=vm.runInNewContext(js+'\n({castRenderIslands})',{btoa,TextEncoder,Buffer})
const transform=parser.castRenderIslands
const braille='\u2800'
const packets=[
`<swarm-cast=Shoto-neutral><font${braille}color="#599CE3">"The bike lane is clear."</font></swarm-cast>`,
`<swarm-cast=Shoto-approval>"I would rather walk beside you."</swarm-cast>`,
`<swarm-cast=Shoto-amusement>"That's your microwave."</swarm-cast>`]
const source=`Katsuki's boots kept time. ${packets[0]} Shoto brushed his wrist, then withdrew. ${packets[1]} The train arrived. ${packets[2]} Katsuki looked away.`
const html=transform(source)
assert.equal((html.match(/data-ss-cast-slot="1"/g)||[]).length,3)
assert.ok(!html.includes('<swarm-cast='))
assert.ok(html.indexOf('Katsuki\'s boots')<html.indexOf('data-ss-cast-index="0"'))
assert.ok(html.indexOf('data-ss-cast-index="0"')<html.indexOf('Shoto brushed'))
assert.ok(html.indexOf('Shoto brushed')<html.indexOf('data-ss-cast-index="1"'))
assert.ok(html.indexOf('The train arrived')<html.indexOf('data-ss-cast-index="2"'))
assert.ok(html.endsWith('Katsuki looked away.'))
assert.equal(transform(html),html,'render preprocessing twice must be idempotent')
const encoded=[...html.matchAll(/data-ss-cast-packet="([\w-]+)"/g)].map(m=>Buffer.from(m[1],'base64url').toString())
assert.ok(encoded[0].includes('<font color="#599CE3">'),'braille must normalize only the packet body')
assert.equal(source.split(packets[0])[0], html.slice(0,html.indexOf('<span')),'preserve bytes before first packet')
const control='<!-- MULTI_BRANCH_UI_START --><payload>1|@risk|choose this</payload><!-- MULTI_BRANCH_UI_END -->'
assert.ok(transform(source+control).endsWith(control),'foreign extension payload must remain intact')
const incomplete=`Intro ${packets[0]} Outro <swarm-cast=Shoto-approval><font color="#599CE3">"Still typing`
const staged=transform(incomplete)
assert.ok(staged.includes('Outro '));assert.ok(!staged.includes('Still typing'))
assert.equal((staged.match(/data-ss-cast-slot/g)||[]).length,1)
assert.equal(transform('Ordinary narration without tags'), 'Ordinary narration without tags')
const continuation=' he said quietly. <font color="#599CE3">"I was waiting for you."</font> Another voice answered: <font color="#ffc0cb">"Right."</font>'
const splitSpeech='<swarm-cast=Shoto-neutral><font color="#599CE3">"No,"</font></swarm-cast>'+continuation
const splitProjection=transform(splitSpeech)
assert.ok(splitProjection.endsWith(continuation),'Colored inline continuation, other speakers, and narration must be preserved byte-for-byte')
assert.equal((splitProjection.match(/data-ss-cast-slot="1"/g)||[]).length,1,'Inline dialogue must not create another card')
assert.equal(transform(continuation),continuation,'Plain colored prose is outside the Cast renderer')
assert.match(transform('<swarm-cast=Shoto-neutral background=room atmosphere=moonlight>"Come inside."</swarm-cast>'),/data-ss-cast-atmosphere="moonlight"/)
assert.doesNotMatch(transform('<swarm-cast=Shoto-neutral atmosphere=not-a-palette>"Hello."</swarm-cast>'),/data-ss-cast-atmosphere=/)
assert.equal(transform('```html\n'+packets[1]+'\n```'),'```html\n'+packets[1]+'\n```','no conversion inside code fences')
console.log('CAST ISLAND CONTRACT PASS: exact source order, braille color, multi-packet, foreign controls, streaming partial, idempotence')
