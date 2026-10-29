import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const player=require('../src/html-singlefile-player.js');
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function resource(path,text){
  return {mime:path.endsWith('.json')?'application/json':path.endsWith('.css')?'text/css':'text/javascript',size:Buffer.byteLength(text),base64:Buffer.from(text).toString('base64')};
}
const records={
  'h5p/h5p.json':resource('h5p/h5p.json','{"mainLibrary":"H5P.AdvancedText"}'),
  'h5p/content/content.json':resource('h5p/content/content.json','{"text":"<p>H5P single file</p>"}'),
  'player/main.bundle.js':resource('player/main.bundle.js','window.H5PStandalone={H5P:function(){}};'),
  'player/frame.bundle.js':resource('player/frame.bundle.js','window.H5P={};'),
  'player/styles/h5p.css':resource('player/styles/h5p.css','body{margin:0}'),
};
const size=Object.values(records).reduce((total,r)=>total+r.size,0);
const bundle={schemaVersion:1,kind:'resource-container-only',fileCount:Object.keys(records).length,totalBytes:size,records};
assert.equal(player.validate(bundle),true);
const html=player.render({bundle,title:'Titre <spécial> & "/titre',language:'fr',layoutCss:'#h5p-container{max-width:920px;margin:0 auto}',translations:{H5P:{fullscreen:'Plein écran'}}});
assert(html.startsWith('<!doctype html>'));
assert(html.includes('embedded-h5p-resources'));
assert(html.includes('H5PConverterSinglefileAudit'));
assert(html.includes('H5PStandalone.H5P'));
assert(html.includes('new Response(bytes(key)'));
assert(html.includes('window.XMLHttpRequest'));
assert(html.includes('HTMLImageElement'));
assert(html.includes("embedType:'div'"));
assert(html.includes('#h5p-container{max-width:920px;margin:0 auto}'));
assert(html.includes('Titre &lt;spécial&gt; &amp; &quot;/titre'));
assert(!html.includes('<script src="https://'));
assert(!html.includes('imsmanifest.xml'));
assert(!html.includes('SCORM12.'));
assert(html.includes('Plein écran'));
assert.throws(()=>player.validate({...bundle,records:{...records,'../../escape.js':resource('x.js','x')}}),/invalide/);
assert.throws(()=>player.validate({...bundle,totalBytes:33*1024*1024}),/32 Mio/);
assert.throws(()=>player.validate({...bundle,records:{'h5p/h5p.json':records['h5p/h5p.json']}}),/manquantes/);
const malicious={...bundle,records:{...records,'h5p/content/content.json':resource('h5p/content/content.json','</script><script>alert(1)</script>')}};
assert(!player.render({bundle:malicious}).includes('</script><script>alert(1)</script>'));
for(const needle of ['singlefileInteractiveBtn','generateSinglefileInteractiveTrial','htmlSinglefilePlayer.render','htmlSinglefileResources.collect','setGenerationProgress(100']){
  assert(source.includes(needle),`app.js doit contenir ${needle}`);
}
assert(ui.includes('id="singlefileInteractiveBtn"'));
assert(ui.includes('<script src="src/html-singlefile-player.js"></script>'));
console.log('Lot 8.3 : validation, encapsulation, HTML, DOM virtuel, sécurité des scripts, intégration UI : OK');
