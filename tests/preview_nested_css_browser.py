#!/usr/bin/env python3
"""Teste propagation CSS vers un document iframe lorsque même origine accessible,
et vérifie l'absence de changement d'origine de l'aperçu hôte.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
MOCK = r'''window.H5PStandalone={H5P:class {
constructor(container,options){return this.start(container,options)}
async start(container,options){
  window.__starts=(window.__starts||0)+1;
  const b=document.createElement('button');b.className='h5p-button';b.id='parent-button';b.textContent='parent';
  container.appendChild(b);
  const f=document.createElement('iframe');f.id='nested';
  const bundle=await (await fetch(options.frameJs)).text();
  f.srcdoc='<html><head><style>.h5p-button {color: rgb(0, 0, 0)}</style></head><body><button class="h5p-button">enfant</button><script>'+bundle.replaceAll('</script','<\\/script')+'<\/script></body></html>';
  container.appendChild(f);
  window.H5P={externalDispatcher:{on(){}},instances:[{resize(){window.__resizes=(window.__resizes||0)+1;}}]};
}
}};'''

def main():
  with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page()
    page.set_content('<iframe id="preview" sandbox="allow-scripts"></iframe><p id="status"></p>')
    for source in ('src/preview-frame.js','src/h5p-preview.js'):
      page.add_script_tag(content=(ROOT/source).read_text())
    page.evaluate('''async player=>{
      const enc=s=>new TextEncoder().encode(s).buffer;
      const zip={files:{'h5p.json':{dir:false,async:async()=>enc('{}')},'content/content.json':{dir:false,async:async()=>enc('{}')}}};
      const pv=window.H5PConverterModules.preview.createPreview({frame:document.querySelector('iframe'),status:document.querySelector('p')});
      window.__pv=pv;
      await pv.open({zip,replacements:{__css:'.h5p-button{color:rgb(1, 80, 140)}'},assetLoader:async()=>({
        '/dist/main.bundle.js':enc(player),'/dist/frame.bundle.js':enc(''),'/dist/styles/h5p.css':enc('')
      })});
    }''',MOCK)
    page.wait_for_function("document.querySelector('#status').textContent.includes('Activité chargée')",timeout=15000)
    outer=page.frame_locator('#preview')
    assert outer.locator('#parent-button').evaluate('(el)=>getComputedStyle(el).color')=='rgb(1, 80, 140)'
    nested=outer.frame_locator('#nested')
    try:
      nested_color=nested.locator('.h5p-button').evaluate('(el)=>getComputedStyle(el).color')
    except Exception as ex:
      nested_color='inaccessible:'+str(ex)[:90]
    print('nested initial:',nested_color)
    page.evaluate("window.__pv.updateCss('.h5p-button{color:rgb(99, 23, 60)}');window.__pv.notifyResize()")
    page.wait_for_timeout(350)
    nested_updated=nested.locator('.h5p-button').evaluate('(el)=>getComputedStyle(el).color')
    print('nested updated:',nested_updated)
    assert nested_updated=='rgb(99, 23, 60)', nested_updated
    print('parent updated:',outer.locator('#parent-button').evaluate('(el)=>getComputedStyle(el).color'))
    resize_count=outer.locator('body').evaluate('()=>window.__resizes||0')
    print('resize:',resize_count)
    assert resize_count >= 1
    assert outer.locator('#parent-button').evaluate('(el)=>getComputedStyle(el).color')=='rgb(99, 23, 60)'
    assert outer.locator('body').evaluate('()=>window.__starts')==1
    nested_is_accessible=outer.locator('#nested').evaluate('(el)=>{try{return !!el.contentDocument}catch{return false}}')
    print('nested doc accessibility:',nested_is_accessible)
    assert nested_is_accessible is False
    browser.close()
if __name__=='__main__':main()
