import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = vm.createContext({});
context.globalThis = context;
for (const path of ['src/runtime-profiles.js','src/engine-catalog.js']) {
  vm.runInContext(fs.readFileSync(path,'utf8'), context, {filename:path});
}
const {compatibility,engineCatalog:cat} = context.H5PConverterModules;
assert.equal(cat.validateCatalogue(),true);
assert.equal(cat.profiles.length,3);
assert.equal(cat.selectProfile({majorVersion:1,minorVersion:28}).id,compatibility.defaultProfile.id);
assert.equal(cat.selectProfile({majorVersion:1,minorVersion:29}),null,'Ne jamais contourner plafond Core API');
assert.equal(cat.selectProfile({majorVersion:2,minorVersion:0}),null);
assert.equal(cat.selectProfile({majorVersion:1,minorVersion:-1}),null);
assert.equal(cat.availableProfiles({majorVersion:1,minorVersion:28}).length,1);
assert.ok(cat.profiles.slice(1).every(p => p.selectable === false && p.coreApiCeiling === null));
assert.equal(cat.validateCatalogue([cat.profiles[0],cat.profiles[0]]),false);
assert.equal(cat.validateCatalogue([{...cat.profiles[0],playerVersion:'latest'}]),false);

const baseline = {
  ok:true, issues:[], warnings:[], required:['H5P.GameMap-1.9','H5P.Question-1.0'],
  mainKey:'H5P.GameMap-1.9',
  h5pJson:{title:'Carte de test',mainLibrary:'H5P.GameMap'},
  language:{selected:'fr'},
  runtimeCompatibility:{profileId:compatibility.defaultProfile.id,playerVersion:'3.8.2',supportedCoreApi:{majorVersion:1,minorVersion:28},maxRequiredCoreApi:{majorVersion:1,minorVersion:28}},
  libraries:[
    {key:'H5P.GameMap-1.9',folder:'H5P.GameMap-1.9',library:{machineName:'H5P.GameMap',majorVersion:1,minorVersion:9,patchVersion:8,coreApi:{majorVersion:1,minorVersion:28}},dependencies:[{machineName:'H5P.Question',majorVersion:1,minorVersion:0,kind:'preloaded'}]},
    {key:'H5P.Question-1.0',folder:'H5P.Question-1.0',library:{machineName:'H5P.Question',majorVersion:1,minorVersion:0,patchVersion:0},dependencies:[]},
    {key:'H5P.EditorOnly-1.0',folder:'H5P.EditorOnly-1.0',library:{machineName:'H5P.EditorOnly',majorVersion:1,minorVersion:0,patchVersion:2},dependencies:[]}
  ],missing:[]
};
const report = JSON.parse(JSON.stringify(cat.buildReport(baseline)));
assert.equal(report.schemaVersion,1);
assert.equal(report.libraries[0].version,'1.9.8');
assert.equal(report.libraries[0].role,'principale');
assert.equal(report.libraries[1].role,'execution');
assert.equal(report.libraries[2].role,'embarquee_non_requise');
assert.equal(report.libraries[1].coreApiDeclared,null);
assert.equal(report.libraries[0].dependencies[0].machineName,'H5P.Question');
assert.equal(report.eligibleProfileIds.length,1);
assert.equal(report.runtime.activeProfileId,compatibility.defaultProfile.id);
assert.ok(report.catalogue.slice(1).every(c=>c.selectable === false));
const future = cat.buildReport({...baseline,ok:false,runtimeCompatibility:{...baseline.runtimeCompatibility,maxRequiredCoreApi:{majorVersion:1,minorVersion:29}}});
assert.equal(future.eligibleProfileIds.length,0);
assert.equal(future.runtime.diagnostic,'analyse_statique_bloquee');
assert.equal(cat.buildReport({...baseline,runtimeCompatibility:{...baseline.runtimeCompatibility,maxRequiredCoreApi:null}}).warnings.length,1);
assert.ok(!('document' in context));
console.log('Catalogue versionné, sélection restrictive, rapport bibliothèque et compatibilité : OK');
