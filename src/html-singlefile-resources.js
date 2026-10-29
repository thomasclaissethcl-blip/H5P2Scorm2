/* Lot 8.2 : preuve de mise en conteneur d'un inventaire H5P dans UN HTML.
 * Ce document est un auto-test de lecture des ressources, pas un lecteur H5P.
 * Il n'intercepte pas encore les fetch/XHR, scripts et CSS dynamiques du runtime.
 * Aucun contenu H5P importé n'est exécuté dans le prototype.
 */
(function(root){
  'use strict';
  const LIMIT_BYTES=32*1024*1024;
  const LIMIT_FILES=5000;
  const MIME={json:'application/json',js:'text/javascript',css:'text/css',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',woff:'font/woff',woff2:'font/woff2',mp3:'audio/mpeg',mp4:'video/mp4',webm:'video/webm',txt:'text/plain',html:'text/html'};
  const escapeHtml=value=>String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  function safePath(path){
    if(typeof path!=='string'||path.length>500||path.startsWith('/')||path.includes('\\')||/[\x00-\x1f]/.test(path)) return false;
    const bits=path.split('/');
    return bits.length>0&&bits.every(s=>s.length>0&&s!=='.'&&s!=='..'&&!/%(?:2e|2f|5c)/i.test(s));
  }
  function mime(path){return MIME[path.split('.').pop().toLowerCase()]||'application/octet-stream';}
  function base64(bytes){
    // Sous navigateur : codage par blocs pour ne pas depasser la taille d'arguments.
    let result='';
    for(let k=0;k<bytes.length;k+=16383){
      const slice=bytes.subarray(k,k+16383);
      let string='';
      for(let i=0;i<slice.length;i++)string+=String.fromCharCode(slice[i]);
      result+=root.btoa(string);
    }
    return result;
  }
  function normalizeLookup(value){
    const raw=String(value||'').split(/[?#]/)[0].replace(/^(?:\.\/)+/,'');
    let decoded;
    try{decoded=decodeURIComponent(raw);}catch(_){return null;}
    return safePath(decoded)?decoded:null;
  }
  // Resolution locale bornee : les ../ internes sont autorises, jamais la sortie
  // de l'arborescence ni les schemas externes, data:, blob:, etc.
  function resolveRelative(request,base=''){
    const raw=String(request??'').split(/[?#]/)[0];
    if(!raw||/^[a-z][a-z0-9+.-]*:/i.test(raw)||raw.startsWith('/')||raw.includes('\\'))return null;
    let decoded;
    try{decoded=decodeURIComponent(raw);}catch(_){return null;}
    if(!decoded||decoded.startsWith('/')||decoded.includes('\\')||/[\x00-\x1f]/.test(decoded))return null;
    const stack=base?String(base).split('/').slice(0,-1):[];
    if(stack.some(x=>!x||x==='..'||x==='.' ))return null;
    for(const bit of decoded.split('/')){
      if(!bit||bit==='.')continue;
      if(bit==='..'){if(!stack.length)return null;stack.pop();continue;}
      stack.push(bit);
    }
    const out=stack.join('/');
    return safePath(out)?out:null;
  }
  async function collect({files,maxBytes=LIMIT_BYTES,maxFiles=LIMIT_FILES}={}){
    if(!files||typeof files!=='object')throw new TypeError('Fichiers source absents.');
    const paths=Object.keys(files).filter(path=>!files[path].dir).sort();
    if(paths.length>maxFiles)throw new Error(`Trop de ressources pour le prototype : ${paths.length}/${maxFiles}.`);
    let total=0;const records=Object.create(null);
    for(const path of paths){
      if(!safePath(path))throw new Error(`Chemin de ressource non sûr : ${path}`);
      if(typeof files[path].async!=='function')throw new Error(`Entrée non lisible : ${path}`);
      const predicted=files[path]._data?.uncompressedSize;
      if(Number.isFinite(predicted)&&predicted>maxBytes-total)throw new Error('Prototype refusé : volume de ressources supérieur à 32 Mio.');
      const bytes=await files[path].async('uint8array');
      total+=bytes.length;
      if(total>maxBytes)throw new Error('Prototype refusé : volume de ressources supérieur à 32 Mio.');
      records[path]={mime:mime(path),size:bytes.length,base64:base64(bytes)};
    }
    return Object.freeze({schemaVersion:1,kind:'resource-container-only',fileCount:paths.length,totalBytes:total,records});
  }
  function render({title='Prototype de ressources H5P',bundle}={}){
    if(!bundle||bundle.schemaVersion!==1||!bundle.records)throw new TypeError('Conteneur invalide.');
    // Le JSON dans un script inerte n'est pas du code execute. Bloquer </script>.
    const data=JSON.stringify(bundle).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font:16px/1.5 system-ui,Arial,sans-serif;max-width:860px;margin:30px auto;padding:0 16px;color:#222}section{border:1px solid #bbb;padding:16px;margin:14px 0}code{overflow-wrap:anywhere}img{max-width:100%;max-height:160px}#result{white-space:pre-wrap} .warning{color:#872d18} #media-preview{display:flex;flex-wrap:wrap;gap:12px} #media-preview figure{margin:0;max-width:260px} #media-preview figcaption{font-size:12px;overflow-wrap:anywhere} progress{width:100%;max-width:480px}</style></head><body><h1>Lot 8.2 : prototype de ressources H5P</h1><p class="warning"><strong>Diagnostic uniquement.</strong> Ce document intègre les ressources dans un unique HTML, mais ne lance aucune activité H5P et ne fournit pas la lecture interactive.</p><section><h2>Contrôles hors ligne</h2><p id="result" role="status">Préparation du diagnostic…</p><progress id="check-progress" max="100" value="0" aria-label="Progression du contrôle des ressources"></progress><h3>Aperçus des images du contenu</h3><div id="media-preview"></div></section><p>La disponibilité des fichiers est testée sans serveur, y compris sous <code>file://</code>. Le moteur H5P Standalone exige encore une résolution fiable des chargements dynamiques avant la qualification d'un export monofichier interactif.</p><script type="application/json" id="embedded-resource-manifest">${data}</script><script>
(function(){'use strict';
  const bundle=JSON.parse(document.getElementById('embedded-resource-manifest').textContent);
  function path(input,base=''){const raw=String(input||'').split(/[?#]/)[0];if(!raw||/^[a-z][a-z0-9+.-]*:/i.test(raw)||raw.startsWith('/')||raw.includes('\\\\'))return null;let decoded;try{decoded=decodeURIComponent(raw)}catch(_){return null}if(!decoded||decoded.includes('\\\\'))return null;const stack=base?String(base).split('/').slice(0,-1):[];for(const bit of decoded.split('/')){if(!bit||bit==='.')continue;if(bit==='..'){if(!stack.length)return null;stack.pop();continue;}stack.push(bit);}const out=stack.join('/');if(!out||out.startsWith('/')||out.split('/').some(s=>!s||s==='.'||s==='..'))return null;return out;}
  function get(input,base){const key=path(input,base);return key&&Object.prototype.hasOwnProperty.call(bundle.records,key)?bundle.records[key]:null;}
  function dataUrl(input,base){const rec=get(input,base);return rec?'data:'+rec.mime+';base64,'+rec.base64:null;}
  function bytes(input,base){const rec=get(input,base);if(!rec)return null;const raw=atob(rec.base64);const arr=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);return arr;}
  function cssText(input){const file=path(input);const data=bytes(file);if(!data)return null;const text=new TextDecoder().decode(data);return text.replace(/url\\(\\s*(['"]?)([^)'"]+)\\1\\s*\\)/gi,(whole,quote,target)=>{const found=dataUrl(target.trim(),file);return found?'url("'+found+'")':whole;});}
  // API d'inspection volontairement en lecture seule, aucun script H5P execute.
  window.H5PResourcePrototype=Object.freeze({resolve:path,get:function(p,base){const r=get(p,base);return r?Object.freeze({mime:r.mime,size:r.size}):null},dataUrl,bytes,cssText});
  // Afficher les vraies images du contenu (pas les polices SVG ni les icones de bibliotheques).
  const paths=Object.keys(bundle.records);
  const imagePaths=paths.filter(p=>/^h5p\\/content\\//i.test(p)&&/\\.(png|jpe?g|gif|webp)$/i.test(p));
  const previews=document.getElementById('media-preview');
  const chosen=imagePaths.slice(0,3);
  if(chosen.length){
    chosen.forEach(p=>{
      const figure=document.createElement('figure');
      const img=document.createElement('img');img.alt='Image du contenu H5P : '+p;img.src=dataUrl(p);img.loading='eager';
      const label=document.createElement('figcaption');label.textContent=p;
      img.addEventListener('error',()=>{label.textContent=p+' (image non affichable)';});
      figure.appendChild(img);figure.appendChild(label);previews.appendChild(figure);
    });
  } else {
    previews.textContent='Aucune image matricielle dans le dossier de contenu. Les autres ressources restent inventoriees.';
  }
  const result=document.getElementById('result');
  const progress=document.getElementById('check-progress');
  const meta=bytes('h5p/h5p.json');const content=bytes('h5p/content/content.json');
  const required=['h5p/h5p.json','h5p/content/content.json','player/main.bundle.js','player/frame.bundle.js','player/styles/h5p.css'];
  const missing=required.filter(p=>!get(p));
  let parsed=false;
  try{if(meta&&content){JSON.parse(new TextDecoder().decode(meta));JSON.parse(new TextDecoder().decode(content));parsed=true;}}catch(_){parsed=false;}
  // Un controle progressif libere le thread principal pour l'affichage et les interactions.
  async function verify(){
    let actual=0;const mismatches=[];
    const step=10;
    for(let i=0;i<paths.length;i+=step){
      for(const p of paths.slice(i,i+step)){
        const b=bytes(p);
        if(!b){mismatches.push(p);continue;}
        actual+=b.length;
        if(b.length!==bundle.records[p].size)mismatches.push(p);
      }
      const checked=Math.min(paths.length,i+step);
      progress.value=paths.length?Math.round(checked*100/paths.length):100;
      result.textContent='Verification en cours : '+checked+' / '+paths.length+' fichiers ('+progress.value+' %).';
      await new Promise(resolve=>setTimeout(resolve,0));
    }
    const success=!missing.length&&!mismatches.length&&parsed&&actual===bundle.totalBytes&&paths.length===bundle.fileCount;
    result.textContent=(success?'RESSOURCES VERIFIEES':'DIAGNOSTIC INCOMPLET')+'\\nFichiers integres : '+paths.length+'\\nOctets verifies : '+actual+'\\nMetadonnees JSON : '+(parsed?'OK':'absentes ou invalides')+'\\nRessources indispensables absentes : '+(missing.join(', ')||'aucune')+'\\nTailles incorrectes : '+mismatches.length+'\\nImages du contenu detectees : '+imagePaths.length;
    document.documentElement.dataset.resourceCheck=success?'ok':'error';
    progress.value=100;
  }
  verify().catch(error=>{
    document.documentElement.dataset.resourceCheck='error';
    result.textContent='ECHEC DU DIAGNOSTIC : '+String(error?.message||error);
  });
})();
</script></body></html>`;
  }
  const api=Object.freeze({safePath,mime,base64,normalizeLookup,resolveRelative,collect,render,LIMIT_BYTES,LIMIT_FILES});
  const modules=root.H5PConverterModules||(root.H5PConverterModules={});
  modules.htmlSinglefileResources=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
