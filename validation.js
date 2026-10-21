/* Shared CS2 state validation. Browser: window.CS2Validation. Node/CommonJS: module.exports. */
(function(root){
  function validateBase(b){
    if(!b||!Array.isArray(b.players)||!Array.isArray(b.maps)||!Array.isArray(b.matches)||!b.aliases||typeof b.aliases!=='object'||Array.isArray(b.aliases))return{ok:false,error:'state shape is invalid'};
    try{
      const uniq=(a,k)=>{const s=new Set();for(const x of a){const id=x&&x[k];if(!id||s.has(id))return false;s.add(id)}return true};
      if(!uniq(b.players,'player_id')||!uniq(b.maps,'map_id')||!uniq(b.matches,'match_id'))return{ok:false,error:'duplicate/invalid id'};
      if(b.players.some(p=>typeof p.player_id!=='string'||!/^[\p{L}\p{N}_.: -]{1,64}$/u.test(p.player_id)))return{ok:false,error:'invalid player_id'};
      const pids=new Set(b.players.map(p=>p.player_id)),mids=new Set(b.matches.map(m=>m.match_id)),maps=new Map(b.maps.map(m=>[m.map_id,m])),used=new Set();
      for(const m of b.matches)for(const id of(Array.isArray(m.map_ids)?m.map_ids:[])){if(used.has(id))return{ok:false,error:'map belongs to multiple matches'};used.add(id)}
      for(const m of b.maps)if(!used.has(m.map_id))return{ok:false,error:'orphan map: '+m.map_id};
      for(const [a,p] of Object.entries(b.aliases))if(!String(a).trim()||typeof p!=='string'||!pids.has(p))return{ok:false,error:'invalid alias mapping'};
      for(const m of b.maps){
        if(!mids.has(m.match_id)||!maps.has(m.map_id)||!Number.isInteger(Number(m.map_index))||Number(m.map_index)<1)return{ok:false,error:'invalid map relation'};
        const rows=Array.isArray(m.player_stats)?m.player_stats:[];
        if(m.stats_available===true&&rows.length===0)return{ok:false,error:'detailed map has no player rows'};
        if(m.stats_available===false&&rows.length>0)return{ok:false,error:'compact map contains player_stats'};
        const seen=new Set();for(const st of rows){if(!st||!Number.isFinite(Number(st.kills))||!Number.isFinite(Number(st.deaths))||!Number.isFinite(Number(st.assists)))return{ok:false,error:'invalid KDA'};if(st.player_id!=null&&!pids.has(st.player_id))return{ok:false,error:'unknown player'};const k=st.player_id||'raw:'+(st.raw_name||'');if(seen.has(k))return{ok:false,error:'duplicate player stats'};seen.add(k)}
      }
      for(const m of b.matches){
        if(Array.isArray(m.player_ids)&&(new Set(m.player_ids).size!==m.player_ids.length||m.player_ids.some(id=>!pids.has(id))))return{ok:false,error:'invalid match player_ids'};
        if(!Array.isArray(m.map_ids)||!m.map_ids.length||new Set(m.map_ids).size!==m.map_ids.length)return{ok:false,error:'invalid map_ids'};
        if(m.format==='BO1'&&m.map_ids.length!==1)return{ok:false,error:'BO1 must have one map'};
        if(m.format==='BO3'&&(m.map_ids.length<2||m.map_ids.length>3))return{ok:false,error:'BO3 must have 2-3 maps'};
        if(m.format==='BO5'&&(m.map_ids.length<3||m.map_ids.length>5))return{ok:false,error:'BO5 must have 3-5 maps'};
        if(!['BO1','BO3','BO5'].includes(m.format))return{ok:false,error:'unsupported format'};
        const ta=Array.isArray(m.team_a)?m.team_a:[],tb=Array.isArray(m.team_b)?m.team_b:[];
        if(ta.length||tb.length){if(ta.length>5||tb.length>5||new Set([...ta,...tb]).size!==ta.length+tb.length||[...ta,...tb].some(pid=>!pids.has(pid)))return{ok:false,error:'invalid team assignment'}}
        for(let i=0;i<m.map_ids.length;i++){const mp=maps.get(m.map_ids[i]);if(!mp||mp.match_id!==m.match_id||Number(mp.map_index)!==i+1)return{ok:false,error:'match/map relation invalid'}}
        const sas=Array.isArray(m.series_aggregate_stats)?m.series_aggregate_stats:[];
        if(sas.length&&!((sas.length===10)))return{ok:false,error:'series aggregate must contain 10 rows when present'};
        const seen=new Set();for(const st of sas){if(!st||!Number.isFinite(Number(st.kills))||!Number.isFinite(Number(st.deaths))||!Number.isFinite(Number(st.assists)))return{ok:false,error:'invalid series KDA'};if(st.player_id!=null&&!pids.has(st.player_id))return{ok:false,error:'unknown series player'};const k=st.player_id||'raw:'+(st.raw_name||'');if(seen.has(k))return{ok:false,error:'duplicate series player'};seen.add(k)}
      }
      return{ok:true};
    }catch(e){return{ok:false,error:e?.message||'validation failed'}}
  }
  const api={validateBase,assertBase(b){const r=validateBase(b);if(!r.ok)throw Error(r.error);return b}};
  if(root)root.CS2Validation=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:window);
