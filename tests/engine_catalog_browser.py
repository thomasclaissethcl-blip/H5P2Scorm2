#!/usr/bin/env python3
"""Test ciblé du catalogue sur le vrai package Game Map joint à la recette.
Le décompresseur JSZip et le lecteur restent simulés. Aucune validation LMS.
"""
import json
import re
import zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
GAME_MAP = ROOT.parent.parent / 'fantasy-map-2-181 (1).h5p'
# Les données restent disponibles uniquement dans l'environnement de développement.
if not GAME_MAP.exists():
    print('SKIP : Game Map de recette absent ; test navigateur facultatif non exécuté')
    raise SystemExit(0)

with zipfile.ZipFile(GAME_MAP) as zf:
    archive = {}
    for item in zf.infolist():
        archive[item.filename] = {
            'size': item.file_size, 'dir': item.is_dir(),
            'text': zf.read(item).decode('utf8') if item.filename.endswith('.json') and not item.is_dir() else None,
        }

init = """(() => {
 window.JSZip = class {
   static async loadAsync() {
     const files = Object.fromEntries(Object.entries(window.__fixture).map(([path,file]) => [path, {
       dir:file.dir, _data:{uncompressedSize:file.size},
       async:async type => { if(type==='string') return file.text; return new ArrayBuffer(0); }
     }]));
     return {files,file(path){return files[path]||null;}};
   }
 };
})();"""

with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    page = browser.new_page(accept_downloads=True)
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    html = (ROOT/'index.html').read_text()
    html = re.sub(r'<script\s+src="[^"]+"\s*></script>', '', html)
    html = re.sub(r'<link\s+rel="stylesheet"[^>]*>', '', html)
    page.set_content(html)
    page.add_script_tag(content=init)
    page.evaluate('(files) => {window.__fixture=files}', archive)
    for path in ['src/runtime-profiles.js','src/engine-catalog.js','src/h5p-dependencies.js',
                 'src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js',
                 'src/youtube-preview.js','app.js']:
        page.add_script_tag(content=(ROOT/path).read_text())
    page.locator('#h5pFile').set_input_files(str(GAME_MAP))
    page.wait_for_function("document.querySelector('#downloadEngineReport') !== null", timeout=15000)
    page.locator('.engine-catalog-details summary').click()
    text = page.locator('.engine-catalog-details').inner_text()
    assert 'H5P.GameMap' in text and '1.9.8' in text, text[:1000]
    assert '3.8.2' in text and '3.8.1' in text and '3.8.0' in text
    assert 'Non qualifié, non sélectionnable' in text
    assert page.locator('#generateBtn').is_enabled(), 'Le Game Map validé ne doit pas être bloqué'
    with page.expect_download() as event:
        page.locator('#downloadEngineReport').click()
    dl=event.value
    assert dl.suggested_filename == 'diagnostic-versions-h5p.json'
    path = dl.path()
    report = json.loads(path.read_text())
    main = next(x for x in report['libraries'] if x['role']=='principale')
    assert main['machineName']=='H5P.GameMap' and main['version']=='1.9.8'
    assert report['runtime']['activeProfileId']=='h5p-standalone-3.8.2-core-1.28'
    assert all(not x['selectable'] for x in report['catalogue'][1:])
    assert len(report['libraries'])==37, len(report['libraries'])
    # Les erreurs réseau du lecteur simulé ne sont pas un résultat d'analyse.
    assert not errors, errors
    browser.close()
print('Firefox à valider manuellement ; Chromium : rapport et version Game Map réels OK')
