const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const app = read('app_v57.js');
const adapter = read('supabase_adapter.js');
const account = read('account_module.js');

test('account registration and login use Supabase Auth with invite-only player linking', () => {
  assert.ok(adapter.includes('client.auth.signUp('));
  assert.ok(adapter.includes('client.auth.signInWithPassword('));
  assert.ok(adapter.includes("client.rpc('claim_player_account_invite'"));
  assert.ok(account.includes("if(isRegister&&!code)"));
  assert.ok(account.includes('pendingInviteEmail=email.toLowerCase()'));
});

test('password recovery and password changes are supported with reauthentication', () => {
  assert.ok(adapter.includes('client.auth.resetPasswordForEmail('));
  assert.ok(adapter.includes('client.auth.updateUser(updatePayload)'));
  assert.ok(adapter.includes('if(currentPassword!==null&&currentPassword!==undefined)updatePayload.current_password=String(currentPassword)'));
  assert.ok(account.includes('accountCurrentPassword'));
  assert.ok(account.includes('CS2Cloud.updateAccountPassword(password,currentPassword)'));
  assert.ok(account.includes('CS2Cloud.updateAccountPassword(password);'));
});

test('profile editing is restricted to avatar and cover media without player-name editing', () => {
  assert.ok(adapter.includes('const allowed={avatar_path:patch.avatar_path,cover_path:patch.cover_path}'));
  assert.ok(adapter.includes("if(!['avatar','cover'].includes(kind))"));
  assert.ok(adapter.includes('file.size>5*1024*1024'));
  assert.ok(adapter.includes("cleanPath.startsWith(user.id+'/')"));
  assert.ok(app.includes('canEditProfile'));
  assert.ok(app.includes('handleProfileImage'));
  assert.ok(app.includes('profileCoverFile'));
  assert.doesNotMatch(app, /id=["']profileName/);
});

test('public player profiles are readable without login but only the linked player can edit media', () => {
  assert.ok(adapter.includes('client.auth.getSession()'));
  assert.ok(adapter.includes("client.from('player_profiles').select('player_id,avatar_path,cover_path,updated_at')"));
  assert.ok(app.includes('state.profileTargetId||state.myPlayerId'));
  assert.ok(app.includes('openPublicPlayerProfile'));
  assert.ok(account.includes('!state.myPlayerId&&!state.profileTargetId'));
});

test('profile match-history rows open the matching series card', () => {
  assert.match(app, /class="profile-match-row click-row" onclick="openMatchDetail/);
  assert.doesNotMatch(app, /class="profile-match-row click-row onclick=/);
});

test('ordinary player accounts do not acquire administrator privileges', () => {
  assert.ok(account.includes('state.logged=!!state.cloudAdmin'));
  assert.ok(account.includes('state.cloudAdmin=await CS2Cloud.isAdmin()'));
  assert.ok(account.includes("if(!state.logged||!state.cloudAdmin)return"));
});
