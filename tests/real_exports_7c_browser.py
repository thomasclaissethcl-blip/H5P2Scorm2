#!/usr/bin/env python3
"""H5P reel, JSZip reel, lecteur dist reel: generation SCORM et HTML avec 4 marges.
Pas de lecture H5P dans les archives, pas de LMS ni hebergement HTTP(S).
"""
import argparse, json, zipfile, re
from pathlib import Path
from urllib.parse import unquote
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser(description='Essai navigateur avec vrai H5P, JSZip local et 25 ressources du lecteur extraites du lot 7.')
parser.add_argument('--h5p',required=True,help='Chemin de la véritable archive .h5p')
parser.add_argument('--reference-html',required=True,help='Archive HTML multifichier avec le dossier player/ 3.8.2')
parser.add_argument('--jszip',required=True,help='Chemin du fichier jszip.min.js, utilisé uniquement pendant la conversion')
parser.add_argument('--out',default='out-tests',help='Dossier de sorties pour inspection')
args=parser.parse_args()
GAME=Path(args.h5p)
REFERENCE=Path(args.reference_html)
OUTPUT=Path(args.out);OUTPUT.mkdir(parents=True,exist_ok=True)
JSZIP=Path(args.jszip)
for path in [GAME,REFERENCE,JSZIP]:
    if not path.is_file():parser.error('Fichier introuvable : '+str(path))
SCRIPTS=['src/runtime-profiles.js','src/engine-catalog.js','src/player-assets.js','src/portable-package.js','src/html-multifile.js','src/export-layout.js','src/html-singlefile-resources.js','src/engine-qualification.js','src/scorm-scoring.js','src/scorm-score-plan.js','src/h5p-dependencies.js','src/h5p-analysis.js','src/preview-frame.js','src/h5p-preview.js','src/youtube-preview.js','app.js']
with zipfile.ZipFile(REFERENCE) as reference:
    dist={item.filename:reference.read(item.filename) for item in reference.infolist() if item.filename.startswith('player/') and not item.is_dir()}
print('Player local dist:',len(dist), 'files',flush=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(locale='fr-FR',accept_downloads=True)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def route_player(route):
        url=route.request.url
        if '/dist/' in url:
            file='player/'+unquote(url.split('/dist/',1)[1].split('?',1)[0])
            if file in dist:
                route.fulfill(status=200,body=dist[file],headers={'access-control-allow-origin':'*','cache-control':'public, max-age=3600'})
                return
        route.abort()
    page.route('**/npm/h5p-standalone@*/dist/**',route_player)
    html=(ROOT/'index.html').read_text()
    html=re.sub(r'<script\s+src="[^"]+"\s*></script>','',html)
    html=re.sub(r'<link\s+rel="stylesheet"[^>]*>','',html)
    page.set_content(html)
    page.add_script_tag(content=JSZIP.read_text())
    for path in SCRIPTS:page.add_script_tag(content=(ROOT/path).read_text())
    page.locator('#h5pFile').set_input_files(str(GAME))
    page.wait_for_function('!document.querySelector("#generateHtmlBtn").disabled',timeout=60000)
    for id,val in [('layoutMaxWidth','960'),('layoutMarginTop','12'),('layoutMarginBottom','48'),('layoutMarginLeft','24'),('layoutMarginRight','36')]:
        page.locator('#'+id).fill(val)
    with page.expect_download(timeout=120000) as transfer:
        page.locator('#generateHtmlBtn').click()
    dl=transfer.value
    html_path=OUTPUT/'game-html.zip';dl.save_as(html_path)
    print('HTML real:',html_path.stat().st_size,flush=True)
    with zipfile.ZipFile(html_path) as archive:
        names=set(archive.namelist());idx=archive.read('index.html').decode()
        assert len(names)>1000,len(names)
        for token in ('padding-top:12px','padding-bottom:48px','padding-left:min(24px,49vw)','padding-right:min(36px,49vw)','max-width:960px'):assert token in idx,token
        assert 'imsmanifest.xml' not in names
        assert 'player/main.bundle.js' in names
        layout=json.loads(archive.read('generation-report.json'))['parameters']['layout']
        assert layout=={'maxWidthPx':960,'marginTopPx':12,'marginRightPx':36,'marginBottomPx':48,'marginLeftPx':24},layout
    with page.expect_download(timeout=120000) as transfer:
        page.locator('#generateBtn').click()
    dl=transfer.value
    scorm_path=OUTPUT/'game-scorm.zip';dl.save_as(scorm_path)
    print('SCORM real:',scorm_path.stat().st_size,flush=True)
    with zipfile.ZipFile(scorm_path) as archive:
        names=set(archive.namelist());idx=archive.read('index.html').decode()
        assert 'imsmanifest.xml' in names
        assert 'scorm/scorm12.js' in names
        assert 'scorm/h5p-scorm-bridge.js' in names
        for token in ('padding-top:12px','padding-bottom:48px','padding-left:min(24px,49vw)','padding-right:min(36px,49vw)','max-width:960px'):assert token in idx,token
        layout=json.loads(archive.read('generation-report.json'))['layout']
        assert layout=={'maxWidthPx':960,'marginTopPx':12,'marginRightPx':36,'marginBottomPx':48,'marginLeftPx':24},layout
    # Diagnostic monofichier : aucune fausse generation HTML.
    assert not errors,errors
    browser.close()
print('Chromium : H5P Game Map réel, JSZip réel, 2 ZIP générés et diagnostic téléchargé, aucune erreur applicative')
