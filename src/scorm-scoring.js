/* H5P Converter - decision de notation SCORM, sans dependance sur le DOM ni le LMS.
   La fabrique est autonome : sa source est embarquee telle quelle dans chaque SCORM. */
(function (root) {
  'use strict';
  function createTracker(options = {}) {
    const SUBCONTENT_EXT = 'http://h5p.org/x-api/h5p-subContentId';
    const mainLibrary = String(options.mainLibrary || '').split(' ')[0];
    const expected = Array.isArray(options.expectedSubContentIds)
      ? [...new Set(options.expectedSubContentIds.filter(id => typeof id === 'string' && id.trim()).map(id => id.trim()))]
      : [];
    const ignoredNested = new Set(Array.isArray(options.ignoredNestedSubContentIds)
      ? options.ignoredNestedSubContentIds.filter(id => typeof id === 'string' && id.trim()) : []);
    const subScores = new Map();
    const seenStatements = new Set();
    let registration = null;
    let rootFinal = false;
    let finalNative = false;
    let rootFinalStatement = null;
    let eventsSeen = 0;
    let rejects = 0;
    let unplannedScored = false;

    function finite(value) {
      if (typeof value !== 'number' && (typeof value !== 'string' || value.trim() === '')) return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    function verb(st) { return String(st?.verb?.id || '').split('/').pop().toLowerCase(); }
    function subId(st) {
      const ext = st?.object?.definition?.extensions || {};
      const fromExtension = ext[SUBCONTENT_EXT];
      if (typeof fromExtension === 'string' && fromExtension.trim()) return fromExtension.trim();
      const activityId = String(st?.object?.id || '');
      const match = /[?&]subContentId=([^&#]+)/i.exec(activityId);
      if (match) { try { return decodeURIComponent(match[1]); } catch (_) { return match[1]; } }
      return null;
    }
    function isChild(st) {
      if (subId(st)) return true;
      const parent = st?.context?.contextActivities?.parent;
      return Array.isArray(parent) && parent.length > 0;
    }
    function parseScore(score, requireDenominator) {
      if (!score || typeof score !== 'object') return null;
      const raw = finite(score.raw), max = finite(score.max);
      const min = score.min === undefined ? 0 : finite(score.min);
      if (raw !== null && max !== null && min !== null && max > min && raw >= min && raw <= max) {
        return {raw, min, max, percent: (raw - min) / (max - min) * 100, bounded: true};
      }
      if (requireDenominator) return null;
      const scaled = finite(score.scaled);
      if (scaled !== null && scaled >= 0 && scaled <= 1) {
        return {raw: null, min: 0, max: 1, percent: scaled * 100, bounded: false};
      }
      // Comportement historique : un score racine de 0..100 sans bareme est accepte.
      if (raw !== null && max === null && raw >= 0 && raw <= 100) {
        return {raw, min: 0, max: 100, percent: raw, bounded: false};
      }
      return null;
    }
    function finalVerb(v) { return v === 'completed' || v === 'passed' || v === 'failed'; }
    function finalSignal(st, v) { return st?.result?.completion === true || finalVerb(v); }
    function reset() {
      subScores.clear();
      seenStatements.clear();
      rootFinal = false;
      finalNative = false;
      rootFinalStatement = null;
      unplannedScored = false;
    }
    function aggregate() {
      if (!rootFinal || !expected.length || finalNative || unplannedScored) return null;
      let earned = 0, maximum = 0;
      for (const id of expected) {
        const entry = subScores.get(id);
        if (!entry || !entry.final) return null;
        earned += entry.score.raw - entry.score.min;
        maximum += entry.score.max - entry.score.min;
      }
      if (maximum <= 0) return null;
      return {percent: earned / maximum * 100, earned, maximum, ids: expected.slice()};
    }
    function ingest(event) {
      const st = event?.data?.statement || event?.statement || event;
      if (!st || typeof st !== 'object' || !st.verb) return {kind:'ignored',reason:'no-statement'};
      const newRegistration = typeof st.context?.registration === 'string' ? st.context.registration : null;
      if (newRegistration && registration && newRegistration !== registration) reset();
      if (newRegistration) registration = newRegistration;
      const id = typeof st.id === 'string' ? st.id : null;
      if (id && seenStatements.has(id)) return {kind:'ignored',reason:'duplicate'};
      if (id) {
        seenStatements.add(id);
        if (seenStatements.size > 5000) seenStatements.clear(); // memoire bornee pour les longues sessions
      }
      eventsSeen += 1;
      const v = verb(st), child = isChild(st), score = parseScore(st.result?.score, child);
      const terminal = finalSignal(st,v);
      if (child) {
        const childId = subId(st);
        // Tout score provenant d'une unite inconnue rend le perimetre incertain,
        // meme si le verbe ne signale pas encore une reponse definitive ou si
        // le score xAPI est invalide. Seuls les enfants connus d'un Question Set
        // sont ignores sans bloquer l'agregation (le score du groupe fait foi).
        if (expected.length && st.result?.score) {
          if (childId && ignoredNested.has(childId)) {
            return {kind:'ignored',reason:'included-in-question-set'};
          }
          if (!childId || !expected.includes(childId)) {
            unplannedScored = true;
            return {kind:'ignored',reason:'unplanned-scored-child'};
          }
        }
        if (childId && score && (v === 'answered' || terminal)) {
          // Remplacer le resultat precedent d'une meme unite, jamais additionner les tentatives.
          subScores.set(childId,{score,final: v === 'answered' || terminal});
          const total = aggregate();
          if (total) return {kind:'aggregate',percent:total.percent,final:true,statement:rootFinalStatement,details:total};
          return {kind:'subcontent',id:childId,percent:score.percent,provisional:true,observed:subScores.size};
        }
        if (st.result?.score && !score) rejects += 1;
        return {kind:'ignored',reason:childId?'child-no-score':'unidentified-child'};
      }
      // H5P.GameMap signale les resultats finaux par 'answered' (et non 'completed').
      // Ce traitement ne s'applique ni a Interactive Book ni aux autres types.
      const gameMapFinal = mainLibrary === 'H5P.GameMap' && v === 'answered' && !!score;
      const final = terminal || gameMapFinal;
      if (final) { rootFinal = true; rootFinalStatement = st; }
      if (finalNative && !score) return {kind:'ignored',reason:'native-final-already-authoritative'};
      if (score) {
        if (final) finalNative = true;
        return {kind:'native',percent:score.percent,final,statement:st,reason:gameMapFinal?'game-map-answered':'root-score'};
      }
      const total = aggregate();
      if (total) return {kind:'aggregate',percent:total.percent,final:true,statement:st,details:total};
      if (final) return {kind:'root-final-unscored',final:true,statement:st,reason:'no-reliable-total'};
      return {kind:'ignored',reason:'root-non-final'};
    }
    function snapshot() {
      if (!expected.length) return null;
      const rows = expected.filter(id => subScores.has(id)).map(id => {
        const entry=subScores.get(id);
        return {id, raw:entry.score.raw, min:entry.score.min, max:entry.score.max, final:entry.final};
      });
      return {v:1, scope:expected.slice().sort().join('|'),
        ...(ignoredNested.size ? {nestedScope:[...ignoredNested].sort().join('|')} : {}), registration,
        rootFinal, finalNative, unplannedScored, rows};
    }
    function restore(saved) {
      if (!expected.length || !saved || saved.v!==1 ||
        saved.scope!==expected.slice().sort().join('|') ||
        (ignoredNested.size ? saved.nestedScope!==[...ignoredNested].sort().join('|') : saved.nestedScope!==undefined) ||
        !Array.isArray(saved.rows) ||
        saved.rows.length>expected.length || (saved.registration!==null && typeof saved.registration!=='string')) return false;
      const restored=new Map();
      for(const row of saved.rows) {
        if (!row || !expected.includes(row.id) || restored.has(row.id) || row.final!==true) return false;
        const score=parseScore({raw:row.raw,min:row.min,max:row.max},true);
        if (!score) return false;
        restored.set(row.id,{score,final:true});
      }
      reset();
      registration=saved.registration;
      for(const [id,entry] of restored) subScores.set(id,entry);
      rootFinal=saved.rootFinal===true;
      finalNative=saved.finalNative===true;
      unplannedScored=saved.unplannedScored===true;
      if(rootFinal) rootFinalStatement={verb:{id:'http://adlnet.gov/expapi/verbs/completed'},result:{completion:true}};
      return true;
    }
    function summary() {
      const provisional = [...subScores.entries()].map(([id, entry]) => ({id,raw:entry.score.raw,max:entry.score.max,final:entry.final}));
      return {mainLibrary,registration,eventsSeen,observedScores:provisional,expectedCount:expected.length,
        rootFinal,finalNative,unplannedScored,rejectedScores:rejects,
        ignoredNestedCount:ignoredNested.size,aggregateReady:aggregate() !== null};
    }
    return {ingest,summary,snapshot,restore};
  }
  root.H5PConverterModules = root.H5PConverterModules || {};
  root.H5PConverterModules.scoring = Object.freeze({createTracker});
})(typeof window !== 'undefined' ? window : globalThis);
