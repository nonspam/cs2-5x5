from pathlib import Path
import json,re,hashlib,subprocess,sys
root=Path(__file__).parent
idx=(root/'index.html').read_text()
app=(root/'app_v57.js').read_text()
css=(root/'style_v57.css').read_text()
maps=json.loads((root/'data/maps.json').read_text())['maps']
players=json.loads((root/'data/players.json').read_text())['players']
matches=json.loads((root/'data/matches.json').read_text())['matches']

def ok(name, cond):
    if not cond: raise SystemExit('FAIL: '+name)
    print('PASS:',name)

active=[m for m in maps if m.get('archived') is not True]
nums=sorted([int(re.search(r'(\d+)$',m['map_id']).group(1)) for m in active], reverse=True)
ok('index loads V57-named assets', 'style_v57.css' in idx and 'app_v57.js' in idx)
ok('Nuke asset exists', (root/'assets/maps/nuke.svg').is_file() and (root/'assets/maps/nuke.svg').stat().st_size>100)
ok('no Mirage hero image remains', 'home-rebuild-hero' in css and "home-rebuild-hero{background-image" in css and "home-rebuild-hero{background-image" in css)
ok('final hero uses Nuke', "url('assets/maps/nuke.svg') !important" in css)
ok('active maps are exactly 66..1', len(active)==66 and nums==list(range(66,0,-1)))
ok('map history uses authoritative activeMapNumber helper', 'function activeMapNumber' in app and 'map_number' in app and 'return i>=0?i+1:null' in app)
ok('history window is 11 latest maps', 'historyMs.slice(0,11)' in app)
ok('history displays blue number + white map name', '.all-map-history-row .map-history-index{color:#70bdf4!important' in css and '.all-map-history-row .map-history-name{color:#fff!important' in css)
ok('history has no MVP field', 'all-map-history-row' in app and 'mapMvp(m.map_id)' not in app[app.find('history=historyMs'):app.find('const selectedPlayer')])
ok('player form uses lowercase avg', 'avg ${fmt(w.avg,2)}' in app)
ok('player form K/D is colorized', 'kdMarkupValue(w.kd' in app and '.kd-positive' in css and '.kd-negative' in css and '.kd-neutral' in css)
ok('recent detailed cards keep blue MVP', 'map-mvp-link' in app and '.map-mvp-link{color:var(--blue)!important}' in css)
ok('score colors exist', '.score-positive' in css and '.score-negative' in css)
ok('bottom roster quick-add remains removed', '.teams-page>.team-quick-add{display:none!important}' in css)
ok('promo mark is compact and clipped safely', '.home-info .promo-mark' in css and 'font-size:18px !important' in css)
ok('no absolute V39 path', 'CS2_ANALYTICS_V39' not in (root/'CUSTOM_V50_QA.js').read_text())
ok('dataset counts', len(players)==14 and len(maps)==66 and len(matches)==32)
# syntax
for f in ['app_v57.js','V57_QA_20260930.js']:
    r=subprocess.run(['node','--check',f],cwd=root,capture_output=True,text=True)
    ok(f+' syntax',r.returncode==0)
print('RELEASE GATE: PASS')
