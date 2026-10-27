/* Lot 4.3 : relevé de qualification manuelle, local, non décisionnel.
 * Le rapport ne change jamais les droits d'export ni le statut du catalogue.
 * Aucune donnée n'est transmise automatiquement à l'extérieur.
 */
(function(root) {
  'use strict';
  const criteria = Object.freeze([
    Object.freeze({id:'load', label:'Chargement du lecteur et de l’activité'}),
    Object.freeze({id:'render', label:'Rendu et géométrie du contenu'}),
    Object.freeze({id:'interactions', label:'Navigation et exercices interactifs'}),
    Object.freeze({id:'media', label:'Images, sons et médias locaux'}),
    Object.freeze({id:'fullscreen', label:'Agrandissement et plein écran'}),
    Object.freeze({id:'css', label:'Styles CSS personnalisés'}),
    Object.freeze({id:'xapi', label:'Événements xAPI des exercices'})
  ]);
  const allowed = Object.freeze(['non_teste','reussi','echoue','sans_objet']);
  const observable = new Set(['ready','error','xapi','xapi-ready','xapi-unavailable','resource-blocked','fullscreen-info']);
  function clean(value, max) { return String(value ?? '').slice(0,max); }
  function newSession({profile, analysis, file, browser, clock=() => new Date().toISOString()}) {
    if (!profile?.id || !profile?.playerVersion || !analysis || typeof clock !== 'function') throw new Error('Contexte de qualification invalide.');
    const startedAt = clock();
    const answers = Object.fromEntries(criteria.map(c=>[c.id,'non_teste']));
    const counts = Object.fromEntries([...observable].map(type=>[type,0]));
    const records = [];
    let note = '';
    const activity = Object.freeze({
      fileName: clean(file?.name,240), fileSize: Number.isFinite(file?.size) ? file.size : null,
      title: clean(analysis.h5pJson?.title,240),
      mainLibrary: clean(analysis.h5pJson?.mainLibrary,140),
      libraries: (analysis.libraries || []).map(r=>({
        name:clean(r.library?.machineName,140),
        version: [r.library?.majorVersion,r.library?.minorVersion,r.library?.patchVersion].map(x=>Number.isInteger(Number(x))?Number(x):null)
      }))
    });
    function record(event) {
      if (!event || !observable.has(event.type)) return;
      counts[event.type]++;
      if (event.type==='error' || event.type==='resource-blocked') {
        if (records.length<12) records.push({type:event.type, message:clean(event.message,220)});
      }
    }
    function mark(id,status) {
      if (!Object.prototype.hasOwnProperty.call(answers,id) || !allowed.includes(status)) return false;
      answers[id]=status;
      return true;
    }
    function setNote(value) {note=clean(value,2000);}
    function report() {
      const results=criteria.map(c=>({id:c.id,label:c.label,status:answers[c.id]}));
      const summary={
        success:results.filter(r=>r.status==='reussi').length,
        failure:results.filter(r=>r.status==='echoue').length,
        notTested:results.filter(r=>r.status==='non_teste').length,
        notApplicable:results.filter(r=>r.status==='sans_objet').length
      };
      return {
        schemaVersion:1, kind:'h5p-engine-manual-trial',
        generatedAt:clock(), startedAt,
        engine:{id:profile.id, version:profile.playerVersion, status:profile.status},
        environment:{browser:clean(browser,250), location:'Navigateur de la personne effectuant l’essai'},
        activity,
        observations:{...counts, errors:records.map(r=>({...r}))},
        criteria:results,
        summary, notes:note,
        evaluation:summary.failure>0?'anomalies_constatees':summary.notTested>0?'essai_incomplet':'essai_documente_non_qualifie',
        // Une réussite sur une activité n'implique jamais la qualification générale.
        qualification:'non_qualifie', exportAllowedByThisReport:false,
        limitations:[
          'Évaluation manuelle sur ce seul contenu et ce seul navigateur.',
          'Les compteurs xAPI prouvent une émission observée, pas la fiabilité des scores LMS.',
          'Ce rapport ne modifie pas la compatibilité Core API ni les autorisations d’export.',
          'Aucune vérification automatique de l’intégrité des fichiers du lecteur distant.'
        ]
      };
    }
    return Object.freeze({mark,setNote,record,report});
  }
  const api=Object.freeze({criteria,allowed,newSession});
  const modules=root.H5PConverterModules||(root.H5PConverterModules={});
  modules.engineQualification=api;
  if (typeof module==='object' && module.exports) module.exports=api;
})(globalThis);
