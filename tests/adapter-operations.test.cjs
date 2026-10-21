const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Exercise the exact operation helper used by the browser adapter without loading Supabase.
const source = fs.readFileSync(path.join(__dirname, '..', 'supabase_adapter.js'), 'utf8');
const start = source.indexOf('function applyOp(s,op)');
const end = source.indexOf('\n  function commit(', start);
assert.notEqual(start, -1, 'applyOp helper must exist');
assert.notEqual(end, -1, 'applyOp helper boundary must exist');
const applyOp = Function('return (' + source.slice(start, end).trim() + ')')();

test('deleting a match also deletes only its related maps', () => {
  const state = {
    matches: [{ match_id: 'm1' }, { match_id: 'm2' }],
    maps: [
      { map_id: 'm1-map1', match_id: 'm1' },
      { map_id: 'm1-map2', match_id: 'm1' },
      { map_id: 'm2-map1', match_id: 'm2' }
    ],
    players: [],
    aliases: {}
  };

  applyOp(state, { kind: 'delete_match', match_id: 'm1' });

  assert.deepEqual(state.matches.map(x => x.match_id), ['m2']);
  assert.deepEqual(state.maps.map(x => x.map_id), ['m2-map1']);
});

test('deleting a map updates its match map_ids and reindexes remaining maps', () => {
  const state = {
    matches: [{ match_id: 'm1', format: 'BO3', map_ids: ['map1', 'map2', 'map3'] }],
    maps: [
      { map_id: 'map1', match_id: 'm1', map_index: 1 },
      { map_id: 'map2', match_id: 'm1', map_index: 2 },
      { map_id: 'map3', match_id: 'm1', map_index: 3 }
    ],
    players: [],
    aliases: {}
  };

  applyOp(state, { kind: 'delete_map', map_id: 'map2' });

  assert.deepEqual(state.matches[0].map_ids, ['map1', 'map3']);
  assert.deepEqual(state.maps.map(x => [x.map_id, x.map_index]), [['map1', 1], ['map3', 2]]);
});

test('refuses to delete a map if it would violate the match format minimum', () => {
  const state = {
    matches: [{ match_id: 'm1', format: 'BO3', map_ids: ['map1', 'map2'] }],
    maps: [
      { map_id: 'map1', match_id: 'm1', map_index: 1 },
      { map_id: 'map2', match_id: 'm1', map_index: 2 }
    ],
    players: [],
    aliases: {}
  };

  assert.throws(() => applyOp(state, { kind: 'delete_map', map_id: 'map2' }), /требует минимум 2 карт/);
  assert.deepEqual(state.matches[0].map_ids, ['map1', 'map2']);
  assert.equal(state.maps.length, 2);
});

test('deleting a player referenced by match history is refused without data loss', () => {
  const state = {
    players: [{ player_id: 'p1' }, { player_id: 'p2' }],
    aliases: { oldnick: 'p1', keepnick: 'p2' },
    maps: [{ map_id: 'map1', player_stats: [
      { player_id: 'p1', kills: 10, deaths: 4, assists: 2 },
      { player_id: 'p2', kills: 5, deaths: 7, assists: 1 },
      { raw_name: 'guest', kills: 2, deaths: 8, assists: 0 }
    ] }],
    matches: [{ match_id: 'm1', team_a: ['p1', 'p2'], team_b: [], series_aggregate_stats: [
      { player_id: 'p1', kills: 10, deaths: 4, assists: 2 },
      { player_id: 'p2', kills: 5, deaths: 7, assists: 1 }
    ] }]
  };

  assert.throws(() => applyOp(state, { kind: 'delete_player', player_id: 'p1' }), /связан с историей матчей/);
  assert.equal(state.players.length, 2);
  assert.equal(state.maps[0].player_stats.length, 3);
  assert.deepEqual(state.matches[0].team_a, ['p1', 'p2']);
  assert.deepEqual(state.matches[0].series_aggregate_stats.map(x => x.player_id), ['p1', 'p2']);
  assert.deepEqual(state.aliases, { oldnick: 'p1', keepnick: 'p2' });
});

test('deleting an unreferenced player removes only the catalog entry and its aliases', () => {
  const state = {
    players: [{ player_id: 'p1' }, { player_id: 'p2' }],
    aliases: { oldnick: 'p1', keepnick: 'p2' },
    maps: [],
    matches: []
  };

  applyOp(state, { kind: 'delete_player', player_id: 'p1' });

  assert.deepEqual(state.players.map(x => x.player_id), ['p2']);
  assert.deepEqual(state.aliases, { keepnick: 'p2' });
});

test('deleting an unknown player fails without changing state', () => {
  const state = { players: [{ player_id: 'p1' }], aliases: {}, maps: [], matches: [] };
  assert.throws(() => applyOp(state, { kind: 'delete_player', player_id: 'missing' }), /Игрок не найден/);
  assert.deepEqual(state.players, [{ player_id: 'p1' }]);
});

test('client patch operation rejects malformed payloads without mutating state', () => {
  for (const patch of [null, undefined, [], 'bad']) {
    const state = { players: [{ player_id: 'p1', display_name: 'Before' }], maps: [], matches: [], aliases: {} };
    assert.throws(
      () => applyOp(state, { kind: 'player_patch', player_id: 'p1', patch }),
      /Некорректные данные изменения/
    );
    assert.equal(state.players[0].display_name, 'Before');
  }
});

test('client patch operation applies valid object payloads', () => {
  const state = { players: [{ player_id: 'p1', display_name: 'Before' }], maps: [], matches: [], aliases: {} };
  applyOp(state, { kind: 'player_patch', player_id: 'p1', patch: { display_name: 'After' } });
  assert.equal(state.players[0].display_name, 'After');
});
