#!/usr/bin/env python3
"""Rendu Chromium de la CSS exacte produite par le module : 4 cotes et largeur."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1440,'height':900})
    page.set_content('<html><body><div id="runtime-error"></div><div id="h5p-container" style="height:160px;background:#ddd"></div><div id="runtime-status"></div></body></html>')
    page.add_script_tag(content=(ROOT/'src/export-layout.js').read_text())
    css = page.evaluate("() => window.H5PConverterModules.exportLayout.css({maxWidthPx:960,marginTopPx:12,marginBottomPx:48,marginLeftPx:24,marginRightPx:36})")
    page.add_style_tag(content='html,body{margin:0;padding:0}#h5p-container{width:100%}\n'+css)
    def measure():
        return page.evaluate('''() => {let b=document.body,el=document.querySelector('#h5p-container'),r=el.getBoundingClientRect(),s=getComputedStyle(b);return {x:r.x,width:r.width,bottom:r.bottom,scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,top:s.paddingTop,bottomPadding:s.paddingBottom,left:s.paddingLeft,right:s.paddingRight}}''')
    desktop=measure()
    assert desktop['width']==960,desktop
    assert desktop['top']=='12px' and desktop['bottomPadding']=='48px',desktop
    assert desktop['left']=='24px' and desktop['right']=='36px',desktop
    assert abs(desktop['x']-234)<1,desktop
    assert desktop['scrollWidth']<=1440,desktop
    page.set_viewport_size({'width':375,'height':800})
    narrow=measure()
    assert abs(narrow['width']-315)<1,narrow
    assert abs(narrow['x']-24)<1,narrow
    assert narrow['scrollWidth']<=375,narrow
    # Une valeur excessive de marge latérale ne provoque pas de débordement causé par ce paramètre.
    page.add_style_tag(content='body{padding-left:min(2000px,49vw)!important;padding-right:min(2000px,49vw)!important}')
    page.set_viewport_size({'width':320,'height':800})
    extreme=measure()
    assert extreme['scrollWidth']<=320,extreme
    # Le fullscreen conserve sa règle d'absence de largeur maximale.
    assert ':fullscreen{max-width:none!important;width:100%' in css
    browser.close()
print('Chromium : 4 marges différentes, 960px centré, adaptation 375px et extrêmes 320px OK')
