import assert from 'node:assert/strict'
import { editWand, editCombineSelection, editMorph, editFeather, editClearPixels, editDespill, editPushPixels } from '../dist/frontend.js'
const w=7,h=7,rgba=new Uint8ClampedArray(w*h*4)
const at=(x,y)=>y*w+x
const pixel=(x,y,c)=>rgba.set(c,at(x,y)*4)
for(let y=0;y<h;y++)for(let x=0;x<w;x++)pixel(x,y,[200,100,150,255])
pixel(1,1,[0,220,70,255]);pixel(2,1,[0,218,72,255]);pixel(5,5,[0,220,70,255]);pixel(0,0,[0,220,70,0])
const contiguous=editWand(rgba,w,h,1,1,5,true), global=editWand(rgba,w,h,1,1,5,false)
assert.equal(contiguous.filter(Boolean).length,2);assert.equal(global.filter(Boolean).length,3);assert.equal(global[0],0)
assert.deepEqual(editCombineSelection(contiguous,global,'add'),global)
assert.equal(editCombineSelection(global,contiguous,'subtract').filter(Boolean).length,1)
assert.equal(editMorph(contiguous,w,h,true).filter(Boolean).length,8)
assert.equal(editMorph(contiguous,w,h,false).filter(Boolean).length,0)
const feather=editFeather(contiguous,w,h,1);assert.ok(feather[at(1,1)]>0&&feather[at(1,1)]<255);assert.ok(feather[at(1,2)]>0)
const copy=rgba.slice();editClearPixels(copy,contiguous);assert.equal(copy[at(1,1)*4+3],0);assert.deepEqual(copy.slice(at(5,5)*4,at(5,5)*4+4),rgba.slice(at(5,5)*4,at(5,5)*4+4))
const spill=new Uint8ClampedArray(9*9*4);for(let y=1;y<8;y++)for(let x=1;x<8;x++)spill.set([30,190,120,255],(y*9+x)*4)
const alpha=Array.from(spill).filter((_,i)=>i%4===3);editDespill(spill,9,9,new Uint8Array(81),'green',1)
assert.equal(spill[(1*9+1)*4+1],120);assert.equal(spill[(4*9+4)*4+1],190);assert.deepEqual(Array.from(spill).filter((_,i)=>i%4===3),alpha)
console.log('Studio Edit pixel primitives PASS: contiguous/global selection, mask combination, grow/shrink/feather, alpha-only deletion, edge-only despill')

// Push moves color and alpha together; unaffected pixels are bit-identical.
const warp=new Uint8ClampedArray(21*21*4);for(let y=0;y<21;y++)for(let x=0;x<10;x++)warp.set([240,80,150,255],(y*21+x)*4)
const unwarped=warp.slice();editPushPixels(warp,21,21,10,10,3,0,6,1)
assert.deepEqual(warp.slice(0,4),unwarped.slice(0,4));assert.ok(warp[(10*21+10)*4+3]>0)
for(let k=0;k<warp.length;k+=4)if(warp[k+3])assert.deepEqual(Array.from(warp.slice(k,k+3)),[240,80,150])
const noOp=warp.slice();editPushPixels(warp,21,21,10,10,0,0,6,1);assert.deepEqual(warp,noOp)
console.log('Liquify push PASS: bounded warp, unchanged exterior, alpha-aware interpolation, no-op')
