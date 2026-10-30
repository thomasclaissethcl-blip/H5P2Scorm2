#!/usr/bin/env python3
"""Test the new UI with genuine H5P fixture analysis, not an artificial button state."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,zipfile
ROOT=Path(__file__).resolve().parents[1]
modules=['src/runtime-profiles.js','src/engine-catalog.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-resources.js','src/html-singlefile-player.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js','src/ui-workspace.js']
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1400,'height':900})
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(ROOT/'index.html').read_text()
 html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
 html=re.sub(r'<link\s+[^>]*rel="stylesheet"[^>]*>','',html)
 page.set_content(html);page.add_style_tag(content=(ROOT/'styles.css').read_text())
 page.add_script_tag(content='''window.JSZip={loadAsync:async()=>({files:Object.fromEntries(Object.entries(window.__fixture).map(([path,file])=>[path,{dir:file.dir,_data:{uncompressedSize:file.size},async:async()=>file.text}])), file(path){return this.files[path]||null;}})};''')
 for name in modules:page.add_script_tag(content=(ROOT/name).read_text())
 for filename,expected in [('poc-valid.h5p',True),('poc-coreapi-future.h5p',False),('poc-missing-dependency.h5p',False)]:
  entries={}
  with zipfile.ZipFile(ROOT/'test-fixtures'/filename) as z:
   for entry in z.infolist():
    data=z.read(entry.filename) if not entry.is_dir() else b''
    entries[entry.filename]={'text':data.decode('utf8') if entry.filename.endswith('.json') else None, 'size':entry.file_size,'dir':entry.is_dir()}
  page.evaluate('(data)=>{window.__fixture=data;}',entries)
  page.locator('#h5pFile').set_input_files(str(ROOT/'test-fixtures'/filename))
  page.wait_for_function("document.querySelector('#diagnostic').classList.contains('status-ok') || document.querySelector('#diagnostic').classList.contains('status-warn') || document.querySelector('#diagnostic').classList.contains('status-error')")
  page.wait_for_timeout(50)
  assert page.locator('#uiSummaryFile').inner_text()==filename,filename
  page.locator('.nav-button[data-view="export"]').click()
  assert page.locator('#uiGeneratePrimary').is_enabled()==expected,(filename,page.locator('#uiSummaryDiagnostic').inner_text())
  for val in ['multi','single']:
   page.locator(f'input[name="uiExportFormat"][value="{val}"]').check()
   assert page.locator('#uiGeneratePrimary').is_enabled()==expected,(filename,val)
  page.locator('.nav-button[data-view="import"]').click()
  page.screenshot(path='/mnt/data/ui85b_real_import_loaded.png',full_page=True)
 assert not errors,errors
 b.close()
print('UI 8.5b : H5P valide et 2 incompatibles, statut export correct dans les trois formats, aucune erreur navigateur')
