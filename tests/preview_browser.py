#!/usr/bin/env python3
"""Scénarios Chromium de la visionneuse avec substitut contrôlé du lecteur.
Ne prétend pas valider h5p-standalone réel ou tous les types H5P.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
PLAYER_MOCK = r'''window.H5PStandalone = { H5P: class {
  constructor(element, options) {return this.start(element, options)}
  async start(element, options) {
    const r = await fetch(options.h5pJsonPath+'/h5p.json');
    const data = await r.json();
    const css = document.createElement('link');css.rel='stylesheet';
    css.href=options.customCss[0]; document.head.appendChild(css);
    // Une activité H5P qui lit localStorage doit trouver un stockage privé temporaire.
    window.__storageOk=false;
    window.localStorage.setItem('test','valeur');
    window.__storageOk=window.localStorage.getItem('test')==='valeur';
    window.__initCount=(window.__initCount || 0)+1;
    const background=document.createElement('div');background.id='background';
    background.style.backgroundImage='url(https://preview.invalid/h5p/content/picture.png)';
    element.appendChild(background);
    const markup=document.createElement('div');markup.id='markup';
    markup.innerHTML='<img class="inserted-image" src="https://preview.invalid/h5p/content/picture.png">';
    element.appendChild(markup);
    const image=document.createElement('img');image.alt='image h5p';
    image.src='https://preview.invalid/h5p/content/picture.png';
    element.appendChild(image);
    const button=document.createElement('button');button.id='exercise';
    button.className='h5p-button';button.textContent=data.title;
    button.onclick=()=>{button.textContent='Réponse validée';};
    element.appendChild(button);
    window.H5P={externalDispatcher:{on(type, callback){
      button.addEventListener('click',()=>callback({data:{statement:{verb:{id:'http://adlnet.gov/expapi/verbs/answered'}}}}));
    }}};
    const xhr = new XMLHttpRequest();
    xhr.open('GET', options.contentJsonPath+'/content.json');
    xhr.onload = ()=>{window.__xhrOk = xhr.status===200 && xhr.responseText==='{}';};
    xhr.send();
    window.__blocked = false;
    try {await fetch('https://example.org/collect?private=1')}catch(err){window.__blocked=true}
  }
}};'''


def main():
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
        page=browser.new_page()
        errors=[]
        page.on('pageerror',lambda err: errors.append(str(err)))
        page.set_content('''<iframe id="preview" sandbox="allow-scripts"></iframe>
          <p id="status"></p>''')
        for source in ('src/preview-frame.js','src/h5p-preview.js'):
            page.add_script_tag(content=(ROOT/source).read_text())
        # Construit de véritables ArrayBuffer pour que l'iframe sandbox les reçoive par transfert.
        page.evaluate('''async (playerSource) => {
          const encode=s=>new TextEncoder().encode(s).buffer;
          const memory={
            'h5p.json':JSON.stringify({title:'Activité fictive'}),
            'content/content.json':'{}',
            'content/picture.png':'image-binaire-simulee',
            'Mock-1.0/library.json':'{}'
          };
          const zip={ files:Object.fromEntries(Object.entries(memory).map(([key,data])=>[key,{
            dir:false,async:async type=>encode(data)
          }]))};
          const mgr=window.H5PConverterModules.preview.createPreview({
            frame:document.querySelector('#preview'),status:document.querySelector('#status')
          });
          window.__mgr=mgr;
          window.__payload={zip,replacements:{__css:'.h5p-button {color: rgb(5, 90, 110)}'},
            assetLoader: async()=>({
              '/dist/main.bundle.js':encode(playerSource),
              '/dist/frame.bundle.js':encode(''),
              '/dist/styles/h5p.css':encode('')
            })};
          await mgr.open(window.__payload);
        }''',PLAYER_MOCK)
        page.wait_for_function("document.querySelector('#status').textContent.includes('Activité chargée')",timeout=15000)
        frame=page.frame_locator('#preview')
        assert frame.locator('#exercise').inner_text() == 'Activité fictive'
        assert frame.locator('body').evaluate('()=>window.__storageOk') is True
        assert frame.locator('#background').evaluate('(el)=>el.style.backgroundImage.includes("blob:")')
        assert frame.locator('.inserted-image').evaluate('(el)=>el.getAttribute("src").startsWith("blob:")')
        assert frame.locator('body').evaluate('()=>window.__initCount')==1
        assert frame.locator('#exercise').evaluate('(el)=>getComputedStyle(el).color')=='rgb(5, 90, 110)'
        frame.locator('#exercise').click()
        assert frame.locator('#exercise').inner_text() == 'Réponse validée'
        page.evaluate("window.__mgr.updateCss('.h5p-button{color:rgb(128, 20, 60)}')")
        assert frame.locator('#exercise').evaluate('(el)=>getComputedStyle(el).color')=='rgb(128, 20, 60)'
        assert frame.locator('body').evaluate('()=>window.__initCount')==1
        assert frame.locator('img[alt="image h5p"]').evaluate('(el)=>el.src.startsWith("blob:")')
        assert frame.locator('body').evaluate('()=>window.__blocked') is True
        assert frame.locator('body').evaluate('()=>window.__xhrOk') is True
        assert page.evaluate("() => {try{return document.querySelector('#preview').contentWindow.document===null}catch(e){return e.name==='SecurityError'}}")
        assert page.evaluate("document.querySelector('#preview').getAttribute('sandbox')")=='allow-scripts'
        page.evaluate('window.__mgr.reset()')
        assert 'Aucun aperçu en cours' in page.locator('#status').inner_text()
        page.evaluate('window.__mgr.open(window.__payload)')
        # ArrayBuffers précédents ont été transférés : l'archive initiale est régénérée par gather.
        page.wait_for_function("document.querySelector('#status').textContent.includes('Activité chargée')",timeout=15000)
        page.evaluate('window.__mgr.dispose()')
        assert not errors, errors
        browser.close()
    print(json.dumps({'browser':'Chromium','status':'success',
      'checks':['chargement iframe','ressources virtuelles JSON/image','CSS virtuel','interaction bouton',
                'XHR virtuel','stockage éphémère isolé','image de fond blob','image HTML insérée',
                'CSS sans redémarrage','CSP réseau bloqué','origine iframe opaque','réinitialisation','réouverture',
                'aucune erreur JavaScript'],
      'limitation':'Lecteur simulé, H5P Standalone réel et contenus tiers encore non testés'},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
