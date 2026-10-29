import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Un vrai moteur de bridgeSource (non une reimplementation du calcul) est evalue
// dans un environnement LMS SCORM 1.2 simule. Le H5P/xAPI, lui, est synthetique.
const fixture = JSON.parse(fs.readFileSync('tests/fixtures/interactive-book-score53.json','utf8'));
const content = fs.readFileSync('app.js','utf8').replace(/\}\)\(\);\s*$/, 'globalThis.__bridgeSource=bridgeSource;\n})();');
const app = vm.createContext({console,navigator:{language:'fr'},document:{getElementById(){return {value:'',addEventListener(){}}}},setTimeout,clearTimeout,setInterval,clearInterval});
app.window=app;app.globalThis=app;app.addEventListener=()=>{};
for (const file of ['src/runtime-profiles.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-preflight.js','src/engine-catalog.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js']) vm.runInContext(fs.readFileSync(file,'utf8'),app,{filename:file});
vm.runInContext(content,app);
const plan={enabled:true,expectedSubContentIds:fixture.expectedSubContentIds,ignoredNestedSubContentIds:fixture.ignoredNestedSubContentIds};
assert.equal(plan.expectedSubContentIds.length,7);
assert.equal(fixture.scoreUnits.reduce((a,u)=>a+u.raw,0),27);
assert.equal(fixture.scoreUnits.reduce((a,u)=>a+u.max,0),38);
const readiness=[];
function buildRuntime(stored='', activePlan=plan) {
 const values={'cmi.core.lesson_status':'incomplete','cmi.suspend_data':stored};
 let handler;const listeners={};const writes=[];
 const env=vm.createContext({console,Blob,Uint8Array,TextEncoder,TextDecoder,Response,CompressionStream,DecompressionStream,btoa,atob,
  setTimeout,clearTimeout,setInterval:()=>1,clearInterval:()=>{},
  SCORM12:{init:()=>true,get:k=>values[k]??'',set:(k,v)=>{values[k]=String(v);writes.push({key:k,value:String(v)});return true;},commit:()=>true,finish:()=>true},
  document:{documentElement:{lang:''},getElementById:()=>({hidden:true,textContent:''})},
  H5PStandalone:{H5P:function(){env.H5P={externalDispatcher:{on:(name,fn)=>{if(name==='xAPI') handler=fn;}}};return Promise.resolve();}}
 });
 env.window=env;env.addEventListener=(key,fn)=>{listeners[key]=fn;};
 vm.runInContext(app.__bridgeSource(80,'fr','auto',10,true,true,4000,fixture.mainLibrary,activePlan),env);
 return {values,writes,boot:async()=>{await listeners.DOMContentLoaded();assert.equal(typeof handler,'function');},
  send:(s)=>{assert.equal(typeof handler,'function');handler({data:{statement:s}});},
  audit:()=>env.H5PConverterScoreAudit(),wait:()=>new Promise(resolve=>setTimeout(resolve,70)),close:()=>listeners.pagehide()};
}
let serial=0;
const statement=(verb,{sub,score,register='attempt-A',id,completion}={})=>({
 id:id??`event-${++serial}`,verb:{id:`http://adlnet.gov/expapi/verbs/${verb}`},
 object:{id:'https://example.invalid/h5p'+(sub?`?subContentId=${sub}`:''),definition:{extensions:sub?{'http://h5p.org/x-api/h5p-subContentId':sub}:{}}},
 context:{registration:register,contextActivities:sub?{parent:[{id:'https://example.invalid/h5p'}]}:{}},
 result:{...(score?{score}:{}),...(completion===true||verb==='completed'?{completion:true}:{})}
});
const unit=u=>statement('answered',{sub:u.id,score:{raw:u.raw,min:0,max:u.max}});
const finalNoScore=()=>statement('completed',{});
const grade=rt=>rt.values['cmi.core.score.raw'];
function row(name,rt,more={}) {readiness.push({name,score:grade(rt)??null,status:rt.values['cmi.core.lesson_status'],source:rt.audit().scoreSource,expectedUnits:rt.audit().expectedUnits,observedUnits:rt.audit().observedUnits,...more});}

// A. Aucune note partielle, resultat de secours final uniquement avec 7/7 unites et fin fiable.
const a=buildRuntime();await a.boot();
for(const u of fixture.scoreUnits.slice(0,6)) a.send(unit(u));
assert.equal(grade(a),undefined);
a.send(finalNoScore());
assert.equal(grade(a),undefined);
assert.equal(a.audit().scoreSource,'none');
a.send(unit(fixture.scoreUnits[6]));
assert.equal(grade(a),'71.05');
assert.equal(a.values['cmi.core.lesson_status'],'failed');
assert.equal(a.audit().scoreSource,'aggregate');
assert.equal(a.audit().aggregateUnits,7);
assert.equal(a.audit().rootFinal,true);
assert.equal(a.audit().nativeFinal,false);
assert.equal(a.audit().scoreFinal,true);
const snapshotA = a.audit();
assert.equal(snapshotA.expectedUnits,7);
assert.equal(snapshotA.observedUnits,7);
assert.equal(Object.isFrozen(snapshotA),true);
assert.equal('registration' in snapshotA,false); // pas d'identifiant de l'apprenant
assert.equal('observedScores' in snapshotA,false); // pas de donnees individuelles du test dans le diagnostic
row('secours-sans-score-racine',a);

// B. Reemission xAPI identique et nouvelle reponse : pas de double compte.
const dup=statement('answered',{sub:fixture.scoreUnits[6].id,score:{raw:5,max:10},id:'repeat-identity'});
a.send(dup); const atDup=grade(a);
a.send(dup);assert.equal(grade(a),atDup);
a.send(statement('answered',{sub:fixture.scoreUnits[0].id,score:{raw:3,max:5}}));
assert.equal(grade(a),'68.42');
assert.equal(a.audit().scoreSource,'aggregate');
row('dedup-et-nouvelle-reponse',a);

// C. Un score natif final transmis apres le secours est prioritaire et non additionne.
a.send(statement('completed',{score:{raw:30,max:38}}));
assert.equal(grade(a),'78.95');
assert.equal(a.audit().scoreSource,'native');
assert.equal(a.audit().nativeFinal,true);
assert.equal(a.audit().aggregateUnits,0);
a.send(statement('answered',{sub:fixture.scoreUnits[0].id,score:{raw:5,max:5}}));
assert.equal(grade(a),'78.95');
row('natif-tardif-prioritaire',a);

// D. Inconnu note : impossible de calculer un secours fiable.
const unsafe=buildRuntime();await unsafe.boot();
for(const u of fixture.scoreUnits) unsafe.send(unit(u));
unsafe.send(statement('answered',{sub:'ffffffff-ffff-4fff-8fff-ffffffffffff',score:{raw:1,max:1}}));
unsafe.send(finalNoScore());
assert.equal(grade(unsafe),undefined);
assert.equal(unsafe.audit().unexpectedScoredChild,true);
assert.equal(unsafe.audit().scoreSource,'none');
row('refus-perimetre-inconnu',unsafe);

// E. Une sous-question deja comprise dans le Question Set ne modifie pas le total.
const nested=buildRuntime();await nested.boot();
for(const u of fixture.scoreUnits) nested.send(unit(u));
nested.send(statement('answered',{sub:fixture.ignoredNestedSubContentIds[0],score:{raw:1,max:1}}));
nested.send(finalNoScore());
assert.equal(grade(nested),'71.05');
row('questions-imbriquees-evitees',nested);

// F. Reprise SCORM : une partie des resultats est enregistree, puis completee apres reouverture.
const early=buildRuntime();await early.boot();
for(const u of fixture.scoreUnits.slice(0,4)) early.send(unit(u));
assert.equal(grade(early),undefined);
await early.wait();
assert.ok(/^H5P3[ZR]:/.test(early.values['cmi.suspend_data']));
assert.ok(early.values['cmi.suspend_data'].length<=4000);
const resumed=buildRuntime(early.values['cmi.suspend_data']);await resumed.boot();
for(const u of fixture.scoreUnits.slice(4)) resumed.send(unit(u));
assert.equal(grade(resumed),undefined);
resumed.send(finalNoScore());
assert.equal(grade(resumed),'71.05');
assert.equal(resumed.audit().scoreSource,'aggregate');
row('reprise-en-scorm-1.2',resumed,{suspendChars:early.values['cmi.suspend_data'].length});

// G. Une session sans plan ne calcule jamais de total d'enfants.
const noPlan = {...plan,enabled:false,expectedSubContentIds:[],ignoredNestedSubContentIds:[]};
const without=buildRuntime('',noPlan);await without.boot();
for(const u of fixture.scoreUnits) without.send(unit(u));
await without.wait();
assert.equal(grade(without),undefined);
assert.equal(without.values['cmi.suspend_data'],''); // les sous-scores hors plan ne declenchent aucune nouvelle sauvegarde
without.send(finalNoScore());
assert.equal(grade(without),undefined);
assert.equal(without.audit().planEnabled,false);
row('plan-desactive-aucune-note',without);

const evidence={schemaVersion:1,testKind:'pont-SCORM-reel-avec-evenements-xAPI-synthetiques',realLms:false,realH5pExecution:false,
 generatedWith:'tests/scorm-fallback53.mjs',sourceFixture:'tests/fixtures/interactive-book-score53.json',
 scenarios:readiness,summary:{passed:readiness.length,expectedFallbackScore:71.05,nativePriorityVerified:true,unknownScoresRejected:true,resumeVerified:true}};
if (process.argv.includes('--report')) {
 const index=process.argv.indexOf('--report');const path=process.argv[index+1];assert.ok(path,'--report requiert un chemin');
 fs.mkdirSync((await import('node:path')).dirname(path),{recursive:true});
 fs.writeFileSync(path,JSON.stringify(evidence,null,2)+'\n','utf8');
}
console.log(`Lot 5.3 : ${readiness.length} scenarios verifies (dont secours 27/38, priorite native, reprise, doublons et refus de perimetre inconnu).`);
