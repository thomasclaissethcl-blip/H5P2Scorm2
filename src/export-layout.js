/* Lot 7c : presentation des pages exportees SCORM, HTML multifichier.
 * Champs independants haut / bas / gauche / droite. Aucun effet sur le H5P
 * lui-meme, le suivi LMS ou la visionneuse. L'ancien contrat marginPx
 * (lot 7b) reste accepte pour ne pas invalider les appels existants.
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
    const maxWidthPx=dimension(input.maxWidthPx,{label:'Largeur maximale',min:1,max:10000});
    const sides=['Top','Right','Bottom','Left'];
    // Compatibilite des outils et rapports deja produits en 7b.
    if(!sides.some(side=>Object.prototype.hasOwnProperty.call(input,`margin${side}Px`))){
      return Object.freeze({maxWidthPx,marginPx:dimension(input.marginPx,{label:'Marges',min:0,max:2000})});
    }
    const fallback=dimension(input.marginPx,{label:'Marges',min:0,max:2000});
    const result={maxWidthPx};
    for(const side of sides){
      const key=`margin${side}Px`;
      const explicit=dimension(input[key],{label:`Marge ${({Top:'haute',Right:'droite',Bottom:'basse',Left:'gauche'})[side]}`,min:0,max:2000});
      result[key]=explicit===null?fallback:explicit;
    }
    return Object.freeze(result);
  }
  function css(settings){
    const layout=normalize(settings);
    const fourSides=Object.prototype.hasOwnProperty.call(layout,'marginTopPx');
    const hasMargins=fourSides
      ? ['Top','Right','Bottom','Left'].some(side=>layout[`margin${side}Px`]!==null)
      : layout.marginPx!==null;
    if(layout.maxWidthPx===null && !hasMargins) return '';
    const rules=['/* Presentation du conteneur exporte : SCORM 1.2 et HTML multifichier. */'];
    if(fourSides && hasMargins){
      const sideCss={Top:'top',Right:'right',Bottom:'bottom',Left:'left'};
      const parts=['box-sizing:border-box'];
      for(const side of ['Top','Right','Bottom','Left']){
        const value=layout[`margin${side}Px`];
        if(value===null) continue;
        // Sur un petit ecran, plafonner les marges horizontales pour eviter
        // un debordement cause seulement par le parametre d'apparence.
        const responsive=side==='Right'||side==='Left' ? `min(${value}px,49vw)` : `${value}px`;
        parts.push(`padding-${sideCss[side]}:${responsive}`);
      }
      rules.push(`body{${parts.join(';')};}`);
    } else if(hasMargins){
      rules.push(`body{box-sizing:border-box;padding:${layout.marginPx}px;}`);
    }
    if(layout.maxWidthPx!==null){
      rules.push(`#h5p-container,#runtime-error,#runtime-status{box-sizing:border-box;width:100%;max-width:${layout.maxWidthPx}px;margin-left:auto;margin-right:auto;}`);
    }
    rules.push('#h5p-container:fullscreen{max-width:none!important;width:100%;margin:0!important;padding:0!important;}');
    return rules.join('\n');
  }
  const api=Object.freeze({normalize,css});
  const modules=root.H5PConverterModules||(root.H5PConverterModules={});
  modules.exportLayout=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
