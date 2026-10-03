import sys
sys.path.insert(0,'.')
from BROWSER_SMOKE_V34 import build_document
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':1365,'height':900})
 page.set_content(build_document(),wait_until='domcontentloaded')
 page.wait_for_timeout(800)
 for i in range(page.locator('#nav button').count()):
  label=page.locator('#nav button').nth(i).inner_text().strip()
  t=page.evaluate('performance.now()')
  page.locator('#nav button').nth(i).click()
  page.wait_for_timeout(10)
  t2=page.evaluate('performance.now()')
  print(label,round(t2-t,2))
 b.close()
