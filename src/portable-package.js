/* Lot 6.1 : copie mutualisée des ressources H5P vers un paquet portable.
 * Le format interne h5p/ est le même pour SCORM et les futurs exports HTML.
 * Aucune écriture sur l'archive importée, aucune interprétation de JavaScript tiers.
 */
(function(root){
  'use strict';
  async function copyH5p({sourceZip,targetZip,h5pJson,contentJson,safePath}){
    if(!sourceZip?.files || typeof targetZip?.file!=='function' || typeof safePath!=='function')
      throw new TypeError('Contrat de copie H5P invalide.');
    if(!h5pJson || typeof h5pJson!=='object' || !contentJson || typeof contentJson!=='object')
      throw new TypeError('Métadonnées H5P absentes.');
    const paths=Object.keys(sourceZip.files);
    // Rejeter TOUS les chemins dangereux avant toute copie.
    for(const path of paths){
      if(sourceZip.files[path]?.dir) continue;
      if(!safePath(path)) throw new Error(`Chemin non sûr refusé : ${path}`);
    }
    let copied=0;
    for(const path of paths){
      const entry=sourceZip.files[path];
      if(entry.dir || path==='h5p.json' || path==='content/content.json') continue;
      const data=await entry.async('uint8array');
      targetZip.file('h5p/'+path,data);
      copied++;
    }
    targetZip.file('h5p/h5p.json',JSON.stringify(h5pJson,null,2));
    targetZip.file('h5p/content/content.json',JSON.stringify(contentJson));
    return Object.freeze({copied,replaced:2,total:copied+2});
  }
  const api=Object.freeze({copyH5p});
  const mods=root.H5PConverterModules||(root.H5PConverterModules={});
  mods.portablePackage=api;
  if(typeof module==='object' && module.exports)module.exports=api;
})(globalThis);
