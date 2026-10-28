#!/usr/bin/env python3
"""Chromium: qualification interface and JSON report with real Game Map analysis.
The player itself is not executed; CDN fetching is intentionally not part of this test.
"""
import json
import re
import zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT.parent.parent/'fantasy-map-2-181 (1).h5p'
if not GAME.exists():
    print('SKIP: Game Map de recette absent'); raise SystemExit(0)
with zipfile.ZipFile(GAME) as archive:
    fixture={name:{'size':f.file_size,'dir':f.is_dir(),'text':archive.read(name).decode('utf8') if name.endswith('.json') and not f.is_dir() else None}
             for f in archive.infolist() for name in [f.filename]}
zip_shim="""window.JSZip=class {static async loadAsync(){const files=Object.fromEntries(Object.entries(window.__fixture).map(([p,f])=>[p,{dir:f.dir,_data:{uncompressedSize:f.size},async:async t=>t==='string'?f.text:new ArrayBuffer(0)}]));return {files,file(p){return files[p]||null}}}}"""
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
    html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
    page.set_content(html)
    page.add_script_tag(content=zip_shim)
    page.evaluate('(v)=>window.__fixture=v',fixture)
    for path in ['src/runtime-profiles.js','src/player-assets.js','src/portable-package.js','src/engine-catalog.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js']:
        page.add_script_tag(content=(ROOT/path).read_text())
    page.locator('#h5pFile').set_input_files(str(GAME))
    page.wait_for_function('document.querySelector("#qualificationNotes") !== null',timeout=20000)
    assert page.locator('#generateBtn').is_enabled()
    page.locator('.engine-catalog-details summary').click()
    engines=page.locator('#previewEngineProfile')
    def select(version):
        value=engines.locator('option').filter(has_text=version).get_attribute('value')
        engines.select_option(value)
    select('3.8.1')
    assert page.locator('#generateBtn').is_disabled()
    page.locator('[data-qualification-criterion="render"]').select_option('echoue')
    page.locator('[data-qualification-criterion="css"]').select_option('reussi')
    page.locator('#qualificationNotes').fill('Carte incomplète pour 3.8.1')
    with page.expect_download() as d:
        page.locator('#downloadQualificationReport').click()
    report=json.loads(d.value.path().read_text())
    assert report['engine']['version']=='3.8.1'
    assert report['evaluation']=='anomalies_constatees'
    assert report['qualification']=='non_qualifie'
    assert report['activity']['mainLibrary'].startswith('H5P.GameMap')
    assert report['summary']['failure']==1
    assert report['notes']=='Carte incomplète pour 3.8.1'
    assert report['exportAllowedByThisReport'] is False
    select('3.8.0')
    assert page.locator('[data-qualification-criterion="render"]').input_value()=='non_teste'
    assert page.locator('#qualificationNotes').input_value()==''
    select('3.8.1')
    assert page.locator('[data-qualification-criterion="render"]').input_value()=='echoue'
    assert page.locator('#qualificationNotes').input_value()=='Carte incomplète pour 3.8.1'
    select('3.8.2')
    assert page.locator('#generateBtn').is_enabled()
    with page.expect_download() as d:
        page.locator('#downloadQualificationReport').click()
    reference=json.loads(d.value.path().read_text())
    assert reference['engine']['version']=='3.8.2'
    assert reference['qualification']=='non_qualifie'
    assert not errors,errors
    browser.close()
print('Lot 4.3 Chromium : UI qualification, Game Map, moteur isolé, fichier JSON et verrouillage export OK')
