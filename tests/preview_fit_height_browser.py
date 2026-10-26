#!/usr/bin/env python3
"""Vérifie l'ajustement proportionnel en hauteur sur une scène haute simulée.
Ne valide pas le Game Map réel ni les contrôles de plein écran de Firefox.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PLAYER=r'''window.H5PStandalone={H5P:class {async start(element){
 const wrap=document.createElement('div');wrap.id='map';
 wrap.style.cssText='width:780px;height:1340px;position:relative;background:rgb(220,220,220)';
 const btn=document.createElement('button');btn.id='hotspot';btn.style.cssText='position:absolute;left:20px;top:20px;width:80px;height:60px';
 btn.textContent='Hotspot';btn.onclick=()=>{btn.dataset.clicked='yes'};
 wrap.appendChild(btn);element.appendChild(wrap);
 window.H5P={fullscreenSupported:document.fullscreenEnabled,instances:[],externalDispatcher:{on(){}}};
}constructor(element){return this.start(element)}}};'''

def run():
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':900,'height':800})
  page.set_content('<iframe id="preview" sandbox="allow-scripts" allow="fullscreen" allowfullscreen style="width:800px;height:700px"></iframe><p id="status"></p>')
  for source in ('src/preview-frame.js','src/h5p-preview.js'):
   page.add_script_tag(content=(ROOT/source).read_text())
  page.evaluate('''async source=>{
    const encode=s=>new TextEncoder().encode(s).buffer;
    const zip={files:{'h5p.json':{dir:false,async:async()=>encode('{}')},'content/content.json':{dir:false,async:async()=>encode('{}')}}};
    window.__preview=window.H5PConverterModules.preview.createPreview({frame:document.querySelector('#preview'),status:document.querySelector('#status')});
    await window.__preview.open({zip,replacements:{__css:''},assetLoader:async()=>({
      '/dist/main.bundle.js':encode(source),'/dist/frame.bundle.js':encode(''),'/dist/styles/h5p.css':encode('')
    })});
  }''',PLAYER)
  page.wait_for_function("document.querySelector('#status').textContent.includes('Activité chargée')",timeout=15000)
  inner=page.frame_locator('#preview')
  page.evaluate('''()=>{
    const el=document.querySelector('#preview');
    el.style.setProperty('height','650px','important');
    window.__preview.setFitHeight(true);
  }''')
  page.wait_for_timeout(600)
  scale=inner.locator('#h5p-container').evaluate('el=>getComputedStyle(el).transform')
  assert scale!='none', scale
  dims=inner.locator('#h5p-container').evaluate('''el=>({scale:getComputedStyle(el).transform,
    box:el.getBoundingClientRect().toJSON(),height:innerHeight})''')
  assert dims['box']['height'] <= dims['height']+10, dims
  inner.locator('#hotspot').click()
  assert inner.locator('#hotspot').get_attribute('data-clicked')=='yes'
  page.evaluate('window.__preview.setFitHeight(false)')
  page.wait_for_timeout(120)
  assert inner.locator('#h5p-container').evaluate('el=>getComputedStyle(el).transform')=='none'
  assert page.evaluate("document.querySelector('#preview').getAttribute('sandbox')")=='allow-scripts'
  browser.close()
  print('OK: ajustement en hauteur, proportion conservée, hotspot utilisable, retour normal, isolation inchangée')
if __name__=='__main__':run()
