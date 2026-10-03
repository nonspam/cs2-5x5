from pathlib import Path
import re,json,subprocess
root=Path(__file__).parent
app=(root/'app_v57.js').read_text()
css=(root/'style_v57.css').read_text()
html=(root/'index.html').read_text()
# JS function declarations
funcs=set(re.findall(r'function\s+([A-Za-z_$][\w$]*)\s*\(',app))
# common inline onclick calls in JS-generated HTML
calls=set(re.findall(r'onclick="([A-Za-z_$][\w$]*)\s*\(',app))
missing=sorted(calls-funcs-{'closeModal','$'})
print('inline handlers:',len(calls),'declared:',len(funcs),'missing:',missing)
assert not missing
# map assets
maps=json.loads((root/'data/maps.json').read_text())['maps']
map_names=sorted({m['map'] for m in maps if m.get('map')})
missing_assets=[n for n in map_names if not (root/'assets/maps'/f'{n.lower()}.svg').exists()]
print('map names:',map_names)
print('missing map assets:',missing_assets)
assert not missing_assets
# all navigation tabs have handlers in render/nav source
for tab in ['home','analytics','base','maps','teams','records','settings']:
    assert f"['{tab}'" in app or f"state.tab='{tab}'" in app
print('navigation source coverage: PASS')
# data integrity counts
players=json.loads((root/'data/players.json').read_text())['players']
matches=json.loads((root/'data/matches.json').read_text())['matches']
active=[m for m in maps if m.get('archived') is not True]
assert len(players)==14 and len(maps)==66 and len(matches)==32 and len(active)==66
print('dataset: 14 players / 66 maps / 32 matches / 66 active maps: PASS')
# release asset wiring
assert 'style_v57.css' in html and 'app_v57.js' in html
assert "url('assets/maps/nuke.svg') !important" in css
assert (root/'assets/maps/mirage.svg').is_file()
print('release asset wiring + map assets: PASS')
print('FULL FUNCTION AUDIT: PASS')
