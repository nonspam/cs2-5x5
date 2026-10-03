import sys
sys.path.insert(0,'.')
from BROWSER_SMOKE_V34 import build_document
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':390,'height':844})
 page.on('console',lambda m: print('C',m.text))
 page.set_content(build_document(),wait_until='domcontentloaded'); page.wait_for_timeout(500)
 page.evaluate("""(()=>{const old=window.scrollTo;window.scrollTo=function(...a){console.log('SCROLLTO',JSON.stringify(a),'before',scrollY);return old.apply(this,a)};window.addEventListener('scroll',()=>console.log('SCROLLEVENT',scrollY),true)})()""")
 page.evaluate('window.scrollTo(0,300)'); page.wait_for_timeout(100)
 print('pre',page.evaluate('scrollY'))
 tr=page.locator('#homeMetric').locator('xpath=..').locator('.custom-select-trigger'); tr.click(); page.wait_for_timeout(100); print('open',page.evaluate('scrollY'))
 page.locator('.custom-select-option[data-value="diff"]').click(); page.wait_for_timeout(300); print('final',page.evaluate('scrollY'))
 b.close()
