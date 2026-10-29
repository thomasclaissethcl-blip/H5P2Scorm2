/* Lot 8.1 : pre-diagnostic statique de l'HTML monofichier.
 * Aucun export monofichier n'est autorise tant que le runtime et sa
 * resolution des ressources sous file:// et HTTP(S) ne sont pas certifies.
 * L'inventaire ne lit que les metadonnees du ZIP et les JSON deja parses.
 */
(function(root){
  'use strict';
  const MAX_ESTIMATED_HTML_BYTES=64*1024*1024; // seuil conservateur d'alerte, pas une garantie
  const MAX_REPORTED_EXTERNAL=25;
  function externalRefs(value, destination, limit=MAX_REPORTED_EXTERNAL){
    if(destination.size>=limit || value==null) return;
    if(typeof value==='string'){
      // URLs de contenus, href/src dans du HTML H5P et CSS personnalise.
      const matches=value.match(/https?:\/\/[^\s<>"'`\\)]+/gi)||[];
      for(const found of matches){
        try{
          const u=new URL(found.replace(/[.,;]+$/,''));
          // Les URL externes sont affichées sans query/hash ni identifiants.
          destination.add(u.origin+u.pathname.slice(0,180));
          if(destination.size>=limit) break;
        }catch(_ignored){}
      }
    }else if(Array.isArray(value)){
      for(const item of value){externalRefs(item,destination,limit);if(destination.size>=limit) break;}
    }else if(typeof value==='object'){
      for(const key of Object.keys(value)){
        externalRefs(value[key],destination,limit);
        if(destination.size>=limit) break;
      }
    }
  }
  function inspect({files,h5pJson,contentJson,customCss='',mainLibrary='',sourceName=''}={}){
    if(!files||typeof files!=='object'||!h5pJson||typeof h5pJson!=='object'||!contentJson||typeof contentJson!=='object')
      throw new TypeError('Un H5P analysé et les entrées de son archive sont nécessaires.');
    let fileCount=0, knownBytes=0, unknownSizes=0, scriptFiles=0, stylesheetFiles=0;
    for(const [path,entry] of Object.entries(files)){
      if(!entry||entry.dir) continue;
      fileCount++;
      if(/\.js$/i.test(path)) scriptFiles++;
      if(/\.css$/i.test(path)) stylesheetFiles++;
      const size=entry._data?.uncompressedSize;
      if(Number.isSafeInteger(size)&&size>=0) knownBytes+=size;
      else unknownSizes++;
    }
    const refs=new Set();
    externalRefs(h5pJson,refs);
    externalRefs(contentJson,refs);
    externalRefs(customCss,refs);
    // Base64 ajoute environ 1/3 d'espace, sans compter lecteur, JS et HTML.
    const minimumEmbeddedBytes=unknownSizes===0?4*Math.ceil(knownBytes/3):null;
    const warnings=[];
    if(refs.size) warnings.push('Références HTTP(S) détectées : distinguer les crédits et liens facultatifs des médias indispensables, avant toute certification hors ligne.');
    if(unknownSizes) warnings.push('Taille non renseignée pour certaines ressources : estimation mémoire incomplète.');
    if(minimumEmbeddedBytes!==null && minimumEmbeddedBytes>MAX_ESTIMATED_HTML_BYTES)
      warnings.push('Le volume estimé des ressources encodées dépasse le seuil conservateur de 64 Mio.');
    return {
      schemaVersion:1,formatRequested:'html-singlefile',stage:'preflight-static',
      sourceName:String(sourceName||''),mainLibrary:String(mainLibrary||h5pJson.mainLibrary||''),
      qualification:{supported:false,status:'non-qualifie',
        blockingReasons:[
          {code:'dynamic-resource-resolution-unverified',message:'Les chargements dynamiques de H5P Standalone, des bibliothèques, médias et CSS ne sont pas encore résolus dans un document unique.'},
          {code:'file-protocol-unverified',message:'L exécution autonome en file:// et HTTP(S) ne dispose pas d une recette navigateur certifiée.'}
        ],recommendedFormat:'html-multifile'},
      inventory:{fileCount,scriptFiles,stylesheetFiles,knownUncompressedBytes:knownBytes,unknownSizeFiles:unknownSizes,
        minimumBase64Bytes:minimumEmbeddedBytes,readerAssetsNotIncludedInEstimate:true,
        externalReferencesDetected:refs.size,externalReferencesSample:[...refs]},
      warnings,
      limitations:[
        'Analyse statique uniquement : les URL produites par du JavaScript ou presentes dans les CSS/JS des bibliotheques ne sont pas inspectees.',
        'Le comptage des URL externes est limite a un echantillon de 25 entrees, et ne prouve pas leur exhaustivite.',
        'Aucun HTML monofichier n est genere : il reste interdit de produire un fichier silencieusement inutilisable.'
      ]
    };
  }
  const api=Object.freeze({inspect,MAX_ESTIMATED_HTML_BYTES});
  const mods=root.H5PConverterModules||(root.H5PConverterModules={});
  mods.htmlSinglefilePreflight=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
