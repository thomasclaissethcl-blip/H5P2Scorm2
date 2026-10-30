import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const player=require('../src/html-singlefile-player.js');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const source=readFileSync(new URL('../src/html-singlefile-player.js',import.meta.url),'utf8');
function record(data,mime='application/json'){
 const raw=Buffer.isBuffer(data)?data:Buffer.from(typeof data==='string'?data:JSON.stringify(data));
 return {size:raw.length,mime,base64:raw.toString('base64')};
}
function make(content,additional={}){
 const records={
  'h5p/h5p.json':record({mainLibrary:'H5P.Video'}),
  'h5p/content/content.json':record(content),
  'player/main.bundle.js':record('window.H5PStandalone={H5P:function(){}};','text/javascript'),
  'player/frame.bundle.js':record('window.H5P={};','text/javascript'),
  'player/styles/h5p.css':record('body{}','text/css'),
  ...additional
 };
 return {schemaVersion:1,kind:'resource-container-only',records,fileCount:Object.keys(records).length,totalBytes:Object.values(records).reduce((n,r)=>n+r.size,0)};
}
let content={sources:[
 {path:'videos/training.mp4',mime:'video/mp4'},
 {path:'https://www.youtube.com/watch?v=abc123',mime:'video/YouTube'},
 {path:'https://cdn.example.org/media/other.webm',mime:'video/webm'},
 {path:'audio/missing.ogg',mime:'audio/ogg'}
]};
const bundle=make(content,{'h5p/content/videos/training.mp4':record(Buffer.from([0,1,2,3,4]),'video/mp4')});
const report=player.inspectOfflineMedia(bundle);
assert.equal(report.localVideoFiles,1);
assert.equal(report.localMediaReferences,1);
assert.deepEqual(report.externalMedia.map(x=>x.service),['YouTube','fichier externe']);
assert.equal(report.missingLocalMedia.length,1);
assert.equal(report.missingLocalMedia[0],'h5p/content/audio/missing.ogg');
assert.equal(report.parseError,false);
let html=player.render({bundle});
assert(html.includes('YouTube'));
assert(html.includes('noExternalMediaDetected'));
assert(html.includes('missingLocalMedia'));
assert(html.includes('MutationObserver'));
assert(html.includes('rewriteInlineHtml'));
assert(html.includes('innerHTML'));
assert(html.includes('CSSStyleDeclaration'));
assert(html.includes('HTMLVideoElement'));
assert(html.includes('HTMLSourceElement'));
assert(!html.includes('<script src="https://'));
assert(app.includes('htmlSinglefilePlayer.inspectOfflineMedia(bundle)'));
assert(app.includes('Diagnostic monofichier') && app.includes('vidéo(s) externe(s)'));
assert.equal(player.inspectOfflineMedia(make({sources:[{path:'videos/offline.webm',mime:'video/webm'}]}, {'h5p/content/videos/offline.webm':record(Buffer.from([1]),'video/webm')})).externalMedia.length,0);
console.log('Lot 8.3b : diagnostics médias externes/manquants, images Memory et vidéo locale : OK');
