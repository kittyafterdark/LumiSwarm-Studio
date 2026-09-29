import assert from 'node:assert/strict'
import { studioNativePreset, upsertStudioNativePreset, nativeImageGenAvailable } from '../dist/frontend.js'
const input = {kind:'main', name:'Studio', prompt:'portrait', negativePrompt:'blur', seed:42, parameters:{width:1024}, loras:['private']}
assert.deepEqual(Object.keys(studioNativePreset(input)).sort(), ['id','kind','mode','name','negativePrompt','prompt'])
assert.throws(() => studioNativePreset({...input, kind:'character'}), /active character/)
assert.throws(() => studioNativePreset({...input, kind:'persona'}), /Unsupported/)
assert.equal(await nativeImageGenAvailable(async () => { throw Error('offline') }), false)
assert.equal(await nativeImageGenAvailable(async () => ({ok:true, json:async()=>({})})), false)
assert.equal(await nativeImageGenAvailable(async () => ({ok:true, json:async()=>({type:'lumiverse_image_gen_config',version:1})})), true)
const presets = new Map([['unrelated',{name:'Keep me'}]])
const calls=[]
const fetcher=async (url, options) => {
  calls.push({url, body:JSON.parse(options.body)})
  const body = JSON.parse(options.body)
  if (url.endsWith('/import')) {
    assert.equal(body.settings, undefined)
    for (const preset of body.presets) presets.set(preset.id,preset)
    return {ok:true, json:async()=>({imported:{presets:1}, errors:[]})}
  }
  return {ok:true}
}
const first = await upsertStudioNativePreset(input, fetcher)
const second = await upsertStudioNativePreset({...input, prompt:'updated'}, fetcher)
assert.equal(first.id,second.id)
assert.equal(presets.size,2)
assert.equal(presets.get(first.id).prompt,'updated')
assert.deepEqual(presets.get('unrelated'), {name:'Keep me'})
await upsertStudioNativePreset({...input,kind:'character',characterId:'char/1',lookId:'casual'},fetcher)
assert.equal(calls.at(-1).url,'/api/v1/image-gen/preset-bindings/character/char%2F1')
assert.match(calls.at(-1).body.preset_id,/casual$/)
await assert.rejects(upsertStudioNativePreset(input,async()=>({ok:false,json:async()=>({error:'Rejected'})})),/Rejected/)
await assert.rejects(upsertStudioNativePreset(input,async()=>({ok:true,json:async()=>({imported:{presets:0},errors:['bad field']})})),/bad field/)
await assert.rejects(upsertStudioNativePreset({...input,kind:'character',characterId:'char'},async url=>url.endsWith('/import')?{ok:true,json:async()=>({imported:{presets:1}})}:{ok:false}),/saved, but/)
console.log('native Image Gen contract: ok')
