import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const player=require('../src/html-singlefile-player.js');
function record(data,mime='application/json'){
 const buf=Buffer.from(typeof data==='string'?data:JSON.stringify(data));
 return {mime,size:buf.byteLength,base64:buf.toString('base64')};
}
function pack(mainLibrary,content,local=true){
 const entries={
  'h5p/h5p.json':record({mainLibrary}),
  'h5p/content/content.json':record(content),
  'player/main.bundle.js':record('window.H5PStandalone={H5P:function(){}}','text/javascript'),
  'player/frame.bundle.js':record('','text/javascript'),
  'player/styles/h5p.css':record('','text/css')
 };
 if(local)entries['h5p/content/videos/clip.mp4']=record('fake-video-bytes','video/mp4');
 return {schemaVersion:1,records:entries,fileCount:Object.keys(entries).length,totalBytes:Object.values(entries).reduce((sum,r)=>sum+r.size,0)};
}
const content={interactiveVideo:{video:{files:[{path:'videos/clip.mp4',mime:'video/mp4'}]},assets:{interactions:[{duration:{from:0.5,to:2},action:{library:'H5P.AdvancedText 1.1'}}]}}};
const good=pack('H5P.InteractiveVideo 1.28',content);
const report=player.inspectInteractiveVideo(good);
assert.equal(report.detected,true);
assert.equal(report.videoSourceCount,1);
assert.equal(report.localVideoFiles,1);
assert.equal(report.interactionsDeclared,1);
assert.equal(report.missingLocalMedia,0);
assert.equal(report.qualification,'non-qualifie-synchronisation');
assert.equal(report.requiredTests.length,4);
const noVideo=player.inspectInteractiveVideo(pack('H5P.InteractiveVideo 1.28',content,false));
assert.equal(noVideo.missingLocalMedia,1);
assert.equal(noVideo.videoFilePresent,false);
const external=player.inspectInteractiveVideo(pack('H5P.InteractiveVideo 1.28',{video:{files:[{path:'https://youtu.be/test',mime:'video/YouTube'}]},assets:{interactions:[]}},false));
assert.equal(external.externalVideoReferences,1);
assert.equal(external.videoFilePresent,false);
assert.equal(player.inspectInteractiveVideo(pack('H5P.Video 1.6',content)).detected,false);
assert.equal(player.inspectInteractiveVideo(pack('H5P.InteractiveBook 1.11',content)).detected,false);
const html=player.render({bundle:good});
assert(html.includes('H5PConverterSinglefileAudit'));
assert(!html.includes('imsmanifest.xml'));
console.log('Lot 8.4b : inventaire conservateur Interactive Video, MP4, interactions et médias manquants. Lecture synchronisée NON qualifiée.');
