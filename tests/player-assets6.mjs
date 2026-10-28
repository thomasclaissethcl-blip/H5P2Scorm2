import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({});ctx.globalThis=ctx;
for(const path of ['src/runtime-profiles.js','src/player-assets.js','src/portable-package.js','src/engine-catalog.js'])
  vm.runInContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const assets=ctx.H5PConverterModules.playerAssets;
const catalog=ctx.H5PConverterModules.engineCatalog;
const reference=JSON.parse(fs.readFileSync('tests/fixtures/player-dist-53.json','utf8'));
assert.deepEqual([...assets.paths],reference.paths,'La liste des 25 ressources doit rester identique au lot 5.3');
assert.equal(assets.validate(),true);
assert.equal(assets.paths.length,25);
assert.equal(assets.manifest().length,25);
assert.equal(assets.manifest('3.8.2',{includeNotices:false}).length,22);
const files=assets.manifest();
assert.equal(new Set(files.map(x=>x.localPath)).size,25);
assert.equal(files.find(x=>x.remotePath==='/dist/main.bundle.js').remoteUrl,'https://cdn.jsdelivr.net/npm/h5p-standalone@3.8.2/dist/main.bundle.js');
assert.equal(files.find(x=>x.remotePath==='/dist/main.bundle.js').localPath,'player/main.bundle.js');
assert.equal(files.find(x=>x.remotePath==='/dist/styles/h5p.css').localPath,'player/styles/h5p.css');
assert.ok(files.some(x=>x.notice));
assert.ok(files.some(x=>x.required));
for(const value of ['/dist/../secret.js','/dist/evil.js','player/main.bundle.js']) assert.throws(()=>assets.localPath(value));
for(const value of ['latest','3.8.2/evil','3.8.2?x=y']) assert.throws(()=>assets.remoteUrl('/dist/main.bundle.js',value));
assert.equal(catalog.previewProfile('h5p-standalone-3.8.2-core-1.28').playerVersion,'3.8.2');
for(const version of ['3.8.1','3.8.0']){
  const profile=catalog.profiles.find(p=>p.playerVersion===version);
  assert.equal(catalog.canExportWithPreview(profile.id),false);
}
console.log('Lot 6.1: 25 ressources du lecteur identiques a 5.3; URL et chemins verifies; candidats bloques.');
