/* Orchestrateur de la visionneuse. L'iframe sandbox a une origine opaque. */
(function (root) {
  'use strict';
  const MAX_BYTES = 120 * 1024 * 1024;
  const MAX_FILES = 4000;
  const frameModule = root.H5PConverterModules?.previewFrame;
  if (!frameModule) throw Error('Charger preview-frame.js avant h5p-preview.js.');
  const MIME_REQUIRED = ['/dist/main.bundle.js','/dist/frame.bundle.js','/dist/styles/h5p.css'];
  function makeToken() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, n => n.toString(16).padStart(2,'0')).join('');
  }
  function safePath(path) {
    return typeof path === 'string' && !path.startsWith('/') && !path.includes('\\') &&
      !path.split('/').some(part => part === '..' || part === '.' || !part) &&
      /^(?!player\/|custom\/).+/.test(path);
  }
  async function gather(zip, replacements, assets, onProgress = () => {}) {
    const entries = Object.entries(zip.files).filter(([,file]) => !file.dir);
    if (entries.length > MAX_FILES) throw Error('Prévisualisation indisponible : plus de 4 000 fichiers.');
    let total=0;
    const files=[];
    for (let i=0;i<entries.length;i++) {
      const [path,file] = entries[i];
      if (!safePath(path)) throw Error('Chemin H5P non sûr : '+path);
      const content = replacements[path];
      const data = content === undefined ? await file.async('arraybuffer') : new TextEncoder().encode(content).buffer;
      total += data.byteLength;
      if (total>MAX_BYTES) throw Error('Prévisualisation indisponible : ressources supérieures à 120 Mio.');
      files.push({path:'h5p/'+path,data});
      if ((i+1)%25===0) onProgress(`Préparation des ressources ${i+1}/${entries.length}`);
    }
    for (const [path, data] of Object.entries(assets)) {
      total+=data.byteLength;
      if (total>MAX_BYTES) throw Error('Prévisualisation indisponible : ressources supérieures à 120 Mio.');
      files.push({path:'player/'+path.replace(/^\/dist\//,''),data:data.slice(0)});
    }
    files.push({path:'custom/custom.css',data:new TextEncoder().encode(replacements.__css || '').buffer});
    return files;
  }
  function createPreview({frame, status, onEvent}) {
    let generation=0;
    let current=null;
    let ready=false;
    function setStatus(message) { status.textContent=message; }
    function onMessage(event) {
      if (!current || event.source !== frame.contentWindow) return;
      const data=event.data;
      if (data?.channel==='h5p-preview-boot') {
        if (current.sent) return;
        current.sent=true;
        const buffers=current.files.map(f=>f.data);
        try {frame.contentWindow.postMessage({channel:'h5p-preview-init',token:current.token,files:current.files},'*',buffers);} catch(err) {setStatus('Erreur d’initialisation : '+err.message);}
      } else if (data?.channel==='h5p-preview' && data.token===current.token) {
        if (data.type==='ready') ready=true;
        if (data.type==='ready'||data.type==='error') setStatus(data.message);
        if (onEvent) onEvent(data);
      }
    }
    root.addEventListener('message',onMessage);
    function reset() {
      generation++;
      ready=false;
      current=null;
      frame.removeAttribute('srcdoc');
      frame.src='about:blank';
      setStatus('Aucun aperçu en cours.');
    }
    async function open({zip,replacements,assetLoader,onProgress}) {
      reset();
      const gen=generation;
      setStatus('Préparation de la visionneuse…');
      try {
        const assets=await assetLoader();
        if (gen!==generation) return false;
        const files=await gather(zip,replacements,assets,onProgress);
        if (gen!==generation) return false;
        current={token:makeToken(),files,sent:false};
        frame.removeAttribute('src');
        frame.srcdoc=frameModule.documentSource();
        setStatus('Démarrage du lecteur H5P…');
        return true;
      } catch(error) {
        if (gen===generation) setStatus('Aperçu indisponible : '+error.message);
        return false;
      }
    }
    return {open,reset,dispose(){ reset();root.removeEventListener('message',onMessage);},get ready(){return ready;}};
  }
  function playerLoader({version,paths,fetcher=null,onProgress=()=>{}}) {
    const cache=new Map();
    return async () => {
      const result={};
      const selected=paths.filter(path => !path.endsWith('.LICENSE.txt') && !path.endsWith('LICENSE.txt') && !path.endsWith('OFL.txt'));
      let count=0;
      for (const path of selected) {
        if (!cache.has(path)) {
          let response;
          try { response=await (fetcher || root.fetch.bind(root))(`https://cdn.jsdelivr.net/npm/h5p-standalone@${version}${path}`,{cache:'force-cache'}); }
          catch (error) { if (MIME_REQUIRED.includes(path)) throw Error('Lecteur H5P indisponible : '+error.message); count++; continue; }
          if (!response.ok) {
            if (MIME_REQUIRED.includes(path)) throw Error(`Lecteur indisponible : ${path} (HTTP ${response.status}).`);
            count++; continue;
          }
          cache.set(path,await response.arrayBuffer());
        }
        result[path]=cache.get(path);
        count++;
        if (count%6===0) onProgress(`Chargement du lecteur ${count}/${selected.length}`);
      }
      for (const path of MIME_REQUIRED) if (!result[path]) throw Error('Fichier essentiel du lecteur manquant : '+path);
      return result;
    };
  }
  root.H5PConverterModules.preview={createPreview,playerLoader,safePath,gather};
})(globalThis);
