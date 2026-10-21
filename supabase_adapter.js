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
  async function signIn(login,password){if(!configured)throw Error('Supabase не настроен');let email=String(login||'').trim();if(!email)throw Error('Введите логин');if(!email.includes('@'))throw Error('Для безопасного входа укажи email администратора.')const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;if(!data.session)throw Error('Сессия не создана');if(!(await isAdmin())){await client.auth.signOut();throw Error('Этот аккаунт не добавлен как администратор сайта.')}return data}
  async function signOut(){if(configured)await client.auth.signOut()}
  function scheduleRealtimeRetry(){if(!configured||realtimeRetryTimer)return;realtimeRetryTimer=setTimeout(()=>{realtimeRetryTimer=null;if(realtimeCallback&&!channel)subscribe(realtimeCallback)},3000)}
  function subscribe(onChange){if(!configured)return;realtimeCallback=onChange;if(channel)return;channel=client.channel('cs2-app-state-live').on('postgres_changes',{event:'UPDATE',schema:'public',table:'cs2_app_state',filter:'id=eq.1'},p=>realtimeCallback?.(p)).subscribe(status=>{if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){if(channel){client.removeChannel(channel);channel=null}scheduleRealtimeRetry()}})}
  function unsubscribe(){if(realtimeRetryTimer){clearTimeout(realtimeRetryTimer);realtimeRetryTimer=null}realtimeCallback=null;if(channel&&client){client.removeChannel(channel);channel=null}}
  function applyOp(s,op){const k=op?.kind;if(k==='map')s.maps.push(op.map);else if(k==='match')s.matches.push(op.match);else if(k==='player')s.players.push(op.player);else if(k==='aliases')Object.assign(s.aliases,op.aliases||{});else if(k==='delete_map')s.maps=s.maps.filter(x=>x?.map_id!==op.map_id);else if(k==='delete_match')s.matches=s.matches.filter(x=>x?.match_id!==op.match_id);else if(k==='delete_player'){s.players=s.players.filter(x=>x?.player_id!==op.player_id);for(const [a,pid] of Object.entries(s.aliases||{}))if(pid===op.player_id)delete s.aliases[a]}else if(['player_patch','match_patch','map_patch'].includes(k)){const key={player_patch:'players',match_patch:'matches',map_patch:'maps'}[k];const idkey={player_patch:'player_id',match_patch:'match_id',map_patch:'map_id'}[k];const row=s[key].find(x=>x?.[idkey]===op[idkey]);if(!row)throw Error('Объект не найден: '+k);Object.assign(row,op.patch||{})}else throw Error('Неизвестная операция')}
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
      // Mutations go through server-side validation and authorization.
      // The browser no longer submits an entire JSONB state to a privileged RPC.
      const operationId='web_'+Date.now()+'_'+Math.random().toString(36).slice(2,10);
      const {data,error}=await client.functions.invoke('cs2-admin',{
        body:{action:'commit',operations:ops,expected_version:Number(row.version),operation_id:operationId,audit:entry?{action:entry.action,target:entry.target,detail:entry.detail}:null}
      });
      if(error){
        let detail='';
        try{detail=(await error.context?.json?.())?.error||''}catch{}
        throw Error(detail||error.message||'Не удалось записать изменения');
      }
      if(!data?.ok||!Number.isInteger(Number(data.version)))throw Error(data?.error||'Некорректный ответ облака');
      return {version:data.version,updated_at:data.updated_at,state:data.state};
    });
    commitQueue=task.catch(()=>{});
    return task;
  }
  window.CS2Cloud={configured,load,isAdmin,signIn,signOut,subscribe,unsubscribe,commit};
})();
