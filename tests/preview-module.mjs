import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={ console, TextEncoder, TextDecoder, crypto:globalThis.crypto,
  addEventListener(){},removeEventListener(){} };
context.globalThis=context;
vm.createContext(context);
for(const path of ['src/preview-frame.js','src/h5p-preview.js'])
  vm.runInContext(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),context,{filename:path});
const {preview,previewFrame}=context.H5PConverterModules;
const markup=previewFrame.documentSource();
for(const part of ['sandbox','connect-src',"frame-src", "form-action"]){
  if(part==='sandbox')continue;assert(markup.includes(part));
}
assert(!markup.includes('allow-same-origin'));
for(const bad of ['../evil','player/main.bundle.js','custom/custom.css','/absolute','one/../../evil','one\\two'])
  assert(!preview.safePath(bad),'Chemin accepté : '+bad);
for(const good of ['content/content.json','H5P.MultipleChoice-1.14/library.json','images/photo.png'])
  assert(preview.safePath(good),'Chemin refusé : '+good);
const buf=text=>new TextEncoder().encode(text).buffer;
const file={dir:false,async:async type=>{assert.equal(type,'arraybuffer');return buf('data');}};
const files=await preview.gather({files:{'content/content.json':file}},
  {'content/content.json':'{"test":true}',__css:'.h5p-content{color:red}'},
  {'/dist/main.bundle.js':buf('script')});
assert.equal(files.length,3);
assert.equal(files[0].path,'h5p/content/content.json');
assert.equal(new TextDecoder().decode(files[0].data),'{"test":true}');
assert.equal(files[1].path,'player/main.bundle.js');
assert.equal(files[2].path,'custom/custom.css');
let urls=[];
const loader=preview.playerLoader({version:'3.8.2',
 paths:['/dist/main.bundle.js','/dist/frame.bundle.js','/dist/styles/h5p.css'],
 fetcher:async url=>{urls.push(url);return {ok:true,arrayBuffer:async()=>buf('ok')}}});
assert.equal(Object.keys(await loader()).length,3);
assert.equal(Object.keys(await loader()).length,3);
assert.equal(urls.length,3,'Le cache du lecteur doit éviter un second téléchargement.');
console.log('Module visionneuse : chemins, CSP, ressources, cache lecteur OK');
