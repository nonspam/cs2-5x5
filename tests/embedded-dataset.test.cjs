const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateBase } = require('../validation.js');

test('embedded fallback is valid and internally linked', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'data_embedded.js'), 'utf8');
  const match = source.match(/window\.CS2_EMBEDDED_DATA\s*=\s*(\{[\s\S]*\});?\s*$/);
  assert.ok(match, 'embedded data assignment must contain a parseable JSON object');
  const data = JSON.parse(match[1]);
  const result = validateBase(data);
  assert.equal(result.ok, true, result.error || 'embedded data failed validation');
  assert.ok(data.players.length > 0, 'embedded player catalog should not be empty');
  assert.ok(data.matches.length > 0, 'embedded match history should not be empty');
  assert.ok(data.maps.length > 0, 'embedded map history should not be empty');
});
