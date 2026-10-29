import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const file=fs.readFileSync('app.js','utf8');
const source=file.replace(/\}\)\(\);\s*$/,`globalThis.__bridgeSource=bridgeSource;\n})();`);
const app=vm.createContext({console,navigator:{language:'fr'},document:{getElementById(){return {value:'',addEventListener(){}}}},setTimeout,clearTimeout,setInterval,clearInterval});
app.window=app;app.globalThis=app;app.window.addEventListener=()=>{};
for(const p of ['src/runtime-profiles.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/engine-catalog.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js']) vm.runInContext(fs.readFileSync(p,'utf8'),app,{filename:p});
vm.runInContext(source,app);
const q1='11111111-1111-4111-8111-111111111111',q2='22222222-2222-4222-8222-222222222222';
const nested='33333333-3333-4333-8333-333333333333';
const plan={enabled:true,expectedSubContentIds:[q1,q2],ignoredNestedSubContentIds:[nested]};
function makeRuntime(stored='') {
 const values={'cmi.core.lesson_status':'incomplete','cmi.suspend_data':stored};let handler;
 const runtime=vm.createContext({console,Blob,Uint8Array,TextEncoder,TextDecoder,Response,CompressionStream,DecompressionStream,btoa,atob,
    setTimeout,clearTimeout,setInterval:()=>1,clearInterval:()=>{},
    SCORM12:{init:()=>true,get:k=>values[k]||'',set:(k,v)=>{values[k]=String(v);return true},commit:()=>true,finish:()=>true},
    document:{documentElement:{lang:''},getElementById:()=>({hidden:true,textContent:''})},
    H5PStandalone:{H5P:function(){ runtime.H5P={externalDispatcher:{on:(name,cb)=>{if(name==='xAPI')handler=cb}}};return Promise.resolve()}}
 });
 const listeners={};runtime.window=runtime;runtime.addEventListener=(type,cb)=>{listeners[type]=cb};
 vm.runInContext(app.__bridgeSource(80,'fr','auto',10,true,true,4000,'H5P.InteractiveBook',plan),runtime);
 return {values,boot:async()=>{await listeners.DOMContentLoaded();assert.equal(typeof handler,'function')},emit:(st)=>handler({data:{statement:st}}),wait:()=>new Promise(r=>setTimeout(r,80)),close:()=>listeners.pagehide()};
}
const evt=(id,verb,score,sub)=>({id,verb:{id:'http://adlnet.gov/expapi/verbs/'+verb},object:{id:'http://t'+(sub?'?subContentId='+sub:''),definition:{extensions:sub?{'http://h5p.org/x-api/h5p-subContentId':sub}:{}}},context:{registration:'same-attempt',contextActivities:sub?{parent:[{id:'http://t'}]}:{}},result:{...(score?{score}:{}),...(verb==='completed'?{completion:true}:{})}});
const rt=makeRuntime();await rt.boot();
rt.emit(evt('nested','answered',{raw:1,max:1},nested));
rt.emit(evt('s1','answered',{raw:4,max:5},q1));
rt.emit(evt('finish','completed',null));
assert.equal(rt.values['cmi.core.score.raw'],undefined);
await rt.wait();
// Les notes intermediaires sont stockees sans faux total ; elles sont restaurees.
assert.ok(rt.values['cmi.suspend_data'].startsWith('H5P3R:') || rt.values['cmi.suspend_data'].startsWith('H5P3Z:'));
assert.ok(rt.values['cmi.suspend_data'].length<=4000);
const rt2=makeRuntime(rt.values['cmi.suspend_data']);await rt2.boot();
rt2.emit(evt('s2','answered',{raw:6,max:10},q2));
assert.equal(rt2.values['cmi.core.score.raw'],'66.67');
assert.equal(rt2.values['cmi.core.lesson_status'],'failed');
rt2.emit(evt('native','completed',{raw:9,max:10}));
assert.equal(rt2.values['cmi.core.score.raw'],'90');
assert.equal(rt2.values['cmi.core.lesson_status'],'passed');
rt2.close();
console.log('Pont SCORM imbrique : sous-question ignoree, 2 unites, reprise, 66.67 et 90 natif prioritaires OK');
