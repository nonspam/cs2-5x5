const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('DEV frontend is hard-bound to the isolated DEV Supabase project', () => {
  const config = read('supabase-config.js');
  assert.match(config, /https:\/\/nwujudniysolpevbtggd\.supabase\.co/);
  assert.match(config, /sb_publishable_/);
  assert.doesNotMatch(config, /agetaoekkbhbmfmhxseu|service_role|SUPABASE_SERVICE_ROLE_KEY/i);
});

test('DEV entrypoint uses the V57 runtime and does not load the legacy runtime', () => {
  const html = read('index.html');
  assert.match(html, /app_v57\.js\?v=/);
  assert.match(html, /style_v57\.css\?v=/);
  assert.doesNotMatch(html, /src="app\.js/);
});

test('Edge Function authenticates bearer tokens and checks the DEV admin allow-list', () => {
  const edge = read('supabase/functions/cs2-admin/index.ts');
  assert.match(edge, /uc\.auth\.getUser\(\)/);
  assert.match(edge, /from\("app_admins"\)/);
  assert.match(edge, /async function authUser\(req:Request\)/);
  assert.match(edge, /const user=await authUser\(req\);if\(!user\)return json\(\{ok:false,error:"Unauthorized"\},401\)/);
});

test('public sign-in resolves aliases but still requires a real allow-listed admin account', () => {
  const edge = read('supabase/functions/cs2-admin/index.ts');
  assert.match(edge, /from\("app_login_aliases"\)/);
  assert.match(edge, /auth\.signInWithPassword\(\{email,password\}\)/);
  assert.match(edge, /from\("app_admins"\)/);
  assert.match(edge, /if\(admin\.error\|\|!admin\.data\)/);
});

test('admin commit validates state, limits operation batches, and uses versioned RPC', () => {
  const edge = read('supabase/functions/cs2-admin/index.ts');
  assert.match(edge, /ops\.length>100/);
  assert.match(edge, /validateBase\(next\)/);
  assert.match(edge, /expected_version/);
  assert.match(edge, /db\.rpc\("commit_cs2_state"/);
});

test('browser and Edge Function keep the critical archive safety guard in sync', () => {
  const adapter = read('supabase_adapter.js');
  const edge = read('supabase/functions/cs2-admin/index.ts');
  for (const source of [adapter, edge]) {
    assert.match(source, /player_ids/);
    assert.match(source, /knownTeam/);
    assert.match(source, /guest_players/);
    assert.match(source, /series_aggregate_stats/);
    assert.match(source, /raw_name/);
  }
});

test('browser and Edge Function expose the same supported admin operation families', () => {
  const adapter = read('supabase_adapter.js');
  const edge = read('supabase/functions/cs2-admin/index.ts');
  const kinds = [
    'delete_map', 'delete_match', 'delete_player',
    'player_patch', 'match_patch', 'map_patch'
  ];
  for (const kind of kinds) {
    assert.ok(adapter.includes(kind), 'browser adapter missing ' + kind);
    assert.ok(edge.includes(kind), 'Edge Function missing ' + kind);
  }
});


test('DEV player account is linked through the shared profile APIs and avatar UI', () => {
  const app = read('app_v57.js');
  const adapter = read('supabase_adapter.js');
  const html = read('index.html');
  assert.match(app, /function profilePage\(v\)/);
  assert.match(app, /CS2Cloud\.loadProfileContext\(\)/);
  assert.match(app, /profileAvatarMarkup\(/);
  assert.match(app, /handleProfileImage/);
  assert.match(adapter, /from\('my_player_account'\)/);
  assert.match(adapter, /from\('player_profiles'\)/);
  assert.match(adapter, /cs2-player-media/);
  assert.match(adapter, /subscribeProfiles/);
  assert.match(html, /app_v57\.js\?v=faceit-profile-/);
  assert.match(html, /supabase_adapter\.js\?v=faceit-profile-/);
  assert.match(app, /profileMatchesForPlayer\(/);
  assert.match(app, /faceit-form-dot/);
  assert.match(app, /accountMenuRoot/);
  assert.match(html, /accountMenuRoot/);

});
