#!/usr/bin/env python3
"""Optional browser wiring test (Chromium/Playwright installed locally).

This test stubs JSZip deliberately: it verifies browser execution of JS modules
and the UI-to-analysis wiring, not HTTP script loading, real ZIP parsing or LMS.
"""
import json
import zipfile
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def fixture(name):
    entries = {}
    with zipfile.ZipFile(ROOT / 'test-fixtures' / name) as z:
        for item in z.infolist():
            data = z.read(item.filename) if not item.is_dir() else b''
            entries[item.filename] = {'text': data.decode('utf-8') if item.filename.endswith('.json') else None,
                                      'size': item.file_size, 'dir': item.is_dir()}
    return entries

INIT = '''(() => {
  window.JSZip = class {
    static async loadAsync(_buffer) {
      const entries = Object.fromEntries(Object.entries(window.__fixture).map(([path, file]) => [path, {
        dir: file.dir,
        _data: { uncompressedSize: file.size },
        async: async () => file.text
      }]));
      return { files: entries, file: path => entries[path] || null };
    }
  };
})();'''


def main():
    # Chargement du DOM et des scripts par injection : cet environnement bloque
    # la navigation Chromium, même sur localhost. L'ordre des URL est testé ailleurs.
    with sync_playwright() as pw:
        browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
        page = browser.new_page(locale='fr-FR')
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        html = (ROOT / 'index.html').read_text(encoding='utf-8')
        html = re.sub(r'<script\s+src="[^"]+"\s*></script>', '', html)
        html = re.sub(r'<link\s+rel="stylesheet"[^>]*>', '', html)
        page.set_content(html)
        page.add_script_tag(content=INIT)
        for path in ['src/runtime-profiles.js','src/player-assets.js','src/portable-package.js','src/engine-catalog.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js']:
            page.add_script_tag(content=(ROOT / path).read_text(encoding='utf-8'))
        data = []
        for name, expected_ok in [('poc-valid.h5p', True), ('poc-coreapi-future.h5p', False), ('poc-missing-dependency.h5p', False)]:
            page.evaluate('(data) => {window.__fixture = data;}', fixture(name))
            page.evaluate('document.querySelector("#diagnostic").className = "diagnostic"')
            page.locator('#h5pFile').set_input_files(str(ROOT / 'test-fixtures' / name))
            page.wait_for_function('document.querySelector("#diagnostic").classList.contains("status-ok") || document.querySelector("#diagnostic").classList.contains("status-warn") || document.querySelector("#diagnostic").classList.contains("status-error")')
            diagnostic = page.locator('#diagnostic').inner_text()
            enabled = page.locator('#generateBtn').is_enabled()
            assert enabled == expected_ok, f'Export état incorrect pour {name}: {enabled}'
            if name == 'poc-coreapi-future.h5p': assert 'Core API' in diagnostic
            if name == 'poc-missing-dependency.h5p': assert 'dépendance' in diagnostic.lower()
            data.append({'fixture': name, 'export_button_enabled': enabled, 'expected': expected_ok})
        assert not errors, 'Erreurs JS navigateur : ' + ' | '.join(errors)
        browser.close()
    print('Intégration interface navigateur simulée : 3 scénarios OK')
    print(json.dumps({'scenarios':data, 'browser_errors':errors, 'limitation':'JSZip remplacé par un simulateur en mémoire, aucun vrai export ni lecteur'},indent=2, ensure_ascii=False))

if __name__ == '__main__': main()
