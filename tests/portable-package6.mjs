import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({});ctx.globalThis=ctx;
vm.runInContext(fs.readFileSync('src/portable-package.js','utf8'),ctx);
const {copyH5p}=ctx.H5PConverterModules.portablePackage;
function bytes(t){return new Uint8Array(Buffer.from(t));}
const originals={
  'h5p.json':'{"title":"Original"}',
  'content/content.json':'{"answer":1}',
  'images/figure.png':bytes('PNG data 1'),
  'lib/sub/file.js':bytes('console.log(123);')
};
const fake=(value)=>({dir:false,async:async type=>{assert.equal(type,'uint8array');return typeof value==='string'?bytes(value):value;}});
const makeSource=(files)=>({files:Object.fromEntries(Object.entries(files).map(([k,v])=>[k,fake(v)]))});
function target(){const map=new Map();return {map,file:(k,v)=>map.set(k,v)};}
const out=target();
const meta={title:'Converti',language:'fr'};
const content={answer:2};
const result=await copyH5p({sourceZip:makeSource(originals),targetZip:out,h5pJson:meta,contentJson:content,safePath:x=>!x.includes('..')});
assert.equal(result.copied,2);
assert.equal(result.replaced,2);
assert.equal(result.total,4);
assert.equal(out.map.size,4);
assert.equal(Buffer.from(out.map.get('h5p/images/figure.png')).toString(),'PNG data 1');
assert.equal(Buffer.from(out.map.get('h5p/lib/sub/file.js')).toString(),'console.log(123);');
assert.deepEqual(JSON.parse(out.map.get('h5p/h5p.json')),meta);
assert.deepEqual(JSON.parse(out.map.get('h5p/content/content.json')),content);
assert.equal(out.map.get('h5p/h5p.json'),JSON.stringify(meta,null,2),'JSON metadata identique au lot 5.3');
assert.equal(out.map.get('h5p/content/content.json'),JSON.stringify(content),'JSON activite identique au lot 5.3');
assert.equal(originals['h5p.json'],'{"title":"Original"}','Original intact');
const rejected=target();
await assert.rejects(copyH5p({sourceZip:makeSource({...originals,'../escape.js':'bad'}),targetZip:rejected,h5pJson:meta,contentJson:content,safePath:x=>!x.includes('..')}),/non sûr/);
assert.equal(rejected.map.size,0,'Le chemin invalide doit etre refuse avant toute copie');
await assert.rejects(copyH5p({sourceZip:makeSource(originals),targetZip:target(),h5pJson:null,contentJson:content,safePath:()=>true}),/absentes/);
console.log('Lot 6.1: copie H5P identique, metadonnees reconstruites, archives sources intactes, chemin dangereux refuse.');
