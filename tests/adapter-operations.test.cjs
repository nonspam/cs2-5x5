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
