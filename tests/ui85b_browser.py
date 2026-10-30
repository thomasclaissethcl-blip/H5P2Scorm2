#!/usr/bin/env python3
"""UI 8.5b : genuine Chromium interactions, preserving the 8.4b HTML bindings.
Browser loads source scripts locally via injection (no HTTP/CDN), JSZip mocked for analysis.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parents[1]
SCRIPTS=['src/runtime-profiles.js','src/engine-catalog.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-resources.js','src/html-singlefile-player.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js','src/ui-workspace.js']
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=b.new_page(viewport={'width':1450,'height':960},locale='fr-FR');errors=[]
    page.on('pageerror',lambda error: errors.append(str(error)))
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
    html=re.sub(r'<link\s+[^>]*rel="stylesheet"[^>]*>','',html)
    page.set_content(html)
    page.add_style_tag(content=(ROOT/'styles.css').read_text())
    page.add_script_tag(content='window.JSZip={loadAsync:async()=>({files:{}})};')
    for script in SCRIPTS: page.add_script_tag(content=(ROOT/script).read_text())
    assert page.locator('#view-import').is_visible()
    assert page.locator('#view-export').is_hidden()
    page.screenshot(path='/mnt/data/ui85b_real_import_dark.png',full_page=True)
    page.locator('.nav-button[data-view="preview"]').click()
    assert page.locator('#previewPanel').is_visible()
    assert page.locator('#previewFrame').count()==1
    page.screenshot(path='/mnt/data/ui85b_real_preview_dark.png',full_page=True)
    page.locator('.nav-button[data-view="customize"]').click()
    assert page.locator('#courseTitle').is_visible() and page.locator('#layoutMaxWidth').is_visible()
    assert page.locator('#cssFile').is_hidden()
    page.locator('.ui-detail').filter(has=page.locator('#cssFile')).locator('summary').click()
    assert page.locator('#cssFile').is_visible()
    page.locator('#courseTitle').fill('Activité de recette')
    page.locator('#layoutMaxWidth').fill('960')
    page.locator('.nav-button[data-view="export"]').click()
    assert page.locator('#scormOptionsPanel').is_visible()
    assert page.locator('#statusPolicy').is_visible()
    page.locator('#resumeProfile').select_option('moodle-extended')
    # When selecting HTML format the SCORM-only settings disappear, without losing their state.
    page.locator('input[name="uiExportFormat"][value="multi"]').check()
    assert page.locator('#scormOptionsPanel').is_hidden()
    assert page.locator('#uiGeneratePrimary').inner_text().strip()=='Générer le mini-site ZIP'
    page.locator('input[name="uiExportFormat"][value="single"]').check()
    assert page.locator('#uiGeneratePrimary').inner_text().strip()=='Générer le HTML monofichier'
    page.locator('input[name="uiExportFormat"][value="scorm"]').check()
    assert page.locator('#resumeProfile').input_value()=='moodle-extended'
    # Enable the actual legacy buttons to prove dispatch of the visible Convert command.
    page.evaluate('''() => {
      window.__clicked=[];
      for(const id of ['generateBtn','generateHtmlBtn','singlefileInteractiveBtn']){
        const btn=document.getElementById(id);btn.disabled=false;
        btn.addEventListener('click',()=>window.__clicked.push(id));
      }
    }''')
    page.wait_for_function("!document.getElementById('uiGeneratePrimary').disabled")
    # Prevent default test actions from doing actual ZIP work by replacing the original click method.
    page.evaluate('''() => {
      for(const id of ['generateBtn','generateHtmlBtn','singlefileInteractiveBtn']){
        document.getElementById(id).click=()=>window.__clicked.push(id);
      }
    }''')
    for name,target in [('scorm','generateBtn'),('multi','generateHtmlBtn'),('single','singlefileInteractiveBtn')]:
        page.locator(f'input[name="uiExportFormat"][value="{name}"]').check()
        page.locator('#uiGeneratePrimary').click()
        assert page.evaluate('window.__clicked.slice(-1)[0]')==target,name
    page.screenshot(path='/mnt/data/ui85b_real_export_dark.png',full_page=True)
    page.locator('#themeToggle').click()
    assert page.locator('html').get_attribute('data-theme')=='light'
    page.screenshot(path='/mnt/data/ui85b_real_export_light.png',full_page=True)
    # Desktop/mobile horizontal overflow verification and navigation usability.
    for width in [1200,990,768,660,390,320]:
        page.set_viewport_size({'width':width,'height':800})
        page.wait_for_timeout(100)
        measures=page.evaluate('''() => ({scroll:document.documentElement.scrollWidth, width:innerWidth})''')
        assert measures['scroll']<=measures['width']+1,(width,measures)
    page.locator('.nav-button[data-view="import"]').click()
    assert page.locator('#h5pFile').count()==1
    page.screenshot(path='/mnt/data/ui85b_real_mobile_light.png',full_page=True)
    assert not errors,errors
    b.close()
print('UI 8.5b Chromium : navigation, thèmes, paramètres, dispatch 3 formats et 320-1450px OK')
