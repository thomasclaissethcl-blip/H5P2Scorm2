import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const resources=require('../src/html-singlefile-resources.js');
const files=Object.fromEntries(Array.from({length:207},(_,index)=>{
 const contents=Buffer.from(`contenu-${index}`);
 return [`h5p/content/${String(index).padStart(4,'0')}.txt`,{
  dir:false,_data:{uncompressedSize:contents.length},async:async()=>new Uint8Array(contents)
 }];
}));
const events=[];
const bundle=await resources.collect({files,onProgress:e=>events.push({...e})});
assert.equal(bundle.fileCount,207);
assert.ok(events.length>=40 && events.length<=101);
assert.equal(events.at(-1).completed,207);
assert.equal(events.at(-1).percent,100);
assert.ok(events.every(x=>x.total===207));
assert.ok(events.every((x,i)=>i===0||x.completed>events[i-1].completed));
assert.ok(events.every((x,i)=>i===0||x.percent>events[i-1].percent));
const empty=[];
await resources.collect({files:{},onProgress:e=>empty.push(e)});
assert.equal(empty.length,1);assert.equal(empty[0].percent,100);
await assert.rejects(()=>resources.collect({files:{'x.txt':{dir:false,async:async()=>{throw Error('lecture interrompue');}}}}),/lecture interrompue/);
assert.equal(typeof resources.render,'undefined');
console.log('Collecteur utilisé par le lecteur : progression monotone, zéro fichier, erreurs explicites et génération non interactive retirée.');
