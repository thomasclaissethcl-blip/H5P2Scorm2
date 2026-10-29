#!/usr/bin/env python3
"""Essai sous Chromium avec Game Map réel dans l'analyse, lecteur simulé.
Pas de validation de lecture des versions 3.8.1 / 3.8.0 : les CDN sont indisponibles.
"""
import json
import re
import zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT.parent.parent/'fantasy-map-2-181 (1).h5p'
if not GAME.exists():
 print('SKIP: Game Map absent'); raise SystemExit(0)
with zipfile.ZipFile(GAME) as zf:
 fixture={n:{'size':it.file_size,'dir':it.is_dir(),'text':zf.read(n).decode('utf8') if n.endswith('.json') and not it.is_dir() else None} for n,it in ((it.filename,it) for it in zf.infolist())}
init="""window.JSZip=class {static async loadAsync(){const files=Object.fromEntries(Object.entries(window.__fixture).map(([path,f])=>[path,{dir:f.dir,_data:{uncompressedSize:f.size},async:async t=>t==='string'?f.text:new ArrayBuffer(0)}]));return {files,file(path){return files[path]||null}}}}"""
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(accept_downloads=True)
 errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
 html=(ROOT/'index.html').read_text()
 html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
 html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
 page.set_content(html)
 page.add_script_tag(content=init)
 page.evaluate('(f)=>window.__fixture=f',fixture)
 for path in ['src/runtime-profiles.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-preflight.js','src/html-singlefile-resources.js','src/engine-catalog.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js']:
  page.add_script_tag(content=(ROOT/path).read_text())
 page.locator('#h5pFile').set_input_files(str(GAME))
 page.wait_for_function('document.querySelector("#previewEngineProfile") !== null',timeout=20000)
 assert page.locator('#generateBtn').is_enabled()
 page.locator('.engine-catalog-details summary').click()
 sel=page.locator('#previewEngineProfile')
 assert '3.8.2' in sel.locator('option:checked').inner_text()
 for ver in ['3.8.1','3.8.0']:
  val=sel.locator('option').filter(has_text=ver).get_attribute('value')
  sel.select_option(val)
  assert page.locator('#generateBtn').is_disabled(), 'Le moteur candidat ne doit pas permettre export'
  assert 'non qualifié' in page.locator('#previewEngineNotice').inner_text().lower() or 'expérimental' in page.locator('#previewEngineNotice').inner_text().lower()
  with page.expect_download() as d:page.locator('#downloadEngineReport').click()
  rpt=json.loads(d.value.path().read_text())
  assert rpt['preview']['playerVersion']==ver
  assert rpt['preview']['exportAllowedWithPreview'] is False
  assert rpt['runtime']['playerVersion']=='3.8.2'
 ref=sel.locator('option').filter(has_text='3.8.2').get_attribute('value')
 sel.select_option(ref)
 assert page.locator('#generateBtn').is_enabled()
 with page.expect_download() as d:page.locator('#downloadEngineReport').click()
 rpt=json.loads(d.value.path().read_text())
 assert rpt['preview']['exportAllowedWithPreview'] is True
 assert not errors,errors
 browser.close()
print('Lot 4.2 Chromium : Game Map analysé, essais volontaires bloquent export, retour 3.8.2 et rapport JSON OK')
