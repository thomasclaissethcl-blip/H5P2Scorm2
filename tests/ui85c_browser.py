#!/usr/bin/env python3
"""Test UI modal status, error, restoration, resize signal in Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]
SCRIPTS=['src/runtime-profiles.js','src/engine-catalog.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-resources.js','src/html-singlefile-player.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js','src/ui-workspace.js']
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':900},locale='fr-FR');errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 html=(ROOT/'index.html').read_text()
 html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
 html=re.sub(r'<link\s+[^>]*rel="stylesheet"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(ROOT/'styles.css').read_text())
 page.add_script_tag(content='window.JSZip={loadAsync:async()=>({files:{}})};')
 for path in SCRIPTS:page.add_script_tag(content=(ROOT/path).read_text())
 page.evaluate('''() => {
    window.__previewVisible=0;
    window.addEventListener('h5p-converter-preview-visible',()=>window.__previewVisible++);
 }''')
 page.locator('.nav-button[data-view="preview"]').click()
 page.wait_for_function('window.__previewVisible>=1')
 # Hidden preview must have real measured work area width.
 page.locator('.nav-button[data-view="import"]').click()
 dims=page.evaluate('''() => {
   const main=document.getElementById('mainContent'); const st=getComputedStyle(main);
   return {hidden:document.getElementById('view-preview').hidden,
    actual:main.getBoundingClientRect().width-parseFloat(st.paddingLeft)-parseFloat(st.paddingRight),
    preview:parseFloat(document.getElementById('view-preview').style.width)};
 }''')
 assert dims['hidden'] and abs(dims['actual']-dims['preview']) <= 1,dims
 page.locator('.nav-button[data-view="preview"]').click()
 assert page.evaluate("document.querySelector('#view-preview').style.width")==''
 page.locator('.nav-button[data-view="export"]').click()
 page.evaluate('''() => {
   window.__called=[];
   for(const id of ['generateBtn','generateHtmlBtn','singlefileInteractiveBtn']){
     const button=document.getElementById(id);button.disabled=false;
     button.click=()=>window.__called.push(id);
   }
 }''')
 page.wait_for_function("!document.getElementById('uiGeneratePrimary').disabled")
 for format_id,target in [('scorm','generateBtn'),('multi','generateHtmlBtn'),('single','singlefileInteractiveBtn')]:
   page.locator(f'input[name="uiExportFormat"][value="{format_id}"]').check()
   page.locator('#uiGeneratePrimary').click()
   assert page.evaluate('window.__called.slice(-1)[0]')==target
   assert page.locator('#uiGenerationDialog').evaluate('(el)=>el.open')
   assert page.locator('#generationInline').evaluate('(el)=>el.parentElement.id')=='uiGenerationDialogContent'
   assert page.locator('#uiGenerationResult').is_hidden()
   # Actual progress/log elements moved in modal (not duplicated).
   page.evaluate('''() => {
      const pr=document.getElementById('generationProgress');pr.value=65;
      document.getElementById('generationProgressWrap').hidden=false;
      document.getElementById('generationProgressPercent').textContent='65 %';
      document.getElementById('log').textContent='[00:00:00] Test de progression...';
   }''')
   assert page.locator('#uiGenerationDialog #generationProgressPercent').inner_text()=='65 %'
   if format_id=='scorm':page.screenshot(path='/mnt/data/UI_85C_MODAL_PROGRESS.png')
   assert 'Test de progression' in page.locator('#uiGenerationDialog #log').inner_text()
   # Disallow Escape during the operation.
   page.keyboard.press('Escape')
   assert page.locator('#uiGenerationDialog').evaluate('(el)=>el.open')
   assert page.locator('#uiGenerationOK').is_hidden()
   success=format_id!='multi'
   if success:
     page.evaluate('''() => {document.getElementById('generationProgress').value=100;document.getElementById('generationProgressPercent').textContent='100 %';}''')
   page.evaluate('''success => document.dispatchEvent(new CustomEvent('h5p-converter-generation-finished',{detail:{success}}))''',success)
   assert page.locator('#uiGenerationOK').is_visible()
   expected='Contenu généré' if success else 'Échec de la génération'
   assert page.locator('#uiGenerationResultTitle').inner_text()==expected
   assert page.evaluate('''() => {
     const result=document.getElementById('uiGenerationResult');const progress=document.getElementById('generationProgressWrap');const log=document.getElementById('log');
     return !!(progress.compareDocumentPosition(result)&Node.DOCUMENT_POSITION_FOLLOWING) && !!(result.compareDocumentPosition(log)&Node.DOCUMENT_POSITION_FOLLOWING);
   }''')
   if format_id=='scorm':page.screenshot(path='/mnt/data/UI_85C_MODAL_COMPLETE.png')
   page.locator('#uiGenerationOK').click()
   assert not page.locator('#uiGenerationDialog').evaluate('(el)=>el.open')
   assert page.locator('#generationInline').evaluate('(el)=>el.parentElement.id')=='uiGenerationLocation'
   assert page.locator('#log').inner_text().startswith('[00:00:00]')
 for width in [1450,990,768,390,320]:
  page.set_viewport_size({'width':width,'height':800})
  measured=page.evaluate('''() => ({width:innerWidth,scroll:document.documentElement.scrollWidth})''')
  assert measured['scroll']<=measured['width']+1,measured
 assert not errors,errors
 b.close()
print('UI 8.5c Chromium : 3 formats, reparentage/restauration, statut réussite/erreur, responsive, recalcul aperçu OK')
