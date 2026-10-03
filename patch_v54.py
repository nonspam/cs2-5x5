from pathlib import Path
p=Path('app.js')
s=p.read_text()
# Add active map numbering helper after mapOrder
old="function mapOrder(m){const t=matchTime(m);if(t)return t;const id=String(m?.match_id||'');const n=id.match(/(\\d+)(?:$)/);return n?Number(n[1]):0}\n"
new=old+"function activeMapNumber(mapId){const maps=DB.maps.filter(m=>m.archived!==true).slice().sort((a,b)=>{const na=Number(String(a.map_id||'').match(/(\\d+)(?:$)/)?.[1]||0),nb=Number(String(b.map_id||'').match(/(\\d+)(?:$)/)?.[1]||0);return na-nb||matchOrder(DB.matches.find(x=>x.match_id===a.match_id))-matchOrder(DB.matches.find(x=>x.match_id===b.match_id))||Number(a.map_index||0)-Number(b.map_index||0)});const i=maps.findIndex(m=>m.map_id===mapId);return i<0?null:i+1}\n"
assert old in s
s=s.replace(old,new)
# form/era
s=s.replace("return [...new Set(sizes)].sort((a,b)=>a-b).map(n=>{const rr=rows.slice(-n),a=aggregateRows(rr);return{n,k:a.k,d:a.d,a:a.a,kd:a.kd,diff:a.kdDiff,form:rr.reduce((z,x)=>z+x.kills-x.deaths,0)/rr.length}})}",
"return [...new Set(sizes)].sort((a,b)=>a-b).map(n=>{const rr=rows.slice(-n),a=aggregateRows(rr);return{n,k:a.k,d:a.d,a:a.a,kd:a.kd,avg:a.maps?a.k/a.maps:0}})}")
s=s.replace("out.push({from:i+1,to:i+rr.length,maps:rr.length,kd:a.kd,diff:a.kdDiff,avg:a.maps?a.k/a.maps:0,idx:b.total})","out.push({from:i+1,to:i+rr.length,maps:rr.length,kd:a.kd,avg:a.maps?a.k/a.maps:0,idx:b.total})")
# player detail map rows and form/era markup
old="const mapRows=latest.map(r=>{const mp=DB.maps.find(x=>x.map_id===r.map_id),m=DB.matches.find(x=>x.match_id===r.match_id);return `<div class=\"map-history-row compact-row\"><div><b>${esc(r.map)}</b><span>${r.kills}/${r.deaths}/${r.assists} · ${fmt(r.deaths?r.kills/r.deaths:0,2)} K/D</span></div><span class=\"muted\">${scoreMarkup(mapScoreText(mp))}</span><strong>MVP · ${esc(mapMvp(r.map_id))}</strong></div>`}).join('');"
new="const mapRows=latest.map(r=>{const n=activeMapNumber(r.map_id);return `<div class=\"map-history-row compact-row\"><div><b>${esc(r.map)}</b><span>${r.kills}/${r.deaths}/${r.assists}</span></div><strong>MVP · ${esc(mapMvp(r.map_id))}</strong><span class=\"map-history-index\">${n?`#${n}`:''}</span></div>`}).join('');"
assert old in s
s=s.replace(old,new)
old="${windows.map((w,i)=>`<div class=\"form-window-card ${w.n===1?'latest':''}\"><span>${w.n===1?'Последняя':`Последние ${w.n}`}</span><strong>${fmt(w.form,2)}</strong><small>форма · ${fmt(w.kd,2)} K/D · ${w.k}/${w.d}/${w.a}</small></div>`).join('')"
new="${windows.map((w,i)=>`<div class=\"form-window-card ${w.n===1?'latest':''}\"><span>${w.n===1?'Последняя':`Последние ${w.n}`}</span><strong>AVG ${fmt(w.avg,2)}</strong><small>K/D ${fmt(w.kd,2)}</small></div>`).join('')"
assert old in s
s=s.replace(old,new)
old="${eras.map(e=>`<div class=\"era-card\"><span>Эра ${e.from}–${e.to}</span><strong>K/D ${fmt(e.kd,2)}</strong><small>AVG ${fmt(e.avg,2)} K · K-D ${e.diff>0?'+':''}${e.diff}</small></div>`).join('')"
new="${eras.map(e=>`<div class=\"era-card\"><span>Эра ${e.from}–${e.to}</span><strong>AVG ${fmt(e.avg,2)}</strong><small>K/D ${fmt(e.kd,2)}</small></div>`).join('')"
assert old in s
s=s.replace(old,new)
# base maps row: number active map, score markup
old="const body=isMaps?rows.map(q=>{const mp=q.mp,m=q.match;return `<tr class=\"click-row\" onclick=\"openMapDetail('${esc(mp.map_id)}')\"><td class=\"name\">${esc(mp.map)}</td><td>${esc(m.match_id)}</td><td>${esc(m.format||'—')}</td><td>${esc(mapScoreText(mp)||m.series_score||'—')}</td>${state.logged?`<td><button class=\"btn mini danger\" onclick=\"event.stopPropagation();deleteMatch('${esc(m.match_id)}')\">УДАЛИТЬ</button></td>`:''}</tr>`}).join(''):"
new="const body=isMaps?rows.map(q=>{const mp=q.mp,m=q.match,n=activeMapNumber(mp.map_id);return `<tr class=\"click-row\" onclick=\"openMapDetail('${esc(mp.map_id)}')\"><td class=\"name\">ИГРА ${n||'—'} · ${esc(mp.map)}</td><td>${esc(m.match_id)}</td><td>${esc(m.format||'—')}</td><td>${scoreMarkup(mapScoreText(mp)||m.series_score||'—')}</td>${state.logged?`<td><button class=\"btn mini danger\" onclick=\"event.stopPropagation();deleteMatch('${esc(m.match_id)}')\">УДАЛИТЬ</button></td>`:''}</tr>`}).join(''):"
assert old in s
s=s.replace(old,new)
# base header maps
s=s.replace("const head=isMaps?`<tr><th>КАРТА</th><th>СЕРИЯ</th><th>ФОРМАТ</th><th>СЧЁТ</th>","const head=isMaps?`<tr><th>ИГРА / КАРТА</th><th>СЕРИЯ</th><th>ФОРМАТ</th><th>СЧЁТ</th>")
# map lab history
old="history=historyMs.slice(0,10).map(m=>{const match=DB.matches.find(x=>x.match_id===m.match_id);return `<div class=\"map-history-row\" onclick=\"openMapDetail('${esc(m.map_id)}')\"><div><b>${esc(m.map)}</b><span>${match?.played_at?esc(new Date(match.played_at).toLocaleDateString('ru-RU',{day:'2-digit',month:'short'})):esc(match?.match_id||'—')}</span></div><strong>${scoreMarkup(mapScoreText(m))}</strong></div>`}).join('');"
new="history=historyMs.slice(0,11).map(m=>{const n=activeMapNumber(m.map_id);return `<div class=\"map-history-row all-map-history-row\" onclick=\"openMapDetail('${esc(m.map_id)}')\"><div><b>${n?`#${n} · `:''}${esc(m.map)}</b><span>${esc(mapMvp(m.map_id))}</span></div><strong>${mapScoreText(m)!=='—'?scoreMarkup(mapScoreText(m)):'—'}</strong></div>`}).join('');"
assert old in s
s=s.replace(old,new)
s=s.replace("<h3>ИСТОРИЯ ${isAll?'ВСЕХ КАРТ':'КАРТЫ'}</h3><span class=\"muted\">10 последних</span>","<h3>ИСТОРИЯ ${isAll?'ВСЕХ КАРТ':'КАРТЫ'}</h3><span class=\"muted\">${historyMs.length?`#${activeMapNumber(historyMs[Math.min(10,historyMs.length-1)].map_id)||'—'}–#${activeMapNumber(historyMs[0].map_id)||'—'}`:'нет карт'}</span>")
# Teams quick pool + search
old="<div class=\"team-builder-grid\"><div class=\"panel card team-dropzone\""
new="<div class=\"team-quick-add panel card\"><div class=\"section-head\"><div><h3>БЫСТРЫЙ НАБОР ИГРОКОВ</h3><div class=\"muted\">Клик по игроку: сначала A, затем B. Не нужно прокручивать список вниз.</div></div><span class=\"pill\">${allSelected.length}/10</span></div><input id=\"teamPlayerSearch\" class=\"control team-player-search\" placeholder=\"Поиск игрока...\"><div id=\"teamQuickPool\" class=\"team-quick-pool\">${roster.map(p=>`<button type=\"button\" class=\"team-quick-chip ${allSelected.includes(p.player_id)?'selected':''}\" data-name=\"${esc(p.display_name.toLowerCase())}\" onclick=\"addToTeam('${esc(p.player_id)}')\"><span>${esc(p.display_name)}</span><b>${fmt(index(p.player_id),1)}</b></button>`).join('')}</div></div><div class=\"team-builder-grid\"><div class=\"panel card team-dropzone\""
assert old in s
s=s.replace(old,new)
# add event after whatIf handlers
needle="$('#whatIfIn')?.addEventListener('change',e=>{state.whatIfIn=e.target.value;render()});$('#teamMapSelect')?.addEventListener('change',e=>{state.teamMap=e.target.value;render()});"
repl=needle+"$('#teamPlayerSearch')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('#teamQuickPool .team-quick-chip').forEach(b=>b.style.display=!q||b.dataset.name.includes(q)?'':'none')});"
assert needle in s
s=s.replace(needle,repl)
# Home hero nuke bg inline and promo text
s=s.replace("<section class=\"panel home-hero home-rebuild-hero\">","<section class=\"panel home-hero home-rebuild-hero\" style=\"--hero-map:url('assets/maps/nuke.svg')\">")
s=s.replace('<div class="promo-mark">CS2</div>','<div class="promo-mark">CS2 <span>ANALYTICS</span></div>')
p.write_text(s)
