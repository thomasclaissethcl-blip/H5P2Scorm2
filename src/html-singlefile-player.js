/* Lot 8.3b : résolution des styles Memory, médias locaux et diagnostic hors ligne.
 * Lot 8.3a : prototype de lecture monofichier expérimental.
 * Résolution virtuelle des fichiers intégrés, sans backend ni CDN à l'exécution.
 * Le runtime s'exécute uniquement dans le document exporté, jamais dans le convertisseur.
 * Ne constitue pas une qualification universelle des H5P ni du protocole file://.
 */
(function(root){
  'use strict';
  const MAX_BYTES=32*1024*1024;
  const MUST_HAVE=['h5p/h5p.json','h5p/content/content.json','player/main.bundle.js','player/frame.bundle.js','player/styles/h5p.css'];
  function escapeHtml(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function safeJson(data){return JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');}
  function validate(bundle){
    if(!bundle||bundle.schemaVersion!==1||!bundle.records||typeof bundle.records!=='object')throw new Error('Ressources monofichier manquantes.');
    if(!Number.isFinite(bundle.totalBytes)||bundle.totalBytes>MAX_BYTES||bundle.totalBytes<0)throw new Error('Limite de volume monofichier atteinte (32 Mio).');
    const missing=MUST_HAVE.filter(p=>!Object.prototype.hasOwnProperty.call(bundle.records,p));
    if(missing.length)throw new Error('Ressources obligatoires manquantes : '+missing.join(', '));
    for(const [p,r] of Object.entries(bundle.records)){
      if(!/^(?:[\w.-]+\/)*[\w.-]+$/.test(p)||p.split('/').includes('..')||!r||!/^[-\w./+]+$/.test(r.mime)||!Number.isSafeInteger(r.size)||r.size<0||typeof r.base64!=='string')throw new Error('Ressource monofichier invalide : '+p);
    }
    return true;
  }

  // Diagnostic statique des médias. Une URL YouTube n'est pas un fichier vidéo
  // présent dans l'archive H5P : ne jamais annoncer un export vidéo hors ligne.
  function inspectOfflineMedia(bundle){
    validate(bundle);
    const record=bundle.records['h5p/content/content.json'];
    const externalMedia=[];const missingLocalMedia=[];let localMediaReferences=0;
    let content;
    try{
      const binary=atob(record.base64);const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      content=JSON.parse(new TextDecoder().decode(bytes));
    }catch(_){return {externalMedia:[],missingLocalMedia:[],localMediaReferences:0,parseError:true};}
    function scan(item,depth){
      if(depth>60||externalMedia.length>200)return;
      if(Array.isArray(item)){for(const v of item)scan(v,depth+1);return;}
      if(!item||typeof item!=='object')return;
      if(typeof item.path==='string'){
        const source=item.path;const mime=String(item.mime||'');
        const isMedia=/^(?:audio|video)\//i.test(mime)||/\.(?:mp3|m4a|ogg|wav|mp4|m4v|webm|ogv)(?:[?#]|$)/i.test(source);
        if(isMedia){
          if(/^(?:https?:)?\/\//i.test(source)){
            const service=/youtu/i.test(source)?'YouTube':/vimeo/i.test(source)?'Vimeo':'fichier externe';
            externalMedia.push({service,kind:/^audio\//i.test(mime)?'audio':'video'});
          }else{
            const normalized=source.split(/[?#]/)[0].replace(/^(?:\.\/)+/,'');
            const path=normalized.startsWith('h5p/content/')?normalized:'h5p/content/'+normalized;
            if(Object.prototype.hasOwnProperty.call(bundle.records,path))localMediaReferences++;
            else missingLocalMedia.push(path.slice(0,200));
          }
        }
      }
      for(const v of Object.values(item))scan(v,depth+1);
    }
    scan(content,0);
    const localVideoFiles=Object.keys(bundle.records).filter(x=>/^h5p\/content\//.test(x)&&/\.(?:mp4|webm|m4v|ogv)$/i.test(x)).length;
    return {externalMedia,missingLocalMedia,localMediaReferences,localVideoFiles,parseError:false};
  }

  // This function is stringified verbatim into the exported HTML.
  // No external script is fetched by the bootstrap itself.
  function playbackRuntime(config){
    'use strict';
    const manifest=document.getElementById('embedded-h5p-resources');
    const status=document.getElementById('singlefile-status');
    const bundle=JSON.parse(document.getElementById('embedded-h5p-resources').textContent);
    const report={state:'booting',missing:[],assetRequests:0,assetHits:0,scriptErrors:[],runtimeError:null,externalRequests:[]};
    const mediaReport=config.mediaReport||{externalMedia:[],missingLocalMedia:[],localVideoFiles:0};
    window.H5PConverterSinglefileAudit=()=>Object.freeze({
      state:report.state,assetRequests:report.assetRequests,assetHits:report.assetHits,
      missing:report.missing.slice(0,20),scriptErrors:report.scriptErrors.slice(0,10),runtimeError:report.runtimeError,
      embeddedVideos:mediaReport.localVideoFiles||0,
      externalVideos:(mediaReport.externalMedia||[]).filter(v=>v.kind==='video').slice(0,20),
      missingLocalMedia:(mediaReport.missingLocalMedia||[]).slice(0,20),
      noExternalMediaDetected:(mediaReport.externalMedia||[]).length===0&&(mediaReport.missingLocalMedia||[]).length===0&&!mediaReport.parseError,
      externalRequests:report.externalRequests.slice(0,20)
    });
    function setStatus(msg,isError){
      if(!status)return;
      status.textContent=msg||'';
      status.hidden=!msg;
      status.style.color=isError?'#9c2525':'#35485e';
      document.documentElement.dataset.h5pSinglefileStatus=isError?'error':report.state;
    }
    const files=bundle.records;
    const nativeFetch=window.fetch?window.fetch.bind(window):null;
    const NativeXHR=window.XMLHttpRequest;
    const nativeCreateURL=URL.createObjectURL.bind(URL);
    const blobUrls=new Map();
    const decoded=new Map();
    const decoder=new TextDecoder();
    function normalize(input){
      let raw=String(input||'');
      if(!raw||/^(?:data|blob|javascript|mailto):/i.test(raw))return null;
      if(raw.startsWith('about://blank/')){
        const marker=raw.match(/\/(h5p|player|custom|html)\//);
        if(!marker)return null;raw=raw.slice(marker.index+1);
      }
      if(/^[a-z][a-z\d+.-]*:/i.test(raw)||raw.startsWith('//')){
        let url;try{url=new URL(raw,document.baseURI);}catch(_){return null;}
        if(!['file:','https:','http:'].includes(url.protocol))return null;
        // Ne jamais rediriger une URL distante tierce vers un fichier embarqué.
        if(url.protocol!==location.protocol||url.host!==location.host)return null;
        raw=url.pathname;
        const match=raw.match(/\/(h5p|player|custom|html)\//);
        if(!match)return null;
        raw=raw.slice(match.index+1);
      }
      raw=raw.split(/[?#]/)[0].replace(/^(?:\.\/)+/,'');
      if(raw.startsWith('/'))return null;
      try{raw=decodeURIComponent(raw);}catch(_){return null;}
      const parts=[];
      for(const p of raw.split('/')){
        if(!p||p==='.')continue;
        if(p==='..'){if(!parts.length)return null;parts.pop();continue;}
        if(p.includes('\\')||/[\x00-\x1f]/.test(p))return null;
        parts.push(p);
      }
      return parts.join('/')||null;
    }
    function locate(input){
      const p=normalize(input);
      if(p && Object.prototype.hasOwnProperty.call(files,p))return p;
      return null;
    }
    function bytes(path){
      if(decoded.has(path))return decoded.get(path);
      const file=files[path];if(!file)return null;
      const binary=atob(file.base64);const out=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);
      if(out.length!==file.size)throw new Error('Taille de ressource incorrecte : '+path);
      decoded.set(path,out);
      return out;
    }
    function text(path){return decoder.decode(bytes(path));}
    function relative(url,source){
      let raw=String(url||'').trim();
      if(raw.startsWith('data:')||raw.startsWith('blob:')||raw.startsWith('#'))return null;
      if(/^[a-z][a-z\d+.-]*:/i.test(raw))return locate(raw);
      const base=source.split('/').slice(0,-1).join('/');
      return locate(base+'/'+raw);
    }
    function cssText(path,seen){
      seen=seen||new Set();
      if(seen.has(path))return '';
      seen.add(path);
      // @import is resolved by URL -> blob CSS, with its own relative references.
      return text(path).replace(/url\(\s*(['"]?)([^)'"\n]+)\1\s*\)/gi,(match,q,url)=>{
        const found=relative(url,path);return found?'url("'+objectUrl(found,seen)+'")':match;
      });
    }
    function objectUrl(path,seen){
      if(blobUrls.has(path))return blobUrls.get(path);
      const file=files[path];if(!file)return null;
      const content=path.endsWith('.css')?cssText(path,seen):bytes(path);
      const url=nativeCreateURL(new Blob([content],{type:file.mime}));
      blobUrls.set(path,url);return url;
    }
    function virtualUrl(url){
      const key=locate(url);
      if(!key)return null;
      report.assetHits++;
      return objectUrl(key);
    }
    // Fetch JSON et fichiers binaires lus par H5P Standalone / H5P Core.
    if(nativeFetch){
      window.fetch=function(input,init){
        const url=typeof input==='string'?input:input&&input.url;
        const key=locate(url);
        if(!key){
          if(url && (/^(?:\.\/)?(?:h5p|player|custom|html)\//.test(String(url)))){
            report.missing.push(String(url).slice(0,250));
            return Promise.resolve(new Response('Ressource H5P absente',{status:404}));
          }
          if(typeof url==='string'&&/^https?:\/\//i.test(url)&&report.externalRequests.length<100)report.externalRequests.push(url.slice(0,250));
          return nativeFetch(input,init);
        }
        report.assetRequests++;report.assetHits++;
        return Promise.resolve(new Response(bytes(key),{status:200,headers:{'Content-Type':files[key].mime}}));
      };
    }
    // Interception des chargements via XHR (H5P Core et bibliothèques jQuery).
    if(NativeXHR){
      window.XMLHttpRequest=function(){
        let native=null,local=null,finished=false;
        const target=new EventTarget();
        const request={readyState:0,status:0,statusText:'',response:null,responseText:'',responseURL:'',responseType:'',timeout:0,withCredentials:false,onreadystatechange:null,onload:null,onerror:null,onloadend:null};
        request.addEventListener=(...args)=>target.addEventListener(...args);
        request.removeEventListener=(...args)=>target.removeEventListener(...args);
        function emit(name){const evt=new Event(name);target.dispatchEvent(evt);if(typeof request['on'+name]==='function')request['on'+name](evt);}
        request.open=function(method,url,async=true,username,password){
          local=locate(url);
          if(local){request.readyState=1;request.responseURL=String(url);emit('readystatechange');}
          else{
            native=new NativeXHR();
            native.open(method,url,async,username,password);
            for(const name of ['readystatechange','load','error','loadend','progress','abort','timeout']){
              native.addEventListener(name,e=>{
                for(const key of ['readyState','status','statusText','response','responseText','responseURL']){
                  try{request[key]=native[key];}catch(_){}
                }
                emit(name);
              });
            }
          }
        };
        request.send=function(body){
          if(!local){if(native){native.responseType=request.responseType;native.timeout=request.timeout;native.withCredentials=request.withCredentials;native.send(body);}return;}
          report.assetRequests++;report.assetHits++;
          const data=bytes(local);
          queueMicrotask(()=>{
            if(finished)return;
            request.readyState=4;request.status=200;request.statusText='OK';
            if(request.responseType==='arraybuffer')request.response=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);
            else if(request.responseType==='blob')request.response=new Blob([data],{type:files[local].mime});
            else if(request.responseType==='json'){request.response=JSON.parse(decoder.decode(data));request.responseText='';}
            else{request.responseText=decoder.decode(data);request.response=request.responseText;}
            emit('readystatechange');emit('load');emit('loadend');
          });
        };
        request.abort=function(){finished=true;if(native)native.abort();};
        request.setRequestHeader=function(k,v){if(native)native.setRequestHeader(k,v);};
        request.getResponseHeader=function(k){return local?(k.toLowerCase()==='content-type'?files[local].mime:null):native&&native.getResponseHeader(k);};
        request.getAllResponseHeaders=function(){return local?'content-type: '+files[local].mime+'\r\n':native&&native.getAllResponseHeaders();};
        request.overrideMimeType=function(t){if(native&&native.overrideMimeType)native.overrideMimeType(t);};
        return request;
      };
      window.XMLHttpRequest.UNSENT=0;window.XMLHttpRequest.OPENED=1;window.XMLHttpRequest.HEADERS_RECEIVED=2;window.XMLHttpRequest.LOADING=3;window.XMLHttpRequest.DONE=4;
    }
    // Certaines bibliothèques (Memory, par exemple) construisent des balises HTML
    // et des styles inline sous forme de chaînes. Le parseur HTML n'appelle pas
    // Element.setAttribute ; un MutationObserver est donc indispensable.
    const rewriteStyle=value=>String(value).replace(/url\(\s*(['"]?)([^)'"\n]+)\1\s*\)/gi,(whole,q,target)=>{
      const found=virtualUrl(target);return found?'url("'+found+'")':whole;
    });
    const originalSetAttribute=Element.prototype.setAttribute;
    const resourceAttributes=['src','href','poster','data'];
    const watchedAttributes=[...resourceAttributes,'style'];
    function rewriteElement(element){
      if(!element||element.nodeType!==1)return;
      for(const attribute of watchedAttributes){
        const current=element.getAttribute(attribute);
        if(!current)continue;
        const next=attribute==='style'?rewriteStyle(current):virtualUrl(current);
        if(next&&next!==current)originalSetAttribute.call(element,attribute,next);
      }
    }
    Element.prototype.setAttribute=function(name,value){
      if(typeof value==='string'){
        if(String(name).toLowerCase()==='style')value=rewriteStyle(value);
        else if(resourceAttributes.includes(String(name).toLowerCase()))value=virtualUrl(value)||value;
      }
      return originalSetAttribute.call(this,name,value);
    };
    for(const [klass,prop] of [
      ['HTMLScriptElement','src'],['HTMLLinkElement','href'],['HTMLImageElement','src'],
      ['HTMLSourceElement','src'],['HTMLAudioElement','src'],['HTMLVideoElement','src'],
      ['HTMLVideoElement','poster'],['HTMLIFrameElement','src']
    ]){
      const ctor=window[klass];if(!ctor)continue;
      const desc=Object.getOwnPropertyDescriptor(ctor.prototype,prop);
      if(!desc||!desc.configurable||!desc.set||!desc.get)continue;
      Object.defineProperty(ctor.prototype,prop,{configurable:true,enumerable:desc.enumerable,
        get:function(){return desc.get.call(this);},
        set:function(value){const replacement=typeof value==='string'&&virtualUrl(value);return desc.set.call(this,replacement||value);}
      });
    }
    const nativeSetAttributeNS=Element.prototype.setAttributeNS;
    Element.prototype.setAttributeNS=function(ns,name,value){
      const isLink=/^(?:xlink:)?href$/i.test(String(name));
      const replacement=isLink&&typeof value==='string'?virtualUrl(value):null;
      return nativeSetAttributeNS.call(this,ns,name,replacement||value);
    };
    const nativeStyleSetter=CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty=function(name,value,priority){
      return nativeStyleSetter.call(this,name,typeof value==='string'&&/image|background|mask/i.test(name)?rewriteStyle(value):value,priority);
    };
    for(const prop of ['backgroundImage','maskImage','borderImageSource','listStyleImage','cssText']){
      const desc=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,prop);
      if(desc&&desc.configurable&&desc.set&&desc.get){
        Object.defineProperty(CSSStyleDeclaration.prototype,prop,{configurable:true,enumerable:desc.enumerable,
          get:function(){return desc.get.call(this);},set:function(value){return desc.set.call(this,rewriteStyle(value));}});
      }
    }
    // jQuery.parseHTML() et H5P.MemoryGame.Card produisent du HTML sous forme
    // de chaînes. Le navigateur peut charger les <img> avant l'insertion dans
    // le DOM : réécrire les URL AVANT l'appel au parseur HTML.
    function rewriteInlineHtml(value){
      if(typeof value!=='string'||!value.includes('h5p/'))return value;
      let html=value.replace(/\b(src|href|poster|data)\s*=\s*(["'])(.*?)\2/gi,(all,name,quote,target)=>{
        const resolved=virtualUrl(target);
        return resolved?name+'='+quote+resolved+quote:all;
      });
      // Les cartes Memory contiennent aussi un background-image inline.
      html=html.replace(/\bstyle\s*=\s*(["'])(.*?)\1/gi,(all,q,style)=>{
        const replaced=rewriteStyle(style);
        return replaced!==style?'style='+q+replaced+q:all;
      });
      return html;
    }
    const innerDescriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
    if(innerDescriptor&&innerDescriptor.configurable&&innerDescriptor.set&&innerDescriptor.get){
      Object.defineProperty(Element.prototype,'innerHTML',{configurable:true,enumerable:innerDescriptor.enumerable,
        get:function(){return innerDescriptor.get.call(this);},
        set:function(value){return innerDescriptor.set.call(this,rewriteInlineHtml(value));}});
    }
    const nativeInsertHTML=Element.prototype.insertAdjacentHTML;
    if(nativeInsertHTML)Element.prototype.insertAdjacentHTML=function(position,html){
      return nativeInsertHTML.call(this,position,rewriteInlineHtml(html));
    };
    const observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        if(mutation.type==='attributes')rewriteElement(mutation.target);
        for(const node of mutation.addedNodes){
          if(node.nodeType!==1)continue;
          rewriteElement(node);
          if(node.querySelectorAll)for(const descendant of node.querySelectorAll('[src],[href],[poster],[data],[style]'))rewriteElement(descendant);
        }
      }
    });
    observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:watchedAttributes});
    document.documentElement.lang=config.language||'en';
    // Certains environnements (dont les origines opaques) refusent localStorage.
    // L'HTML simple n'a pas de contrat de persistance LMS : stockage mémoire de secours.
    try{window.localStorage.getItem('__h5p_singlefile_probe__');}
    catch(_){
      const memory=new Map();
      const fallback={getItem:k=>memory.has(String(k))?memory.get(String(k)):null,
        setItem:(k,v)=>{memory.set(String(k),String(v));},removeItem:k=>{memory.delete(String(k));},
        clear:()=>memory.clear(),key:i=>Array.from(memory.keys())[i]||null};
      Object.defineProperty(fallback,'length',{get:()=>memory.size});
      try{Object.defineProperty(window,'localStorage',{configurable:true,value:fallback});}catch(_){}
    }
    async function boot(){
      try{
        setStatus('Initialisation du lecteur H5P…');
        const main=document.createElement('script');
        main.textContent=text('player/main.bundle.js');
        document.head.appendChild(main);
        if(!window.H5PStandalone||typeof H5PStandalone.H5P!=='function')throw new Error('Lecteur H5P non initialisé.');
        const options={
          id:'h5p-singlefile-content',
          h5pJsonPath:'./h5p',contentJsonPath:'./h5p/content',librariesPath:'./h5p',
          frameJs:'./player/frame.bundle.js',frameCss:'./player/styles/h5p.css',
          customCss:['./custom/custom.css'],frame:false,embedType:'div',
          copyright:false,export:false,fullScreen:true,reportingIsEnabled:true
        };
        if(config.translations)options.translations=config.translations;
        await new H5PStandalone.H5P(document.getElementById('h5p-container'),options);
        report.state='ready';
        if((mediaReport.externalMedia||[]).length){
          setStatus('Attention : '+mediaReport.externalMedia.length+' média(s) externe(s), notamment YouTube/Vimeo, nécessitent Internet et peuvent être bloqués en ouverture locale. Ces vidéos ne sont pas intégrées dans le fichier H5P. Les vidéos locales MP4/WebM restent embarquées.');
        }else if((mediaReport.missingLocalMedia||[]).length){
          setStatus('Attention : '+mediaReport.missingLocalMedia.length+' média(s) locaux sont absents du fichier H5P source.');
        }else setStatus('');
      }catch(error){
        report.state='error';report.runtimeError=error&&error.message?error.message:String(error);
        setStatus('Ce contenu ne peut pas être lancé dans ce prototype monofichier : '+report.runtimeError+' Utilisez le HTML multifichier.',true);
        console.error('H5P monofichier expérimental',error);
      }
    }
    window.addEventListener('error',e=>{if(e.target&&e.target.tagName==='SCRIPT')report.scriptErrors.push(e.target.src||'script');},true);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else void boot();
  }
  function render({bundle,title='Activité H5P',language='en',translations=null,layoutCss=''}={}){
    validate(bundle);
    const cfg={language:String(language||'en'),translations,mediaReport:inspectOfflineMedia(bundle)};
    return '<!doctype html>\n<html lang="'+escapeHtml(language||'en')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHtml(title)+'</title><style>html,body{margin:0;padding:0;min-height:100%;background:#fff;color:#222}#h5p-container{width:100%}#singlefile-status{font:14px/1.5 Arial,sans-serif;padding:12px;white-space:pre-wrap}#singlefile-status[hidden]{display:none}'+String(layoutCss||'')+'</style></head><body><div id="singlefile-status" role="status">Initialisation du monofichier expérimental…</div><div id="h5p-container"></div><script id="embedded-h5p-resources" type="application/json">'+safeJson(bundle)+'</script><script>('+playbackRuntime.toString()+')('+safeJson(cfg)+');</script></body></html>';
  }
  const api=Object.freeze({validate,render,inspectOfflineMedia,MAX_BYTES,MUST_HAVE});
  const mods=root.H5PConverterModules||(root.H5PConverterModules={});
  mods.htmlSinglefilePlayer=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
