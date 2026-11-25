import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {stripTypeScriptTypes} from 'node:module';
import {deflateRawSync} from 'node:zlib';
const source=await readFile(new URL('../src/studio/expressions.ts',import.meta.url),'utf8');
const helper=source.slice(source.indexOf('async function unpackExpressionImages'),source.indexOf('const EXPRESSION_BG_MODEL'));
const unpack=new Function(stripTypeScriptTypes(helper,{mode:'transform'})+';return unpackExpressionImages;')();
const bytes=Buffer.from([137,80,78,71,13,10,26,10,1,2,3]);
const crc32=b=>{let crc=0xffffffff;for(const byte of b){crc^=byte;for(let n=0;n<8;n++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;};
function zip(method,declared=bytes.length){
 const name=Buffer.from('expressions/neutral.png'),data=method?deflateRawSync(bytes):bytes,local=Buffer.alloc(30),central=Buffer.alloc(46),end=Buffer.alloc(22);
 local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(method,8);local.writeUInt32LE(crc32(bytes),14);local.writeUInt32LE(data.length,18);local.writeUInt32LE(declared,22);local.writeUInt16LE(name.length,26);
 central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(method,10);central.writeUInt32LE(crc32(bytes),16);central.writeUInt32LE(data.length,20);central.writeUInt32LE(declared,24);central.writeUInt16LE(name.length,28);
 end.writeUInt32LE(0x06054b50);end.writeUInt16LE(1,8);end.writeUInt16LE(1,10);end.writeUInt32LE(central.length+name.length,12);end.writeUInt32LE(local.length+name.length+data.length,16);
 return new File([Buffer.concat([local,name,data,central,name,end])],'expressions.zip');
}
for(const method of [0,8]){const out=await unpack([zip(method)]);assert.equal(out.length,1);assert.equal(out[0].name,'neutral.png');assert.equal(out[0].type,'image/png');assert.deepEqual(new Uint8Array(await out[0].arrayBuffer()),new Uint8Array(bytes));}
await assert.rejects(()=>unpack([zip(8,2)]),/expands beyond/);
await assert.rejects(()=>unpack([zip(0,2)]),/length mismatch/);
console.log('Expression ZIP stored/deflated import, owned ArrayBuffer bytes and declared-size rejection: PASS');
