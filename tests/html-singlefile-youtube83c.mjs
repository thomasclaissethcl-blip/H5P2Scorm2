import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const player=require('../src/html-singlefile-player.js');
function record(v,mime='application/json'){
 const data=Buffer.from(typeof v==='string'?v:JSON.stringify(v));
 return {size:data.byteLength,mime,base64:data.toString('base64')};
}
function make(source){
 const rec={
  'h5p/h5p.json':record({mainLibrary:'H5P.Column'}),
  'h5p/content/content.json':record({content:[{content:{params:{sources:[source]}}}]}),
  'player/main.bundle.js':record('window.H5PStandalone={H5P:function(){}}','application/javascript'),
  'player/frame.bundle.js':record('','application/javascript'),
  'player/styles/h5p.css':record('','text/css')
 };
 return {schemaVersion:1,records:rec,fileCount:Object.keys(rec).length,totalBytes:Object.values(rec).reduce((n,r)=>n+r.size,0)};
}
const youtube=make({path:'https://youtu.be/5ju4rFTRi0s',mime:'video/YouTube'});
const report=player.inspectOfflineMedia(youtube);
assert.equal(report.externalMedia.length,1);
assert.equal(report.externalMedia[0].service,'YouTube');
assert.equal(report.localVideoFiles,0);
const html=player.render({bundle:youtube});
assert.match(html,/<meta name="referrer" content="strict-origin-when-cross-origin">/);
assert.match(html,/location\.protocol==='file:'/);
assert.match(html,/youtubeLocalFileUnsupported/);
assert.match(html,/YouTube exige une origine HTTP/);
assert(!/<script\s+src\s*=/.test(html));
const local=make({path:'videos/training.mp4',mime:'video/mp4'});
assert(!player.render({bundle:local}).includes('<meta name="referrer"'));
const vimeo=make({path:'https://vimeo.com/12345678',mime:'video/vimeo'});
assert(!player.render({bundle:vimeo}).includes('<meta name="referrer"'));
console.log('Lot 8.3c : diagnostic H5P.Column/Video YouTube et politique de référent conditionnelle OK');
