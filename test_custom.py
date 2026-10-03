import sys
sys.path.insert(0,'.')
from BROWSER_SMOKE_V34 import build_document
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':390,'height':844})
 page.set_content(build_document(),wait_until='domcontentloaded'); page.wait_for_timeout(500)
 # find home metric wrapper
 tr=page.locator('#homeMetric').locator('xpath=..').locator('.custom-select-trigger')
 print('trigger',tr.count(),'scroll0',page.evaluate('scrollY'))
 page.evaluate('window.scrollTo(0,700)'); print('scroll1',page.evaluate('scrollY'))
 tr.click(); page.wait_for_timeout(100); print('after open',page.evaluate('scrollY'))
 opt=page.locator('.custom-select-option[data-value="diff"]')
 print('opt count',opt.count(), 'opt box', opt.bounding_box())
 opt.click(); page.wait_for_timeout(100); print('after option',page.evaluate('scrollY'),'value',page.locator('#homeMetric').input_value())
 b.close()
