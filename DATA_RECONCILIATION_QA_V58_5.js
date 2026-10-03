const fs=require('fs');
const p=JSON.parse(fs.readFileSync('data/players.json','utf8'));
const m=JSON.parse(fs.readFileSync('data/maps.json','utf8'));
const s=JSON.parse(fs.readFileSync('data/matches.json','utf8'));
const ids=new Set(p.players.map(x=>x.player_id));
const mapIds=m.maps.map(x=>x.map_id);
const matchIds=s.matches.map(x=>x.match_id);
function assert(x,msg){if(!x)throw new Error(msg)}
assert(m.maps.length===66,'maps != 66');
assert(s.matches.length===32,'matches != 32');
assert(new Set(mapIds).size===66,'duplicate map ids');
assert(new Set(matchIds).size===32,'duplicate match ids');
assert(mapIds[0]==='map_001'&&mapIds.at(-1)==='map_066','map range mismatch');
for(const mp of m.maps){
  assert(matchIds.includes(mp.match_id),`orphan map ${mp.map_id}`);
  assert(Array.isArray(mp.player_stats)&&mp.player_stats.length>0,`no stats ${mp.map_id}`);
  for(const r of mp.player_stats) assert(ids.has(r.player_id),`unknown player ${r.player_id} on ${mp.map_id}`);
}
for(const id of ['Romanchestr','FLAFF1X']) assert(ids.has(id),`missing player ${id}`);
const totals={};
for(const mp of m.maps) for(const r of mp.player_stats){
  const t=totals[r.player_id] ||= {maps:0,k:0,d:0,a:0};
  t.maps++;t.k+=r.kills;t.d+=r.deaths;t.a+=r.assists;
}
for(const id of ['Romanchestr','FLAFF1X']){
  const p0=p.players.find(x=>x.player_id===id);
  const t=totals[id];
  assert(JSON.stringify(p0.frozen_source_totals)===JSON.stringify(t),`total mismatch ${id}`);
}
console.log('V58.5 DATA QA: PASS');
console.log(JSON.stringify({players:p.players.length,maps:m.maps.length,matches:s.matches.length,Romanchestr:totals.Romanchestr,FLAFF1X:totals.FLAFF1X},null,2));
