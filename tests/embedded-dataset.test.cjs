const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateBase } = require('../validation.js');
const { validateBase: validateEdgeBase } = require('../supabase/functions/cs2-admin/validation.js');

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


test('embedded fallback also satisfies the stricter Edge Function state contract', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'data_embedded.js'), 'utf8');
  const match = source.match(/window\.CS2_EMBEDDED_DATA\s*=\s*(\{[\s\S]*\});?\s*$/);
  assert.ok(match, 'embedded data assignment must contain a parseable JSON object');
  const data = JSON.parse(match[1]);
  const result = validateEdgeBase(data);
  assert.equal(result.ok, true, (result.errors || []).join('; ') || result.error || 'embedded data failed Edge validation');
});


test('Edge validation accepts manual_edit provenance for an edited historical series', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'data_embedded.js'), 'utf8');
  const match = source.match(/window\.CS2_EMBEDDED_DATA\s*=\s*(\{[\s\S]*\});?\s*$/);
  assert.ok(match, 'embedded data assignment must contain a parseable JSON object');
  const data = JSON.parse(match[1]);
  const historical = data.matches.find(item => item.source_kind === 'detailed');
  assert.ok(historical, 'fixture must include a detailed historical series');
  historical.team_assignment_source = 'manual_edit';

  const result = validateEdgeBase(data);
  assert.equal(result.ok, true, (result.errors || []).join('; ') || result.error || 'manual_edit provenance was rejected');
});


test('Edge validation treats an empty played_at field as an optional date', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'data_embedded.js'), 'utf8');
  const match = source.match(/window\.CS2_EMBEDDED_DATA\s*=\s*(\{[\s\S]*\});?\s*$/);
  assert.ok(match, 'embedded data assignment must contain a parseable JSON object');
  const data = JSON.parse(match[1]);
  const emptyDate = validateEdgeBase(data);
  assert.equal(emptyDate.ok, true, (emptyDate.errors || []).join('; ') || emptyDate.error || 'empty played_at should be allowed');

  const invalidDateState = JSON.parse(JSON.stringify(data));
  invalidDateState.matches[0].played_at = 'not-a-date';
  const invalidDate = validateEdgeBase(invalidDateState);
  assert.equal(invalidDate.ok, false);
  assert.match(invalidDate.error, /invalid played_at/);
});
