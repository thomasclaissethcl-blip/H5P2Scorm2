/* Conteneur de ressources monofichier réutilisé par le lecteur interactif.
 * Préserve la validation des chemins, les limites et l'encodage contrôlé.
 */
(function(root){
  'use strict';
  const LIMIT_BYTES=32*1024*1024;
  const LIMIT_FILES=5000;
  const MIME={json:'application/json',js:'text/javascript',css:'text/css',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',woff:'font/woff',woff2:'font/woff2',mp3:'audio/mpeg',mp4:'video/mp4',webm:'video/webm',txt:'text/plain',html:'text/html'};
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
  async function collect({files,maxBytes=LIMIT_BYTES,maxFiles=LIMIT_FILES,onProgress}={}){
    if(!files||typeof files!=='object')throw new TypeError('Fichiers source absents.');
    const paths=Object.keys(files).filter(path=>!files[path].dir).sort();
    if(paths.length>maxFiles)throw new Error(`Trop de ressources pour le monofichier : ${paths.length}/${maxFiles}.`);
    let total=0;const records=Object.create(null);
    const reportEvery=Math.max(1,Math.ceil(paths.length/100));
    let completed=0;
    if(typeof onProgress==='function'&&!paths.length)onProgress({completed:0,total:0,percent:100});
    for(const path of paths){
      if(!safePath(path))throw new Error(`Chemin de ressource non sûr : ${path}`);
      if(typeof files[path].async!=='function')throw new Error(`Entrée non lisible : ${path}`);
      const predicted=files[path]._data?.uncompressedSize;
      if(Number.isFinite(predicted)&&predicted>maxBytes-total)throw new Error('Monofichier refusé : volume de ressources supérieur à 32 Mio.');
      const bytes=await files[path].async('uint8array');
      total+=bytes.length;
      if(total>maxBytes)throw new Error('Monofichier refusé : volume de ressources supérieur à 32 Mio.');
      records[path]={mime:mime(path),size:bytes.length,base64:base64(bytes)};
      // Avancement reel (nombre de fichiers lus), limite a environ 100 mises a jour.
      // La callback est facultative pour conserver le contrat existant.
      completed++;
      if(typeof onProgress==='function'&&(completed%reportEvery===0||completed===paths.length)){
        onProgress({completed,total:paths.length,percent:100*completed/paths.length});
      }
    }
    return Object.freeze({schemaVersion:1,kind:'resource-container-only',fileCount:paths.length,totalBytes:total,records});
  }
  const api=Object.freeze({safePath,mime,base64,collect,LIMIT_BYTES,LIMIT_FILES});
  const modules=root.H5PConverterModules||(root.H5PConverterModules={});
  modules.htmlSinglefileResources=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
