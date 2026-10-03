import json, math, sys
from pathlib import Path
root=Path(__file__).parent/'data'
P=json.loads((root/'players.json').read_text())['players']
M=json.loads((root/'maps.json').read_text())['maps']
S=json.loads((root/'matches.json').read_text())['matches']
A=json.loads((root/'aliases.json').read_text())['aliases']
fail=[]
def ok(c,msg):
    if not c: fail.append(msg)
# structural
ok(len(P)==14,f'players={len(P)} != 14')
ok(len(M)==66,f'maps={len(M)} != 66')
ok(len(S)==32,f'matches={len(S)} != 32')
pids={p['player_id'] for p in P}; mids={m['match_id'] for m in S}; mapids={m['map_id'] for m in M}
ok(len(pids)==len(P),'duplicate player_id')
ok(len(mids)==len(S),'duplicate match_id')
ok(len(mapids)==len(M),'duplicate map_id')
ok(all(v in pids for v in A.values()),'alias points to missing player')
byid={m['map_id']:m for m in M}
for mp in M:
    ok(mp.get('match_id') in mids,f"map {mp['map_id']} missing match")
    seen=set()
    for r in mp.get('player_stats') or []:
        k=r.get('player_id') or 'raw:'+str(r.get('raw_name',''))
        ok(k not in seen,f"duplicate player row {mp['map_id']}:{k}"); seen.add(k)
        ok(all(isinstance(r.get(x),(int,float)) and math.isfinite(r[x]) for x in ('kills','deaths','assists')),f"bad stat {mp['map_id']}:{k}")
for ma in S:
    ids=ma.get('map_ids') or []
    ok(ids and len(ids)==len(set(ids)),f"bad map_ids {ma['match_id']}")
    for mid in ids: ok(mid in byid and byid[mid]['match_id']==ma['match_id'],f"broken link {ma['match_id']}->{mid}")
    seen=set()
    for r in ma.get('series_aggregate_stats') or []:
        k=r.get('player_id') or 'raw:'+str(r.get('raw_name',''))
        ok(k not in seen,f"duplicate series player {ma['match_id']}:{k}"); seen.add(k)
# active aggregate frozen etalon
expected={p['player_id']:tuple((p.get('frozen_source_totals') or {}).get(k,0) for k in ('maps','k','d','a')) for p in P}

active_ids={x['match_id'] for x in S if x.get('archived') is not True}
calc={p['player_id']:[0,0,0,0] for p in P}
for mp in M:
    if mp.get('archived') is True or mp['match_id'] not in active_ids: continue
    for r in mp.get('player_stats') or []:
        if r.get('player_id') in calc:
            q=calc[r['player_id']]; q[0]+=1;q[1]+=r['kills'];q[2]+=r['deaths'];q[3]+=r['assists']
for ma in S:
    if ma.get('archived') is True or ma.get('source_kind')!='compact_bo3': continue
    n=sum(1 for mid in ma['map_ids'] if byid[mid].get('archived') is not True)
    for r in ma.get('series_aggregate_stats') or []:
        if r.get('player_id') in calc:
            q=calc[r['player_id']]; q[0]+=n;q[1]+=r['kills'];q[2]+=r['deaths'];q[3]+=r['assists']
for p in P:
    got=tuple(calc[p['player_id']]); exp=expected.get(p['player_id'])
    ok(got==exp,f"aggregate {p['display_name']}: {got} != {exp}")
# source composition
ok(sum(1 for m in M if m.get('stats_available') and m.get('archived') is not True)==66,'active detailed map count')
ok(sum(1 for m in M if not m.get('stats_available') and m.get('archived') is not True)==0,'active compact map count')
if fail:
    print('FAIL')
    print('\n'.join('- '+x for x in fail)); sys.exit(1)
print('PASS: structure, links, stat rows, aliases, 66-map pool, 66 detailed maps, and current frozen aggregates.')
