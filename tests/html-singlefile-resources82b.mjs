import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const sandbox=vm.createContext({btoa,Uint8Array,console});sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('src/html-singlefile-resources.js','utf8'),sandbox);
const api=sandbox.H5PConverterModules.htmlSinglefileResources;
const tinyPng=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/NwAAAABJRU5ErkJggg==','base64');
const inputs={
 'h5p/h5p.json':Buffer.from('{"mainLibrary":"H5P.MultiChoice"}'),
 'h5p/content/content.json':Buffer.from('{"image":{"path":"images/photo.png"}}'),
 'h5p/FontAwesome-4.5/fontawesome-webfont.svg':Buffer.from('<svg></svg>'),
 'h5p/content/images/photo.png':tinyPng,
 'player/main.bundle.js':Buffer.from('x'),
 'player/frame.bundle.js':Buffer.from('x'),
 'player/styles/h5p.css':Buffer.from('body{}'),
};
const files=Object.fromEntries(Object.entries(inputs).map(([k,b])=>[k,{dir:false,async:async()=>new Uint8Array(b)}]));
const bundle=await api.collect({files});
const html=api.render({title:'Recette images 8.2b',bundle});
assert.match(html,/Images du contenu detectees/);
assert.match(html,/check-progress/);
assert.match(html,/imagePaths=paths.filter\(p=>\/\^h5p\\\/content\\\//);
assert.match(html,/await new Promise\(resolve=>setTimeout\(resolve,0\)\)/);
const out='/mnt/data/h5p_lot82b_work/PROTOTYPE_TEST_IMAGES_82B.html';
fs.writeFileSync(out,html);
console.log('Correctif 8.2b : images du contenu prioritaires, verification progressive et affichage du diagnostic');
