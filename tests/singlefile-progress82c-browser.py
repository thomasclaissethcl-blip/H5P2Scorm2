#!/usr/bin/env python3
"""Controle de la barre de progression du prototype dans Chromium.
JSZip et les 25 reponses CDN sont simules; controle de l'interface, pas du paquet H5P reel.
"""
import base64
import re
import zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=ROOT/'test-fixtures/poc-valid.h5p'
with zipfile.ZipFile(FIXTURE) as z:
    content={k:base64.b64encode(z.read(k)).decode() for k in z.namelist() if not k.endswith('/')}
MOCK_JSZIP="""(() => {
  class Entry {
    constructor(input){ this.dir=false; this.payload=input instanceof Uint8Array ? input :
      input instanceof ArrayBuffer ? new Uint8Array(input) : new TextEncoder().encode(String(input));
      this._data={uncompressedSize:this.payload.length}; }
    async async(kind){return kind==='string'?new TextDecoder().decode(this.payload):this.payload;}
  }
  window.JSZip=class {
    constructor(){this.files={};}
    file(p,v){if(v===undefined)return this.files[p]||null;this.files[p]=new Entry(v);return this;}
    static async loadAsync(){const z=new window.JSZip();for(const [p,b64] of Object.entries(window.__fixture)){
      const bin=atob(b64);const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
      z.file(p,bytes);
    }return z;}
  };
})();"""
SCRIPTS=['src/runtime-profiles.js','src/engine-catalog.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-preflight.js','src/html-singlefile-resources.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js']
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=b.new_page(accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda x:errors.append(str(x)))
    page.route('**/npm/h5p-standalone@*/dist/**',lambda r:r.fulfill(status=200,body=b'asset-test',headers={'access-control-allow-origin':'*'}))
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
    html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
    page.set_content(html)
    page.evaluate('fixture => window.__fixture=fixture',content)
    page.add_script_tag(content=MOCK_JSZIP)
    for path in SCRIPTS:page.add_script_tag(content=(ROOT/path).read_text())
    page.locator('#h5pFile').set_input_files(str(FIXTURE))
    page.wait_for_function('document.querySelector("#singlefileResourceBtn").disabled === false',timeout=25000)
    with page.expect_download(timeout=25000) as dl:
        page.locator('#singlefileResourceBtn').click()
    download=dl.value
    assert download.suggested_filename.endswith('-prototype-ressources-non-interactif.html'),download.suggested_filename
    page.wait_for_function('document.querySelector("#generationProgressPercent").textContent === "100 %"',timeout=25000)
    percent=page.locator('#generationProgressPercent').inner_text()
    label=page.locator('#generationProgressPhase').inner_text()
    bar=page.locator('#generationProgress').evaluate('(el) => String(el.value)')
    logs=page.locator('#log').inner_text()
    assert percent=='100 %',(percent,label)
    assert label=='Terminé',label
    assert bar=='100',bar
    assert 'Prototype non interactif' in logs,logs
    assert page.locator('#singlefileResourceBtn').is_enabled()
    assert page.locator('#generateHtmlBtn').is_enabled()
    assert page.locator('#generateBtn').is_enabled()
    assert not errors,errors
    b.close()
print('Chromium : clic Prototype, téléchargement, progression 100 %, état Terminé, boutons réactivés : OK (JSZip/CDN simulés)')
