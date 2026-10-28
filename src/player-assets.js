/* Lot 6.1 : contrat commun pour les ressources du lecteur H5P.
 * La liste est extraite SANS MODIFICATION de la version 5.3 validée.
 * L'application conserve le lecteur 3.8.2, et n'autorise pas les candidats aux exports.
 * Aucune récupération réseau ne se produit dans ce module.
 */
(function(root){
  'use strict';
  const paths=Object.freeze([
    "/dist/main.bundle.js",
    "/dist/frame.bundle.js",
    "/dist/main.bundle.js.LICENSE.txt",
    "/dist/styles/h5p.css",
    "/dist/styles/h5p-fonts.css",
    "/dist/images/h5p.svg",
    "/dist/images/throbber.gif",
    "/dist/fonts/h5p-core-30.woff2",
    "/dist/fonts/h5p-hub-publish.woff",
    "/dist/fonts/h5p-hub-publish.woff2",
    "/dist/fonts/h5p-theme.woff2",
    "/dist/fonts/inter/Inter-ExtraBold.woff2",
    "/dist/fonts/inter/Inter-ExtraBoldItalic.woff2",
    "/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-600.woff2",
    "/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-600italic.woff2",
    "/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-italic.woff2",
    "/dist/fonts/inter/inter-v18-cyrillic_cyrillic-ext_greek_greek-ext_latin_latin-ext_vietnamese-regular.woff2",
    "/dist/fonts/inter/LICENSE.txt",
    "/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-600.woff2",
    "/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-600italic.woff2",
    "/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-700.woff2",
    "/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-700italic.woff2",
    "/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-italic.woff2",
    "/dist/fonts/open-sans/open-sans-v40-cyrillic_cyrillic-ext_greek_greek-ext_hebrew_latin_latin-ext_math_symbols_vietnamese-regular.woff2",
    "/dist/fonts/open-sans/OFL.txt"
]);
  const DEFAULT_VERSION='3.8.2';
  const MANDATORY=Object.freeze(['/dist/main.bundle.js','/dist/frame.bundle.js','/dist/styles/h5p.css']);
  function localPath(path){
    if(typeof path!=='string' || !paths.includes(path)) throw new Error('Ressource lecteur inconnue : '+String(path));
    return 'player/'+path.slice('/dist/'.length);
  }
  function remoteUrl(path,version=DEFAULT_VERSION){
    localPath(path);
    if(!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Version du lecteur invalide.');
    return `https://cdn.jsdelivr.net/npm/h5p-standalone@${version}${path}`;
  }
  function manifest(version=DEFAULT_VERSION,{includeNotices=true}={}){
    return paths.filter(p=> includeNotices || !isNotice(p)).map(p=>Object.freeze({
      remotePath:p,localPath:localPath(p),remoteUrl:remoteUrl(p,version),
      required:MANDATORY.includes(p),notice:isNotice(p)
    }));
  }
  function isNotice(p){return p.endsWith('.LICENSE.txt')||p.endsWith('/LICENSE.txt')||p.endsWith('/OFL.txt');}
  function validate(){
    if(new Set(paths).size!==paths.length || !MANDATORY.every(x=>paths.includes(x))) return false;
    const output=new Set();
    for(const p of paths){
      if(!/^\/dist\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/.test(p)) return false;
      const local='player/'+p.slice(6);
      if(output.has(local)) return false;
      output.add(local);
    }
    return true;
  }
  if(!validate()) throw new Error('Manifeste de ressources H5P invalide.');
  const api=Object.freeze({paths,DEFAULT_VERSION,MANDATORY,localPath,remoteUrl,manifest,validate,isNotice});
  const mods=root.H5PConverterModules||(root.H5PConverterModules={});
  mods.playerAssets=api;
  if(typeof module==='object' && module.exports) module.exports=api;
})(globalThis);
