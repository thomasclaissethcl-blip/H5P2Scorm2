import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('src/scorm-scoring.js','utf8'),ctx);
const make=ctx.H5PConverterModules.scoring.createTracker;
const q1='11111111-1111-4111-8111-111111111111',q2='22222222-2222-4222-8222-222222222222',
 child1='33333333-3333-4333-8333-333333333333',child2='44444444-4444-4444-8444-444444444444';
const options={mainLibrary:'H5P.InteractiveBook',expectedSubContentIds:[q1,q2],ignoredNestedSubContentIds:[child1,child2]};
const st=(id,verb,score,sub,registration='1')=>({id,verb:{id:`http://adlnet.gov/expapi/verbs/${verb}`},
 object:{id:'https://example.test/book'+(sub?`?subContentId=${sub}`:''),definition:{extensions:sub?{'http://h5p.org/x-api/h5p-subContentId':sub}:{}}},
 context:{registration,contextActivities:sub?{parent:[{id:'https://example.test/book'}]}:{}},
 result:{...(score?{score}:{}),...(verb==='completed'?{completion:true}:{})}});
const t=make(options);
assert.equal(t.ingest(st('nested1','answered',{raw:1,max:1},child1)).reason,'included-in-question-set');
assert.equal(t.ingest(st('g1','answered',{raw:4,max:5},q1)).kind,'subcontent');
assert.equal(t.ingest(st('nested2','answered',{raw:0,max:1},child2)).reason,'included-in-question-set');
assert.equal(t.ingest(st('g2','answered',{raw:6,max:10},q2)).kind,'subcontent');
assert.ok(Math.abs(t.ingest(st('final','completed',null,null)).percent-100*10/15)<1e-10);
assert.equal(t.summary().unplannedScored,false);
assert.equal(t.summary().ignoredNestedCount,2);
assert.equal(t.ingest(st('final','completed',null,null)).reason,'duplicate');
const saved=JSON.parse(JSON.stringify(t.snapshot()));
assert.ok(saved.nestedScope.includes(child1));
const restored=make(options);assert.equal(restored.restore(saved),true);
assert.ok(Math.abs(restored.ingest(st('updated','answered',{raw:5,max:5},q1)).percent-100*11/15)<1e-10);
assert.equal(make({...options,ignoredNestedSubContentIds:[child2]}).restore(saved),false);
const unsafe=make(options);unsafe.ingest(st('g1','answered',{raw:4,max:5},q1));
unsafe.ingest(st('unknown','answered',{raw:1,max:1},'55555555-5555-4555-8555-555555555555'));
unsafe.ingest(st('g2','answered',{raw:6,max:10},q2));
assert.equal(unsafe.ingest(st('final','completed',null,null)).kind,'root-final-unscored');
assert.equal(unsafe.summary().unplannedScored,true);
const odd=make(options);odd.ingest(st('g1','answered',{raw:4,max:5},q1));
odd.ingest(st('strange','interacted',{raw:0,max:0},'66666666-6666-4666-8666-666666666666'));
odd.ingest(st('g2','answered',{raw:6,max:10},q2));
assert.equal(odd.ingest(st('done','completed',null,null)).kind,'root-final-unscored');
const native=make(options);native.ingest(st('g1','answered',{raw:4,max:5},q1));native.ingest(st('g2','answered',{raw:6,max:10},q2));
assert.equal(native.ingest(st('native','completed',{raw:27,max:38},null)).percent,100*27/38);
assert.equal(native.ingest(st('late','answered',{raw:5,max:5},q1)).kind,'subcontent');
assert.equal(native.summary().aggregateReady,false);
const partial=make(options);partial.ingest(st('g1','answered',{raw:4,max:5},q1));
assert.equal(partial.ingest(st('final','completed',null,null)).kind,'root-final-unscored');
console.log('Tracker imbrique : 0 double compte, native prioritaire, reprise liee au perimetre, incomplet refuse OK');
