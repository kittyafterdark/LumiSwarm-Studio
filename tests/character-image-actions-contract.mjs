import assert from 'node:assert/strict'
import {studioCharacterImageAction} from '../dist/frontend.js'
const calls=[]
const fetcher=async(url,options={})=>{
  calls.push({url,options})
  if(url.endsWith('/gallery'))return {ok:true,json:async()=>[{image_id:'already'}]}
  if(url.endsWith('/gallery/link')) {
    const id=JSON.parse(options.body).image_id
    return {ok:id!=='failed',json:async()=>({error:'Failed to link'})}
  }
  if(url.startsWith('/api/v1/images/'))return {ok:true,blob:async()=>new Blob(['png'],{type:'image/png'})}
  if(url.endsWith('/avatar'))return {ok:true}
  throw Error('Unexpected URL')
}
assert.deepEqual(await studioCharacterImageAction('char/one',['already','new','new','failed'],'gallery',fetcher),{saved:['already','new'],failed:['failed']})
assert.equal(calls.filter(call=>call.url.endsWith('/gallery/link')).length,2)
assert.ok(calls.every(call=>call.options.credentials==='same-origin'))
assert.match(calls[0].url,/char%2Fone/)
await studioCharacterImageAction('char/one',['image-id'],'avatar',fetcher)
const upload=calls.at(-1)
assert.equal(upload.options.body.get('avatar').type,'image/png')
assert.equal(upload.options.headers,undefined,'Browser supplies the multipart boundary')
assert.equal(calls.at(-2).url,'/api/v1/images/image-id')
await assert.rejects(studioCharacterImageAction('', ['image'],'gallery',fetcher),/active character/)
await assert.rejects(studioCharacterImageAction('char', ['a','b'],'avatar',fetcher),/one output/)
await assert.rejects(studioCharacterImageAction('char',['a'],'gallery',async()=>({ok:false,json:async()=>({error:'Permission denied'})})),/Permission denied/)
await assert.rejects(studioCharacterImageAction('char',['a'],'avatar',async()=>({ok:true,blob:async()=>new Blob(['video'],{type:'video/mp4'})})),/not an image/)
console.log('character avatar upload, existing gallery links, deduplication and partial failures: ok')
