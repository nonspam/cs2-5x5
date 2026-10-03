import json, pathlib, re
root=pathlib.Path(__file__).parent
players=json.load(open(root/'data/players.json',encoding='utf-8'))['players']
maps=json.load(open(root/'data/maps.json',encoding='utf-8'))['maps']
matches=json.load(open(root/'data/matches.json',encoding='utf-8'))['matches']
aliases=json.load(open(root/'data/aliases.json',encoding='utf-8'))['aliases']
assert len(players)==14, len(players)
assert len(maps)==67, len(maps)
assert len(matches)==33, len(matches)
assert len([p for p in players if p.get('is_active') is not False])==13
assert len([m for m in matches if m.get('archived') is not True])==30
assert len([m for m in maps if m.get('archived') is not True])==61
assert len([m for m in matches if m.get('format')=='BO1'])==7
assert len([m for m in matches if m.get('format')=='BO3'])==26
assert all(len(m.get('team_a',[]))<=5 and len(m.get('team_b',[]))<=5 for m in matches)
pids={p['player_id'] for p in players}
assert all(x in pids for m in matches for x in (m.get('team_a',[])+m.get('team_b',[])))
assert all(len(set(m.get('team_a',[])+m.get('team_b',[])))==len(m.get('team_a',[]))+len(m.get('team_b',[])) for m in matches)
used=[]
for m in matches:
    assert m['map_ids']
    assert len(set(m['map_ids']))==len(m['map_ids'])
    for i,mid in enumerate(m['map_ids'],1):
        mp=next(x for x in maps if x['map_id']==mid)
        assert mp['match_id']==m['match_id'] and int(mp['map_index'])==i
        used.append(mid)
assert len(used)==len(set(used))==len(maps)
for a,p in aliases.items(): assert p in pids
print('PASS')
print({'players':len(players),'maps':len(maps),'matches':len(matches),'active_players':13,'active_maps':61,'active_matches':30,'bo1':7,'bo3':26,'historical_team_assignments':sum(bool(m.get('team_a') or m.get('team_b')) for m in matches),'full_5x5':sum(len(m.get('team_a',[]))==5 and len(m.get('team_b',[]))==5 for m in matches)})
