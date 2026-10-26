/* Contexte d'exécution isolé : ce module produit le script du document srcdoc.
 * Le H5P fourni est du JavaScript tiers. Aucun accès DOM ni origine hôte n'est accordé.
 */
(function (root) {
  'use strict';
  const SCRIPT = String.raw`
(() => {
  'use strict';
  const ROOT = 'https://preview.invalid/';
  const TYPES = {js:'text/javascript',css:'text/css',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',mp3:'audio/mpeg',ogg:'audio/ogg',mp4:'video/mp4',webm:'video/webm',vtt:'text/vtt',html:'text/html',txt:'text/plain'};
  const entries = new Map();
  const objectUrls = [];
  let token = '';
  let started = false;
  function signal(type, text) {
    parent.postMessage({channel:'h5p-preview',token,type,message:String(text || '').slice(0,350)}, '*');
  }
  function normalize(value, base) {
    const s = String(value || '').trim();
    if (!s || s.startsWith('blob:') || s.startsWith('data:') || s.startsWith('#')) return null;
    try {
      const url = new URL(s, base || ROOT);
      if (url.origin !== new URL(ROOT).origin) return null;
      const pathname = decodeURIComponent(url.pathname);
      const parts = pathname.replace(/^\/+/, '').split('/');
      if (parts.some(x => x === '..' || x === '.' || !x)) return null;
      return parts.join('/');
    } catch (_err) { return null; }
  }
  function mime(path) { return TYPES[path.split('.').pop().toLowerCase()] || 'application/octet-stream'; }
  function fail(message) {
    const node = document.getElementById('preview-error');
    node.textContent = message;
    node.hidden = false;
    signal('error', message);
  }
  function fileBlob(path) {
    const item = entries.get(path);
    if (!item) return null;
    if (!item.blobUrl) {
      item.blobUrl = URL.createObjectURL(new Blob([item.data], {type:mime(path)}));
      objectUrls.push(item.blobUrl);
    }
    return item.blobUrl;
  }
  function virtualUrl(value, base) {
    const path = normalize(value, base);
    return path && entries.has(path) ? fileBlob(path) : null;
  }
  function cssFor(path, source) {
    return source.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi, (_m, _quote, relative) => {
      const resolved = virtualUrl(relative, ROOT + path.substring(0, path.lastIndexOf('/')+1));
      return resolved ? 'url("' + resolved + '")' : 'url("about:blank")';
    });
  }
  function prepareCss() {
    for (const [path, item] of entries) {
      if (!path.endsWith('.css')) continue;
      const text = new TextDecoder().decode(item.data);
      const rewritten = cssFor(path, text);
      item.data = new TextEncoder().encode(rewritten).buffer;
    }
  }
  function installVirtualAccess() {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const value = typeof input === 'string' ? input : input?.url;
      const path = normalize(value);
      if (!path) throw new TypeError('Accès réseau désactivé dans la prévisualisation.');
      const file = entries.get(path);
      if (!file) return new Response('Ressource H5P absente : ' + path, {status:404});
      return new Response(file.data.slice(0), {status:200,headers:{'Content-Type':mime(path)}});
    };
    // Des bibliothèques utilisent fetch ou une création d'éléments DOM pour charger leurs ressources.
    for (const [prototype, property] of [
      [HTMLScriptElement.prototype,'src'],[HTMLLinkElement.prototype,'href'],
      [HTMLImageElement.prototype,'src'],[HTMLMediaElement.prototype,'src'],
      [HTMLSourceElement.prototype,'src']
    ]) {
      const original = Object.getOwnPropertyDescriptor(prototype,property);
      if (!original?.set || !original?.get) continue;
      Object.defineProperty(prototype,property,{configurable:true,enumerable:original.enumerable,
        get(){return original.get.call(this);},
        set(value){
          const substitute = virtualUrl(value);
          return original.set.call(this, substitute || value);
        }
      });
    }
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name,value) {
      if (['src','href','poster'].includes(String(name).toLowerCase())) {
        value = virtualUrl(value) || value;
      }
      return originalSetAttribute.call(this,name,value);
    };
    // Adaptateur XHR en mémoire. Aucun accès natif au réseau n'est autorisé.
    window.XMLHttpRequest = class VirtualXHR extends EventTarget {
      constructor() {super();this.readyState=0;this.status=0;this.responseType='';this.response=null;
        this.responseText='';this.timeout=0;this.withCredentials=false;this.upload=new EventTarget();}
      emit(type) {const event=new Event(type);this.dispatchEvent(event);
        const handler=this['on'+type];if(typeof handler==='function') handler.call(this,event);}
      open(method,url,asynchronous=true) {
        this.method=String(method).toUpperCase();this.resource=String(url);this.async=asynchronous!==false;
        this.readyState=1;this.emit('readystatechange');
      }
      setRequestHeader() {} overrideMimeType() {} getAllResponseHeaders(){return this.status===200?'Content-Type: '+this.contentType+'\r\n':'';}
      getResponseHeader(name){return String(name).toLowerCase()==='content-type'?this.contentType:null;}
      abort(){this.aborted=true;this.emit('abort');}
      send() {
        if (this.method!=='GET') throw Error('Requête réseau non autorisée.');
        const run=()=>{
          if (this.aborted) return;
          const path=normalize(this.resource);
          const item=path && entries.get(path);
          this.status=item?200:404;this.statusText=item?'OK':'Not Found';
          this.contentType=mime(path||'');this.readyState=4;
          if(item){
            const raw=item.data.slice(0);
            if(this.responseType==='arraybuffer')this.response=raw;
            else if(this.responseType==='blob')this.response=new Blob([raw],{type:this.contentType});
            else {
              const text=new TextDecoder().decode(raw);
              if(this.responseType==='json'){try{this.response=JSON.parse(text);}catch(_err){this.response=null;}}
              else {this.responseText=text;this.response=text;}
            }
          }
          this.emit('readystatechange');
          this.emit(this.status===200?'load':'error');
          this.emit('loadend');
        };
        if(this.async)queueMicrotask(run);else run();
      }
    };
    void nativeFetch;
  }
  async function boot(payload) {
    for (const item of payload.files) {
      if (!/^(h5p|player|custom)\//.test(item.path) || entries.has(item.path)) throw Error('Chemin de ressource invalide ou dupliqué.');
      entries.set(item.path, {data:item.data,blobUrl:null});
    }
    prepareCss();
    installVirtualAccess();
    const scriptFile = fileBlob('player/main.bundle.js');
    if (!scriptFile) throw Error('Lecteur H5P Standalone manquant.');
    const script = document.createElement('script');
    script.src = scriptFile;
    await new Promise((resolve,reject) => {
      script.onload = resolve;
      script.onerror = () => reject(Error('Impossible de lancer H5P Standalone.'));
      document.head.appendChild(script);
    });
    if (!window.H5PStandalone?.H5P) throw Error('API H5P Standalone absente.');
    const opts = {
      h5pJsonPath:ROOT+'h5p',contentJsonPath:ROOT+'h5p/content',librariesPath:ROOT+'h5p',
      frameJs:ROOT+'player/frame.bundle.js',frameCss:ROOT+'player/styles/h5p.css',
      frame:false,embedType:'div',postUserStatistics:false,saveFreq:false,
      customCss:[ROOT+'custom/custom.css']
    };
    await new window.H5PStandalone.H5P(document.getElementById('h5p-container'),opts);
    try {
      window.H5P?.externalDispatcher?.on('xAPI', event => {
        const statement = event?.data?.statement || event?.statement;
        const verb = String(statement?.verb?.id || '').split('/').pop();
        signal('xapi', verb || 'événement H5P');
      });
    } catch (_err) {}
    signal('ready','Activité chargée. Vous pouvez interagir avec le contenu.');
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || started || event.data?.channel !== 'h5p-preview-init' || !event.data?.token) return;
    started=true;
    token=event.data.token;
    Promise.resolve().then(() => boot(event.data)).catch(error => fail(error?.message || String(error)));
  });
  window.addEventListener('unload', () => objectUrls.forEach(url => URL.revokeObjectURL(url)));
  parent.postMessage({channel:'h5p-preview-boot'},'*');
})();`;
  function documentSource() {
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
      '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\' blob:; style-src \'unsafe-inline\' blob:; img-src blob: data:; font-src blob: data:; media-src blob: data:; connect-src \'none\'; frame-src \'none\'; object-src \'none\'; form-action \'none\'; base-uri \'none\'">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>body{margin:0;padding:12px;font:16px system-ui;background:white;color:#172033}#preview-error{white-space:pre-wrap;color:#992a2a}#preview-error[hidden]{display:none}</style></head>' +
      '<body><div id="preview-error" role="alert" hidden></div><div id="h5p-container"></div><script>' +
      SCRIPT.replaceAll('</script', '<\\/script') + '</script></body></html>';
  }
  root.H5PConverterModules = root.H5PConverterModules || {};
  root.H5PConverterModules.previewFrame = { documentSource };
})(globalThis);
