/* CS2 Analytics — Supabase cloud adapter. */
(function(){
  const cfg=window.CS2_SUPABASE_CONFIG||{};
  const sdk=window.supabase;
  const configured=!!(sdk&&cfg.url&&cfg.key&&/^https:\/\/[^\s]+\.supabase\.co$/i.test(cfg.url));
  let client=null,channel=null,realtimeRetryTimer=null,realtimeCallback=null,commitQueue=Promise.resolve();
  if(configured)client=sdk.createClient(cfg.url,cfg.key,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
  const clone=x=>JSON.parse(JSON.stringify(x));
  const api=()=>window.CS2Validation;
  async function getRow(){if(!configured)throw Error('Supabase не настроен');const {data,error}=await client.from('cs2_app_state').select('id,state,version,updated_at,updated_by').eq('id',1).maybeSingle();if(error)throw error;if(!data)throw Error('В Supabase ещё нет начального состояния');return data}
  async function load(){if(!configured)return null;const row=await getRow();return {...clone(row.state),updated_at:row.updated_at,cloud_version:row.version}}
  async function isAdmin(){if(!configured)return false;const {data:{session}}=await client.auth.getSession();if(!session)return false;const {data,error}=await client.rpc('is_cs2_admin');if(error)throw error;return data===true}
  async function signIn(login,password){
    if(!configured)throw Error('Supabase не настроен');
    const emailOrLogin=String(login||'').trim();
    if(!emailOrLogin)throw Error('Введите логин');
    if(!password)throw Error('Введите пароль');
    let data;
    if(emailOrLogin.includes('@')){
      const result=await client.auth.signInWithPassword({email:emailOrLogin,password});
      if(result.error)throw result.error;
      data=result.data;
    }else{
      const response=await fetch((cfg.url.endsWith('/')?cfg.url.slice(0,-1):cfg.url)+'/functions/v1/cs2-admin',{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':cfg.key},
        body:JSON.stringify({action:'sign_in',login:emailOrLogin,password})
      });
      const payload=await response.json().catch(()=>null);
      if(!response.ok||!payload?.ok||!payload?.session?.access_token||!payload?.session?.refresh_token)
        throw Error(payload?.error||'Неверный логин или пароль');
      const result=await client.auth.setSession({access_token:payload.session.access_token,refresh_token:payload.session.refresh_token});
      if(result.error)throw result.error;
      data=result.data;
    }
    if(!data.session)throw Error('Сессия не создана');
    if(!(await isAdmin())){await client.auth.signOut();throw Error('Этот аккаунт не добавлен как администратор сайта.')}
    return data;
  }
  async function signOut(){if(configured)await client.auth.signOut()}
  async function signUpAccount(email,password){
    if(!configured)throw Error('Supabase не настроен');
    const cleanEmail=String(email||'').trim().toLowerCase();
    if(!cleanEmail||!cleanEmail.includes('@'))throw Error('Укажи корректную электронную почту');
    if(String(password||'').length<8)throw Error('Пароль должен содержать не менее 8 символов');
    const {data,error}=await client.auth.signUp({email:cleanEmail,password,options:{emailRedirectTo:window.location.origin}});
    if(error)throw error;
    return data;
  }
  async function signInAccount(email,password){
    if(!configured)throw Error('Supabase не настроен');
    const cleanEmail=String(email||'').trim().toLowerCase();
    if(!cleanEmail||!password)throw Error('Введи почту и пароль');
    const {data,error}=await client.auth.signInWithPassword({email:cleanEmail,password});
    if(error)throw error;
    if(!data.session||!data.user)throw Error('Не удалось создать сессию');
    return data;
  }
  async function sendAccountPasswordReset(email){
    if(!configured)throw Error('Supabase не настроен');
    const cleanEmail=String(email||'').trim().toLowerCase();
    if(!cleanEmail||!cleanEmail.includes('@'))throw Error('Укажи электронную почту аккаунта');
    const {error}=await client.auth.resetPasswordForEmail(cleanEmail,{redirectTo:window.location.origin});
    if(error)throw error;
  }
  async function updateAccountPassword(password,currentPassword=null){
    if(!configured)throw Error('Supabase не настроен');
    if(String(password||'').length<8)throw Error('Пароль должен содержать не менее 8 символов');
    if(currentPassword!==null&&currentPassword!==undefined){
      const user=await currentUser();
      if(!user?.email)throw Error('Не удалось определить электронную почту аккаунта');
      const verified=await client.auth.signInWithPassword({email:user.email,password:String(currentPassword)});
      if(verified.error)throw Error('Текущий пароль указан неверно');
    }
    const updatePayload={password};
    if(currentPassword!==null&&currentPassword!==undefined)updatePayload.current_password=String(currentPassword);
    const {data,error}=await client.auth.updateUser(updatePayload);
    if(error)throw error;
    return data;
  }
  function onAuthStateChange(callback){
    if(!configured)return null;
    return client.auth.onAuthStateChange(callback);
  }
  function scheduleRealtimeRetry(){if(!configured||realtimeRetryTimer)return;realtimeRetryTimer=setTimeout(()=>{realtimeRetryTimer=null;if(realtimeCallback&&!channel)subscribe(realtimeCallback)},3000)}
  function subscribe(onChange){if(!configured)return;realtimeCallback=onChange;if(channel)return;channel=client.channel('cs2-app-state-live').on('postgres_changes',{event:'UPDATE',schema:'public',table:'cs2_app_state',filter:'id=eq.1'},p=>realtimeCallback?.(p)).subscribe(status=>{if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){if(channel){client.removeChannel(channel);channel=null}scheduleRealtimeRetry()}})}
  function unsubscribe(){if(realtimeRetryTimer){clearTimeout(realtimeRetryTimer);realtimeRetryTimer=null}realtimeCallback=null;if(channel&&client){client.removeChannel(channel);channel=null}}
  function applyOp(s,op){const k=op?.kind;if(k==='map')s.maps.push(op.map);else if(k==='match')s.matches.push(op.match);else if(k==='player')s.players.push(op.player);else if(k==='aliases')Object.assign(s.aliases,op.aliases||{});else if(k==='delete_map'){const map=s.maps.find(x=>x?.map_id===op.map_id);if(!map)throw Error('Карта не найдена');const match=s.matches.find(x=>x?.match_id===map.match_id);if(!match)throw Error('Матч карты не найден');const ids=Array.isArray(match.map_ids)?match.map_ids:[];const remaining=ids.filter(id=>id!==op.map_id);const min=match.format==='BO1'?1:match.format==='BO3'?2:match.format==='BO5'?3:Infinity;if(remaining.length<min)throw Error('Нельзя удалить карту: формат '+match.format+' требует минимум '+min+' карт');match.map_ids=remaining;s.maps=s.maps.filter(x=>x?.map_id!==op.map_id);match.map_ids.forEach((id,i)=>{const related=s.maps.find(x=>x?.map_id===id);if(related)related.map_index=i+1})}else if(k==='delete_match'){s.matches=s.matches.filter(x=>x?.match_id!==op.match_id);s.maps=s.maps.filter(x=>x?.match_id!==op.match_id);}else if(k==='delete_player'){const target=s.players.find(x=>x?.player_id===op.player_id);if(!target)throw Error('Игрок не найден');const rawName=String(target.display_name||target.player_id),guestId='archived_'+op.player_id;for(const match of (s.matches||[])){const knownTeam=(Array.isArray(match.team_a)&&match.team_a.includes(op.player_id))||(Array.isArray(match.team_b)&&match.team_b.includes(op.player_id))||(Array.isArray(match.lobby_team_a)&&match.lobby_team_a.includes(op.player_id))||(Array.isArray(match.lobby_team_b)&&match.lobby_team_b.includes(op.player_id));if(Array.isArray(match.player_ids)&&match.player_ids.includes(op.player_id)&&!knownTeam)throw Error('Нельзя архивировать игрока: в старой серии не указана команда')}for(const map of (s.maps||[])){if(Array.isArray(map.player_stats))map.player_stats=map.player_stats.map(st=>st?.player_id===op.player_id?{...st,player_id:null,raw_name:st.raw_name||rawName}:st);for(const side of ['lobby_team_a','lobby_team_b'])if(Array.isArray(map[side]))map[side]=map[side].map(pid=>pid===op.player_id?guestId:pid)}for(const match of (s.matches||[])){let team=null;if(Array.isArray(match.team_a)&&match.team_a.includes(op.player_id))team='A';if(Array.isArray(match.team_b)&&match.team_b.includes(op.player_id))team='B';if(!team&&Array.isArray(match.lobby_team_a)&&match.lobby_team_a.includes(op.player_id))team='A';if(!team&&Array.isArray(match.lobby_team_b)&&match.lobby_team_b.includes(op.player_id))team='B';if(team){const guests=Array.isArray(match.guest_players)?match.guest_players:[];if(!guests.some(g=>g?.guest_id===guestId))guests.push({guest_id:guestId,display_name:rawName,team});match.guest_players=guests}for(const side of ['lobby_team_a','lobby_team_b'])if(Array.isArray(match[side]))match[side]=match[side].map(pid=>pid===op.player_id?guestId:pid);for(const side of ['player_ids','team_a','team_b'])if(Array.isArray(match[side]))match[side]=match[side].filter(pid=>pid!==op.player_id);if(Array.isArray(match.series_aggregate_stats))match.series_aggregate_stats=match.series_aggregate_stats.map(st=>st?.player_id===op.player_id?{...st,player_id:null,raw_name:st.raw_name||rawName}:st)}s.players=s.players.filter(x=>x?.player_id!==op.player_id);for(const [a,pid] of Object.entries(s.aliases||{}))if(pid===op.player_id)delete s.aliases[a]}else if(['player_patch','match_patch','map_patch'].includes(k)){const key={player_patch:'players',match_patch:'matches',map_patch:'maps'}[k];const idkey={player_patch:'player_id',match_patch:'match_id',map_patch:'map_id'}[k];const row=s[key].find(x=>x?.[idkey]===op[idkey]);if(!row)throw Error('Объект не найден: '+k);if(!op.patch||typeof op.patch!=='object'||Array.isArray(op.patch))throw Error('Некорректные данные изменения: '+k);Object.assign(row,op.patch)}else throw Error('Неизвестная операция')}
  function commit(ops,audit){
    if(!configured)return Promise.reject(Error('Supabase не настроен'));
    const task=commitQueue.then(async()=>{
      if(!(await isAdmin()))throw Error('Нет прав администратора');
      const row=await getRow(),next=clone(row.state);
      for(const op of ops||[])applyOp(next,op);
      if(api()?.assertBase)api().assertBase(next);else throw Error('Общий валидатор не подключён');
      const user=(await client.auth.getUser()).data.user;
      const entry=audit?{id:'audit_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),at:new Date().toISOString(),action:audit.action,target:audit.target,detail:audit.detail||{}}:null;
      if(entry){next.audit=Array.isArray(next.audit)?next.audit.slice(-499):[];next.audit.push(entry);next.audit=next.audit.slice(-500)}
      const {data,error}=await client.rpc('commit_cs2_state',{p_expected_version:Number(row.version),p_state:next,p_operation_id:'web_'+Date.now()+'_'+Math.random().toString(36).slice(2,10),p_action:entry?.action||'WEB_COMMIT',p_target:entry?.target||null,p_detail:entry?.detail||{},p_actor:user?.email||user?.id||'web',p_updated_by:user?.id||null});
      if(error)throw error;
      const out=Array.isArray(data)?data[0]:data;
      if(!out||typeof out!=='object'||!Number.isFinite(Number(out.version))||!out.state||!Array.isArray(out.state.players)||!Array.isArray(out.state.maps)||!Array.isArray(out.state.matches)||!out.state.aliases||typeof out.state.aliases!=='object'){
        throw Error('Supabase вернул неполный ответ после сохранения. Обновите данные перед повторной попыткой.');
      }
      return {version:out.version,updated_at:out.updated_at,state:out.state};
    });
    commitQueue=task.catch(()=>{});
    return task;
  }

  let profileChannel=null;
  async function currentUser(){if(!configured)return null;const {data,error}=await client.auth.getUser();if(error)throw error;return data.user||null}
  async function loadProfileContext(){
    if(!configured)return {user:null,playerId:null,profiles:[]};
    const {data:{session},error:sessionError}=await client.auth.getSession();
    if(sessionError)throw sessionError;
    const user=session?.user||null;
    const [account,profiles]=await Promise.all([
      user?client.from('my_player_account').select('player_id').maybeSingle():Promise.resolve({data:null,error:null}),
      client.from('player_profiles').select('player_id,avatar_path,cover_path,updated_at')
    ]);
    if(account.error)throw account.error;if(profiles.error)throw profiles.error;
    return {user,playerId:account.data?.player_id||null,profiles:profiles.data||[]};
  }
  async function listUnlinkedPlayers(){
    if(!configured)throw Error('Supabase не настроен');
    const {data,error}=await client.rpc('list_unlinked_players');
    if(error)throw error;
    return Array.isArray(data)?data:[];
  }
  async function createPlayerAccountInvite(playerId){
    if(!configured)throw Error('Supabase не настроен');
    const {data,error}=await client.rpc('create_player_account_invite',{p_player_id:String(playerId||'')});
    if(error)throw error;
    return Array.isArray(data)?data[0]:data;
  }
  async function claimPlayerAccountInvite(token){
    if(!configured)throw Error('Supabase не настроен');
    const {data,error}=await client.rpc('claim_player_account_invite',{p_token:String(token||'').trim()});
    if(error)throw error;
    return data;
  }
  function publicMediaUrl(path){if(!configured||!path)return '';return client.storage.from('cs2-player-media').getPublicUrl(path).data.publicUrl}
  async function uploadProfileMedia(kind,file){
    if(!configured)throw Error('Облачное хранилище не настроено');
    if(!['avatar','cover'].includes(kind))throw Error('Неизвестный тип изображения');
    if(!file||!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw Error('Поддерживаются JPEG, PNG, WebP и GIF');
    if(file.size>5*1024*1024)throw Error('Изображение должно быть не больше 5 МБ');
    const user=await currentUser();if(!user)throw Error('Сначала войди в свой аккаунт');
    const {data:account,error:accountError}=await client.from('my_player_account').select('player_id').maybeSingle();
    if(accountError)throw accountError;if(!account?.player_id)throw Error('К этому аккаунту не привязан профиль игрока');
    const ext=({ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif' })[file.type];
    const path=user.id+'/'+kind+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
    const {error}=await client.storage.from('cs2-player-media').upload(path,file,{upsert:false,contentType:file.type,cacheControl:'3600'});
    if(error)throw error;
    return {path,url:publicMediaUrl(path)};
  }
  async function deleteProfileMedia(path){
    if(!configured)throw Error('Облачное хранилище не настроено');
    const user=await currentUser();if(!user)throw Error('Сначала войди в свой аккаунт');
    const cleanPath=String(path||'');
    if(!cleanPath.startsWith(user.id+'/'))throw Error('Нельзя удалить чужое изображение');
    const {error}=await client.storage.from('cs2-player-media').remove([cleanPath]);
    if(error)throw error;
    return true;
  }
  async function savePlayerProfile(playerId,patch){
    if(!configured)throw Error('Supabase не настроен');
    const allowed={avatar_path:patch.avatar_path,cover_path:patch.cover_path};
    Object.keys(allowed).forEach(k=>{if(allowed[k]===undefined)delete allowed[k]});
    allowed.updated_at=new Date().toISOString();
    const {data,error}=await client.from('player_profiles').update(allowed).eq('player_id',playerId).select('player_id,avatar_path,cover_path,updated_at').single();
    if(error)throw error;return data;
  }
  function subscribeProfiles(onChange){
    if(!configured||profileChannel)return;
    profileChannel=client.channel('cs2-player-profiles-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'player_profiles'},payload=>onChange?.(payload))
      .subscribe(status=>{if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){if(profileChannel){client.removeChannel(profileChannel);profileChannel=null}}});
  }
  function unsubscribeProfiles(){if(profileChannel&&client){client.removeChannel(profileChannel);profileChannel=null}}

  window.CS2Cloud={configured,load,isAdmin,signIn,signOut,signUpAccount,signInAccount,sendAccountPasswordReset,updateAccountPassword,onAuthStateChange,subscribe,unsubscribe,commit,currentUser,loadProfileContext,listUnlinkedPlayers,createPlayerAccountInvite,claimPlayerAccountInvite,publicMediaUrl,uploadProfileMedia,deleteProfileMedia,savePlayerProfile,subscribeProfiles,unsubscribeProfiles};
})();
