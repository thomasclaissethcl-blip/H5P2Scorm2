from pathlib import Path
import json,sys,time
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]) if len(sys.argv)>1 else root/'INTERACTIVE_BOOK_SST406_MONOFICHIER_ESSAI.html'
reportpath=Path(sys.argv[2]) if len(sys.argv)>2 else root/'interactivebook84-browser.json'
errors=[];failed=[];blocked=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(locale='fr-FR',viewport={'width':1280,'height':800},offline=True)
 page=context.new_page()
 page.on('pageerror',lambda e:errors.append(str(e)[:250]))
 page.on('requestfailed',lambda r:failed.append({'url':r.url[:160],'failure':r.failure}))
 page.set_default_timeout(30000)
 t=time.time()
 try:
  page.set_content(source.read_text(encoding='utf8'),wait_until='domcontentloaded',timeout=110000)
  page.wait_for_function("window.H5PConverterSinglefileAudit && ['ready','error'].includes(window.H5PConverterSinglefileAudit().state)",timeout=60000)
  page.wait_for_timeout(3000)
  audit=page.evaluate('window.H5PConverterSinglefileAudit()')
  book=page.evaluate('''() => ({text:document.querySelector('#h5p-container')?.innerText.slice(0,1000), htmlLength:document.querySelector('#h5p-container')?.innerHTML.length, images:document.querySelectorAll('#h5p-container img').length, buttons:document.querySelectorAll('#h5p-container button').length, statusVisible:!document.querySelector('#singlefile-status').hidden, hrefs:Array.from(document.querySelectorAll('a')).slice(0,8).map(a=>a.getAttribute('href'))})''')
  navigation={'attempted':False}
  begin=page.get_by_text('Commencer',exact=True)
  if begin.count():
   navigation['attempted']=True
   try:
    begin.first.click(timeout=5000)
    page.wait_for_timeout(1000)
    navigation['afterText']=page.locator('#h5p-container').inner_text()[:300]
    navigation['changed']=navigation['afterText'][:70]!=book['text'][:70]
   except Exception as err:
    navigation['error']=str(err)[:240]
  result={'state':audit['state'],'assetRequests':audit['assetRequests'],'assetHits':audit['assetHits'],'missing':audit['missing'][:15],'runtimeError':audit['runtimeError'],'scriptErrors':audit['scriptErrors'],'display':book,'navigation':navigation,'jsErrors':errors[:15],'failedRequests':failed[:15],'elapsed':round(time.time()-t,2),'test': 'Chromium hors réseau et rendu du livre complet, sans LMS'}
 except Exception as exc:
  result={'error':str(exc)[:500], 'errors':errors[:15], 'failures':failed[:15], 'elapsed':round(time.time()-t,2)}
 browser.close()
reportpath.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print(json.dumps(result,indent=2,ensure_ascii=False),flush=True)
