/* H5P Converter : plan experimental de notation des Interactive Books.
   La structure ne prouve pas l'achevement : les unites attendues et la fin
   explicite doivent egalement etre confirmees par les evenements xAPI.
   Les Question Set sont UNE seule unite ; leurs questions ne sont pas
   additionnees une seconde fois. Les composants d'affichage ne valent 0
   point qu'apres verification de leur propre structure.
*/
(function (root) {
  'use strict';
  const SCORED = new Set([
    'H5P.MultiChoice', 'H5P.Blanks', 'H5P.TrueFalse',
    'H5P.DragText', 'H5P.MarkTheWords'
  ]);
  const DISPLAY = new Set(['H5P.AdvancedText','H5P.Text','H5P.Image','H5P.Audio','H5P.Video']);
  const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  function library(node) { return typeof node?.library === 'string' ? node.library.split(' ')[0] : ''; }
  function plan(mainLibrary, content) {
    const name=String(mainLibrary||'').split(' ')[0];
    const result={schemaVersion:2,mainLibrary:name,enabled:false,reason:'native-score-preferred',
      expectedSubContentIds:[],ignoredNestedSubContentIds:[],scoreUnits:[],displayOnlyCounts:{},scope:'none'};
    // Game Map : parcours optionnels, score global toujours prioritaire.
    if(name!=='H5P.InteractiveBook') return result;
    const chapters=content?.chapters;
    if(!Array.isArray(chapters)||!chapters.length) return {...result,reason:'chapters-unavailable'};
    const seen=new Set(), ids=[], ignored=[], units=[], displayCounts={};
    function register(node,mandatory) {
      const id=node?.subContentId;
      if(id===undefined || id===null) {
        if(mandatory) throw new Error('missing-stable-id');
        return null;
      }
      if(typeof id!=='string'||!UUID.test(id)) throw new Error('missing-stable-id');
      if(seen.has(id)) throw new Error('duplicate-subcontent-id');
      seen.add(id);
      return id;
    }
    function display(node,lib) {
      register(node,false);
      displayCounts[lib]=(displayCounts[lib]||0)+1;
    }
    function score(node,lib) {
      const id=register(node,true);
      ids.push(id);
      units.push({subContentId:id,library:lib,kind:'scored-exercise'});
    }
    function check(node,depth) {
      if(depth>8 || !node || typeof node!=='object') throw new Error('nested-structure-unsupported');
      const lib=library(node);
      if(lib==='H5P.Column') {
        register(node,false);
        const children=node.params?.content;
        if(!Array.isArray(children) || !children.length) throw new Error('empty-column');
        for(const item of children) check(item?.content,depth+1);
        return;
      }
      if(DISPLAY.has(lib)) { display(node,lib); return; }
      if(lib==='H5P.Accordion') {
        register(node,false);
        const panels=node.params?.panels;
        if(!Array.isArray(panels) || !panels.length) throw new Error('empty-accordion');
        for(const panel of panels) {
          // La structure est revalidee ; une activite notee dans un panneau
          // serait un autre type de contenu et ne serait pas ignoree.
          const child=panel?.content;
          if(!DISPLAY.has(library(child))) throw new Error('unqualified-accordion-content:'+library(child));
          check(child,depth+1);
        }
        displayCounts[lib]=(displayCounts[lib]||0)+1;
        return;
      }
      if(lib==='H5P.ImageHotspots') {
        register(node,false);
        const hotspots=node.params?.hotspots;
        if(!Array.isArray(hotspots)) throw new Error('hotspots-unavailable');
        for(const spot of hotspots) {
          if(!Array.isArray(spot?.content)) throw new Error('hotspot-content-unavailable');
          for(const child of spot.content) {
            // Qualification stricte : seuls les hotspots textuels sont
            // consideres comme non notes. Aucun type interactif suppose.
            if(!['H5P.Text','H5P.AdvancedText'].includes(library(child))) {
              throw new Error('unqualified-hotspot-content:'+library(child));
            }
            check(child,depth+1);
          }
        }
        displayCounts[lib]=(displayCounts[lib]||0)+1;
        return;
      }
      if(lib==='H5P.QuestionSet') {
        const parentId=register(node,true);
        const questions=node.params?.questions;
        if(!Array.isArray(questions) || !questions.length) throw new Error('empty-question-set');
        for(const child of questions) {
          const childLib=library(child);
          if(!SCORED.has(childLib)) throw new Error('unqualified-question-set-child:'+childLib);
          const childId=register(child,true);
          ignored.push(childId);
        }
        // Le score du groupe est l'unite de calcul. Les enfants peuvent
        // emettre des evenements xAPI, mais ne sont pas sommes a nouveau.
        ids.push(parentId);
        units.push({subContentId:parentId,library:lib,kind:'question-set',questionCount:questions.length});
        return;
      }
      if(SCORED.has(lib)) { score(node,lib); return; }
      throw new Error('unqualified-library:'+lib);
    }
    try {
      for(const chapter of chapters) {
        if(library(chapter)!=='H5P.Column') throw new Error('unexpected-chapter-type');
        check(chapter,0);
      }
    } catch(error) { return {...result,reason:error.message||'structure-unqualified'}; }
    if(!ids.length) return {...result,reason:'no-scored-exercises',displayOnlyCounts:displayCounts};
    const ordered=ids.slice().sort();
    return {...result,enabled:true,reason:'bounded-interactive-book',
      expectedSubContentIds:ordered,ignoredNestedSubContentIds:ignored.slice().sort(),scoreUnits:units,
      displayOnlyCounts:displayCounts,scope:'all-qualified-score-units'};
  }
  root.H5PConverterModules=root.H5PConverterModules||{};
  root.H5PConverterModules.scorePlan=Object.freeze({createPlan:plan});
})(typeof window!=='undefined'?window:globalThis);
