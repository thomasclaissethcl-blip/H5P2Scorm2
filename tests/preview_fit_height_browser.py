#!/usr/bin/env python3
"""Teste l'absence de réduction globale et l'API de mise en page Game Map dans
une iframe enfant à origine opaque. N'émule pas le rendu réel de H5P.GameMap.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
MOCK_PLAYER = r'''window.H5PStandalone={H5P:class {
constructor(element, options){return this.start(element,options)}
async start(element,options){
 const wrap=document.createElement('div');wrap.id='map-root';
 wrap.style.cssText='width:100%;height:1200px;background:rgb(235,235,235)';
 const inline=document.createElement('button');inline.id='outer-hotspot';
 inline.textContent='Point';inline.style.cssText='width:85px;height:40px';
 wrap.appendChild(inline);element.appendChild(wrap);
 const childCode=await (await fetch(options.frameJs)).text();
 const nested=document.createElement('iframe');nested.id='game-frame';
 nested.style.cssText='display:block;width:100%;height:90%';
 const gameScript=`window.H5P={instances:[{main:{setFullscreen(enabled){
   window.__gameLayout=enabled;const map=document.getElementById('game-map');
   map.style.height=enabled?'70vh':'1000px';
 },resize(){window.__gameResizes=(window.__gameResizes||0)+1;}}}]};`;
 nested.srcdoc='<html><body><div id="game-map" style="height:1000px"><button id="hotspot" style="width:90px;height:44px">Stage</button></div>'+
   '<script>'+gameScript+'</script><script>'+childCode.replaceAll('</script','<\/script')+'</script></body></html>';
 element.appendChild(nested);
 window.H5P={fullscreenSupported:false,instances:[],externalDispatcher:{on(){}}};
}
}};'''

def main():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':960,'height':900})
  page.set_content('<iframe id="preview" sandbox="allow-scripts" allow="fullscreen" style="width:920px;height:820px"></iframe><p id="status"></p>')
  for script in ('src/preview-frame.js','src/h5p-preview.js'):
   page.add_script_tag(content=(ROOT/script).read_text())
  page.evaluate('''async player=>{
   const encode=t=>new TextEncoder().encode(t).buffer;
   const zip={files:{'h5p.json':{dir:false,async:async()=>encode(JSON.stringify({mainLibrary:'H5P.GameMap'}))},
     'content/content.json':{dir:false,async:async()=>encode('{}')}}};
   window.__events=[];window.__pv=window.H5PConverterModules.preview.createPreview({frame:document.querySelector('#preview'),status:document.querySelector('#status'),onEvent:e=>window.__events.push({type:e.type,message:e.message})});
   await window.__pv.open({zip,replacements:{__css:''},assetLoader:async()=>({
     '/dist/main.bundle.js':encode(player),'/dist/frame.bundle.js':encode(''),'/dist/styles/h5p.css':encode('')})});
  }''',MOCK_PLAYER)
  page.wait_for_function("document.querySelector('#status').textContent.includes('Activité chargée')",timeout=15000)
  parent=page.frame_locator('#preview')
  child=parent.frame_locator('#game-frame')
  page.wait_for_timeout(350)
  page.evaluate('''()=>{document.querySelector('#preview').style.height='750px';window.__pv.setFitHeight(true); }''')
  page.wait_for_function("document.querySelector('#preview').contentWindow !== null")
  page.wait_for_timeout(500)
  assert parent.locator('#h5p-container').evaluate('node=>getComputedStyle(node).transform')=='none', 'Scale appliqué au contenu'
  assert child.locator('#hotspot').evaluate('node=>node.getBoundingClientRect().height')==44, 'Hotspot redimensionné'
  assert child.locator('body').evaluate('()=>window.__gameLayout') is True, 'Mode Game Map non reçu par le sous-document'
  assert child.locator('#game-map').evaluate('node=>node.style.height')=='70vh'
  child.locator('#hotspot').click()
  page.evaluate('window.__pv.setFitHeight(false)')
  page.wait_for_timeout(350)
  assert child.locator('body').evaluate('()=>window.__gameLayout') is False
  assert child.locator('#game-map').evaluate('node=>node.style.height')=='1000px'
  assert parent.locator('#h5p-container').evaluate('node=>getComputedStyle(node).transform')=='none'
  assert page.evaluate("document.querySelector('#preview').getAttribute('sandbox')")=='allow-scripts'
  browser.close()
  print('OK : Game Map sollicite sa mise en page native, tailles interactives préservées, retour normal, sandbox inchangé')
if __name__=='__main__': main()
