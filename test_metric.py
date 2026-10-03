import sys
sys.path.insert(0,'/tmp/v34fix/v31_mobile')
from BROWSER_SMOKE_V34 import build_document
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':1365,'height':900})
 page.set_content(build_document(),wait_until='domcontentloaded',timeout=15000)
 page.wait_for_timeout(1200)
 print('metric count',page.locator('#homeMetric').count(),'scroll',page.evaluate('scrollY'))
 page.evaluate('window.scrollTo(0,0)')
 for m in ['kd','diff','kills','deaths','assists','avg','impact','index','form','stability']:
  before=page.evaluate('scrollY')
  page.locator('#homeMetric').select_option(m)
  page.wait_for_timeout(50)
  after=page.evaluate('scrollY')
  print(m,'value=',page.locator('#homeMetric').input_value(),'scroll',before,'->',after,'chart',len(page.locator('#homeChart').inner_text()))
 b.close()
