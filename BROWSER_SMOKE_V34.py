#!/usr/bin/env python3
"""Deterministic offline Chromium smoke test for CS2 Analytics V34."""
from pathlib import Path
import json, re, sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
REPORT=ROOT/'BROWSER_SMOKE_V34_REPORT.json'
def build_document():
    html=(ROOT/'index.html').read_text(encoding='utf-8')
    css=(ROOT/'style_v57.css').read_text(encoding='utf-8')
    html=re.sub(r'<link rel="stylesheet" href="style_v57\.css[^>]*>','<style>'+css+'</style>',html)
    html=re.sub(r'<script defer src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2"></script>','',html)
    for fn in ('supabase-config.js','validation.js','supabase_adapter.js','data_embedded.js','app_v57.js'):
        source=(ROOT/fn).read_text(encoding='utf-8')
        html,n=re.subn(rf'<script defer src="{re.escape(fn)}(?:\?[^\"]*)?"></script>',lambda _: '<script>'+source+'</script>',html,count=1)
        if n!=1: raise RuntimeError('Could not inline '+fn)
    return html
def run_viewport(browser,html,name,width,height):
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    checks=[]
    page.set_content(html,wait_until='domcontentloaded',timeout=15000); page.wait_for_timeout(800)
    def check(label,ok,detail=''): checks.append({'check':label,'passed':bool(ok),'detail':detail})
    check('document title','CS2 Analytics' in page.title(),page.title())
    nav=page.locator('#nav button'); count=nav.count()
    check('primary navigation rendered',count>=6,f'buttons={count}')
    text=page.locator('#view').inner_text().strip()
    check('home view rendered',len(text)>100,f'characters={len(text)}')
    check('bundled dataset visible','66' in text and 'Карт' in text,'66 maps visible')
    metric_checks=[]
    if page.locator('#homeMetric').count():
        trigger=page.locator('#homeMetric').locator('xpath=..').locator('.custom-select-trigger')
        page.evaluate('window.scrollTo({top:0,left:0,behavior:"auto"})')
        trigger.click(); page.wait_for_timeout(80)
        target=page.locator('.custom-select-option[data-value="diff"]')
        box=target.bounding_box(); before=page.evaluate('scrollY')
        if box and box['y'] >= 0 and box['y'] + box['height'] <= 900:
            page.mouse.click(box['x']+8, box['y']+8); page.wait_for_timeout(100)
            after=page.evaluate('scrollY')
            metric_checks.append({'metric':'diff','passed':after==before and page.locator('#homeMetric').input_value()=='diff','before':before,'after':after})
        else:
            metric_checks.append({'metric':'diff','passed':False,'detail':'option not visible in viewport','box':box})
    check('home metric selector updates without page jump',all(x['passed'] for x in metric_checks),metric_checks)
    tab_timings=[]
    for i in range(count):
        btn=nav.nth(i); label=btn.inner_text().strip().replace('\n',' ')
        t0=page.evaluate('performance.now()'); btn.click(); page.wait_for_timeout(10); t1=page.evaluate('performance.now()')
        tab_timings.append({'label':label,'ms':round(t1-t0,1)})
    check('tab render timing stays lightweight',max((x['ms'] for x in tab_timings),default=0)<250,tab_timings)
    nav.first.click(); page.wait_for_timeout(100)
    nav_results=[]
    for i in range(count):
        button=nav.nth(i); label=button.inner_text().strip().replace('\n',' ')
        try:
            button.click(timeout=2500); page.wait_for_timeout(120)
            view=page.locator('#view').inner_text().strip()
            nav_results.append({'label':label,'passed':len(view)>20,'view_chars':len(view)})
        except Exception as exc: nav_results.append({'label':label,'passed':False,'error':str(exc)[:200]})
    check('navigation interactions',all(x['passed'] for x in nav_results),json.dumps(nav_results,ensure_ascii=False))
    try: nav.first.click(timeout=2500); page.wait_for_timeout(150)
    except Exception: pass
    shot=ROOT/f'BROWSER_SMOKE_V34_{name}.png'; page.screenshot(path=str(shot),full_page=True)
    check('no uncaught JavaScript errors',not errors,json.dumps(errors,ensure_ascii=False))
    result={'viewport':name,'size':f'{width}x{height}','checks':checks,'javascript_errors':errors,'screenshot':shot.name}
    page.close(); return result
def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
        html=build_document()
        results=[run_viewport(browser,html,'desktop',1365,900),run_viewport(browser,html,'mobile',390,844)]
        browser.close()
    checks=[c for r in results for c in r['checks']]
    report={'suite':'CS2 Analytics V34 offline Chromium smoke test','method':'Real headless Chromium with local CSS/JS inlined into about:blank because sandbox blocks localhost/file navigation.','scope':'Bundled-data/offline UI and primary navigation; Supabase SDK/network excluded, cloud connectivity not covered.','passed':sum(c['passed'] for c in checks),'failed':sum(not c['passed'] for c in checks),'results':results}
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2)); return 1 if report['failed'] else 0
if __name__=='__main__': sys.exit(main())
