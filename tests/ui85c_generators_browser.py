#!/usr/bin/env python3
"""Three real application export flows, simulated ZIP/player IO, genuine UI/modal."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import zipfile,base64,re
ROOT=Path(__file__).resolve().parents[1]
SCRIPTS=['src/runtime-profiles.js','src/engine-catalog.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-resources.js','src/html-singlefile-player.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js','src/ui-workspace.js']
files={}
with zipfile.ZipFile(ROOT/'test-fixtures/poc-valid.h5p') as z:
 for item in z.infolist():
  if not item.is_dir():files[item.filename]={'b64':base64.b64encode(z.read(item.filename)).decode(), 'size':item.file_size}
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1240,'height':840},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 html=(ROOT/'index.html').read_text()
 html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
 html=re.sub(r'<link\s+[^>]*rel="stylesheet"[^>]*>','',html)
 page.set_content(html)
 page.add_style_tag(content=(ROOT/'styles.css').read_text())
 page.evaluate('window.__fixture = data => data') if False else None
 page.evaluate('(fixture)=>window.__fixture=fixture',files)
 page.add_script_tag(content='''(() => {
   const decode = b64 => Uint8Array.from(atob(b64), c=>c.charCodeAt(0));
   function FakeZip(){this.files={};}
   FakeZip.loadAsync=async()=>{
     const zip=new FakeZip();
     for(const [path,rec] of Object.entries(window.__fixture)){
       zip.files[path]={dir:false,_data:{uncompressedSize:rec.size},async:async format=>{const bytes=decode(rec.b64);return format==='string'?new TextDecoder().decode(bytes):format==='uint8array'?bytes:bytes.buffer;}};
     }
     return zip;
   };
   FakeZip.prototype.file=function(path,data){
     if(arguments.length>1){
       this.files[path]={dir:false,async:async format=>{
         const bytes = typeof data==='string' ? new TextEncoder().encode(data) : data instanceof Uint8Array ? new Uint8Array(data) : data instanceof ArrayBuffer ? new Uint8Array(data) : new TextEncoder().encode(String(data));
         return format==='string'?new TextDecoder().decode(bytes):format==='uint8array'?bytes:bytes.buffer;
       }};
       return this;
     }
     return this.files[path]||null;
   };
   FakeZip.prototype.generateAsync=async function(opts,onUpdate){onUpdate?.({percent:50});onUpdate?.({percent:100});return new Blob(['ZIP TEST'],{type:'application/zip'});};
   window.JSZip=FakeZip;
   window.fetch=async url=>({ok:true,arrayBuffer:async()=>new TextEncoder().encode('/* fixture player */').buffer});
   window.__outcomes=[];
   document.addEventListener('h5p-converter-generation-finished',e=>window.__outcomes.push(e.detail));
 })();''')
 for script in SCRIPTS:page.add_script_tag(content=(ROOT/script).read_text())
 print('Scripts loaded',flush=True)
 page.locator('#h5pFile').set_input_files(str(ROOT/'test-fixtures/poc-valid.h5p'))
 print('H5P chosen',flush=True)
 page.wait_for_function("!document.getElementById('generateBtn').disabled",timeout=7000)
 print('Analysis passed',flush=True)
 page.locator('.nav-button[data-view="export"]').click()
 for name in ['scorm','multi','single']:
   print('testing format',name,flush=True)
   page.locator(f'input[name="uiExportFormat"][value="{name}"]').check()
   with page.expect_download(timeout=12000):page.locator('#uiGeneratePrimary').click()
   page.wait_for_function('document.getElementById("uiGenerationOK").offsetParent !== null',timeout=30000)
   assert page.locator('#uiGenerationResultTitle').inner_text()=='Contenu généré'
   assert page.locator('#generationProgressPercent').inner_text()=='100 %'
   assert len(page.locator('#log').inner_text())>0
   page.locator('#uiGenerationOK').click()
   assert page.locator('#log').evaluate('(el)=>el.parentElement.id')=='generationInline'
   assert page.locator('#generationInline').evaluate('(el)=>el.parentElement.id')=='uiGenerationLocation'
 outcomes=page.evaluate('window.__outcomes')
 assert len(outcomes)==3,outcomes
 assert [o['format'] for o in outcomes]==['scorm','multi','single'],outcomes
 assert all(o['success'] for o in outcomes),outcomes
 assert not errors,errors
 browser.close()
print('UI 8.5c : 3 exportateurs déclenchés, 3 téléchargements simulés, restauration modale OK')
