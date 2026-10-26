import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

let text = '';
for await (const chunk of process.stdin) text += chunk;
const { baselineApp, fixtures } = JSON.parse(text);

function fakeZip(files) {
  const entries = {};
  for (const [path, item] of Object.entries(files)) {
    entries[path] = {
      dir: item.dir,
      _data: { uncompressedSize: item.size },
      async: async () => {
        if (item.text == null) throw new Error(`Fichier non textuel lu comme JSON : ${path}`);
        return item.text;
      }
    };
  }
  return { files: entries, file: path => entries[path] || null };
}

function browserContext() {
  const fakeElement = () => ({ value: '', checked: true, addEventListener() {}, classList: {add(){},remove(){}} });
  const elements = new Proxy({}, { get(target, key) { return target[key] ??= fakeElement(); } });
  elements.languageOverride.value = '';
  const context = {
    console, navigator: { language: 'fr-FR', languages: ['fr-FR'] },
    document: { getElementById: id => elements[id] },
    setTimeout, clearTimeout
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  return context;
}

const baseContext = browserContext();
const end = baselineApp.lastIndexOf('})();');
assert.ok(end >= 0, 'Fin du fichier V1 introuvable');
vm.runInContext(baselineApp.slice(0, end) + 'globalThis.__baselineAnalyze = analyzeH5P;\n' + baselineApp.slice(end), baseContext);

const modContext = vm.createContext({ console });
modContext.globalThis = modContext;
vm.runInContext(fs.readFileSync('src/runtime-profiles.js','utf8'), modContext);
vm.runInContext(fs.readFileSync('src/h5p-dependencies.js','utf8'), modContext);
vm.runInContext(fs.readFileSync('src/h5p-analysis.js','utf8'), modContext);
const { analysis, compatibility, dependencies } = modContext.H5PConverterModules;

const normalize = value => JSON.parse(JSON.stringify(value, (_key, v) => Object.prototype.toString.call(v) === '[object Map]' ? [...v.entries()] : v));
const analysisOptions = { browserLanguage:'fr-FR', languageOverride:'', coreTranslations: {fr: { H5P: {} }}, runtimeProfile: compatibility.defaultProfile };
for (const [name, files] of Object.entries(fixtures)) {
  const old = await baseContext.__baselineAnalyze(fakeZip(files));
  const current = await analysis.analyzeH5P(fakeZip(files), analysisOptions);
  assert.deepEqual(normalize(current), normalize(old), `Analyse différente de la V1 pour ${name}`);
  console.log(`Parité analyse V1 : ${name} OK (${current.ok ? 'valide' : 'bloqué'})`);
}

const t = compatibility;
assert.equal(t.getProfile(t.defaultProfile.id), t.defaultProfile);
assert.equal(t.getProfile('profil-absent'), null);
assert.equal(t.compareCoreApi({majorVersion:1,minorVersion:29}, {majorVersion:1,minorVersion:28}), 1);
assert.equal(t.normalizeCoreApi({majorVersion:1,minorVersion:'29'}).minorVersion,29);
assert.equal(t.normalizeCoreApi({majorVersion:-1,minorVersion:0}).invalid,true);
assert.equal(t.normalizeCoreApi(null),null);
const d = {machineName:'H5P.Parent',majorVersion:1,minorVersion:0};
assert.equal(dependencies.dependencyKey(d),'H5P.Parent-1.0');
assert.equal(analysis.safeZipPath('../danger'),false);
assert.equal(analysis.safeZipPath('C:/danger'),false);
assert.equal(analysis.safeZipPath('lib/valid.js'),true);
assert.equal(analysis.languageCandidates('fr-FR').join(','),'fr-fr,fr');
assert.equal(dependencies.parseLibraryReference('H5P.Parent 1.0.1').key,'H5P.Parent-1.0');
assert.equal(analysis.resolveLanguage({language:'de'}, {}, {languageOverride:'fr-FR',browserLanguage:'en'}).selected,'fr-fr');
// Tests fonctionnels indépendants des snapshots V1 : transitivité et cycles.
function syntheticZip(mainLibrary, libs) {
  const rows = {
    'h5p.json': { title: 'Test dépendances', mainLibrary, language:'fr', embedTypes:['div'],
      preloadedDependencies:[{machineName: mainLibrary, majorVersion:1, minorVersion:0}] },
    'content/content.json': {metadata:{defaultLanguage:'fr'}}
  };
  for (const [name, data] of Object.entries(libs)) rows[`${name}-1.0/library.json`] = {
    machineName:name,majorVersion:1,minorVersion:0,patchVersion:0,runnable:1,
    preloadedDependencies:data.preloadedDependencies || [], ...(data.coreApi !== undefined ? {coreApi:data.coreApi}:{})
  };
  return fakeZip(Object.fromEntries(Object.entries(rows).map(([path, value]) => {
    const str = JSON.stringify(value);
    return [path, { text:str, size:Buffer.byteLength(str), dir:false }];
  })));
}
const link = machineName => ({ machineName, majorVersion:1, minorVersion:0 });
const cycle = await analysis.analyzeH5P(syntheticZip('H5P.A',{
  'H5P.A': { preloadedDependencies:[link('H5P.B')] },
  'H5P.B': { preloadedDependencies:[link('H5P.A')] }
}), analysisOptions);
assert.equal(cycle.ok,true,'Cycle de dépendances correctement résolu');
assert.equal(cycle.required.length,2);
const missingNested = await analysis.analyzeH5P(syntheticZip('H5P.A',{
  'H5P.A': { preloadedDependencies:[link('H5P.Unavailable')] }
}),analysisOptions);
assert.equal(missingNested.ok,false);
assert.equal(missingNested.missing.map(d=>d.key).join(','),'H5P.Unavailable-1.0');
const futureApi = await analysis.analyzeH5P(syntheticZip('H5P.A',{
  'H5P.A': { coreApi:{majorVersion:1,minorVersion:29} }
}),analysisOptions);
assert.equal(futureApi.ok,false);
assert.equal(futureApi.runtimeCompatibility.incompatible.length,1);
const invalidApi = await analysis.analyzeH5P(syntheticZip('H5P.A',{
  'H5P.A': { coreApi:{majorVersion:1,minorVersion:-1} }
}),analysisOptions);
assert.equal(invalidApi.ok,false);
assert.equal(invalidApi.runtimeCompatibility.invalid.length,1);
console.log('Dépendances cycliques/transitives, Core API future et invalide : OK');
assert.ok(!('document' in modContext), 'Les modules ne doivent pas dépendre du DOM');
console.log('Contrats des modules et absence de DOM : OK');
