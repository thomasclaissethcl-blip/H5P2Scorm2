from pathlib import Path
from playwright.sync_api import sync_playwright
p=Path('/mnt/data/h5p_lot82_work/prototype_qa.html')
assert p.is_file()
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page();page.set_content(p.read_text(encoding='utf-8'));page.wait_for_function('document.documentElement.dataset.resourceCheck !== undefined')
 assert page.locator('html').get_attribute('data-resource-check')=='ok',page.locator('#result').inner_text()
 assert '8' in page.locator('#result').inner_text()
 values=page.evaluate("() => [H5PResourcePrototype.get('h5p/content/content.json').size, H5PResourcePrototype.get('../insecure'), H5PResourcePrototype.dataUrl('h5p/content/image.png').startsWith('data:image/png;base64,')]")
 assert values[0]>0 and values[1] is None and values[2] is True,values
 assert page.evaluate("() => H5PResourcePrototype.resolve('../fonts/demo.woff2','player/styles/h5p.css')")=='player/fonts/demo.woff2'
 assert 'data:font/woff2;base64,' in page.evaluate("() => H5PResourcePrototype.cssText('player/styles/h5p.css')")
 assert page.locator('img').count()==1
 assert not page.locator('script[src]').count()
 b.close()
print('Chromium set_content : HTML unique autonome, JSON, medias integres, controle binaire, aucune execution H5P OK ; file:// bloque par administrateur')
