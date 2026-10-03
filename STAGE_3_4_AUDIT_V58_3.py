import json,re,hashlib, pathlib
root=pathlib.Path('.')
app=(root/'app_v57.js').read_text(encoding='utf-8')
css=(root/'style_v57.css').read_text(encoding='utf-8')
html=(root/'index.html').read_text(encoding='utf-8')
data={k:json.loads((root/'data'/f'{k}.json').read_text(encoding='utf-8'))[k] for k in ['players','maps','matches','aliases']}
players,maps,matches,aliases=data.values()
checks=[]
def ok(name, cond, detail=''):
    checks.append((name,bool(cond),detail))
# structure/runtime
ok('index -> V57 runtime', 'app_v57.js?' in html and 'style_v57.css?' in html)
ok('single runtime script', html.count('app_v57.js?')==1)
ok('single runtime stylesheet', html.count('style_v57.css?')==1)
ok('157 unique functions', len(re.findall(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(',app))==157)
fn=set(re.findall(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(',app))
inline=[]
for m in re.finditer(r'onclick\s*=\s*["\']([^"\']+)["\']',app):
    x=m.group(1)
    n=re.match(r'\s*([A-Za-z_$][\w$]*)\s*\(',x)
    if n: inline.append(n.group(1))
missing=sorted(x for x in set(inline)-fn-set(['render','event']) if x!='$')
ok('inline handlers resolved', not missing, ', '.join(missing))
ok('nav tabs covered', all(x in app for x in ['home','analytics','base','maps','teams','records','settings']))
# data
ok('13 active players / 14 total', sum(p.get('is_active') is not False for p in players)==13 and len(players)==14)
ok('66 maps', len(maps)==66)
ok('32 matches', len(matches)==32)
ok('10 map types', len(set(m['map'].strip().lower() for m in maps))==10)
ok('unique map ids', len({m['map_id'] for m in maps})==66)
ok('unique match ids', len({m['match_id'] for m in matches})==32)
ok('map ids 001..066', [m['map_id'] for m in maps]==[f'map_{i:03d}' for i in range(1,67)])
match_ids={m['match_id'] for m in matches}; player_ids={p['player_id'] for p in players}
ok('all maps point to existing matches', all(m['match_id'] in match_ids for m in maps))
ok('all stat rows point to known players', all(r.get('player_id') in player_ids for m in maps for r in m.get('player_stats',[])))
ok('all maps have stats', all(isinstance(m.get('player_stats'),list) and len(m['player_stats'])>0 for m in maps))
# current frozen totals
for pid in ['Romanchestr','FLAFF1X']:
    p=next(p for p in players if p['player_id']==pid)
    t={'maps':0,'k':0,'d':0,'a':0}
    for m in maps:
        for r in m.get('player_stats',[]):
            if r['player_id']==pid:
                t['maps']+=1;t['k']+=r['kills'];t['d']+=r['deaths'];t['a']+=r['assists']
    ok(f'{pid} frozen totals', p.get('frozen_source_totals')==t, str(t))
# Player Center aggregate order
agg={p['player_id']:{'k':0,'d':0,'a':0,'maps':0} for p in players if p.get('is_active') is not False}
for m in maps:
    for r in m.get('player_stats',[]):
        if r['player_id'] in agg:
            a=agg[r['player_id']];a['maps']+=1;a['k']+=r['kills'];a['d']+=r['deaths'];a['a']+=r['assists']
order=[]
for p in players:
    if p.get('is_active') is False: continue
    a=agg[p['player_id']]; kd=a['k']/a['d'] if a['d'] else 0
    order.append((kd,a['k']-a['d'],p['display_name']))
order.sort(key=lambda x:(-x[0],-x[1],x[2].lower()))
expected=['gletcher','DaDa_VoVa','FLAFF1X','donater','Romanchestr','vorenxy','подушка пердушка','Patr1k','bigchungus','gamiersanek','эгоист','пяточки','дядя']
actual=[x[2] for x in order]
ok('Player Center K/D order', actual==expected, ' > '.join(actual))
ok('Player Center # column', 'player-rank-head' in app and 'player-rank-cell' in app)
ok('Player Center K/D sort source', 'b.x.kd-a.x.kd||b.x.kdDiff-a.x.kdDiff' in app)
# Maps sorting
ok('maps sort by newest map number', 'activeMapNumber(b.mp.map_id)-activeMapNumber(a.mp.map_id)' in app)
# Home stability
ok('Hero DOM image source is remote Nuke', 'ghostcap-gaming/cs2-map-images/main/cs2/de_nuke.png' in app)
ok('Hero CSS background disabled', 'background-image:none!important' in css)
ok('Hero overlay/counters intact', all(x in css for x in ['.home-hero.home-rebuild-hero .hero-image','.home-hero.home-rebuild-hero::before','.home-hero.home-rebuild-hero .hero-counters']))
ok('Hero stray note hidden', '.home-hero.home-rebuild-hero .hero-note{display:none!important;}' in css)
# perf
ok('scripts deferred', all(re.search(r'<script\s+defer\s+[^>]+>',line) for line in html.splitlines() if '<script' in line))
ok('cloud/admin startup parallelized', 'const [remote, admin] = await Promise.all' in app)
ok('Hero preloaded', 'rel="preload" as="image"' in html and 'fetchpriority="high"' in html)
ok('Hero fetchpriority high', 'fetchpriority="high"' in app)
ok('preconnect CDN', 'preconnect" href="https://cdn.jsdelivr.net"' in html)
# legacy/runtime safety
ok('no app.js runtime load', 'src="app.js' not in html)
ok('no style.css runtime load', 'href="style.css' not in html)
ok('no hardcoded 61 map counter', '<b>61</b><span>Карт</span>' not in app)
failed=[x for x in checks if not x[1]]
print(f'CHECKS: {len(checks)}  PASS: {len(checks)-len(failed)}  FAIL: {len(failed)}')
for n,p,d in checks: print(('PASS' if p else 'FAIL')+': '+n+(f' — {d}' if d else ''))
raise SystemExit(1 if failed else 0)
