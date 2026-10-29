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
const html=r.render({title:'<script>alert(1)</script>',bundle:b});
assert.ok(html.startsWith('<!doctype html>'));
assert.ok(html.includes('dataUrl'));
assert.ok(html.includes('ne lance aucune activité H5P'));
assert.ok(!html.includes('<title><script>'));
assert.ok(!html.includes('src="./player/main.bundle.js"'));
assert.equal(r.normalizeLookup('./h5p/content/test.png?x=1'),'h5p/content/test.png');
assert.equal(r.resolveRelative('../fonts/demo.woff2','player/styles/h5p.css'),'player/fonts/demo.woff2');
assert.equal(r.resolveRelative('../../../bad.js','player/styles/h5p.css'),null);
assert.equal(r.resolveRelative('https://evil.test/x.js','player/styles/h5p.css'),null);
for(const bad of ['../escape.js','/etc/passwd','a\\b','a//b','a/%2e%2e/b','a/%2f/b'])assert.equal(r.safePath(bad),false,bad);
await assert.rejects(()=>r.collect({files:{'../bad':files['h5p/h5p.json']}}),/non sûr/);
await assert.rejects(()=>r.collect({files,maxBytes:5}),/volume/);
await assert.rejects(()=>r.collect({files,maxFiles:2}),/Trop de ressources/);
const malicious={...b,records:{...b.records,'x.json':{mime:'application/json',size:17,base64:'PC9zY3JpcHQ+'}}};
const safe=r.render({bundle:malicious});
assert.equal((safe.match(/<script/g)||[]).length,2,'Aucun script injecte dans le document');
assert.match(safe,/resource-container-only/);
fs.mkdirSync('/mnt/data/h5p_lot82_work',{recursive:true});
fs.writeFileSync('/mnt/data/h5p_lot82_work/prototype_qa.html',r.render({bundle:b,title:'Recette ressources 8.2'}));
console.log('Lot 8.2 : conteneur binaire, refus chemins dangereux et depassements, HTML unique de diagnostic OK');
