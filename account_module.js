/* CS2 Analytics DEV — player account UI */
(function(){
  'use strict';
  let authMode='login';
  let pendingInviteCode='';
  let accountBusy=false;
  const $=selector=>document.querySelector(selector);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function closeAccountModal(){
    $('#accountAuthModal')?.remove();
    $('#accountInviteModal')?.remove();
  }

  function accountModalShell(title,body){
    $('#accountAuthModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',
      '<div class="modal-back account-auth-back" id="accountAuthModal">'+
        '<div class="modal panel wide account-auth-modal" role="dialog" aria-modal="true" aria-label="'+esc(title)+'">'+
          '<div class="modal-head"><div><div class="eyebrow">CS2 · ЛИЧНЫЙ КАБИНЕТ</div><h2>'+esc(title)+'</h2></div>'+
          '<button class="close" type="button" data-account-close aria-label="Закрыть">×</button></div>'+
          '<div class="account-auth-content">'+body+'</div>'+
        '</div>'+
      '</div>');
    $('#accountAuthModal')?.addEventListener('click',event=>{if(event.target.id==='accountAuthModal')closeAccountModal()});
    $('[data-account-close]')?.addEventListener('click',closeAccountModal);
  }

  function accountError(message){
    const el=$('#accountAuthError');
    if(el){el.textContent=String(message||'Не удалось выполнить действие');el.hidden=false}
  }

  function accountNotice(message){
    const el=$('#accountAuthNotice');
    if(el){el.textContent=String(message||'');el.hidden=!message}
  }

  function renderAccountAuth(message='',error=''){
    const user=state.accountUser||null;
    const playerId=state.myPlayerId||null;
    const p=playerId?player(playerId):null;
    let body='';

    if(user&&playerId){
      const email=user.email||'';
      body='<div class="account-auth-linked">'+
        '<div class="account-auth-linked-mark">✓</div>'+
        '<h3>Аккаунт подключён</h3>'+
        '<p class="muted">'+esc(p?.display_name||playerId)+' · '+esc(email)+'</p>'+
        '<div class="account-auth-actions">'+
          '<button class="btn primary" type="button" id="accountOpenProfile">МОЙ ПРОФИЛЬ</button>'+
          '<button class="btn" type="button" id="accountSignOutBtn">ВЫЙТИ</button>'+
        '</div></div>';
    }else if(user){
      body='<div class="account-auth-copy"><h3>Привязать игровой профиль</h3>'+
        '<p class="muted">Аккаунт создан. Введи одноразовый код приглашения от администратора, чтобы связать его с твоим игровым профилем.</p></div>'+
        '<form id="accountClaimForm" class="account-auth-form">'+
          '<div class="field"><label for="accountInviteCode">КОД ПРИГЛАШЕНИЯ</label><input id="accountInviteCode" class="control" autocomplete="one-time-code" maxlength="128" value="'+esc(pendingInviteCode)+'" placeholder="Вставь код приглашения" required></div>'+
          '<div class="account-auth-error" id="accountAuthError" role="alert" hidden></div>'+
          '<div class="account-auth-notice" id="accountAuthNotice" role="status" hidden></div>'+
          '<button class="btn primary" type="submit">ПРИВЯЗАТЬ ПРОФИЛЬ</button>'+
        '</form>'+
        '<div class="account-auth-foot"><span>'+esc(user.email||'')+'</span><button class="btn mini" type="button" id="accountSignOutBtn">Выйти</button></div>';
    }else{
      const isRegister=authMode==='register';
      body='<div class="account-auth-tabs">'+
        '<button type="button" data-auth-mode="login" class="'+(!isRegister?'active':'')+'">ВХОД</button>'+
        '<button type="button" data-auth-mode="register" class="'+(isRegister?'active':'')+'">СОЗДАТЬ АККАУНТ</button>'+
      '</div>'+
      '<p class="muted account-auth-intro">'+(isRegister?'Регистрация доступна по персональному приглашению администратора.':'Войди в свой аккаунт, чтобы открыть личный профиль и статистику.')+'</p>'+
      '<form id="accountAuthForm" class="account-auth-form">'+
        '<div class="field"><label for="accountEmail">ЭЛЕКТРОННАЯ ПОЧТА</label><input id="accountEmail" class="control" type="email" autocomplete="email" maxlength="254" placeholder="name@example.com" required></div>'+
        '<div class="field"><label for="accountPassword">ПАРОЛЬ</label><input id="accountPassword" class="control" type="password" autocomplete="'+(isRegister?'new-password':'current-password')+'" minlength="'+(isRegister?'8':'1')+'" maxlength="128" placeholder="'+(isRegister?'Не менее 8 символов':'Твой пароль')+'" required></div>'+
        (isRegister?'<div class="field"><label for="accountPasswordConfirm">ПОВТОРИ ПАРОЛЬ</label><input id="accountPasswordConfirm" class="control" type="password" autocomplete="new-password" minlength="8" maxlength="128" placeholder="Повтори пароль" required></div>'+
          '<div class="field"><label for="accountInviteCode">КОД ПРИГЛАШЕНИЯ</label><input id="accountInviteCode" class="control" autocomplete="one-time-code" maxlength="128" value="'+esc(pendingInviteCode)+'" placeholder="Персональный код от администратора" required></div>':'')+
        '<div class="account-auth-error" id="accountAuthError" role="alert" hidden></div>'+
        '<div class="account-auth-notice" id="accountAuthNotice" role="status" hidden></div>'+
        '<button class="btn primary" type="submit" id="accountAuthSubmit">'+(isRegister?'СОЗДАТЬ АККАУНТ':'ВОЙТИ')+'</button>'+
        (isRegister?'':'<button class="account-auth-forgot" type="button" id="accountForgotPassword">Забыли пароль?</button>')+
      '</form>'+
      '<div class="account-auth-foot">Только приглашённые участники · аккаунт привязывается к одному игровому профилю</div>';
    }

    accountModalShell(user&&playerId?'Мой аккаунт':user?'Завершение регистрации':'Аккаунт игрока',body);
    if(message)accountNotice(message);
    if(error)accountError(error);

    document.querySelectorAll('[data-auth-mode]').forEach(button=>button.addEventListener('click',()=>{
      authMode=button.dataset.authMode||'login';
      renderAccountAuth();
    }));

    $('#accountAuthForm')?.addEventListener('submit',submitAccountAuth);
    $('#accountClaimForm')?.addEventListener('submit',submitClaimInvite);
    $('#accountForgotPassword')?.addEventListener('click',sendPasswordReset);
    $('#accountOpenProfile')?.addEventListener('click',()=>{
      closeAccountModal();state.tab='profile';state.profileSection='overview';render();
    });
    $('#accountSignOutBtn')?.addEventListener('click',signOutAccount);
  }

  async function refreshAccountContext(){
    const context=await CS2Cloud.loadProfileContext();
    state.accountUser=context.user||null;
    state.myPlayerId=context.playerId||null;
    state.profileRows=context.profiles||[];
    state.myProfile=state.profileRows.find(row=>row.player_id===state.myPlayerId)||null;
    try{state.cloudAdmin=await CS2Cloud.isAdmin()}catch{state.cloudAdmin=false}
    state.logged=!!state.cloudAdmin;
    render();
  }

  async function submitAccountAuth(event){
    event.preventDefault();
    if(accountBusy)return;
    const email=$('#accountEmail')?.value.trim()||'';
    const password=$('#accountPassword')?.value||'';
    const isRegister=authMode==='register';
    const code=$('#accountInviteCode')?.value.trim()||'';
    if(isRegister&&password!==($('#accountPasswordConfirm')?.value||'')){
      accountError('Пароли не совпадают');return;
    }
    if(isRegister&&!code){accountError('Нужен персональный код приглашения');return;}
    accountBusy=true;
    const submit=$('#accountAuthSubmit');
    if(submit){submit.disabled=true;submit.textContent=isRegister?'СОЗДАЮ АККАУНТ…':'ВХОЖУ…'}
    try{
      if(isRegister){
        const data=await CS2Cloud.signUpAccount(email,password);
        pendingInviteCode=code;
        if(data.session&&data.user){
          state.accountUser=data.user;
          await CS2Cloud.claimPlayerAccountInvite(code);
          pendingInviteCode='';
          await refreshAccountContext();
          closeAccountModal();
          toast('Аккаунт создан и игровой профиль привязан');
        }else{
          authMode='login';
          renderAccountAuth('Аккаунт создан. Подтверди электронную почту по письму от Supabase, затем войди. Код приглашения останется в этом окне.');
          if($('#accountEmail'))$('#accountEmail').value=email;
        }
      }else{
        const data=await CS2Cloud.signInAccount(email,password);
        state.accountUser=data.user||null;
        const codeToClaim=code||pendingInviteCode;
        if(codeToClaim){
          await CS2Cloud.claimPlayerAccountInvite(codeToClaim);
          pendingInviteCode='';
        }
        await refreshAccountContext();
        if(state.myPlayerId){
          closeAccountModal();
          toast('Вход выполнен');
        }else{
          renderAccountAuth(codeToClaim?'Профиль привязан.':'Вход выполнен. Теперь введи персональный код приглашения.');
        }
      }
    }catch(error){
      if(state.accountUser&&!state.myPlayerId){
        renderAccountAuth('',error?.message||'Не удалось выполнить действие');
      }else{
        accountError(error?.message||'Не удалось выполнить действие');
        if(submit){submit.disabled=false;submit.textContent=isRegister?'СОЗДАТЬ АККАУНТ':'ВОЙТИ'}
      }
    }finally{accountBusy=false}
  }

  async function sendPasswordReset(){
    const email=$('#accountEmail')?.value.trim()||'';
    if(!email){accountError('Сначала введи электронную почту');return}
    const button=$('#accountForgotPassword');
    if(button){button.disabled=true;button.textContent='ОТПРАВЛЯЮ…'}
    try{
      await CS2Cloud.sendAccountPasswordReset(email);
      accountNotice('Если аккаунт с такой почтой существует, письмо для сброса пароля отправлено. Открой ссылку из письма на этом DEV-сайте.');
    }catch(error){
      accountError(error?.message||'Не удалось отправить письмо для сброса пароля');
    }finally{if(button){button.disabled=false;button.textContent='Забыли пароль?'}}
  }

  function renderPasswordRecovery(){
    const body='<p class="muted">Придумай новый пароль длиной не менее 8 символов.</p>'+
      '<form id="accountPasswordRecoveryForm" class="account-auth-form">'+
        '<div class="field"><label for="accountNewPassword">НОВЫЙ ПАРОЛЬ</label><input id="accountNewPassword" class="control" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></div>'+
        '<div class="field"><label for="accountNewPasswordConfirm">ПОВТОРИ ПАРОЛЬ</label><input id="accountNewPasswordConfirm" class="control" type="password" autocomplete="new-password" minlength="8" maxlength="128" required></div>'+
        '<div class="account-auth-error" id="accountAuthError" role="alert" hidden></div>'+
        '<button class="btn primary" type="submit">СОХРАНИТЬ НОВЫЙ ПАРОЛЬ</button>'+
      '</form>';
    accountModalShell('Восстановление пароля',body);
    $('#accountPasswordRecoveryForm')?.addEventListener('submit',async event=>{
      event.preventDefault();
      const password=$('#accountNewPassword')?.value||'';
      if(password!==($('#accountNewPasswordConfirm')?.value||'')){accountError('Пароли не совпадают');return}
      const button=$('#accountPasswordRecoveryForm button[type="submit"]');
      if(button){button.disabled=true;button.textContent='СОХРАНЯЮ…'}
      try{
        await CS2Cloud.updateAccountPassword(password);
        closeAccountModal();
        toast('Пароль успешно изменён');
        await refreshAccountContext();
      }catch(error){
        accountError(error?.message||'Не удалось изменить пароль');
        if(button){button.disabled=false;button.textContent='СОХРАНИТЬ НОВЫЙ ПАРОЛЬ'}
      }
    });
  }

  async function submitClaimInvite(event){
    event.preventDefault();
    if(accountBusy)return;
    const code=$('#accountInviteCode')?.value.trim()||'';
    if(!code){accountError('Введи код приглашения');return}
    accountBusy=true;
    const button=$('#accountClaimForm button[type="submit"]');
    if(button){button.disabled=true;button.textContent='ПРИВЯЗЫВАЮ…'}
    try{
      await CS2Cloud.claimPlayerAccountInvite(code);
      pendingInviteCode='';
      await refreshAccountContext();
      closeAccountModal();
      toast('Игровой профиль успешно привязан');
    }catch(error){
      accountError(error?.message||'Не удалось привязать профиль');
      if(button){button.disabled=false;button.textContent='ПРИВЯЗАТЬ ПРОФИЛЬ'}
    }finally{accountBusy=false}
  }

  async function signOutAccount(){
    if(accountBusy)return;
    accountBusy=true;
    try{
      await CS2Cloud.signOut();
      state.myPlayerId=null;state.accountUser=null;state.myProfile=null;state.profileRows=[];
      state.accountMenuOpen=false;state.logged=false;state.cloudAdmin=false;state.tab='home';
      closeAccountModal();render();toast('Вы вышли из аккаунта');
    }catch(error){accountError(error?.message||'Не удалось выйти')}
    finally{accountBusy=false}
  }

  function openAccountAuth(mode){
    authMode=mode||((state.accountUser&&!state.myPlayerId)?'link':'login');
    renderAccountAuth();
  }

  function renderAccountMenu(){
    const root=$('#accountMenuRoot');
    if(!root)return;
    const id=state.myPlayerId;
    const avatar=id?profileAvatarMarkup(id,'sm'):'♙';
    const label=state.accountUser?(id?playerName(id):'Аккаунт'): 'Войти в аккаунт';
    root.innerHTML='<button class="account-menu-trigger" type="button" aria-label="Аккаунт" title="'+esc(label)+'">'+avatar+'</button>';
    root.querySelector('button')?.addEventListener('click',()=>openAccountAuth());
  }

  async function openInviteManager(){
    $('#accountInviteModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',
      '<div class="modal-back account-auth-back" id="accountInviteModal"><div class="modal panel wide account-auth-modal" role="dialog" aria-modal="true" aria-label="Приглашения">'+
      '<div class="modal-head"><div><div class="eyebrow">УПРАВЛЕНИЕ АККАУНТАМИ</div><h2>Пригласить игрока</h2></div><button class="close" type="button" id="accountInviteClose">×</button></div>'+
      '<div class="account-auth-content"><p class="muted">Создай одноразовый код для выбранного игрока. Код действует 7 дней и может быть использован только один раз.</p>'+
      '<form id="accountInviteForm" class="account-auth-form"><div class="field"><label for="accountInvitePlayer">ИГРОК БЕЗ АККАУНТА</label><select class="control" id="accountInvitePlayer" required><option value="">Загрузка игроков…</option></select></div>'+
      '<div class="account-auth-error" id="accountInviteError" role="alert" hidden></div><button class="btn primary" id="accountInviteCreate" type="submit">СОЗДАТЬ ПРИГЛАШЕНИЕ</button></form>'+
      '<div id="accountInviteResult" class="account-invite-result" hidden></div></div></div></div>');
    $('#accountInviteModal')?.addEventListener('click',event=>{if(event.target.id==='accountInviteModal')$('#accountInviteModal')?.remove()});
    $('#accountInviteClose')?.addEventListener('click',()=>$('#accountInviteModal')?.remove());
    try{
      const players=await CS2Cloud.listUnlinkedPlayers();
      const select=$('#accountInvitePlayer');
      if(select)select.innerHTML='<option value="">Выбери игрока</option>'+players.map(row=>'<option value="'+esc(row.player_id)+'">'+esc(row.display_name)+' · '+esc(row.player_id)+'</option>').join('');
      if(!players.length&&select)select.innerHTML='<option value="">Все активные игроки уже привязаны</option>';
    }catch(error){
      const el=$('#accountInviteError');if(el){el.textContent=error?.message||'Не удалось загрузить список игроков';el.hidden=false}
    }
    $('#accountInviteForm')?.addEventListener('submit',async event=>{
      event.preventDefault();
      const playerId=$('#accountInvitePlayer')?.value||'';
      if(!playerId)return;
      const button=$('#accountInviteCreate'),errorBox=$('#accountInviteError'),result=$('#accountInviteResult');
      if(button){button.disabled=true;button.textContent='СОЗДАЮ…'}
      if(errorBox)errorBox.hidden=true;
      if(result)result.hidden=true;
      try{
        const invite=await CS2Cloud.createPlayerAccountInvite(playerId);
        const code=invite?.invite_token||'';
        if(!code)throw Error('Сервер не вернул код приглашения');
        if(result){
          result.innerHTML='<span class="eyebrow">ОДНОРАЗОВЫЙ КОД</span><input class="control account-invite-code" id="accountInviteGeneratedCode" readonly value="'+esc(code)+'">'+
            '<div class="account-invite-meta">Игрок: '+esc(invite.player_id)+' · действует до '+esc(new Date(invite.expires_at).toLocaleString('ru-RU'))+'</div>'+
            '<button class="btn" type="button" id="accountInviteCopy">СКОПИРОВАТЬ КОД</button>';
          result.hidden=false;
          $('#accountInviteCopy')?.addEventListener('click',async()=>{
            try{await navigator.clipboard.writeText(code);$('#accountInviteCopy').textContent='СКОПИРОВАНО'}catch{$('#accountInviteGeneratedCode')?.select();$('#accountInviteCopy').textContent='ВЫДЕЛИ И СКОПИРУЙ'}
          });
        }
        if(select){[...select.options].find(option=>option.value===playerId)?.remove();select.value=''}
        toast('Приглашение создано');
      }catch(error){
        if(errorBox){errorBox.textContent=error?.message||'Не удалось создать приглашение';errorBox.hidden=false}
      }finally{if(button){button.disabled=false;button.textContent='СОЗДАТЬ ПРИГЛАШЕНИЕ'}}
    });
  }

  const originalProfilePage=profilePage;
  profilePage=function(view){
    if(!state.myPlayerId){
      view.innerHTML='<section class="section"><div class="panel card account-unlinked-card"><div class="eyebrow">ЛИЧНЫЙ КАБИНЕТ</div><h2>'+(state.accountUser?'Игровой профиль ещё не привязан':'Войди в аккаунт')+'</h2><p class="muted">'+(state.accountUser?'Для доступа к личной статистике введи персональный код приглашения.':'Авторизуйся, чтобы открыть личный профиль и историю матчей.')+'</p><button class="btn primary" type="button" id="accountProfileAction">'+(state.accountUser?'ПРИВЯЗАТЬ ИГРОВОЙ ПРОФИЛЬ':'ВОЙТИ / СОЗДАТЬ АККАУНТ')+'</button></div></section>';
      $('#accountProfileAction')?.addEventListener('click',()=>openAccountAuth());
      return;
    }
    originalProfilePage(view);
  };

  const originalSettings=settings;
  settings=function(view){
    originalSettings(view);
    if(!state.logged||!state.cloudAdmin)return;
    const toolbar=view.querySelector('.grid2 .panel:first-child .toolbar');
    if(!toolbar||toolbar.querySelector('[data-account-invites]'))return;
    const button=document.createElement('button');
    button.className='btn';
    button.type='button';
    button.dataset.accountInvites='1';
    button.textContent='АККАУНТЫ / ПРИГЛАШЕНИЯ';
    button.addEventListener('click',openInviteManager);
    toolbar.appendChild(button);
  };

  CS2Cloud.onAuthStateChange?.((event)=>{
    if(event==='PASSWORD_RECOVERY')renderPasswordRecovery();
  });

  renderAccountMenu=renderAccountMenu;
  accountSignOut=signOutAccount;
  window.openAccountAuth=openAccountAuth;
  window.openInviteManager=openInviteManager;
  window.renderAccountMenu=renderAccountMenu;
  window.accountSignOut=signOutAccount;
})();