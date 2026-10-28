import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('src/scorm-score-plan.js','utf8'),context);
const build=context.H5PConverterModules.scorePlan.createPlan;
const u=n=>`${String(n).padStart(8,'0')}-1111-4111-8111-111111111111`;
const node=(lib,n,params={})=>({library:`H5P.${lib} 1.1`,subContentId:u(n),params});
const scored=n=>node('MultiChoice',n,{question:'Test'});
const group=(n,children)=>node('QuestionSet',n,{questions:children});
const hotspots=(n,children)=>node('ImageHotspots',n,{hotspots:[{content:children}]});
const accordion=(n,children)=>node('Accordion',n,{panels:children.map(content=>({content}))});
const column=(n,items)=>node('Column',n,{content:items.map(content=>({content}))});
const book=items=>({chapters:[column(100,items)]});
const valid=build('H5P.InteractiveBook',book([
 hotspots(10,[node('Text',11,{text:'information'})]),
 accordion(12,[node('AdvancedText',13,{text:'information'})]),
 group(20,[scored(21),scored(22)]),scored(23)
]));
assert.equal(valid.enabled,true);
assert.equal(valid.expectedSubContentIds.length,2);
assert.ok(valid.expectedSubContentIds.includes(u(20)));
assert.ok(valid.expectedSubContentIds.includes(u(23)));
assert.deepEqual(Array.from(valid.ignoredNestedSubContentIds),[u(21),u(22)]);
assert.equal(valid.scoreUnits[0].kind,'question-set');
assert.equal(valid.scoreUnits[0].questionCount,2);
assert.equal(valid.displayOnlyCounts['H5P.ImageHotspots'],1);
assert.equal(valid.displayOnlyCounts['H5P.Accordion'],1);
assert.equal(build('H5P.InteractiveBook',book([hotspots(10,[scored(11)]),scored(23)])).reason,
 'unqualified-hotspot-content:H5P.MultiChoice');
assert.equal(build('H5P.InteractiveBook',book([accordion(12,[scored(13)]),scored(23)])).reason,
 'unqualified-accordion-content:H5P.MultiChoice');
assert.equal(build('H5P.InteractiveBook',book([group(20,[]),scored(23)])).reason,'empty-question-set');
assert.equal(build('H5P.InteractiveBook',book([group(20,[scored(21),node('Essay',22)]),scored(23)])).reason,
 'unqualified-question-set-child:H5P.Essay');
assert.equal(build('H5P.InteractiveBook',book([group(20,[scored(23)]),scored(23)])).reason,
 'duplicate-subcontent-id');
assert.equal(build('H5P.GameMap',book([group(20,[scored(21)])])).reason,'native-score-preferred');
console.log('Plan imbrique : groupe non double-compte, affichages valides, sous-structures inconnues refusees OK');
