const test = require('node:test');
const assert = require('node:assert/strict');
const { validateBase, assertBase } = require('../validation.js');
const { validateBase: validateEdgeBase } = require('../supabase/functions/cs2-admin/validation.js');

function makeBase({ format = 'BO1', mapCount = 1, stats = [], teamA = ['p1', 'p2', 'p3', 'p4', 'p5'], teamB = ['p6', 'p7', 'p8', 'p9', 'p10'] } = {}) {
  const players = Array.from({ length: 10 }, (_, i) => ({ player_id: `p${i + 1}`, name: `Player ${i + 1}` }));
  const match_id = 'match_test';
  const map_ids = Array.from({ length: mapCount }, (_, i) => `map_${i + 1}`);
  return {
    players,
    aliases: {},
    matches: [{ match_id, format, map_ids, team_a: teamA, team_b: teamB }],
    maps: map_ids.map((map_id, i) => ({
      map_id, match_id, map_index: i + 1, map: 'mirage',
      stats_available: stats.length > 0,
      player_stats: stats.map(row => ({ ...row }))
    }))
  };
}

test('accepts valid BO1, BO3 and BO5 structures', () => {
  for (const [format, mapCount] of [['BO1', 1], ['BO3', 2], ['BO3', 3], ['BO5', 3], ['BO5', 5]]) {
    const result = validateBase(makeBase({ format, mapCount }));
    assert.equal(result.ok, true, `${format}/${mapCount}: ${result.error || 'unexpected failure'}`);
  }
});

test('rejects format/map-count mismatches', () => {
  for (const [format, mapCount] of [['BO1', 2], ['BO3', 1], ['BO3', 4], ['BO5', 2], ['BO5', 6]]) {
    assert.equal(validateBase(makeBase({ format, mapCount })).ok, false, `${format}/${mapCount} should fail`);
  }
});

test('allows incomplete team rosters without inventing players', () => {
  const result = validateBase(makeBase({ teamA: ['p1', 'p2'], teamB: ['p3'] }));
  assert.equal(result.ok, true, result.error);
});

test('allows guest stats with a raw name and no linked player id', () => {
  const result = validateBase(makeBase({
    stats: [{ kills: 12, deaths: 9, assists: 4, raw_name: 'Guest-123', player_id: null }]
  }));
  assert.equal(result.ok, true, result.error);
});

test('rejects duplicate stat rows for the same player on a map', () => {
  const row = { kills: 12, deaths: 9, assists: 4, raw_name: 'Player 1', player_id: 'p1' };
  const result = validateBase(makeBase({ stats: [row, row] }));
  assert.equal(result.ok, false);
  assert.match(result.error, /duplicate player stats/);
});

test('rejects orphan maps and broken aliases', () => {
  const orphan = makeBase();
  orphan.maps.push({ map_id: 'orphan', match_id: 'missing', map_index: 1, stats_available: false, player_stats: [] });
  assert.match(validateBase(orphan).error, /orphan map/);

  const badAlias = makeBase();
  badAlias.aliases = { 'typo': 'player_that_does_not_exist' };
  assert.match(validateBase(badAlias).error, /invalid alias mapping/);
});

test('assertBase throws for invalid state instead of silently accepting it', () => {
  assert.throws(() => assertBase(makeBase({ format: 'BO1', mapCount: 2 })), /BO1 must have one map/);
});

test('rejects negative KDA values on maps and series', () => {
  const mapNegative = makeBase({
    stats: [{ kills: -1, deaths: 1, assists: 0, raw_name: 'Guest-123', player_id: null }]
  });
  assert.equal(validateBase(mapNegative).ok, false);
  assert.match(validateBase(mapNegative).error, /invalid KDA/);

  const seriesNegative = makeBase();
  seriesNegative.matches[0].series_aggregate_stats = Array.from({ length: 10 }, (_, i) => ({
    player_id: `p${i + 1}`,
    kills: i === 0 ? -1 : 1,
    deaths: 1,
    assists: 0
  }));
  assert.equal(validateBase(seriesNegative).ok, false);
  assert.match(validateBase(seriesNegative).error, /invalid series KDA/);
});

test('rejects non-finite KDA values', () => {
  const result = validateBase(makeBase({
    stats: [{ kills: 'NaN', deaths: 1, assists: 0, raw_name: 'Guest-123', player_id: null }]
  }));
  assert.equal(result.ok, false);
  assert.match(result.error, /invalid KDA/);
});

test('rejects invalid map ordering within a match', () => {
  const base = makeBase({ format: 'BO3', mapCount: 2 });
  base.maps[1].map_index = 1;
  assert.equal(validateBase(base).ok, false);
  assert.match(validateBase(base).error, /match\/map relation invalid/);
});

test('rejects reusing a map in multiple matches', () => {
  const base = makeBase();
  base.matches.push({
    match_id: 'match_other',
    format: 'BO1',
    map_ids: ['map_1'],
    team_a: [],
    team_b: []
  });
  assert.match(validateBase(base).error, /map belongs to multiple matches/);
});

test('rejects duplicate player IDs', () => {
  const base = makeBase();
  base.players.push({ player_id: 'p1', name: 'Duplicate Player' });
  assert.match(validateBase(base).error, /duplicate\/invalid id/);
});

test('rejects malformed series aggregate statistics', () => {
  const base = makeBase();
  base.matches[0].series_aggregate_stats = Array.from({ length: 11 }, (_, i) => ({
    player_id: `p${i + 1}`,
    kills: 1,
    deaths: 1,
    assists: 0
  }));
  assert.match(validateBase(base).error, /series aggregate cannot exceed 10 rows/);
});

test('rejects unlinked guest rows without a raw name instead of silently collapsing them', () => {
  const base = makeBase({ stats: [{ kills: 5, deaths: 4, assists: 2, player_id: null, raw_name: '  ' }] });
  assert.match(validateBase(base).error, /guest stat missing raw_name/);
});

test('guest names are compared case-insensitively when checking duplicate rows', () => {
  const base = makeBase({ stats: [
    { kills: 5, deaths: 4, assists: 2, player_id: null, raw_name: 'GuestOne' },
    { kills: 6, deaths: 4, assists: 2, player_id: null, raw_name: 'guestone' }
  ] });
  assert.match(validateBase(base).error, /duplicate player stats/);
});

test('rejects unlinked series aggregate rows without a raw name', () => {
  const base = makeBase();
  base.matches[0].series_aggregate_stats = Array.from({ length: 10 }, (_, i) => ({
    player_id: i === 0 ? null : `p${i + 1}`,
    raw_name: i === 0 ? '' : undefined,
    kills: 1, deaths: 1, assists: 0
  }));
  assert.match(validateBase(base).error, /guest series stat missing raw_name/);
});


test('app surfaces cloud-state load failures instead of silently presenting the embedded snapshot', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const app = fs.readFileSync(path.join(__dirname, '..', 'app_v57.js'), 'utf8');
  assert.match(app, /Не удалось загрузить актуальные данные из облачной базы/);
  assert.match(app, /state\.serverSync=false;/);
  assert.match(app, /if\(!remote\)throw Error\(state\.storageWarning\|\|'Не удалось загрузить актуальные данные из облачной базы/);
  assert.match(app, /if\(!validateBase\(remote\)\)throw Error\('Актуальная облачная база не прошла проверку\.'\);\s*state\.serverSync=true;/);
  assert.match(app, /applyLoadedState\(remote,remote\.audit\);[\s\S]*connectServerEvents\(\);/);
});


test('cloud commit response is validated before the adapter reports success', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const adapter = fs.readFileSync(path.join(__dirname, '..', 'supabase_adapter.js'), 'utf8');
  assert.match(adapter, /Supabase вернул неполный ответ после сохранения/);
  assert.match(adapter, /Number\.isFinite\(Number\(out\.version\)\)/);
});

test('map team stats resolve unlinked rows through unique registered player aliases', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const app = fs.readFileSync(path.join(__dirname, '..', 'app_v57.js'), 'utf8');
  assert.ok(app.includes('Guest rows can carry a known player'));
  assert.ok(app.includes('owners.length===1&&owners[0].player_id===id'));
  assert.ok(app.includes('const row=rowById||rowByRaw||rowByKnownName'));
});


test('series team stats resolve unlinked rows by a unique registered alias and do not alias-match guest slots', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const app = fs.readFileSync(path.join(__dirname, '..', 'app_v57.js'), 'utf8');
  assert.ok(app.includes('statByUniqueAlias'));
  assert.ok(app.includes('owners.length===1&&owners[0].player_id===pid'));
  assert.ok(app.includes('statById||statByExactName||statByUniqueAlias'));
  assert.match(app, /statByUniqueAlias=statById\|\|statByExactName\|\|guest\?null:rows\.find/);
});

function makeGuestLocalSeries() {
  const players = Array.from({ length: 9 }, (_, i) => ({
    player_id: 'p' + (i + 1),
    display_name: 'Player ' + (i + 1),
    status: 'active',
    is_active: true,
    aliases: []
  }));
  const matchId = 'series_with_guest';
  const mapIds = ['guest-map-1', 'guest-map-2'];
  const maps = mapIds.map((mapId, mapIndex) => ({
    map_id: mapId,
    match_id: matchId,
    map_index: mapIndex + 1,
    map: mapIndex === 0 ? 'mirage' : 'inferno',
    score: { team_a: 13, team_b: 8 },
    stats_available: true,
    player_stats: players.map((player, i) => ({
      player_id: player.player_id,
      raw_name: player.display_name,
      kills: 10 + i + mapIndex,
      deaths: 8 + i,
      assists: 2 + (i % 3) + mapIndex
    }))
  }));
  const totals = new Map();
  for (const map of maps) {
    for (const row of map.player_stats) {
      const total = totals.get(row.player_id) || {
        player_id: row.player_id, raw_name: row.raw_name,
        kills: 0, deaths: 0, assists: 0
      };
      total.kills += row.kills;
      total.deaths += row.deaths;
      total.assists += row.assists;
      totals.set(row.player_id, total);
    }
  }
  return {
    players,
    aliases: {},
    matches: [{
      match_id: matchId,
      format: 'BO3',
      source_kind: 'local_series',
      map_ids: mapIds,
      series_score: '2:0',
      team_a: ['p1', 'p2', 'p3', 'p4', 'p5'],
      team_b: ['p6', 'p7', 'p8', 'p9'],
      player_ids: players.map(player => player.player_id),
      guest_players: [{ guest_id: 'guest_1', display_name: 'Guest', team: 'B' }],
      series_aggregate_stats: [...totals.values()]
    }],
    maps
  };
}

test('allows local series KDA aggregates with a guest omitted from statistics', () => {
  const base = makeGuestLocalSeries();
  assert.equal(base.matches[0].series_aggregate_stats.length, 9);
  const client = validateBase(base);
  assert.equal(client.ok, true, client.error);
  const edge = validateEdgeBase(base);
  assert.equal(edge.ok, true, (edge.errors || []).join('; ') || edge.error);
});

test('rejects a series aggregate that differs from the sum of its fully detailed maps', () => {
  const base = makeGuestLocalSeries();
  base.matches[0].series_aggregate_stats[0].kills += 1;
  const client = validateBase(base);
  assert.equal(client.ok, false);
  assert.match(client.error, /series aggregate does not match detailed maps/);
  const edge = validateEdgeBase(base);
  assert.equal(edge.ok, false);
  assert.match(edge.error, /series aggregate does not match detailed maps/);
});

test('allows aggregate summaries for partially detailed series without inventing missing map rows', () => {
  const base = makeGuestLocalSeries();
  base.maps[1].stats_available = false;
  base.maps[1].player_stats = [];
  const client = validateBase(base);
  assert.equal(client.ok, true, client.error);
  const edge = validateEdgeBase(base);
  assert.equal(edge.ok, true, (edge.errors || []).join('; ') || edge.error);
});

test('requires ten aggregate rows for compact BO3 records in both validators', () => {
  const base = makeGuestLocalSeries();
  base.matches[0].source_kind = 'compact_bo3';
  base.maps = base.maps.map(map => ({ ...map, stats_available: false, player_stats: [] }));
  const client = validateBase(base);
  assert.equal(client.ok, false);
  assert.match(client.error, /compact BO3 must contain 10/);
  const edge = validateEdgeBase(base);
  assert.equal(edge.ok, false);
  assert.match(edge.error, /compact BO3 must contain 10/);
});

test('runtime validation keeps partial local-series aggregates valid but requires full compact BO3 aggregates', () => {
  const app = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'app_v57.js'), 'utf8');
  assert.ok(app.includes("if(m.source_kind==='compact_bo3'&&sas.length!==10)return false"));
});
