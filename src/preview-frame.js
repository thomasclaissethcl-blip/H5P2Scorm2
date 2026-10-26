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
  let activeCss = '';
  const styledDocuments = new WeakMap();
  const observedDocuments = new WeakSet();
  const registeredFrames = new WeakSet();
  let cssScanScheduled = false;
  const childFrames = new Set();
  const childKey = Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2,'0')).join('');
  let resizeObserver = null;
  let lastHeight = 0;
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
  // Les H5P anciens accèdent parfois à localStorage. Une iframe à origine
  // opaque n'y a pas droit. Fournir un stockage volatil et privé, sans
  // réutiliser les données du site hôte ni affaiblir le sandbox.
  function installMemoryStorage() {
    function store() {
      const values = new Map();
      return {
        get length() { return values.size; },
        key(index) { return Array.from(values.keys())[index] ?? null; },
        getItem(key) { return values.has(String(key)) ? values.get(String(key)) : null; },
        setItem(key, value) { values.set(String(key), String(value)); },
        removeItem(key) { values.delete(String(key)); },
        clear() { values.clear(); }
      };
    }
    for (const key of ['localStorage', 'sessionStorage']) {
      try { Object.defineProperty(window, key, {configurable:true, get:()=>storage[key]}); }
      catch (_err) { signal('warning', 'Stockage temporaire non disponible : ' + key); }
    }
    const storage = {localStorage:store(),sessionStorage:store()};
  }
  function rewriteCssUrls(source, base = ROOT + 'h5p/content/') {
    return String(source).replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi, (match, quote, path) => {
      if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('#')) return match;
      const resolved = virtualUrl(path, base);
      return resolved ? 'url("' + resolved + '")' : match;
    });
  }
  // Le lecteur peut afficher un H5P dans un document iframe interne.
  // Les styles du document parent ne traversent pas une frontière iframe.
  // Réinjecter le CSS dans chaque document accessible et le maintenir après
  // les styles H5P ajoutés de manière asynchrone.
  function scanStyles() {
    function inject(doc) {
      const head = doc.head;
      if (!head || !doc.documentElement) return;
      let style = styledDocuments.get(doc);
      if (!style || !style.isConnected) {
        style = doc.createElement('style');
        style.id = 'preview-custom-css-live';
        styledDocuments.set(doc, style);
      }
      if (style.textContent !== activeCss) style.textContent = activeCss;
      if (head.lastElementChild !== style) head.appendChild(style);
      if (!observedDocuments.has(doc)) {
        observedDocuments.add(doc);
        const observer = new MutationObserver(records => {
          if (records.some(record => record.addedNodes.length)) scheduleStyleScan();
        });
        observer.observe(doc.documentElement, {childList:true,subtree:true});
      }
      for (const iframe of doc.querySelectorAll('iframe')) {
        if (!registeredFrames.has(iframe)) {
          registeredFrames.add(iframe);
          iframe.addEventListener('load', scheduleStyleScan);
        }
        try {
          if (iframe.contentDocument?.documentElement) inject(iframe.contentDocument);
        } catch (_error) {
          // Un sous-document tiers (ex. YouTube) reste inaccessible.
        }
      }
    }
    inject(document);
  }
  function scheduleStyleScan() {
    if (cssScanScheduled) return;
    cssScanScheduled = true;
    setTimeout(() => { cssScanScheduled = false; scanStyles(); }, 40);
  }
  function sendCssToChild(source) {
    try { source.postMessage({channel:'h5p-preview-child-css',key:childKey,css:activeCss}, '*'); }
    catch (_err) { childFrames.delete(source); }
  }
  // Le Core H5P peut créer une seconde iframe à origine opaque, inaccessible
  // même depuis le lecteur. Un agent CSS est ajouté à sa propre ressource
  // frame.bundle.js et reçoit exclusivement du CSS via postMessage.
  window.addEventListener('message', event => {
    if (event.data?.channel !== 'h5p-preview-child-ready' || event.data?.key !== childKey) return;
    if (event.source === parent || !event.source) return;
    childFrames.add(event.source);
    sendCssToChild(event.source);
    signal('css-child-ready', 'Sous-document H5P CSS connecté.');
  });
  function installChildCssBridge() {
    const file = entries.get('player/frame.bundle.js');
    if (!file) return;
    const childCode = ';(function(){' +
      '"use strict";const KEY=' + JSON.stringify(childKey) + ';' +
      'let css="";let style=null;let scheduled=false;' +
      'function apply(){if(!document.head)return;' +
        'if(!style||!style.isConnected){style=document.createElement("style");style.id="preview-child-custom-css";}' +
        'if(style.textContent!==css)style.textContent=css;' +
        'if(document.head.lastElementChild!==style)document.head.appendChild(style);}' +
      'window.addEventListener("message",function(e){if(e.source!==parent||e.data?.channel!=="h5p-preview-child-css"||e.data.key!==KEY)return;' +
        'css=String(e.data.css||"");apply();});' +
      'function refresh(){if(scheduled)return;scheduled=true;setTimeout(function(){scheduled=false;apply();},40);}' +
      'new MutationObserver(function(changes){if(changes.some(x=>x.addedNodes.length))refresh();})' +
        '.observe(document.documentElement,{childList:true,subtree:true});' +
      'parent.postMessage({channel:"h5p-preview-child-ready",key:KEY},"*");' +
    '})();';
    const text = new TextDecoder().decode(file.data);
    file.data = new TextEncoder().encode(text + '\n' + childCode).buffer;
  }
  function applyCss(text) {
    activeCss = rewriteCssUrls(String(text || ''));
    const file = entries.get('custom/custom.css');
    if (file) file.data = new TextEncoder().encode(String(text || '')).buffer;
    scanStyles();
    for (const child of childFrames) sendCssToChild(child);
    scheduleStyleScan();
    signal('css-applied', 'CSS envoyé aux documents H5P accessibles et connectés.');
  }
  function reportHeight() {
    const container = document.getElementById('h5p-container');
    // Mesurer le contenu H5P lui-même et non la hauteur de la fenêtre :
    // autrement une activité qui occupe toute l'iframe crée une boucle
    // d'agrandissement à chaque message de redimensionnement.
    const wanted = Math.ceil(container?.scrollHeight || 0);
    const height = Math.max(640, Math.min(wanted + 28, 1400));
    if (Math.abs(height-lastHeight)<32) return;
    lastHeight=height;
    parent.postMessage({channel:'h5p-preview',token,type:'height',height},'*');
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
    // Les images de carte H5P peuvent être insérées via style.backgroundImage,
    // setProperty ou un attribut style, et non uniquement via <img src>.
    for (const property of ['backgroundImage','background']) {
      const descriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, property);
      if (descriptor?.set && descriptor?.get && descriptor.configurable) {
        Object.defineProperty(CSSStyleDeclaration.prototype, property, {
          configurable:true, enumerable:descriptor.enumerable,
          get(){return descriptor.get.call(this);},
          set(value){return descriptor.set.call(this, rewriteCssUrls(value));}
        });
      }
    }
    const nativeSetProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function(name, value, priority) {
      if (String(name).toLowerCase().includes('background') || String(value).includes('url(')) {
        value = rewriteCssUrls(value);
      }
      return nativeSetProperty.call(this, name, value, priority);
    };
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
      const attr = String(name).toLowerCase();
      if (['src','href','poster','xlink:href'].includes(attr)) value = virtualUrl(value) || value;
      if (attr === 'style') value = rewriteCssUrls(value);
      if (attr === 'srcset') value = String(value).split(',').map(part => {
        const fields = part.trim().split(/\s+/);
        if (fields.length) fields[0] = virtualUrl(fields[0]) || fields[0];
        return fields.join(' ');
      }).join(', ');
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
    // Les insertions par innerHTML ne passent pas par nos setters JavaScript.
    // Corriger a posteriori les attributs et styles des nouveaux noeuds.
    let scheduled = false;
    function patchTree(node) {
      if (!(node instanceof Element)) return;
      for (const element of [node, ...node.querySelectorAll('[src],[href],[poster],[srcset],[style]')]) {
        for (const attr of ['src','href','poster','srcset','style']) {
          if (!element.hasAttribute(attr)) continue;
          const original = element.getAttribute(attr);
          if (original !== null) element.setAttribute(attr, original);
        }
      }
    }
    new MutationObserver(mutations => {
      if (scheduled) return;
      if (!mutations.some(m => m.addedNodes.length)) return;
      scheduled = true;
      queueMicrotask(() => {scheduled = false; for (const m of mutations) {
        for (const node of m.addedNodes) patchTree(node);
      }});
    }).observe(document.documentElement, {childList:true, subtree:true});
    void nativeFetch;
  }
  async function boot(payload) {
    for (const item of payload.files) {
      if (!/^(h5p|player|custom)\//.test(item.path) || entries.has(item.path)) throw Error('Chemin de ressource invalide ou dupliqué.');
      entries.set(item.path, {data:item.data,blobUrl:null});
    }
    installMemoryStorage();
    installChildCssBridge();
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
      frame:false,embedType:'div',postUserStatistics:false,saveFreq:false,fullScreen:true,
      customCss:[ROOT+'custom/custom.css']
    };
    let xapiAttached = false;
    function attachXapi() {
      if (xapiAttached || !window.H5P?.externalDispatcher?.on) return false;
      try {
        window.H5P.externalDispatcher.on('xAPI', event => {
          const statement = event?.data?.statement || event?.statement;
          const verb = String(statement?.verb?.id || '').split('/').pop();
          const score=statement?.result?.score;
          const result=(Number.isFinite(score?.raw) && Number.isFinite(score?.max))
            ? ' (score ' + score.raw + '/' + score.max + ')' : '';
          signal('xapi', (verb || 'événement H5P') + result);
        });
        xapiAttached=true;
        signal('xapi-ready','Écoute des événements xAPI active.');
      } catch (_err) { /* L'absence d'un dispatcher n'interrompt pas la lecture. */ }
      return xapiAttached;
    }
    attachXapi();
    await new window.H5PStandalone.H5P(document.getElementById('h5p-container'),opts);
    if (!attachXapi() && !xapiAttached) signal('xapi-unavailable','Le lecteur ne fournit pas de dispatcher xAPI accessible.');
    applyCss(new TextDecoder().decode(entries.get('custom/custom.css')?.data || new ArrayBuffer(0)));
    reportHeight();
    window.addEventListener('resize', reportHeight);
    resizeObserver = new ResizeObserver(() => reportHeight());
    resizeObserver.observe(document.getElementById('h5p-container'));
    signal('ready','Activité chargée. Vous pouvez interagir avec le contenu.');
  }
  window.addEventListener('message', event => {
    if (event.source !== parent || started || event.data?.channel !== 'h5p-preview-init' || !event.data?.token) return;
    started=true;
    token=event.data.token;
    Promise.resolve().then(() => boot(event.data)).catch(error => fail(error?.message || String(error)));
  });
  window.addEventListener('message', event => {
    if (event.source !== parent || !started || event.data?.channel !== 'h5p-preview-control' || event.data?.token !== token) return;
    if (event.data.action === 'css') applyCss(event.data.css || '');
    if (event.data.action === 'resize') {
      // Reporter les notifications après le calcul de layout du navigateur.
      // Certaines bibliothèques recalculent leurs hotspots sur un événement resize.
      const notify = () => {
        window.dispatchEvent(new Event('resize'));
        try { window.H5P?.jQuery?.(window)?.trigger?.('resize'); } catch (_error) {}
        try { (window.H5P?.instances || []).forEach(instance => {
          if (typeof instance?.resize === 'function') instance.resize();
          else if (typeof instance?.trigger === 'function') instance.trigger('resize');
        }); } catch (_error) {}
        reportHeight();
      };
      requestAnimationFrame(() => requestAnimationFrame(notify));
    }
  });
  window.addEventListener('unload', () => {resizeObserver?.disconnect();objectUrls.forEach(url => URL.revokeObjectURL(url));});
  parent.postMessage({channel:'h5p-preview-boot'},'*');
})();`;
  function documentSource(options = {}) {
    const iframeHosts=options.allowYoutube
      ? 'https://www.youtube.com https://www.youtube-nocookie.com'
      : "'none'";
    const extraScripts=options.allowYoutube
      ? ' https://www.youtube.com https://www.youtube-nocookie.com https://s.ytimg.com'
      : '';
    const extraImages=options.allowYoutube
      ? ' https://i.ytimg.com https://img.youtube.com'
      : '';
    const connections=options.allowYoutube ? 'https://www.youtube.com' : "'none'";
    return '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
      '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\' blob:' + extraScripts + '; style-src \'unsafe-inline\' blob:; img-src blob: data:' + extraImages + '; font-src blob: data:; media-src blob: data:; connect-src ' + connections + '; frame-src ' + iframeHosts + '; object-src \'none\'; form-action \'none\'; base-uri \'none\'">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>body{margin:0;padding:12px;font:16px system-ui;background:white;color:#172033}#preview-error{white-space:pre-wrap;color:#992a2a}#preview-error[hidden]{display:none}</style></head>' +
      '<body><div id="preview-error" role="alert" hidden></div><div id="h5p-container"></div><script>' +
      SCRIPT.replaceAll('</script', '<\\/script') + '</script></body></html>';
  }
  root.H5PConverterModules = root.H5PConverterModules || {};
  root.H5PConverterModules.previewFrame = { documentSource };
})(globalThis);
