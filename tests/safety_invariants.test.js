'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const browser = require('../validation.js');
const edge = require('../supabase/functions/cs2-admin/validation.js');
const app = read('app_v57.js');
const localLine = app.split(/\r?\n/).find(line => line.startsWith('function validateBase(b){'));
assert.ok(localLine, 'app-local validator must be present');
const validStat = n => (typeof n === 'number' || (typeof n === 'string' && n.trim() !== '')) && Number.isFinite(Number(n)) && Number(n) >= 0;
const local = vm.runInNewContext(localLine + '\nvalidateBase', { validStat }, { timeout: 2000 });

function fixture() {
  const stat = { player_id: 'p1', raw_name: 'Player', kills: 2, deaths: 3, assists: 1 };
  return {
    players: [{ player_id: 'p1', display_name: 'Player', is_active: true, status: 'active' }],
    aliases: {},
    maps: [{
      map_id: 'map_one', match_id: 'match_one', map_index: 1, map: 'mirage',
      score: { team_a: 13, team_b: 9 }, stats_available: true, player_stats: [stat]
    }],
    matches: [{
      match_id: 'match_one', source_kind: 'local_series', format: 'BO1',
      map_ids: ['map_one'], team_a: ['p1'], team_b: [], series_score: '1:0',
      played_at: null, series_aggregate_stats: [stat]
    }]
  };
}
const copy = x => JSON.parse(JSON.stringify(x));
const validators = [
  ['app', b => local(b)],
  ['browser', b => browser.validateBase(b).ok],
  ['edge', b => edge.validateBase(b).ok]
];
function allAgree(base, expected) {
  for (const [name, validate] of validators) {
    assert.equal(validate(base), expected, name + ' validator disagreement');
  }
}

test('incomplete team and 1-player stats are valid without invented players', () => allAgree(fixture(), true));
test('guest-only map without stat rows is valid', () => {
  const b = fixture();
  b.maps[0].stats_available = false;
  b.maps[0].player_stats = [];
  b.matches[0].series_aggregate_stats = [];
  b.matches[0].guest_players = [{ guest_id: 'guest_1', display_name: 'Guest', team: 'B' }];
  allAgree(b, true);
});
test('empty timestamp is tolerated for legacy history, not mistaken for a date', () => {
  const b = fixture();
  b.matches[0].played_at = '';
  allAgree(b, true);
});
test('missing, negative or blank kills are rejected instead of becoming zero', () => {
  for (const value of [null, '', -1, '  ']) {
    const b = fixture();
    b.maps[0].player_stats[0].kills = value;
    allAgree(b, false);
  }
});
test('overfull and duplicated player stats are rejected', () => {
  const b = fixture();
  b.maps[0].player_stats.push(copy(b.maps[0].player_stats[0]));
  allAgree(b, false);
  const c = fixture();
  for (let n = 2; n <= 11; n++) {
    const id = 'p' + n;
    c.players.push({player_id:id, display_name:id, is_active:true, status:'active'});
    c.maps[0].player_stats.push({ player_id:id, raw_name:id, kills:0, deaths:0, assists:0 });
  }
  allAgree(c, false);
});
test('missing player references invalidate match and map relationships', () => {
  const b = fixture();
  b.maps[0].match_id = 'missing';
  allAgree(b, false);
  const c = fixture();
  c.maps[0].player_stats[0].player_id = 'missing';
  allAgree(c, false);
});
test('server rejects inconsistent lifecycle status', () => {
  const b = fixture();
  b.players[0].is_active = false;
  assert.equal(edge.validateBase(b).ok, false);
  b.players[0].status = 'archived';
  assert.equal(edge.validateBase(b).ok, true);
});
test('versioned embedded and legacy local snapshots independently pass validation', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(read('data_embedded.js'), sandbox, { timeout: 3000 });
  const embedded = sandbox.window.CS2_EMBEDDED_DATA;
  assert.ok(embedded);
  allAgree(embedded, true);
  const legacy = {
    players: JSON.parse(read('data/players.json')).players,
    maps: JSON.parse(read('data/maps.json')).maps,
    matches: JSON.parse(read('data/matches.json')).matches,
    aliases: JSON.parse(read('data/aliases.json')).aliases
  };
  allAgree(legacy, true);
});
test('cloud backup downloads freshly fetched server state, not stale BASE', async () => {
  const a = app.indexOf('async function exportBackup(){');
  const b = app.indexOf('function importBackup(file){', a);
  assert.ok(a >= 0 && b > a, 'exportBackup must precede importBackup');
  const source = app.slice(a, b);
  const current = fixture(), remote = copy(current);
  remote.maps[0].player_stats[0].kills = 99;
  remote.cloud_version = 123;
  let exported = null, clicks = 0;
  const sandbox = {
    window: { CS2Cloud: { configured: true } },
    CS2Cloud: { load: async () => remote },
    state: { cloudMode: true },
    DB: current, BASE: current, Date,
    validateBase: b => browser.validateBase(b).ok,
    additions: () => [{ kind: 'stale' }],
    auditLog: () => [],
    Blob: class { constructor(parts) { this.parts = parts; } },
    document: { createElement: () => ({ click() { clicks++; } }) },
    URL: { createObjectURL(blob) { exported = JSON.parse(blob.parts[0]); return 'blob:example'; }, revokeObjectURL() {} },
    setTimeout() {},
    toast() {}
  };
  const fn = vm.runInNewContext(source + '\nexportBackup', sandbox, {timeout:2000});
  await fn();
  assert.equal(clicks, 1);
  assert.equal(exported.source, 'supabase');
  assert.equal(exported.cloud_version, 123);
  assert.equal(exported.base.maps[0].player_stats[0].kills, 99);
  assert.deepEqual(JSON.parse(JSON.stringify(exported.localStorage)), []);
});
test('cloud admin operations use Edge Function, not an unconditional direct browser write', () => {
  const adapter = read('supabase_adapter.js');
  assert.match(adapter, /client\.functions\.invoke\('cs2-admin'/);
  assert.match(adapter, /if\(e\.status!==404\)throw e/);
  assert.match(app, /if\(state\.cloudMode\)\{toast\('Импорт JSON/);
  assert.match(app, /series_stats_available:totals\.size>0/);
});
