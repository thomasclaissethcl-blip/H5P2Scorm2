import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const player=require('../src/html-singlefile-player.js');
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const src=readFileSync(new URL('../src/html-singlefile-player.js',import.meta.url),'utf8');
const rec=(data,mime='application/json')=>{const b=Buffer.from(typeof data==='string'?data:JSON.stringify(data));return {mime,size:b.length,base64:b.toString('base64')};};
const records={
 'h5p/h5p.json':rec({mainLibrary:'H5P.Video'}),
 'h5p/content/content.json':rec({sources:[{path:'https://youtu.be/5ju4rFTRi0s',mime:'video/YouTube'}]}),
 'player/main.bundle.js':rec('window.H5PStandalone={H5P:function(){}}','text/javascript'),
 'player/frame.bundle.js':rec('','text/javascript'),
 'player/styles/h5p.css':rec('','text/css'),
};
const bundle={schemaVersion:1,records,fileCount:Object.keys(records).length,totalBytes:Object.values(records).reduce((t,v)=>t+v.size,0)};
const html=player.render({bundle});
assert.match(html,/<div id="singlefile-status" role="alert" hidden><\/div>/);
assert.doesNotMatch(html,/Vidéo YouTube externe : ce fichier est ouvert en file/);
assert.doesNotMatch(html,/Attention : .*média\(s\) externe/);
assert.doesNotMatch(html,/Initialisation du monofichier expérimental…/);
assert.doesNotMatch(html,/Initialisation du lecteur H5P…/);
assert.match(html,/<meta name="referrer" content="strict-origin-when-cross-origin">/);
assert.match(html,/H5PConverterSinglefileAudit/);
assert.match(html,/youtubeLocalFileUnsupported/);
assert.match(src,/setStatus\(''\);/);
assert.match(src,/setStatus\('Impossible d’afficher cette activité H5P/);
for(const phrase of ['logLine(`Diagnostic monofichier','logLine(`Compatibilité YouTube','logLine(\'Note de portabilité','média(s) locaux manquants']){
 assert(app.includes(phrase),`Journal de génération : ${phrase}`);
}
assert(!app.includes('setStatus(\'Vidéo YouTube externe'));
console.log('Lot 8.4a : expérience apprenant nettoyée ; diagnostics conservés dans le journal et audit interne, politique HTTPS intacte.');
