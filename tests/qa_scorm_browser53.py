#!/usr/bin/env python3
"""Control real Chromium for the generated QA-only SCORM SCO. Not Moodle."""
from pathlib import Path
import subprocess
import sys
import re
import tempfile
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as directory:
    p=subprocess.run(['node','tests/generate_qa_scorm53.mjs',directory],cwd=root,capture_output=True,text=True)
    assert p.returncode==0,p.stdout+p.stderr
    with sync_playwright() as playwright:
        browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        page=browser.new_page()
        html=(Path(directory)/'index.html').read_text(encoding='utf-8')
        page.set_content(re.sub(r'<script src="[^"]+"></script>','',html))
        page.evaluate("""window.__qaValues={'cmi.core.lesson_status':'incomplete'};
          window.API={LMSInitialize:()=> 'true',LMSGetValue:k=>window.__qaValues[k]||'',LMSSetValue:(k,v)=>{window.__qaValues[k]=String(v);return 'true';},LMSCommit:()=> 'true',LMSFinish:()=> 'true',LMSGetLastError:()=> '0',LMSGetErrorString:()=>'',LMSGetDiagnostic:()=>''};""")
        for rel in ['scorm/scorm12.js','scorm/qa-h5p-mock.js','scorm/h5p-scorm-bridge.js','scorm/qa-activity.js']:
            page.add_script_tag(content=(Path(directory)/rel).read_text(encoding='utf-8'))
        page.evaluate("window.dispatchEvent(new Event('DOMContentLoaded'))")
        page.wait_for_function("!document.getElementById('scores').disabled",timeout=20000)
        page.click('#scores')
        first=page.evaluate("window.H5PConverterScoreAudit()")
        assert first['scoreSource']=='none',first
        assert page.evaluate("window.__qaValues['cmi.core.score.raw']") is None
        page.click('#submit')
        second=page.evaluate("window.H5PConverterScoreAudit()")
        assert second['scoreSource']=='aggregate' and second['aggregateUnits']==7,second
        assert page.evaluate("window.__qaValues['cmi.core.score.raw']")=='71.05'
        assert page.evaluate("window.__qaValues['cmi.core.lesson_status']")=='failed'
        page.click('#native')
        third=page.evaluate("window.H5PConverterScoreAudit()")
        assert third['scoreSource']=='native',third
        assert page.evaluate("window.__qaValues['cmi.core.score.raw']")=='81.58'
        assert page.evaluate("window.__qaValues['cmi.core.lesson_status']")=='passed'
        browser.close()
        print('Chromium : test SCO embarque reussi ; aucune note partielle, 71.05 secours, 81.58 natif')
