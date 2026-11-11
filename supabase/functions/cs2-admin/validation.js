/* CS2 Analytics — canonical state validation. Browser + Edge Function. */
(function(root){
  'use strict';
  const PLAYER_ID=/^[\p{L}\p{N}_.: -]{1,64}$/u;
  const FORMATS=new Set(['BO1','BO3','BO5']);
  const SOURCE_KINDS=new Set(['detailed','compact_bo3','manual','imported','historical','local_series']);
  const PROVENANCE=new Set(['historical_source_order','source_order_with_full_5v5','reconstructed','manual']);
  const PLAYER_STATUS=new Set(['active','archived']);
  const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
  const finite=n=>Number.isFinite(Number(n));
  const nonNeg=n=>finite(n)&&Number(n)>=0;
  const intNonNeg=n=>Number.isInteger(Number(n))&&Number(n)>=0;
  const nonEmptyString=v=>typeof v==='string'&&v.trim().length>0;
  const uniq=(arr,key)=>{const s=new Set();for(const x of arr||[]){const id=x?.[key];if(!id||s.has(id))return false;s.add(id)}return true};
  function validateBase(b,opts={}){
    const errors=[];
    if(!isObj(b)||!Array.isArray(b.players)||!Array.isArray(b.maps)||!Array.isArray(b.matches)||!isObj(b.aliases))return {ok:false,errors:['state shape is invalid'],error:'state shape is invalid'};
    try{
      if(!uniq(b.players,'player_id'))errors.push('duplicate/invalid player_id');
      if(!uniq(b.maps,'map_id'))errors.push('duplicate/invalid map_id');
      if(!uniq(b.matches,'match_id'))errors.push('duplicate/invalid match_id');
      if(b.players.some(p=>typeof p?.player_id!=='string'||!PLAYER_ID.test(p.player_id)))errors.push('invalid player_id');
      const pids=new Set(b.players.map(p=>p.player_id)),mids=new Set(b.matches.map(m=>m.match_id)),maps=new Map(b.maps.map(m=>[m.map_id,m])),listed=new Set();
      for(const p of b.players){
        if(!nonEmptyString(p.display_name))errors.push('invalid display_name:'+p.player_id);
        if(!PLAYER_STATUS.has(p.status))errors.push('invalid player status:'+p.player_id);
        if(typeof p.is_active!=='boolean')errors.push('invalid is_active:'+p.player_id);
        if(p.status==='active'&&p.is_active!==true)errors.push('active player must be active:'+p.player_id);
        if(p.status==='archived'&&p.is_active!==false)errors.push('archived player must be inactive:'+p.player_id);
        if(Array.isArray(p.frozen_source_totals))errors.push('invalid frozen totals shape:'+p.player_id);
        if(p.frozen_source_totals!=null){const t=p.frozen_source_totals;if(!isObj(t)||!intNonNeg(t.maps)||!nonNeg(t.k)||!nonNeg(t.d)||!nonNeg(t.a))errors.push('invalid frozen totals:'+p.player_id)}
      }
      for(const m of b.matches){
        if(!m?.match_id||!SOURCE_KINDS.has(m.source_kind)||!FORMATS.has(m.format))errors.push('invalid match contract:'+m.match_id);
        if(!Array.isArray(m.map_ids)||!m.map_ids.length||new Set(m.map_ids).size!==m.map_ids.length)errors.push('invalid map_ids:'+m.match_id);
        const expected={BO1:[1,1],BO3:[2,3],BO5:[3,5]}[m.format];
        if(expected&&(m.map_ids.length<expected[0]||m.map_ids.length>expected[1]))errors.push('format/map count mismatch:'+m.match_id);
        for(const id of m.map_ids||[]){if(listed.has(id))errors.push('map belongs to multiple matches:'+id);listed.add(id);if(!maps.has(id))errors.push('unknown map:'+m.match_id+':'+id)}
        if(!PROVENANCE.has(m.team_assignment_source)&&m.source_kind!=='local_series')errors.push('invalid/missing team_assignment_source:'+m.match_id);
        for(const side of ['team_a','team_b']){if(!Array.isArray(m[side]))errors.push('missing '+side+':'+m.match_id);else if(m[side].length>5||m[side].some(id=>!pids.has(id)))errors.push('invalid team:'+m.match_id+':'+side)}
        if(Array.isArray(m.team_a)&&Array.isArray(m.team_b)&&new Set([...m.team_a,...m.team_b]).size!==m.team_a.length+m.team_b.length)errors.push('team overlap:'+m.match_id);
        if(m.series_score!=null){const score=String(m.series_score);if(!/^\d+:\d+$/.test(score))errors.push('invalid series_score:'+m.match_id);else{const [a,c]=score.split(':').map(Number);if(a<0||c<0||a>5||c>5)errors.push('series_score out of bounds:'+m.match_id)}}
        if(m.played_at!=null&&Number.isNaN(Date.parse(m.played_at)))errors.push('invalid played_at:'+m.match_id);
        if(m.series_number!=null&&(!Number.isInteger(Number(m.series_number))||Number(m.series_number)<1))errors.push('invalid series_number:'+m.match_id);
        const sas=Array.isArray(m.series_aggregate_stats)?m.series_aggregate_stats:[];if(sas.length>10)errors.push('series aggregate cannot exceed 10 rows:'+m.match_id);
        const seenSeries=new Set();for(const st of sas){if(!st||!nonNeg(st.kills)||!nonNeg(st.deaths)||!nonNeg(st.assists))errors.push('invalid series KDA:'+m.match_id);if(st.player_id!=null&&!pids.has(st.player_id))errors.push('unknown series player:'+m.match_id);const k=st.player_id||'raw:'+(st.raw_name||'');if(seenSeries.has(k))errors.push('duplicate series player:'+m.match_id);seenSeries.add(k)}
      }
      for(const mp of b.maps){
        if(!mids.has(mp.match_id)||!maps.has(mp.map_id)||!listed.has(mp.map_id)||!Number.isInteger(Number(mp.map_index))||Number(mp.map_index)<1)errors.push('invalid map relation:'+mp.map_id);
        if(!nonEmptyString(mp.map))errors.push('invalid map name:'+mp.map_id);
        if(!isObj(mp.score)||!intNonNeg(mp.score.team_a)||!intNonNeg(mp.score.team_b))errors.push('invalid map score:'+mp.map_id);
        const hasMapA=Array.isArray(mp.team_a),hasMapB=Array.isArray(mp.team_b);if(hasMapA!==hasMapB)errors.push('incomplete map teams:'+mp.map_id);if(hasMapA&&hasMapB)for(const side of ['team_a','team_b']){if(mp[side].some(id=>!pids.has(id)))errors.push('unknown map team player:'+mp.map_id+':'+side)}
        if(Array.isArray(mp.team_a)&&Array.isArray(mp.team_b)&&new Set([...mp.team_a,...mp.team_b]).size!==mp.team_a.length+mp.team_b.length)errors.push('map team overlap:'+mp.map_id);
        const rows=Array.isArray(mp.player_stats)?mp.player_stats:[];if(mp.stats_available===true&&rows.length===0)errors.push('detailed map has no rows:'+mp.map_id);if(mp.stats_available===false&&rows.length>0)errors.push('compact map contains player_stats:'+mp.map_id);
        const seen=new Set();for(const st of rows){if(!st||!nonNeg(st.kills)||!nonNeg(st.deaths)||!nonNeg(st.assists))errors.push('invalid KDA:'+mp.map_id);if(st.player_id!=null&&!pids.has(st.player_id))errors.push('unknown player:'+mp.map_id);const k=st.player_id||'raw:'+(st.raw_name||'');if(seen.has(k))errors.push('duplicate player stats:'+mp.map_id);seen.add(k)}
      }
      for(const [alias,pid] of Object.entries(b.aliases)){if(!String(alias).trim()||typeof pid!=='string'||!pids.has(pid))errors.push('invalid alias mapping:'+alias)}
      if(opts.semantic!==false)for(const m of b.matches){if(m.series_score){const parts=String(m.series_score).split(':').map(Number);if(parts.some(x=>!Number.isInteger(x)||x<0))errors.push('invalid numeric series score:'+m.match_id)}const linked=(m.map_ids||[]).map(id=>maps.get(id)).filter(Boolean);if(linked.some(x=>x.match_id!==m.match_id))errors.push('map cross-link mismatch:'+m.match_id);if(m.team_assignment_source==='reconstructed'&&!nonEmptyString(m.team_assignment_note))errors.push('reconstructed assignment missing note:'+m.match_id)}
    }catch(e){errors.push(e?.message||'validation failed')}
    const unique=[...new Set(errors)];return {ok:unique.length===0,errors:unique,error:unique[0]||null};
  }
  const api={validateBase,assertBase(b,opts){const r=validateBase(b,opts);if(!r.ok)throw Error(r.errors.join('; '));return b},constants:Object.freeze({PROVENANCE:[...PROVENANCE],FORMATS:[...FORMATS],SOURCE_KINDS:[...SOURCE_KINDS]})};
  if(root)root.CS2Validation=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);