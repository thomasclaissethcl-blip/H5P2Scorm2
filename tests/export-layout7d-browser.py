from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900})
 page.set_content('<html><body><div id="h5p-container" style="height:100px;background:#ddd"></div></body></html>')
 page.add_script_tag(content=(root/'src/export-layout.js').read_text())
 css=page.evaluate("() => H5PConverterModules.exportLayout.css({maxWidthPx:960,marginTopPx:12,marginBottomPx:48,marginLeftPx:24,marginRightPx:36,mobileMarginTopPx:2,mobileMarginBottomPx:6,mobileMarginLeftPx:8,mobileMarginRightPx:10})")
 page.add_style_tag(content='html,body{margin:0;padding:0}#h5p-container{width:100%}\n'+css)
 def get():return page.evaluate('''() => {let b=getComputedStyle(document.body),e=document.querySelector('#h5p-container').getBoundingClientRect();return {top:b.paddingTop,bottom:b.paddingBottom,left:b.paddingLeft,right:b.paddingRight,width:e.width,x:e.x,scroll:document.documentElement.scrollWidth}}''')
 d=get();assert (d['top'],d['bottom'],d['left'],d['right'])==('12px','48px','24px','36px'),d
 assert d['width']==960 and abs(d['x']-234)<1,d
 page.set_viewport_size({'width':768,'height':900});m=get()
 assert (m['top'],m['bottom'],m['left'],m['right'])==('2px','6px','8px','10px'),m
 assert m['width']==750 and abs(m['x']-8)<1 and m['scroll']<=768,m
 page.set_viewport_size({'width':375,'height':900});m=get();assert m['width']==357 and m['scroll']<=375,m
 page.set_viewport_size({'width':769,'height':900});d=get();assert d['top']=='12px' and d['left']=='24px',d
 # Valeurs mobiles laissées vides, les marges desktop s'annulent sur mobile.
 css2=page.evaluate("() => H5PConverterModules.exportLayout.css({marginLeftPx:120,marginRightPx:120,marginTopPx:70,marginBottomPx:60,mobileMarginLeftPx:'',mobileMarginRightPx:'',mobileMarginTopPx:'',mobileMarginBottomPx:''})")
 page.set_content('<html><body style="margin:0"><div id="h5p-container"></div></body></html>')
 page.add_style_tag(content=css2);page.set_viewport_size({'width':375,'height':900})
 z=get();assert (z['top'],z['bottom'],z['left'],z['right'])==('0px','0px','0px','0px'),z
 browser.close()
print('Chromium : 769 ordinateur, 768 mobile, marges custom, mobile 0 par defaut, aucun debordement OK')
