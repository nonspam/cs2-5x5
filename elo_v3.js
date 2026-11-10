/* CS2 Analytics DEV — deterministic ELO V3 baseline */
(function(root){
  'use strict';
  const START_RATING=1000;
  const TEAM_WEIGHT=.85;
  const IMPACT_WEIGHT=.15;
  const PROVISIONAL_K=32;
  const ESTABLISHED_K=24;
  const CALIBRATION_MATCHES=10;
  let cache=null,cacheEpoch=-1;

  const number=value=>Number.isFinite(Number(value))?Number(value):0;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const normalize=value=>typeof normalizeStatName==='function'
    ? normalizeStatName(value)
    : String(value??'').normalize('NFKC').trim().toLocaleLowerCase('ru').replace(/\s+/g,' ');

  function playerCatalog(){
    return new Map((DB.players||[])
      .filter(p=>p&&p.player_id&&p.deleted_permanently!==true)
      .map(p=>[p.player_id,p]));
  }

  function resolvePlayerId(value,catalog){
    const raw=String(value||'').trim();
    if(!raw)return null;
    const direct=raw.startsWith('archived_')?raw.slice(9):raw;
    if(catalog.has(direct))return direct;
    return null;
  }

  function resolveStatPlayer(row,catalog){
    if(row?.player_id){
      const direct=resolvePlayerId(row.player_id,catalog);
      if(direct)return direct;
    }
    const raw=normalize(row?.raw_name);
    if(!raw)return null;
    for(const [alias,pid] of Object.entries(DB.aliases||{})){
      if(normalize(alias)===raw){
        const resolved=resolvePlayerId(pid,catalog);
        if(resolved)return resolved;
      }
    }
    for(const p of catalog.values()){
      if(normalize(p.display_name)===raw)return p.player_id;
      if((p.aliases||[]).some(alias=>normalize(alias)===raw))return p.player_id;
    }
    return null;
  }

  function matchResult(match){
    const score=String(match?.series_score||'').match(/^(\d+)\s*:\s*(\d+)$/);
    if(score){
      const a=Number(score[1]),b=Number(score[2]);
      if(a===0&&b===0)return null;
      return a===b ? 0.5 : (a>b ? 1 : 0);
    }
    let winsA=0,winsB=0,draws=0;
    for(const mp of (typeof matchMaps==='function'?matchMaps(match):[])){
      const a=Number(mp?.score?.team_a),b=Number(mp?.score?.team_b);
      if(!Number.isFinite(a)||!Number.isFinite(b))continue;
      if(a===b)draws++;
      else if(a>b)winsA++;
      else winsB++;
    }
    if(winsA>winsB)return 1;
    if(winsB>winsA)return 0;
    if(draws||winsA||winsB)return .5;
    return null;
  }

  function rosterFor(match,catalog){
    let groups=typeof historicalLobbyGroups==='function'
      ? historicalLobbyGroups(match,null)
      : [match?.lobby_team_a||match?.team_a||[],match?.lobby_team_b||match?.team_b||[]];
    let a=Array.isArray(groups?.[0])?groups[0]:[];
    let b=Array.isArray(groups?.[1])?groups[1]:[];
    if(a.length!==5||b.length!==5){
      a=Array.isArray(match?.lobby_team_a)&&match.lobby_team_a.length===5?match.lobby_team_a:(match?.team_a||[]);
      b=Array.isArray(match?.lobby_team_b)&&match.lobby_team_b.length===5?match.lobby_team_b:(match?.team_b||[]);
    }
    if(a.length!==5||b.length!==5)return null;
    const toEntry=raw=>{
      const key=String(raw||'').trim();
      const playerId=resolvePlayerId(key,catalog);
      return {key,playerId,rated:!!playerId};
    };
    const teamA=a.map(toEntry),teamB=b.map(toEntry);
    const all=[...teamA,...teamB];
    if(all.some(x=>!x.key)||new Set(all.map(x=>x.key)).size!==10)return null;
    const known=all.filter(x=>x.playerId).map(x=>x.playerId);
    if(new Set(known).size!==known.length)return null;
    if(!teamA.some(x=>x.rated)||!teamB.some(x=>x.rated))return null;
    return {teamA,teamB};
  }

  function statsForMatch(match,catalog){
    const result=new Map();
    const add=(pid,row,mapCount)=>{
      if(!pid||!row)return;
      const old=result.get(pid)||{kills:0,deaths:0,assists:0,maps:0};
      old.kills+=number(row.kills);
      old.deaths+=number(row.deaths);
      old.assists+=number(row.assists);
      old.maps+=mapCount||1;
      result.set(pid,old);
    };
    const aggregate=Array.isArray(match?.series_aggregate_stats)?match.series_aggregate_stats:[];
    if(aggregate.length>=10){
      for(const row of aggregate){
        const pid=resolveStatPlayer(row,catalog);
        if(pid)add(pid,row,Math.max(1,(match.map_ids||[]).length));
      }
      return result;
    }
    for(const mp of (typeof matchMaps==='function'?matchMaps(match):[])){
      if(!Array.isArray(mp?.player_stats))continue;
      const seen=new Set();
      for(const row of mp.player_stats){
        const pid=resolveStatPlayer(row,catalog);
        if(!pid||seen.has(pid))continue;
        seen.add(pid);
        add(pid,row,1);
      }
    }
    return result;
  }

  function impactScore(stats){
    if(!stats||stats.maps<1)return null;
    const diffPerMap=(stats.kills-stats.deaths)/stats.maps;
    const assistsPerMap=stats.assists/stats.maps;
    return clamp(50+6*diffPerMap+2*(assistsPerMap-4),0,100);
  }

  function calculate(){
    const epoch=typeof renderEpoch==='number'?renderEpoch:-1;
    if(cache&&cacheEpoch===epoch)return cache;
    const catalog=playerCatalog();
    const ratings=new Map([...catalog.keys()].map(id=>[id,START_RATING]));
    const played=new Map([...catalog.keys()].map(id=>[id,0]));
    const histories=new Map([...catalog.keys()].map(id=>[id,[]]));
    const matchRows=[];
    const matches=(typeof activeMatches==='function'?activeMatches():[])
      .slice()
      .sort((a,b)=>(typeof matchOrder==='function'?matchOrder(a):0)-(typeof matchOrder==='function'?matchOrder(b):0)
        ||String(a.match_id||'').localeCompare(String(b.match_id||'')));

    for(const match of matches){
      const actualA=matchResult(match);
      if(actualA==null)continue;
      const roster=rosterFor(match,catalog);
      if(!roster)continue;
      const stats=statsForMatch(match,catalog);
      const impactById=new Map();
      for(const entry of [...roster.teamA,...roster.teamB]){
        if(!entry.playerId)continue;
        const score=impactScore(stats.get(entry.playerId));
        if(score!=null)impactById.set(entry.playerId,score);
      }
      const meanImpact=team=>{
        const values=team.map(x=>x.playerId?impactById.get(x.playerId):null).filter(v=>v!=null);
        return values.length?values.reduce((sum,v)=>sum+v,0)/values.length:null;
      };
      const meanA=meanImpact(roster.teamA),meanB=meanImpact(roster.teamB);
      const averageRating=team=>team.reduce((sum,x)=>sum+(x.playerId?(ratings.get(x.playerId)??START_RATING):START_RATING),0)/5;
      const avgA=averageRating(roster.teamA),avgB=averageRating(roster.teamB);
      const expectedA=1/(1+Math.pow(10,(avgB-avgA)/400));
      const expectedB=1-expectedA;
      const ratingChanges={};
      const applyTeam=(team,actual,expected,teamMean,opponentMean)=>{
        for(const entry of team){
          const id=entry.playerId;
          if(!id)continue;
          const before=ratings.get(id)??START_RATING;
          const games=played.get(id)||0;
          const k=games<CALIBRATION_MATCHES?PROVISIONAL_K:ESTABLISHED_K;
          const score=impactById.get(id);
          const relative=score==null||teamMean==null?0:clamp((score-teamMean)/25,-1,1);
          let delta=k*(TEAM_WEIGHT*(actual-expected)+IMPACT_WEIGHT*relative);
          if(actual===1&&delta<1)delta=1;
          if(actual===0&&delta>-1)delta=-1;
          delta=Math.round(delta*10)/10;
          const after=Math.round((before+delta)*10)/10;
          ratings.set(id,after);
          played.set(id,games+1);
          const event={
            match_id:match.match_id,
            series_number:typeof seriesNumberForMatch==='function'?seriesNumberForMatch(match):null,
            played_at:match.played_at||match.date||match.created_at||null,
            result:actual===1?'WIN':actual===0?'LOSS':'DRAW',
            before,delta,after,
            impact:score,
            impact_adjustment:Math.round((k*IMPACT_WEIGHT*relative)*10)/10
          };
          histories.get(id).push(event);
          ratingChanges[id]=event;
        }
      };
      applyTeam(roster.teamA,actualA,expectedA,meanA,meanB);
      applyTeam(roster.teamB,1-actualA,expectedB,meanB,meanA);
      matchRows.push({
        match_id:match.match_id,
        resultA:actualA===1?'WIN':actualA===0?'LOSS':'DRAW',
        expectedA,expectedB,avgA,avgB,ratingChanges,
        guestCount:[...roster.teamA,...roster.teamB].filter(x=>!x.playerId).length
      });
    }

    const leaderboard=(typeof activePlayers==='function'?activePlayers():[])
      .map(p=>({player_id:p.player_id,display_name:p.display_name,rating:ratings.get(p.player_id)??START_RATING,matches:played.get(p.player_id)||0,lastDelta:histories.get(p.player_id)?.at(-1)?.delta??0}))
      .sort((a,b)=>b.rating-a.rating||b.matches-a.matches||String(a.display_name).localeCompare(String(b.display_name),'ru'));
    const rankById=new Map(leaderboard.map((p,i)=>[p.player_id,i+1]));
    const summary={
      activeSeries:matches.length,
      ratedSeries:matchRows.length,
      coverage:matches.length?matchRows.length/matches.length:0,
      startRating:START_RATING,
      teamWeight:TEAM_WEIGHT,
      impactWeight:IMPACT_WEIGHT,
      calibrationMatches:CALIBRATION_MATCHES,
      provisionalK:PROVISIONAL_K,
      establishedK:ESTABLISHED_K
    };
    cache={ratings,played,histories,leaderboard,rankById,matchRows,summary};
    cacheEpoch=epoch;
    return cache;
  }

  function playerData(id){
    const data=calculate();
    const history=data.histories.get(id)||[];
    return {
      rating:Math.round((data.ratings.get(id)??START_RATING)*10)/10,
      matches:data.played.get(id)||0,
      lastDelta:history.at(-1)?.delta??0,
      history,
      rank:data.rankById.get(id)||null
    };
  }
  function recentDelta(id,count=5){
    return (playerData(id).history.slice(-Math.max(0,Number(count)||0))).reduce((sum,event)=>sum+event.delta,0);
  }
  function ratingAtMatch(id,matchId){
    const event=(calculate().histories.get(id)||[]).find(x=>x.match_id===matchId);
    return event?event.after:START_RATING;
  }
  function deltaForMatch(id,matchId){
    const event=(calculate().histories.get(id)||[]).find(x=>x.match_id===matchId);
    return event?event.delta:null;
  }
  function matchData(matchId){
    return calculate().matchRows.find(row=>row.match_id===matchId)||null;
  }
  function leaderboard(){return calculate().leaderboard.slice()}
  function summary(){return {...calculate().summary}}
  function explain(){
    return {
      startRating:START_RATING,
      teamWeight:TEAM_WEIGHT,
      impactWeight:IMPACT_WEIGHT,
      calibrationMatches:CALIBRATION_MATCHES,
      provisionalK:PROVISIONAL_K,
      establishedK:ESTABLISHED_K,
      impactFormula:'50 + 6 × (K−D за карту) + 2 × (A за карту − 4), ограничено 0–100',
      resultRule:'Победа всегда даёт положительное изменение, поражение — отрицательное; импакт корректирует величину изменения, но не переворачивает результат.',
      granularity:'Одно обновление на серию BO1/BO3/BO5. Неполные составы или неизвестный исход не учитываются.'
    };
  }

  root.CS2EloV3={player:playerData,recentDelta,ratingAtMatch,deltaForMatch,match:matchData,leaderboard,summary,explain};
})(window);