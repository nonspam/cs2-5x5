from pathlib import Path
import json,re,hashlib,subprocess,sys
root=Path(__file__).parent
app=(root/'app_v57.js').read_text(encoding='utf-8')
css=(root/'style_v57.css').read_text(encoding='utf-8')
html=(root/'index.html').read_text(encoding='utf-8')
P=json.loads((root/'data/players.json').read_text())['players']
M=json.loads((root/'data/maps.json').read_text())['maps']
S=json.loads((root/'data/matches.json').read_text())['matches']
A=json.loads((root/'data/aliases.json').read_text())['aliases']
checks=[]
def ok(name,cond,detail=''): checks.append((name,bool(cond),detail))
# Runtime wiring
ok('runtime JS is app_v57.js', html.count('app_v57.js?')==1 and 'src="app_v57.js?' in html)
ok('runtime CSS is style_v57.css', html.count('style_v57.css?')==1 and 'href="style_v57.css?' in html)
ok('no stale app.js runtime', 'src="app.js' not in html)
ok('no stale style.css runtime', 'href="style.css' not in html)
# Syntax
for f in ['app_v57.js','supabase_adapter.js','validation.js','data_embedded.js']:
    r=subprocess.run(['node','--check',f],cwd=root,capture_output=True,text=True)
    ok(f'node syntax: {f}',r.returncode==0,r.stderr.strip())
# Function/handler surface
names=re.findall(r'\bfunction\s+([A-Za-z_$][\w$]*)\s*\(',app)
ok('181 function declarations',len(names)==181,str(len(names)))
inline=[]
for m in re.finditer(r'onclick\s*=\s*["\']([^"\']+)["\']',app):
    q=re.match(r'\s*([A-Za-z_$][\w$]*)\s*\(',m.group(1))
    if q:inline.append(q.group(1))
fn=set(names); missing=sorted(set(inline)-fn-{'closeModal','$'})
ok('all inline handlers resolve',not missing,', '.join(missing))
# Data
activeP=[p for p in P if p.get('is_active') is not False]
activeM=[m for m in M if m.get('archived') is not True]
activeS=[m for m in S if m.get('archived') is not True]
ok('players 14 total / 13 active',len(P)==14 and len(activeP)==13,f'{len(P)}/{len(activeP)}')
ok('maps 66 active',len(M)==66 and len(activeM)==66,str(len(M)))
ok('matches 32 active',len(S)==32 and len(activeS)==32,str(len(S)))
ok('10 map types',len({m.get('map','').strip().lower() for m in M})==10)
ok('unique ids',len({p['player_id'] for p in P})==14 and len({m['map_id'] for m in M})==66 and len({m['match_id'] for m in S})==32)
match_ids={m['match_id'] for m in S}; player_ids={p['player_id'] for p in P}
ok('all map->match links valid',all(m.get('match_id') in match_ids for m in M))
ok('all stat player ids valid',all(r.get('player_id') in player_ids for m in M for r in m.get('player_stats',[])))
ok('all active maps have stats',all(isinstance(m.get('player_stats'),list) and len(m['player_stats'])>0 for m in activeM))
ok('aliases all point to known players',all(pid in player_ids for pid in A.values()))
# Frozen totals
for pid,exp in [('Romanchestr',{'maps':25,'k':452,'d':421,'a':141}),('FLAFF1X',{'maps':7,'k':104,'d':93,'a':26})]:
    t={'maps':0,'k':0,'d':0,'a':0}
    for m in M:
        for r in m.get('player_stats',[]):
            if r.get('player_id')==pid:
                t['maps']+=1;t['k']+=r['kills'];t['d']+=r['deaths'];t['a']+=r['assists']
    ok(f'{pid} frozen totals',t==exp,str(t))
# Player center K/D
agg={p['player_id']:{'k':0,'d':0} for p in activeP}
for m in M:
    for r in m.get('player_stats',[]):
        if r.get('player_id') in agg: agg[r['player_id']]['k']+=r['kills'];agg[r['player_id']]['d']+=r['deaths']
order=[]
for p in activeP:
    a=agg[p['player_id']];kd=a['k']/a['d'] if a['d'] else 0;order.append((kd,a['k']-a['d'],p['display_name']))
order.sort(key=lambda x:(-x[0],-x[1],x[2].lower()))
expected=['gletcher','DaDa_VoVa','FLAFF1X','donater','Romanchestr','vorenxy','подушка пердушка','Patr1k','bigchungus','gamiersanek','эгоист','пяточки','дядя']
ok('Player Center K/D order', [x[2] for x in order]==expected,' > '.join(x[2] for x in order))
ok('Player Center rank column', 'player-rank-head' in app and 'player-rank-cell' in app)
# Home / design / perf
ok('Train Hero wired', 'de_train.png' in html and 'de_train.png' in app)
ok('Hero photo layer present', '.home-hero.home-rebuild-hero .hero-image' in css)
ok('Hero note hidden', '.home-hero.home-rebuild-hero .hero-note{display:none!important;}' in css)
ok('scripts deferred',all('defer' in line for line in html.splitlines() if '<script' in line))
ok('cloud/admin startup parallelized','const [remote, admin] = await Promise.all' in app)
ok('legacy storage migration present','migrateLegacyStorage' in app and 'cs5_base_override' in app)
# Experimental features that must survive release
feature_checks=[
 ('admin player archive','archivePlayer' in app),('permanent player delete guard','purgeArchivedPlayer' in app),
 ('new match wizard','renderNewStatsStep' in app),('BO1/BO3/BO5 wizard','function requiredMapCount' in app and "format==='BO3'" in app and "format==='BO5'" in app and "format==='BO1'" in app),
 ('5v5 team guard','teamA.length!==5||teamB.length!==5' in app),('slot action labels','Добавить игрока' in app),
 ('all-player deselect','function clearPlayers' in app),('repeat map toggle',"state.map=state.map==='${esc(r.map)}'?'all':'${esc(r.map)}'" in app),
 ('player profile','function openPlayerDetail' in app),('backup export','function exportBackup' in app),
 ('backup import validation','function importBackup' in app)]
for name,passed in feature_checks: ok(name,passed)
# Assets
mapnames={m['map'].strip().lower() for m in M}
ok('all local map SVG assets exist',all((root/'assets/maps'/f'{n}.svg').is_file() for n in mapnames))
ok('all local map logo PNG assets exist',all((root/'assets/maps/logos'/f'{n}.png').is_file() for n in mapnames))
# Validation script on local base
r=subprocess.run(['python3','QA_CHECK.py'],cwd=root,capture_output=True,text=True)
ok('data QA_CHECK',r.returncode==0,r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr.strip())
failed=[x for x in checks if not x[1]]
print(f'RELEASE GATE V22: {len(checks)-len(failed)}/{len(checks)} PASS')
for n,p,d in checks: print(('PASS' if p else 'FAIL')+': '+n+(f' — {d}' if d else ''))
raise SystemExit(1 if failed else 0)
