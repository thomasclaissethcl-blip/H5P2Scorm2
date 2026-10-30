const fs=require('fs');
const p=require('../src/html-singlefile-player.js');
const bundle=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const audit=p.inspectOfflineMedia(bundle);
const html=p.render({bundle,title:'SST406 Dossier1 - essai monofichier composite',language:'fr'});
fs.writeFileSync(process.argv[3],html);
console.log(JSON.stringify({fileCount:bundle.fileCount,totalBytes:bundle.totalBytes,htmlLength:html.length,mediaAudit:audit}));
