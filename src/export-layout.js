/* Lot 7b : presentation facultative, commune aux pages SCORM et HTML.
 * Le CSS ne cible que la page hote et jamais les elements internes H5P.
 * Les parametres sont convertis en entiers avant toute interpolation CSS.
 */
(function(root){
  'use strict';
  function dimension(value,{label,min,max}){
    if(value === null || value === undefined || String(value).trim() === '') return null;
    const raw=String(value).trim();
    if(!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw)<min || Number(raw)>max){
      throw new Error(`${label} : entrez un nombre entier de ${min} à ${max} px, ou laissez le champ vide.`);
    }
    return Number(raw);
  }
  function normalize(input={}){
    return Object.freeze({
      maxWidthPx:dimension(input.maxWidthPx,{label:'Largeur maximale',min:1,max:10000}),
      marginPx:dimension(input.marginPx,{label:'Marges',min:0,max:2000})
    });
  }
  function css(settings){
    const layout=normalize(settings);
    if(layout.maxWidthPx===null && layout.marginPx===null) return '';
    const rules=['/* Presentation du conteneur exporte : SCORM 1.2 et HTML multifichier. */'];
    if(layout.marginPx!==null){
      rules.push(`body{box-sizing:border-box;padding:${layout.marginPx}px;}`);
    }
    if(layout.maxWidthPx!==null){
      rules.push(`#h5p-container,#runtime-error,#runtime-status{box-sizing:border-box;width:100%;max-width:${layout.maxWidthPx}px;margin-left:auto;margin-right:auto;}`);
    }
    // Le plein ecran natif est un contexte d'affichage distinct : ne pas le limiter.
    rules.push('#h5p-container:fullscreen{max-width:none!important;width:100%;margin:0!important;padding:0!important;}');
    return rules.join('\n');
  }
  const api=Object.freeze({normalize,css});
  const modules=root.H5PConverterModules||(root.H5PConverterModules={});
  modules.exportLayout=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
