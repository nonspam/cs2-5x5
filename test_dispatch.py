import sys
sys.path.insert(0,'.')
from BROWSER_SMOKE_V34 import build_document
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 page=b.new_page(viewport={'width':390,'height':844})
 page.set_content(build_document(),wait_until='domcontentloaded');page.wait_for_timeout(500)
 page.evaluate('document.documentElement.style.scrollBehavior="auto";window.scrollTo({top:400,behavior:"auto"})');page.wait_for_timeout(50);print('before',page.evaluate('scrollY'))
 page.evaluate("const s=document.querySelector('#homeMetric');s.value='diff';s.dispatchEvent(new Event('change',{bubbles:true}))")
 page.wait_for_timeout(50);print('after50',page.evaluate('scrollY'))
 page.wait_for_timeout(300);print('after350',page.evaluate('scrollY'))
 b.close()
