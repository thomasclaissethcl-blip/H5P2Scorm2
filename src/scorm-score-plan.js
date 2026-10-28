/* H5P Converter : inventaire conservateur des sous-exercices d'Interactive Book.
   Ce plan n'est jamais une preuve suffisante de fin : le tracker attend aussi
   l'evenement final racine et tous les scores correspondants. */
(function (root) {
  'use strict';
  const SCORED = new Set([
    'H5P.MultiChoice', 'H5P.Blanks', 'H5P.TrueFalse',
    'H5P.DragText', 'H5P.MarkTheWords'
  ]);
  const DISPLAY = new Set(['H5P.AdvancedText', 'H5P.Image', 'H5P.Audio', 'H5P.Video']);
  const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  function library(node) { return typeof node?.library === 'string' ? node.library.split(' ')[0] : ''; }
  function plan(mainLibrary, content) {
    const name=String(mainLibrary||'').split(' ')[0];
    const result={schemaVersion:1,mainLibrary:name,enabled:false,reason:'native-score-preferred',expectedSubContentIds:[],scope:'none'};
    // Game Map peut contenir des parcours optionnels : aucune extrapolation des etapes.
    if(name!=='H5P.InteractiveBook') return result;
    const chapters=content?.chapters;
    if(!Array.isArray(chapters)||!chapters.length) return {...result,reason:'chapters-unavailable'};
    const ids=[], seen=new Set();
    function check(node,depth) {
      if(depth>6 || !node || typeof node!=='object') throw new Error('nested-structure-unsupported');
      const lib=library(node);
      if(lib==='H5P.Column') {
        const children=node.params?.content;
        if(!Array.isArray(children) || !children.length) throw new Error('empty-column');
        for(const item of children) check(item?.content,depth+1);
        return;
      }
      if(DISPLAY.has(lib)) return;
      if(!SCORED.has(lib)) throw new Error('unqualified-library:'+lib);
      const id=node.subContentId;
      if(typeof id!=='string'||!UUID.test(id)) throw new Error('missing-stable-id');
      if(seen.has(id)) throw new Error('duplicate-subcontent-id');
      seen.add(id); ids.push(id);
    }
    try {
      for(const chapter of chapters) {
        if(library(chapter)!=='H5P.Column') throw new Error('unexpected-chapter-type');
        check(chapter,0);
      }
    } catch(error) { return {...result,reason:error.message||'structure-unqualified'}; }
    if(!ids.length) return {...result,reason:'no-scored-exercises'};
    // Empreinte deterministe du perimetre pour refuser des etats de reprise etrangers.
    const ordered=ids.slice().sort();
    return {...result,enabled:true,reason:'bounded-interactive-book',expectedSubContentIds:ordered,scope:'all-supported-book-exercises'};
  }
  root.H5PConverterModules=root.H5PConverterModules||{};
  root.H5PConverterModules.scorePlan=Object.freeze({createPlan:plan});
})(typeof window!=='undefined'?window:globalThis);
