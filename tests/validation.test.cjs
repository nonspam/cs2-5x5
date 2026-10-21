const test = require('node:test');
const assert = require('node:assert/strict');
const { validateBase, assertBase } = require('../validation.js');

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
  base.matches[0].series_aggregate_stats = Array.from({ length: 9 }, (_, i) => ({
    player_id: `p${i + 1}`,
    kills: 1,
    deaths: 1,
    assists: 0
  }));
  assert.match(validateBase(base).error, /series aggregate must contain 10 rows/);
});
