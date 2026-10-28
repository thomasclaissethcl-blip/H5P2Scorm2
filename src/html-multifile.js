/* Lot 7 : lanceur HTML multifichier independant de SCORM.
 * Les chemins sont strictement relatifs a index.html. Aucune dependance
 * externe n'est requise a la lecture pour le lecteur ou les fichiers H5P.
 * Les contenus H5P contenant eux-memes des URL externes restent soumis
 * aux politiques et aux reseaux de la plateforme hote.
 */
(function(root){
  'use strict';
  function escapeHtml(value){
    return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function indexHtml({title,language}){
    const name=escapeHtml(title||'Activité H5P');
    const lang=escapeHtml(language||'en');
    return `<!doctype html>\n<html lang="${lang}">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>${name}</title>\n<style>html,body{margin:0;min-height:100%;padding:0;background:#fff;color:#222}#h5p-container{width:100%}#runtime-error{font:14px/1.5 Arial,sans-serif;color:#8a1f1f;padding:12px;white-space:pre-wrap}#runtime-error:empty{display:none}</style>\n</head>\n<body>\n<div id="runtime-error" role="alert"></div>\n<div id="h5p-container"></div>\n<script src="./player/main.bundle.js"></script>\n<script src="./html/player-init.js"></script>\n</body>\n</html>\n`;
  }
  function bootstrapSource({language,translations}){
    const lang=JSON.stringify(language||'en');
    const trans=JSON.stringify(translations||null).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
    return `'use strict';\n(function(){\n  const language=${lang};\n  const translations=${trans};\n  async function boot(){\n    document.documentElement.lang=language;\n    const options={\n      id:'h5p-html-content',\n      h5pJsonPath:'./h5p',\n      contentJsonPath:'./h5p/content',\n      librariesPath:'./h5p',\n      frameJs:'./player/frame.bundle.js',\n      frameCss:'./player/styles/h5p.css',\n      customCss:['./custom/custom.css'],\n      frame:false,\n      copyright:false,\n      export:false,\n      fullScreen:true,\n      reportingIsEnabled:true\n    };\n    if(translations)options.translations=translations;\n    try{\n      if(!window.H5PStandalone || typeof window.H5PStandalone.H5P!=='function')\n        throw new Error('Le lecteur H5P local ne peut pas être initialisé.');\n      await new window.H5PStandalone.H5P(document.getElementById('h5p-container'),options);\n      document.documentElement.dataset.h5pHtmlStatus='ready';\n    }catch(error){\n      document.documentElement.dataset.h5pHtmlStatus='error';\n      document.getElementById('runtime-error').textContent='Erreur de lecture H5P : '+(error&&error.message?error.message:String(error));\n      console.error(error);\n    }\n  }\n  window.addEventListener('DOMContentLoaded',boot);\n})();\n`;
  }
  function generationReport({title,language,mainLibrary,libraries,profileId,playerVersion,coreApi,localization,cssLength}){
    return {
      format:'html-multifile',schemaVersion:1,generator:'H5P Converter',
      generatedAt:new Date().toISOString(),title,language,
      mainLibrary,player:{name:'h5p-standalone',version:playerVersion,profileId,declaredCoreApiCeiling:coreApi},
      libraries:(libraries||[]).map(item=>({library:item.key,folder:item.folder})),
      parameters:{customCssBytes:cssLength,scormBridge:false,tracking:'aucun suivi LMS',resume:'aucune sauvegarde LMS'},
      localization,
      portability:{entryPoint:'index.html',paths:'relative-to-index',server:'HTTP(S) statique',backendRequired:false,cdnRequiredAtRuntime:false,
        compatibleDeployment:'repertoire ou sous-repertoire web accessible par HTTP(S)',
        limitations:[
          'Les fichiers du mini-site doivent rester accessibles avec leurs chemins relatifs.',
          'L environnement hote doit autoriser les scripts JavaScript, les requetes locales et les iframes necessaires au contenu H5P.',
          'Moodle : importer le ZIP comme ressource Fichier, decompresser et definir index.html comme fichier principal ; les politiques de securite de Moodle peuvent limiter le fonctionnement.',
          'Les ressources externes citees dans le contenu H5P, par exemple YouTube, necessitent reseau et autorisations adaptees.',
          'Aucun score, statut ou etat de reprise n est transmis ni sauvegarde dans un LMS.',
          'Le lancement direct sous file:// n est pas qualifie pour ce format.'
        ]}
    };
  }
  function readme({title,language,playerVersion}){
    return `H5P Converter - mini-site HTML multifichier\n\nTitre : ${title}\nLangue : ${language}\nLecteur embarque : H5P Standalone ${playerVersion}\n\nINSTALLATION\n1. Decompresser le ZIP entier. Ne pas sortir index.html de son dossier.\n2. Copier le contenu du dossier extrait dans un repertoire d un site web statique.\n3. Ouvrir l URL HTTP(S) correspondante vers index.html.\n4. Moodle (ressource Fichier) : importer le ZIP, decompresser les fichiers, puis choisir index.html comme fichier principal. Si Moodle bloque les scripts ou les ressources, utiliser un hebergement web statique autorise ou une configuration Moodle adaptee.\n\nLes bibliotheques, les medias et le lecteur H5P sont inclus. Aucun CDN ni backend n est necessaire a la lecture.\nAucune communication SCORM ni persistance des scores dans Moodle n est integree.\nLes contenus qui utilisent des medias externes (ex. YouTube) peuvent exiger une connexion reseau.\nConsulter generation-report.json pour les limites techniques.\nPour ce format, l utilisation directe par double-clic file:// n est pas garantie.\n`;
  }
  const api=Object.freeze({indexHtml,bootstrapSource,generationReport,readme});
  const mods=root.H5PConverterModules||(root.H5PConverterModules={});
  mods.htmlMultifile=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
