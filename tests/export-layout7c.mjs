import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx=vm.createContext({console});ctx.globalThis=ctx;
vm.runInContext(fs.readFileSync('src/export-layout.js','utf8'),ctx);
const layout=ctx.H5PConverterModules.exportLayout;
const plain=obj=>JSON.parse(JSON.stringify(obj));
const blank={maxWidthPx:'',marginTopPx:'',marginBottomPx:'',marginLeftPx:'',marginRightPx:''};
assert.deepEqual(plain(layout.normalize(blank)),{maxWidthPx:null,marginTopPx:null,marginRightPx:null,marginBottomPx:null,marginLeftPx:null});
assert.equal(layout.css(blank),'');
const input={maxWidthPx:'960',marginTopPx:'12',marginBottomPx:'48',marginLeftPx:'24',marginRightPx:'36'};
const norm=plain(layout.normalize(input));
assert.equal(norm.maxWidthPx,960);assert.equal(norm.marginTopPx,12);
assert.equal(norm.marginBottomPx,48);assert.equal(norm.marginLeftPx,24);assert.equal(norm.marginRightPx,36);
const css=layout.css(norm);
assert.match(css,/padding-top:12px/);
assert.match(css,/padding-bottom:48px/);
assert.match(css,/padding-left:min\(24px,49vw\)/);
assert.match(css,/padding-right:min\(36px,49vw\)/);
assert.match(css,/max-width:960px/);
assert.match(css,/#h5p-container:fullscreen\{max-width:none!important/);
assert.ok(!css.includes('.h5p-content'));
const zero=layout.css({...blank,marginTopPx:'0'});
assert.match(zero,/padding-top:0px/);assert.ok(!zero.includes('padding-right'));
assert.equal(layout.css({...blank,marginLeftPx:'24'}).includes('padding-top'),false);
assert.match(layout.css({...blank,maxWidthPx:'300'}),/max-width:300px/);
for(const side of ['Top','Bottom','Left','Right']){
 for(const invalid of ['-1','2001','1.2','1e2','1px','Infinity','0;display:none'])
  assert.throws(()=>layout.normalize({...blank,[`margin${side}Px`]:invalid}),/Marge/);
}
for(const invalid of ['0','10001','-1'])assert.throws(()=>layout.normalize({...blank,maxWidthPx:invalid}),/Largeur maximale/);
// Compatibilite explicite avec le parametrage existant du lot 7b.
assert.deepEqual(plain(layout.normalize({maxWidthPx:'960',marginPx:'24'})),{maxWidthPx:960,marginPx:24});
assert.match(layout.css({maxWidthPx:960,marginPx:24}),/padding:24px/);
console.log('Lot 7c : quatre marges independantes, blancs/zero, garde-fou responsive, retrocompatibilite 7b OK');
