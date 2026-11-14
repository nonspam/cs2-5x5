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

test('profile editing keeps avatar media while cover media is repurposed for account wallpaper', () => {
  assert.ok(adapter.includes('const allowed={avatar_path:patch.avatar_path,cover_path:patch.cover_path}'));
  assert.ok(adapter.includes("if(!['avatar','cover'].includes(kind))"));
  assert.ok(adapter.includes('file.size>5*1024*1024'));
  assert.ok(adapter.includes("cleanPath.startsWith(user.id+'/')"));
  assert.ok(app.includes('canEditProfile'));
  assert.ok(app.includes('handleProfileImage'));
  assert.ok(app.includes('accountWallpaperFile'));
  assert.ok(app.includes("handleProfileImage('cover'"));
  assert.ok(app.includes('function applyAccountWallpaper'));
  assert.ok(!app.includes('profileCoverFile'));
  assert.doesNotMatch(app, /id=["']profileName/);
});

test('public player profiles are readable without login but only the linked player can edit media', () => {
  assert.ok(adapter.includes('client.auth.getSession()'));
  assert.ok(adapter.includes("client.from('player_profiles').select('player_id,avatar_path,cover_path,updated_at')"));
  assert.ok(app.includes('state.profileTargetId||state.myPlayerId'));
  assert.ok(app.includes('openPublicPlayerProfile'));
  assert.ok(account.includes('!state.myPlayerId&&!state.profileTargetId'));
});

test('profile match-history rows expose ELO changes and open the matching series card', () => {
  assert.ok(app.includes('deltaForMatch(id,q.m.match_id)'));
  assert.ok(app.includes('faceit-match-elo-delta'));
  assert.ok(app.includes('ELO Δ</th>'));
  assert.match(app, /class="profile-match-row click-row" onclick="openMatchDetail/);
  assert.doesNotMatch(app, /class="profile-match-row click-row onclick=/);
});

test('ordinary player accounts do not acquire administrator privileges', () => {
  assert.ok(account.includes('state.logged=!!state.cloudAdmin'));
  assert.ok(account.includes('state.cloudAdmin=await CS2Cloud.isAdmin()'));
  assert.ok(account.includes("if(!state.logged||!state.cloudAdmin)return"));
});


test('site wallpaper is a full viewport account-scoped layer rather than a profile cover hero', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'style_v57.css'), 'utf8');
  assert.match(app, /function accountWallpaperUrl\(\)/);
  assert.match(app, /document\.body\.style\.setProperty\('--account-wallpaper'/);
  assert.match(css, /body\.has-account-wallpaper:before\{[\s\S]*?position:fixed;inset:0/);
  assert.match(css, /background-size:cover;background-position:center;background-repeat:no-repeat/);
  assert.doesNotMatch(app, /profileCoverStyle|profileCoverUrl|profileCoverFile/);
});

test('Track fills and centers in the shared route content area while keeping compact panel rhythm', () => {
  const css = fs.readFileSync(path.join(__dirname, '..', 'style_v57.css'), 'utf8');
  assert.match(css, /\.track-page\{[\s\S]*?max-width:1480px!important;\s*margin:0 auto!important/);
  assert.match(css, /\.track-kpis article,\.track-chart-panel,\.track-matches-panel\{border-radius:6px\}/);
  assert.match(css, /\.track-chart-panel,\.track-matches-panel\{padding:14px;margin-top:10px\}/);
});
