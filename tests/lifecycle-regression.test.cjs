const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateBase } = require('../validation.js');

const source = fs.readFileSync(path.join(__dirname, '..', 'supabase_adapter.js'), 'utf8');
const start = source.indexOf('function applyOp(s,op)');
const end = source.indexOf('\n  function commit(', start);
assert.notEqual(start, -1, 'adapter applyOp helper must exist');
assert.notEqual(end, -1, 'adapter applyOp helper boundary must exist');
const applyOp = Function('return (' + source.slice(start, end).trim() + ')')();

function baseState() {
  const players = Array.from({ length: 10 }, (_, i) => ({ player_id: 'p' + (i + 1), name: 'Player ' + (i + 1) }));
  return {
    players,
    aliases: { old_p1: 'p1' },
    matches: [
      { match_id: 'm1', format: 'BO3', map_ids: ['m1-map1', 'm1-map2'], team_a: ['p1'], team_b: ['p2'] },
      { match_id: 'm2', format: 'BO1', map_ids: ['m2-map1'], team_a: ['p3'], team_b: ['p4'] }
    ],
    maps: [
      { map_id: 'm1-map1', match_id: 'm1', map_index: 1, stats_available: false, player_stats: [] },
      { map_id: 'm1-map2', match_id: 'm1', map_index: 2, stats_available: false, player_stats: [] },
      { map_id: 'm2-map1', match_id: 'm2', map_index: 1, stats_available: false, player_stats: [] }
    ]
  };
}

function applyAll(state, operations) {
  for (const op of operations) applyOp(state, op);
  const result = validateBase(state);
  assert.equal(result.ok, true, result.error || 'post-operation state should be valid');
  return state;
}

test('archive and restore apply to the match and every child map, leaving other matches active', () => {
  const state = baseState();
  applyAll(state, [
    { kind: 'match_patch', match_id: 'm1', patch: { archived: true, archived_at: '2026-10-22T10:00:00.000Z' } },
    { kind: 'map_patch', map_id: 'm1-map1', patch: { archived: true } },
    { kind: 'map_patch', map_id: 'm1-map2', patch: { archived: true } }
  ]);
  assert.equal(state.matches.find(x => x.match_id === 'm1').archived, true);
  assert.ok(state.maps.filter(x => x.match_id === 'm1').every(x => x.archived === true));
  assert.equal(state.matches.find(x => x.match_id === 'm2').archived, undefined);
  assert.equal(state.maps.find(x => x.map_id === 'm2-map1').archived, undefined);

  applyAll(state, [
    { kind: 'match_patch', match_id: 'm1', patch: { archived: false, archived_at: null } },
    { kind: 'map_patch', map_id: 'm1-map1', patch: { archived: false } },
    { kind: 'map_patch', map_id: 'm1-map2', patch: { archived: false } }
  ]);
  assert.equal(state.matches.find(x => x.match_id === 'm1').archived, false);
  assert.ok(state.maps.filter(x => x.match_id === 'm1').every(x => x.archived === false));
});

test('permanent deletion removes the selected match and its maps, preserving all unrelated history', () => {
  const state = baseState();
  applyAll(state, [{ kind: 'delete_match', match_id: 'm1' }]);
  assert.deepEqual(state.matches.map(x => x.match_id), ['m2']);
  assert.deepEqual(state.maps.map(x => x.map_id), ['m2-map1']);
  assert.deepEqual(state.matches[0].map_ids, ['m2-map1']);
});

test('failed map deletion leaves the whole state unchanged', () => {
  const state = baseState();
  const before = JSON.stringify(state);
  assert.throws(() => applyOp(state, { kind: 'delete_map', map_id: 'm1-map2' }), /требует минимум 2 карт/);
  assert.equal(JSON.stringify(state), before);
});

test('editing one match or map preserves unrelated records and their statistics', () => {
  const state = baseState();
  const unrelated = JSON.stringify({
    match: state.matches.find(x => x.match_id === 'm2'),
    map: state.maps.find(x => x.map_id === 'm2-map1')
  });
  applyAll(state, [
    { kind: 'match_patch', match_id: 'm1', patch: { played_at: '2026-10-22T12:00:00.000Z' } },
    { kind: 'map_patch', map_id: 'm1-map1', patch: { map: 'mirage' } }
  ]);
  assert.equal(JSON.stringify({
    match: state.matches.find(x => x.match_id === 'm2'),
    map: state.maps.find(x => x.map_id === 'm2-map1')
  }), unrelated);
});

test('new/restored series number is based on active count, not stale IDs or saved numbers', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'app_v57.js'), 'utf8');
  const helperMatch = app.match(/function nextSeriesNumber\(\)\{[^}]*\}/);
  assert.ok(helperMatch, 'nextSeriesNumber helper must exist');
  assert.equal(helperMatch[0], 'function nextSeriesNumber(){return activeMatches().length+1}');
  const nextSeriesNumber = Function('activeMatches', 'return (' + helperMatch[0] + ')')(
    () => [
      { match_id: 'match_100', series_number: 100 },
      { match_id: 'match_local_9999999999999', series_number: 40 },
      { match_id: 'match_2', archived: true }
    ].filter(m => m.archived !== true)
  );
  assert.equal(nextSeriesNumber(), 3, 'stale high values must not create numbering gaps');
});
