import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
const ctx=vm.createContext({console,URL});ctx.globalThis=ctx;
vm.runInContext(fs.readFileSync('src/html-singlefile-preflight.js','utf8'),ctx);
const {inspect}=ctx.H5PConverterModules.htmlSinglefilePreflight;
const files={
 'h5p.json':{dir:false,_data:{uncompressedSize:120}},
 'content/content.json':{dir:false,_data:{uncompressedSize:380}},
 'H5P.Example-1.0/scripts/runtime.js':{dir:false,_data:{uncompressedSize:1000}},
 'H5P.Example-1.0/styles/runtime.css':{dir:false,_data:{uncompressedSize:400}},
 'content/images/test.png':{dir:false,_data:{uncompressedSize:600}},
 'empty-dir/':{dir:true}
};
const content={html:'<p><img src="https://example.org/media/a.png?token=SECRET"></p>',q:'https://example.org/media/a.png?token=SECRET'};
const result=JSON.parse(JSON.stringify(inspect({files,h5pJson:{mainLibrary:'H5P.Example'},contentJson:content,sourceName:'test.h5p'})));
assert.equal(result.qualification.supported,false);
assert.equal(result.qualification.status,'non-qualifie');
assert.equal(result.qualification.recommendedFormat,'html-multifile');
assert.equal(result.inventory.fileCount,5);
assert.equal(result.inventory.scriptFiles,1);
assert.equal(result.inventory.stylesheetFiles,1);
assert.equal(result.inventory.knownUncompressedBytes,2500);
assert.equal(result.inventory.unknownSizeFiles,0);
assert.equal(result.inventory.minimumBase64Bytes,4*Math.ceil(2500/3));
assert.equal(result.inventory.externalReferencesDetected,1);
assert.equal(result.inventory.externalReferencesSample[0],'https://example.org/media/a.png');
assert.ok(!JSON.stringify(result).includes('SECRET'));
const few=inspect({files:{'f.bin':{dir:false,_data:{}}},h5pJson:{},contentJson:{}});
assert.equal(few.inventory.unknownSizeFiles,1);
assert.equal(few.inventory.minimumBase64Bytes,null);
assert.equal(few.qualification.supported,false);
const huge=inspect({files:{huge:{dir:false,_data:{uncompressedSize:66*1024*1024}}},h5pJson:{},contentJson:{}});
assert.ok(huge.warnings.some(w=>w.includes('64 Mio')));
assert.throws(()=>inspect({files:{},h5pJson:null,contentJson:{}}),/H5P analysé/);
assert.ok(!fs.readFileSync('src/html-singlefile-preflight.js','utf8').includes('fetch('));
console.log('Lot 8.1 : diagnostic H5P, volume, URL externes, refus responsable du monofichier non certifie OK');
