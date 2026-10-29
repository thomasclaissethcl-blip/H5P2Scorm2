import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const file = fs.readFileSync('app.js','utf8');
const js=file.replace(/\}\)\(\);\s*$/,`globalThis.__bridgeSource=bridgeSource;\n})();`);
const app=vm.createContext({console,navigator:{language:'fr'},document:{getElementById(){return {value:'',addEventListener(){}}}},setTimeout,clearTimeout,setInterval,clearInterval});
app.window=app; app.globalThis=app; app.window.addEventListener=()=>{};
for (const f of ['src/runtime-profiles.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/engine-catalog.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js']) vm.runInContext(fs.readFileSync(f,'utf8'),app,{filename:f});
vm.runInContext(js,app);
function launch(lib) {
 const values={'cmi.core.lesson_status':'incomplete'};
 let handler;
 const runtime=vm.createContext({console,Blob,Uint8Array,TextEncoder,TextDecoder,Response,
  CompressionStream,DecompressionStream,setTimeout,clearTimeout,setInterval:()=>1,clearInterval:()=>{},
  SCORM12:{init:()=>true,get:k=>values[k]||'',set:(k,v)=>{values[k]=String(v);return true},commit:()=>true,finish:()=>true},
  document:{documentElement:{lang:''},getElementById:()=>({hidden:true,textContent:''})},
  H5PStandalone:{H5P:function(){ runtime.H5P={externalDispatcher:{on:(name,cb)=>{if(name==='xAPI')handler=cb}}};return Promise.resolve()}}
 });
 const listeners={};runtime.window=runtime;runtime.addEventListener=(type,cb)=>{listeners[type]=cb};
 vm.runInContext(app.__bridgeSource(80,'fr','auto',10,false,true,4000,lib),runtime);
 return {values,run:async()=>{await listeners.DOMContentLoaded(); assert.equal(typeof handler,'function')},
   emit:(statement)=>handler({data:{statement}})};
}
function event(id,verb,score,child,complete){
 const ext=child?{'http://h5p.org/x-api/h5p-subContentId':child}:{};
 return {id,verb:{id:'http://adlnet.gov/expapi/verbs/'+verb},object:{id:child?'http://t?subContentId='+child:'http://t',definition:{extensions:ext}},
  context:{contextActivities:child?{parent:[{id:'http://t'}]}:{}},result:{...(score?{score}:{}),...(complete?{completion:true}:{})}};
}
const game=launch('H5P.GameMap');await game.run();
game.emit(event('child1','answered',{raw:5,max:5},'sub1'));
game.emit(event('child2','answered',{raw:4,max:5},'sub2'));
assert.equal(game.values['cmi.core.score.raw'],undefined,'no score for child-only');
game.emit(event('root','answered',{raw:9,max:10}));
assert.equal(game.values['cmi.core.score.raw'],'90');
assert.equal(game.values['cmi.core.lesson_status'],'passed','GameMap answered final');
game.emit(event('same-root-again','completed',null,null,true));
assert.equal(game.values['cmi.core.lesson_status'],'passed','no late status downgrade');
const book=launch('H5P.InteractiveBook');await book.run();
book.emit(event('book1','answered',{raw:4,max:5},'q1'));
book.emit(event('book2','answered',{raw:6,max:10},'q2'));
book.emit(event('bookend','completed',null,null,true));
assert.equal(book.values['cmi.core.score.raw'],undefined,'unbounded aggregate must never be written');
assert.equal(book.values['cmi.core.lesson_status'],'completed');
const simple=launch('H5P.MultiChoice');await simple.run();
simple.emit(event('question','answered',{raw:0,max:1}));
assert.equal(simple.values['cmi.core.score.raw'],'0');
assert.equal(simple.values['cmi.core.lesson_status'],'incomplete','other root answered unchanged');
console.log('SCORM runtime : Game Map final answered, multi-score unbounded not invented, native score stable OK');
