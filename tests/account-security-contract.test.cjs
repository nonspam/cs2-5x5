const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const inviteMigration = read('supabase/migrations/20261110204350_player_account_invites_and_self_service_linking.sql');
const activeGuardMigration = read('supabase/migrations/20261110204818_validate_active_player_on_account_claim.sql');
const privateMigration = read('supabase/migrations/20261110211414_move_player_account_helpers_to_private_schema.sql');
const adapter = read('supabase_adapter.js');
const account = read('account_module.js');

test('player invitations persist only a SHA-256 hash of a cryptographically random token', () => {
  assert.match(inviteMigration, /gen_random_bytes\(18\)/);
  assert.match(inviteMigration, /digest\(convert_to\(v_token, 'UTF8'\), 'sha256'\)/);
  assert.match(inviteMigration, /token_hash text not null unique check \(token_hash ~ '\^\[0-9a-f\]\{64\}\$'\)/);
  assert.doesNotMatch(inviteMigration, /token\s+text\s+not null\s*,/i);
});

test('invite creation is admin-only and limited to active players with a public profile row', () => {
  assert.match(inviteMigration, /v_user is null or not public\.is_cs2_admin\(\)/);
  assert.match(inviteMigration, /p\.value->>'status' = 'active'/);
  assert.match(inviteMigration, /coalesce\(\(p\.value->>'is_active'\)::boolean, false\) = true/);
  assert.match(inviteMigration, /exists\s*\(\s*select 1 from public\.player_profiles pp\s*where pp\.player_id = p_player_id/s);
  assert.match(inviteMigration, /v_expires timestamptz := now\(\) \+ interval '7 days'/);
});

test('claim is authenticated, expiry-aware, single-use, and row-locked', () => {
  assert.match(inviteMigration, /if v_user is null then/);
  assert.match(inviteMigration, /i\.claimed_at is null/);
  assert.match(inviteMigration, /i\.revoked_at is null/);
  assert.match(inviteMigration, /i\.expires_at > now\(\)/);
  assert.match(inviteMigration, /for update;/i);
  assert.match(inviteMigration, /insert into private\.player_account_links\(auth_user_id, player_id\)/);
  assert.match(inviteMigration, /set claimed_by = v_user, claimed_at = now\(\)/);
});

test('claim revalidates that the player is still active and has a profile at redemption time', () => {
  assert.match(activeGuardMigration, /player is no longer active/i);
  assert.match(activeGuardMigration, /p\.value->>'status' = 'active'/);
  assert.match(activeGuardMigration, /coalesce\(\(p\.value->>'is_active'\)::boolean, false\) = true/);
  assert.match(activeGuardMigration, /exists\s*\(\s*select 1 from public\.player_profiles pp\s*where pp\.player_id = v_player_id/s);
});

test('public account RPC wrappers are invoker functions and private implementations are hardened', () => {
  for (const name of ['list_unlinked_players_impl', 'create_player_account_invite_impl', 'claim_player_account_invite_impl']) {
    const start = privateMigration.indexOf('function private.' + name);
    assert.notEqual(start, -1, name + ' implementation exists');
    const body = privateMigration.slice(start, privateMigration.indexOf('$$;', start) + 3);
    assert.match(body, /security definer/i, name + ' is SECURITY DEFINER');
    assert.match(body, /set search_path = ''/i, name + ' has an empty search_path');
  }
  for (const name of ['list_unlinked_players', 'create_player_account_invite', 'claim_player_account_invite']) {
    const start = privateMigration.indexOf('function public.' + name);
    assert.notEqual(start, -1, name + ' wrapper exists');
    const body = privateMigration.slice(start, privateMigration.indexOf('$$;', start) + 3);
    assert.match(body, /security invoker/i, name + ' wrapper is SECURITY INVOKER');
  }
});

test('account context reads the current user's linked player through the guarded view and claim RPC', () => {
  assert.match(adapter, /client\.from\('my_player_account'\)\.select\('player_id'\)\.maybeSingle\(\)/);
  assert.match(adapter, /client\.rpc\('claim_player_account_invite'/);
  assert.match(adapter, /client\.from\('player_profiles'\)\.select\('player_id,avatar_path,cover_path,updated_at'\)/);
});

test('profile media upload is authenticated, size/type limited, and namespaced to the current user', () => {
  assert.match(adapter, /\['avatar','cover'\]\.includes\(kind\)/);
  assert.match(adapter, /image\/jpeg.*image\/png.*image\/webp.*image\/gif/);
  assert.match(adapter, /file\.size>5\*1024\*1024/);
  assert.match(adapter, /const path=user\.id\+'\/'\+kind/);
  assert.match(adapter, /cleanPath\.startsWith\(user\.id\+'\/'\)/);
});

test('password reset response does not disclose whether an email exists', () => {
  assert.match(account, /Если аккаунт с такой почтой существует, письмо для сброса пароля отправлено/);
  assert.match(adapter, /client\.auth\.resetPasswordForEmail\(cleanEmail/);
  assert.match(adapter, /current_password/);
});
