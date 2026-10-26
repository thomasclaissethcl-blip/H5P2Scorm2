"""Vérifie le lecteur YouTube de secours dans Chromium, sans contacter YouTube."""
from pathlib import Path
from playwright.sync_api import sync_playwright
PROJECT=Path(__file__).resolve().parents[1]
HTML='''<!doctype html><html><body>
<input type="checkbox" id="consent">
<div id="wrap" hidden><ul id="links"></ul></div>
<div id="surface" hidden><p id="title"></p><button id="close">Fermer</button>
<iframe id="player" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"></iframe></div>
</body></html>'''
with sync_playwright() as playwright:
    browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page()
    called=[]
    page.route('**/*',lambda route: (called.append(route.request.url),route.abort()))
    page.goto('about:blank')
    page.set_content(HTML)
    page.add_script_tag(content=(PROJECT/'src/youtube-preview.js').read_text())
    page.evaluate('''() => {
      const el=id=>document.getElementById(id);
      window.controller=H5PConverterModules.youtubePreview.createController({wrap:el('wrap'),links:el('links'),surface:el('surface'),iframe:el('player'),title:el('title'),closeButton:el('close'),consent:el('consent')});
      controller.render({videos:[{mime:'video/YouTube',path:'https://www.youtube.com/watch?v=_Ng4pyFqZyI'},{mime:'video/YouTube',path:'https://youtu.be/Mfwuqo47bwg'}]});
    }''')
    assert page.locator('#wrap').is_visible()
    assert page.locator('#links button').count()==2
    assert page.locator('#links button').first.is_disabled()
    assert not page.locator('#player').get_attribute('src')
    assert not called,'Une URL distante a été demandée sans consentement'
    page.locator('#consent').check()
    page.evaluate('''() => controller.render({videos:[{mime:'video/YouTube',path:'https://www.youtube.com/watch?v=_Ng4pyFqZyI'}]})''')
    page.locator('#links button').click()
    assert page.locator('#player').get_attribute('src').startswith('https://www.youtube-nocookie.com/embed/_Ng4pyFqZyI')
    assert page.locator('#surface').is_visible()
    page.locator('#consent').uncheck()
    assert not page.locator('#player').get_attribute('src')
    assert page.locator('#surface').is_hidden()
    browser.close()
print('Chromium : consentement, ouverture, blocage initial et fermeture : OK (lecteur simulé, aucune lecture YouTube réelle).')
