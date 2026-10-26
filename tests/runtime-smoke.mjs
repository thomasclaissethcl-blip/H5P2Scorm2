import fs from 'node:fs';
import vm from 'node:vm';

const appPath = new URL('../app.js', import.meta.url);
let source = fs.readFileSync(appPath, 'utf8');
const end = source.lastIndexOf('})();');
if (end < 0) throw new Error('Fin de l’IIFE introuvable');
source = source.slice(0, end) + 'globalThis.__test={scormApiSource,bridgeSource,manifestXml,normalizeCoreApi,compareCoreApi,analyzeH5P};\n' + source.slice(end);

const fakeElement = () => ({
  value: '', checked: true, textContent: '', className: '', innerHTML: '', disabled: false,
  files: [], addEventListener() {}, scrollTop: 0, scrollHeight: 0
});
const elements = new Proxy({}, { get(target, key) { return target[key] ??= fakeElement(); } });
elements.statusPolicy.value = 'auto';
elements.saveFreq.value = '10';
elements.enableResume.checked = true;
elements.resumeProfile.value = 'strict';
elements.showRuntimeWarnings.checked = true;

const appContext = {
  console,
  navigator: { language: 'fr-FR', languages: ['fr-FR'] },
  document: { getElementById: id => elements[id] },
  setTimeout, clearTimeout, setInterval, clearInterval
};
appContext.window = appContext;
appContext.globalThis = appContext;
appContext.window.addEventListener = () => {};
vm.createContext(appContext);
for (const path of ['src/runtime-profiles.js', 'src/h5p-dependencies.js', 'src/h5p-analysis.js', 'src/preview-frame.js', 'src/h5p-preview.js']) {
  vm.runInContext(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'), appContext, { filename: path });
}
vm.runInContext(source, appContext);

function makeFakeZip(files) {
  const entries = {};
  for (const [path, value] of Object.entries(files)) {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    entries[path] = {
      dir: false,
      _data: { uncompressedSize: Buffer.byteLength(text) },
      async: async type => {
        if (type === 'string') return text;
        if (type === 'uint8array') return new Uint8Array(Buffer.from(text));
        throw new Error('type fake zip non supporté: ' + type);
      }
    };
  }
  return {
    files: entries,
    file(path) { return entries[path] || null; }
  };
}

const baseH5p = {
  title: 'Core API test',
  mainLibrary: 'POC.Future',
  language: 'fr',
  embedTypes: ['iframe'],
  preloadedDependencies: [{ machineName: 'POC.Future', majorVersion: 1, minorVersion: 0 }]
};
const baseContent = { metadata: { defaultLanguage: 'fr' } };
const compatibleLib = {
  machineName: 'POC.Future', majorVersion: 1, minorVersion: 0, patchVersion: 0, runnable: 1,
  coreApi: { majorVersion: 1, minorVersion: 28 }, preloadedDependencies: []
};
const futureLib = { ...compatibleLib, coreApi: { majorVersion: 1, minorVersion: 29 } };
const compatibleAnalysis = await appContext.__test.analyzeH5P(makeFakeZip({
  'h5p.json': baseH5p,
  'content/content.json': baseContent,
  'POC.Future-1.0/library.json': compatibleLib
}));
if (!compatibleAnalysis.ok) throw new Error('Core API 1.28 devrait être acceptée: ' + compatibleAnalysis.issues.join(' | '));
const futureAnalysis = await appContext.__test.analyzeH5P(makeFakeZip({
  'h5p.json': baseH5p,
  'content/content.json': baseContent,
  'POC.Future-1.0/library.json': futureLib
}));
if (futureAnalysis.ok || !futureAnalysis.issues.some(message => message.includes('Core API'))) throw new Error('Core API 1.29 devrait bloquer la génération');

const compatibleApi = appContext.__test.normalizeCoreApi({ majorVersion: 1, minorVersion: 28 });
const futureApi = appContext.__test.normalizeCoreApi({ majorVersion: 1, minorVersion: 29 });
if (appContext.__test.compareCoreApi(compatibleApi, { majorVersion: 1, minorVersion: 28 }) !== 0) throw new Error('comparaison Core API compatible incorrecte');
if (appContext.__test.compareCoreApi(futureApi, { majorVersion: 1, minorVersion: 28 }) <= 0) throw new Error('comparaison Core API future incorrecte');

const scormSource = appContext.__test.scormApiSource(true, true);
const bridgeSource = appContext.__test.bridgeSource(80, 'fr', 'auto', 10, true, true, 4000);
const extendedBridgeSource = appContext.__test.bridgeSource(80, 'fr', 'auto', 10, true, true, 64000);
new vm.Script(scormSource);
new vm.Script(bridgeSource);
new vm.Script(extendedBridgeSource);
if (!extendedBridgeSource.includes('const suspendLimit=64000')) throw new Error('profil Moodle étendu absent');

const manifestAuto = appContext.__test.manifestXml('Test', 80, 'auto', ['index.html']);
const manifestCompletion = appContext.__test.manifestXml('Test', 80, 'completion', ['index.html']);
if (!manifestAuto.includes('<adlcp:masteryscore>80</adlcp:masteryscore>')) throw new Error('masteryscore absent');
if (manifestCompletion.includes('<adlcp:masteryscore>')) throw new Error('masteryscore présent en mode achèvement');

const listeners = {};
let intervalCallback = null;
let playerOptions = null;
let xapiHandler = null;
const runtimeData = { 'cmi.core.lesson_status': 'incomplete', 'cmi.core.entry': 'ab-initio', 'cmi.suspend_data': '' };
const runtimeContext = {
  console,
  SCORM12: {
    init: () => true,
    get: key => runtimeData[key] || '',
    set: (key, value) => { runtimeData[key] = String(value); return true; },
    commit: () => true,
    finish: () => true
  },
  document: {
    documentElement: { lang: '' },
    getElementById: id => id === 'runtime-status' ? { textContent: '', hidden: true } : { textContent: '' }
  },
  H5PStandalone: {
    H5P: function (_element, options) {
      playerOptions = options;
      runtimeContext.H5PIntegration = { contents: { ['cid-' + options.id]: { contentUserData: { 0: { state: '{"count":7}' } } } } };
      runtimeContext.H5P = {
        instances: [{ getCurrentState: () => ({ count: 7 }) }],
        externalDispatcher: { on(name, callback) { if (name === 'xAPI') xapiHandler = callback; } }
      };
      return Promise.resolve();
    }
  },
  Blob,
  TextEncoder,
  TextDecoder,
  Response,
  CompressionStream: globalThis.CompressionStream,
  DecompressionStream: globalThis.DecompressionStream,
  Uint8Array,
  btoa: value => Buffer.from(value, 'binary').toString('base64'),
  atob: value => Buffer.from(value, 'base64').toString('binary'),
  setInterval: callback => { intervalCallback = callback; return 1; },
  clearInterval() {},
  setTimeout,
  clearTimeout
};
runtimeContext.window = runtimeContext;
runtimeContext.addEventListener = (name, callback) => { listeners[name] = callback; };
vm.createContext(runtimeContext);
vm.runInContext(bridgeSource, runtimeContext);
await listeners.DOMContentLoaded();
if (!playerOptions || playerOptions.saveFreq !== 10) throw new Error('saveFreq non transmis à H5P');
if (playerOptions.contentUserData?.[0]?.state !== '{}') throw new Error('état initial contentUserData natif absent au premier lancement');
if (typeof xapiHandler !== 'function') throw new Error('écoute xAPI absente');
xapiHandler({ data: { statement: { verb: { id: 'http://adlnet.gov/expapi/verbs/completed' }, result: { completion: true, score: { raw: 9, min: 0, max: 9 } } } } });
if (runtimeData['cmi.core.score.raw'] !== '100') throw new Error('score brut non normalisé sur 100');
if (runtimeData['cmi.core.score.min'] !== '0' || runtimeData['cmi.core.score.max'] !== '100') throw new Error('bornes de score non normalisées');
if (runtimeData['cmi.core.lesson_status'] !== 'passed') throw new Error('statut final incorrect après score 9/9');
intervalCallback();
await new Promise(resolve => setTimeout(resolve, 80));
if (!runtimeData['cmi.suspend_data'].startsWith('H5P3')) throw new Error('suspend_data non sauvegardé');
if (runtimeData['cmi.suspend_data'].length > 4000) throw new Error('suspend_data dépasse la limite');

const savedSuspendData = runtimeData['cmi.suspend_data'];
const listeners2 = {};
let restoredOptions = null;
const runtimeData2 = {
  'cmi.core.lesson_status': 'incomplete',
  'cmi.core.entry': 'resume',
  'cmi.suspend_data': savedSuspendData
};
const runtimeContext2 = {
  console,
  SCORM12: {
    init: () => true,
    get: key => runtimeData2[key] || '',
    set: (key, value) => { runtimeData2[key] = String(value); return true; },
    commit: () => true,
    finish: () => true
  },
  document: {
    documentElement: { lang: '' },
    getElementById: id => id === 'runtime-status' ? { textContent: '', hidden: true } : { textContent: '' }
  },
  H5PStandalone: {
    H5P: function (_element, options) {
      restoredOptions = options;
      const previous = options.contentUserData?.[0]?.state ? JSON.parse(options.contentUserData[0].state) : {};
      runtimeContext2.__restoredPreviousState = previous;
      runtimeContext2.H5P = {
        instances: [{ getCurrentState: () => previous }],
        externalDispatcher: { on(name, callback) { if (name === 'xAPI') xapiHandler = callback; } }
      };
      return Promise.resolve();
    }
  },
  Blob,
  TextEncoder,
  TextDecoder,
  Response,
  CompressionStream: globalThis.CompressionStream,
  DecompressionStream: globalThis.DecompressionStream,
  Uint8Array,
  btoa: value => Buffer.from(value, 'binary').toString('base64'),
  atob: value => Buffer.from(value, 'base64').toString('binary'),
  setInterval: () => 1,
  clearInterval() {},
  setTimeout,
  clearTimeout
};
runtimeContext2.window = runtimeContext2;
runtimeContext2.addEventListener = (name, callback) => { listeners2[name] = callback; };
vm.createContext(runtimeContext2);
vm.runInContext(bridgeSource, runtimeContext2);
await listeners2.DOMContentLoaded();
if (!restoredOptions?.contentUserData?.[0]?.state) throw new Error('contentUserData natif non restauré');
if (!String(restoredOptions.contentUserData[0].state).includes('"count":7')) throw new Error('état racine restauré incorrect');
if (runtimeContext2.__restoredPreviousState?.count !== 7) throw new Error('le core simulé n’a pas reçu previousState');



// Repli manuel : aucune instance H5P accessible, état disponible uniquement dans H5PIntegration.
const listeners3 = {};
let intervalCallback3 = null;
const runtimeData3 = { 'cmi.core.lesson_status': 'incomplete', 'cmi.core.entry': 'ab-initio', 'cmi.suspend_data': '' };
const runtimeContext3 = {
  console,
  SCORM12: {
    init: () => true,
    get: key => runtimeData3[key] || '',
    set: (key, value) => { runtimeData3[key] = String(value); return true; },
    commit: () => true,
    error: () => ({ code: '0', message: '', diagnostic: '' }),
    finish: () => true
  },
  document: {
    documentElement: { lang: '' },
    getElementById: id => id === 'runtime-status' ? { textContent: '', hidden: true } : { textContent: '' }
  },
  H5PStandalone: {
    H5P: function (_element, options) {
      runtimeContext3.H5PIntegration = { contents: { ['cid-' + options.id]: { contentUserData: { 0: { state: '{"count":4}' } } } } };
      runtimeContext3.H5P = { externalDispatcher: { on(name, callback) { if (name === 'xAPI') xapiHandler = callback; } } };
      return Promise.resolve();
    }
  },
  Blob,
  TextEncoder,
  TextDecoder,
  Response,
  CompressionStream: globalThis.CompressionStream,
  DecompressionStream: globalThis.DecompressionStream,
  Uint8Array,
  btoa: value => Buffer.from(value, 'binary').toString('base64'),
  atob: value => Buffer.from(value, 'base64').toString('binary'),
  setInterval: callback => { intervalCallback3 = callback; return 1; },
  clearInterval() {},
  setTimeout: () => 2,
  clearTimeout() {}
};
runtimeContext3.window = runtimeContext3;
runtimeContext3.addEventListener = (name, callback) => { listeners3[name] = callback; };
vm.createContext(runtimeContext3);
vm.runInContext(bridgeSource, runtimeContext3);
await listeners3.DOMContentLoaded();
intervalCallback3();
await new Promise(resolve => setTimeout(resolve, 80));
if (!runtimeData3['cmi.suspend_data'].startsWith('H5P3')) throw new Error('repli H5PIntegration non sauvegardé');

console.log('Runtime SCORM généré : OK');
