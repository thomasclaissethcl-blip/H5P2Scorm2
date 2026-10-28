import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const s = fs.readFileSync(new URL('../src/scorm-scoring.js', import.meta.url),'utf8');
const context = vm.createContext({});
vm.runInContext(s,context);
const createTracker = context.H5PConverterModules.scoring.createTracker;
const data = (id, verb, score, opts={}) => ({data:{statement:{
  id, verb:{id:'http://adlnet.gov/expapi/verbs/'+verb},
  object:{id:opts.child?'http://localhost/activity?subContentId='+opts.child:'http://localhost/activity',
    definition:{extensions:opts.child?{'http://h5p.org/x-api/h5p-subContentId':opts.child}:{}}},
  context:{registration:opts.registration||'attempt-1',contextActivities:opts.child?{parent:[{id:'http://localhost/activity'}]}:{}},
  result:{...(score?{score}:{}),...(opts.complete?{completion:true}:{})}
}}});
const tracker=createTracker({mainLibrary:'H5P.GameMap'});
assert.equal(tracker.ingest(data('a','attempted')).kind,'ignored');
assert.equal(tracker.ingest(data('b','answered',{raw:4,max:5},{child:'q1'})).kind,'subcontent');
assert.equal(tracker.ingest(data('c','answered',{raw:6,max:10},{child:'q2'})).kind,'subcontent');
assert.equal(tracker.summary().observedScores.length,2);
assert.equal(tracker.ingest(data('c','answered',{raw:6,max:10},{child:'q2'})).reason,'duplicate');
assert.equal(tracker.ingest(data('d','completed',null,{complete:true})).kind,'root-final-unscored');
assert.equal(tracker.ingest(data('e','answered',{raw:9,max:10})).final,true);
assert.equal(tracker.ingest(data('f','completed',null,{complete:true})).reason,'native-final-already-authoritative');
assert.equal(tracker.summary().finalNative,true);
// Reponse nouvelle a la meme question : remplacement de la precedente, sans double comptage.
const scoped=createTracker({mainLibrary:'H5P.InteractiveBook',expectedSubContentIds:['q1','q2']});
assert.equal(scoped.ingest(data('1','answered',{raw:4,max:5},{child:'q1'})).kind,'subcontent');
assert.equal(scoped.ingest(data('2','answered',{raw:3,max:5},{child:'q1'})).kind,'subcontent');
assert.equal(scoped.ingest(data('3','answered',{raw:6,max:10},{child:'q2'})).kind,'subcontent');
assert.equal(scoped.ingest(data('4','completed',null,{complete:true})).kind,'aggregate');
assert.equal(Math.round(scoped.ingest(data('5','completed',null,{complete:true})).percent*100)/100,60);
const native=scoped.ingest(data('6','completed',{raw:7,max:10},{complete:true}));
assert.equal(native.kind,'native'); assert.equal(native.percent,70);
assert.equal(scoped.ingest(data('7','answered',{raw:5,max:5},{child:'q1'})).kind,'subcontent');
const inverse=createTracker({expectedSubContentIds:['q1','q2']});
assert.equal(inverse.ingest(data('i1','completed',null,{complete:true})).kind,'root-final-unscored');
assert.equal(inverse.ingest(data('i2','answered',{raw:4,max:5},{child:'q1'})).kind,'subcontent');
assert.equal(inverse.ingest(data('i3','answered',{raw:6,max:10},{child:'q2'})).kind,'aggregate');
assert.equal(inverse.ingest(data('i4','answered',{raw:0,max:0},{child:'q3'})).reason,'child-no-score');
const fresh=createTracker();
assert.equal(fresh.ingest(data('a','answered',{raw:4,max:5},{child:'q1'})).kind,'subcontent');
assert.equal(fresh.ingest(data('b','completed',null,{complete:true})).kind,'root-final-unscored');
assert.equal(fresh.ingest(data('c','answered',{raw:5,max:5},{child:'q1',registration:'attempt-2'})).kind,'subcontent');
assert.equal(fresh.summary().observedScores.length,1);
const simple=createTracker({mainLibrary:'H5P.MultiChoice'});
assert.equal(simple.ingest(data('mc1','answered',{raw:1,max:1})).final,false);
assert.equal(createTracker({mainLibrary:'H5P.GameMap'}).ingest(data('gm1','answered',{raw:1,max:1})).final,true);
assert.equal(createTracker({mainLibrary:'H5P.GameMap'}).ingest(data('gm2','answered',{raw:0,max:1})).final,true);
const invalid=createTracker();
for (const [n,score] of [{raw:2,max:1},{raw:-1,max:1},{raw:1,max:0},{raw:'',max:5},{raw:3,max:'nan'}].entries()) {
 assert.equal(invalid.ingest(data('invalid'+n,'answered',score,{child:'bad'+n})).kind,'ignored');
}
console.log('Notation SCORM : suivi, priorite du score natif, Game Map, aggregation conditionnelle, doublons et invalides OK');
