import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const ctx=vm.createContext({btoa,Uint8Array,console});ctx.globalThis=ctx;
vm.runInContext(fs.readFileSync('src/html-singlefile-resources.js','utf8'),ctx);
const r=ctx.H5PConverterModules.htmlSinglefileResources;
const input={
 'h5p/h5p.json':JSON.stringify({mainLibrary:'POC.Text'}),
 'h5p/content/content.json':JSON.stringify({text:'Bonjour'}),
 'h5p/content/image.png':'PNG',
 'player/main.bundle.js':'main',
 'player/frame.bundle.js':'frame',
 'player/styles/h5p.css':'@font-face{src:url(../fonts/demo.woff2)}',
 'player/fonts/demo.woff2':'FONT',
 'custom/custom.css':'h1{color:red}'
};
const files=Object.fromEntries(Object.entries(input).map(([k,v])=>[k,{dir:false,_data:{uncompressedSize:Buffer.byteLength(v)},async:async()=>new Uint8Array(Buffer.from(v))}]));
const b=await r.collect({files});
assert.equal(b.fileCount,8);assert.equal(b.totalBytes,Object.values(input).reduce((n,x)=>n+Buffer.byteLength(x),0));
for(const [key,val] of Object.entries(input))assert.equal(Buffer.from(b.records[key].base64,'base64').toString(),val);
assert.equal(typeof r.render,'undefined','La sortie non interactive obsolète doit être supprimée');
for(const bad of ['../escape.js','/etc/passwd','a\\b','a//b','a/%2e%2e/b','a/%2f/b'])assert.equal(r.safePath(bad),false,bad);
await assert.rejects(()=>r.collect({files:{'../bad':files['h5p/h5p.json']}}),/non sûr/);
await assert.rejects(()=>r.collect({files,maxBytes:5}),/volume/);
await assert.rejects(()=>r.collect({files,maxFiles:2}),/Trop de ressources/);
console.log('Conteneur monofichier : fichiers, limites, protection des chemins et ressources intégrées : OK');
