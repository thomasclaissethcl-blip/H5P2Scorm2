import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = vm.createContext({});
ctx.globalThis = ctx;
for (const path of ['src/runtime-profiles.js', 'src/engine-catalog.js']) {
  vm.runInContext(fs.readFileSync(path,'utf8'), ctx, {filename:path});
}
const {engineCatalog:catalogue,compatibility} = ctx.H5PConverterModules;
assert.equal(catalogue.validateCatalogue(),true);
assert.equal(catalogue.previewProfile(compatibility.defaultProfile.id).playerVersion,'3.8.2');
assert.equal(catalogue.canExportWithPreview(compatibility.defaultProfile.id),true);
for (const ver of ['3.8.1','3.8.0']) {
  const p=catalogue.profiles.find(p=>p.playerVersion===ver);
  assert.ok(p && p.previewTrial && !p.selectable);
  assert.equal(catalogue.previewProfile(p.id).id,p.id);
  assert.equal(catalogue.canExportWithPreview(p.id),false);
  assert.equal(p.coreApiCeiling,null);
}
assert.equal(catalogue.previewProfile('not-valid'),null);
assert.equal(catalogue.canExportWithPreview('not-valid'),false);
assert.equal(catalogue.selectProfile({majorVersion:1,minorVersion:28}).playerVersion,'3.8.2');
assert.equal(catalogue.selectProfile({majorVersion:1,minorVersion:29}),null);
assert.equal(catalogue.validateCatalogue([{...catalogue.profiles[0],previewTrial:true}]),false);
const base={ok:true,issues:[],warnings:[],required:[],libraries:[],missing:[],h5pJson:{title:'Test'},runtimeCompatibility:{profileId:compatibility.defaultProfile.id,playerVersion:'3.8.2',supportedCoreApi:{majorVersion:1,minorVersion:28},maxRequiredCoreApi:null}};
const candidate=catalogue.profiles[1];
const report=JSON.parse(JSON.stringify(catalogue.buildReport(base,{previewProfileId:candidate.id})));
assert.equal(report.preview.mode,'essai_manuel_non_qualifie');
assert.equal(report.preview.exportAllowedWithPreview,false);
assert.equal(report.runtime.activeProfileId,compatibility.defaultProfile.id);
assert.equal(report.runtime.playerVersion,'3.8.2');
assert.equal(report.preview.playerVersion,candidate.playerVersion);
assert.ok(report.warnings.some(w=>w.includes('Export SCORM désactivé')));
assert.equal(catalogue.buildReport(base).preview.exportAllowedWithPreview,true);
console.log('Lot 4.2: sélection explicite candidats, verrou export, retour référence et rapport cohérent OK');
