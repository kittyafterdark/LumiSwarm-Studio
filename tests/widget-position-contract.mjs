import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { runInNewContext } from 'node:vm'
import { JSDOM } from 'jsdom'
const dom = new JSDOM('', {url:'https://studio.test'})
const source = await readFile(new URL('../src/miniplayer/surface.ts',import.meta.url),'utf8')
const key='swarm-studio-miniplayer-position-v1'
const api=runInNewContext(stripTypeScriptTypes(source)+ '; ({ readMiniplayerPosition, persistNativeMiniplayerPosition })', {
  window:dom.window,document:dom.window.document,MINIPLAYER_POSITION_STORAGE_KEY:key,
})
let position={x:42,y:137},drag,off=0
const widget={getPosition:()=>position,onDragEnd:handler=>{drag=handler;return()=>{off++;drag=null}}}
const stop=api.persistNativeMiniplayerPosition(widget)
drag(position)
assert.deepEqual(JSON.parse(JSON.stringify(api.readMiniplayerPosition())),position)
position={x:201,y:311}
dom.window.dispatchEvent(new dom.window.Event('pagehide'))
assert.deepEqual(JSON.parse(dom.window.localStorage.getItem(key)),position)
stop()
assert.equal(off,1)
const secondWidget={getPosition:()=>position,onDragEnd:()=>()=>{}}
const stopSecond=api.persistNativeMiniplayerPosition(secondWidget)
assert.deepEqual(JSON.parse(JSON.stringify(api.readMiniplayerPosition())),{x:201,y:311})
stopSecond()
dom.window.localStorage.setItem(key,'{"x":"bad","y":24}')
assert.equal(api.readMiniplayerPosition(),undefined)
dom.window.localStorage.setItem(key,'bad json')
assert.equal(api.readMiniplayerPosition(),undefined)
assert.doesNotThrow(()=>api.persistNativeMiniplayerPosition({})())
dom.window.close()
console.log('native widget drag/pagehide persistence, refresh restore and invalid-storage recovery: ok')
