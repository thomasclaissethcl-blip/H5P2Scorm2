import fs from 'node:fs';
import assert from 'node:assert/strict';
const html = fs.readFileSync('index.html', 'utf8');
const app = fs.readFileSync('app.js','utf8');
const ui = fs.readFileSync('src/ui-workspace.js','utf8');
const css = fs.readFileSync('styles.css','utf8');
for (const id of ['uiGenerationLocation','generationInline','uiGenerationDialog','uiGenerationDialogContent','uiGenerationDialogTitle','uiGenerationResult','uiGenerationResultTitle','uiGenerationResultText','uiGenerationOK','generationProgress','generationProgressWrap','log']) {
  assert.match(html,new RegExp(`id="${id}"`),`missing: ${id}`);
}
for (const [name,event] of [['scorm','format:\'scorm\''],['multi','format:\'multi\''],['single','format:\'single\'']]) {
  assert.match(app,new RegExp(event),`missing event ${name}`);
}
assert.equal((app.match(/h5p-converter-generation-finished/g)||[]).length,3);
assert.match(app,/window.addEventListener\('h5p-converter-preview-visible'/);
assert.match(app,/preview\.notifyResize\(\)/);
assert.match(ui,/signalVisiblePreview/);
assert.match(ui,/requestAnimationFrame\(\(\) => requestAnimationFrame\(signalVisiblePreview\)\)/);
assert.match(ui,/syncHiddenPreviewWidth\(\)/);
assert.match(ui,/openGenerationDialog\(\)/);
assert.match(ui,/dialogContent\.appendChild\(generationInline\)/);
assert.match(ui,/generationHome\.appendChild\(generationInline\)/);
assert.match(ui,/generationResult\.hidden = false/);
assert.match(ui,/dialog\?\.addEventListener\('cancel', event => event\.preventDefault\(\)\)/);
assert.match(css,/\.generation-dialog::backdrop/);
assert.match(css,/\.generation-result\[hidden\]/);
assert.match(html,/aria-modal="true"/);
console.log('UI 8.5c contrat modal et recalcul aperçu : OK');
