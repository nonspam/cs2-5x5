const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app_v57.js'), 'utf8');

function extractFunction(name, nextName) {
  const start = app.indexOf('function ' + name + '(');
  assert.notEqual(start, -1, name + ' must exist in production runtime');
  const end = nextName ? app.indexOf('function ' + nextName + '(', start) : -1;
  assert.ok(end > start, 'could not isolate ' + name);
  return Function('return (' + app.slice(start, end).trim() + ')')();
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const aggregateRows = extractFunction('aggregateRows', 'impact');
const formForRows = extractFunction('formForRows', 'form');
const realStability = extractFunction('stability', 'detailRows');
const indexSource = app.slice(app.indexOf('function indexBreakdown('), app.indexOf('function eraRows('));
const realIndexBreakdown = (aggregate, stability, form, impact) =>
  Function('aggregate', 'stability', 'form', 'impact', 'clamp', 'return (' + indexSource.trim() + ')')(
    aggregate, stability, form, impact, clamp
  );

function fixtureAggregate(_id, rows, includeCompact) {
  const a = aggregateRows(rows);
  const maps = includeCompact ? a.maps : rows.length;
  return { ...a, detailed: rows.length, maps, kpm: maps ? a.k / maps : 0, apm: maps ? a.a / maps : 0 };
}
function fixtureImpact(_id, rows, includeCompact) {
  const x = fixtureAggregate(_id, rows, includeCompact);
  return x.maps ? clamp(50 + 5 * ((x.kdDiff / x.maps) + 0.5 * x.apm), 0, 100) : 0;
}
test('Player Index golden fixture: documented weights produce a stable, reproducible score', () => {
  const rows = [
    { kills: 20, deaths: 10, assists: 5 },
    { kills: 10, deaths: 10, assists: 2 }
  ];
  const stability = (_id, rr, _fullPool) => realStability(_id, rr, false, rr.length);
  const form = (_id, rr) => formForRows(rr);
  const result = realIndexBreakdown(fixtureAggregate, stability, form, fixtureImpact)(
    'fixture-player', rows, false, false
  );
  assert.equal(result.kd, 1.5);
  assert.equal(result.diff, 10);
  assert.equal(result.kpm, 15);
  assert.equal(result.impact, 83.75);
  assert.equal(result.stability, 65);
  assert.equal(result.volume, 50);
  assert.equal(result.formScore, 100);
  assert.equal(result.total, 89.0625);
});

test('stability counts detailed-map threshold evidence and does not treat zero deaths as infinite K/D', () => {
  const rows = [
    { kills: 30, deaths: 10 },
    { kills: 100, deaths: 0 },
    { kills: 15, deaths: 10 },
    { kills: 0, deaths: 10 }
  ];
  const result = realStability('fixture-player', rows, false, rows.length);
  assert.equal(result.detailed, 4);
  assert.equal(result.total, 4);
  assert.equal(result.plus, 3);
  // K/D 3.0 contributes to all thresholds; K/D 1.5 contributes to 1.0 and 1.5.
  assert.equal(result.score, 42.5);
});

test('form explicitly reports no history and preserves chronological last-ten window', () => {
  assert.deepEqual(formForRows([]), { form: null, trend: null, n: 0 });
  const rows = Array.from({ length: 12 }, (_, i) => ({ kills: i + 10, deaths: 10 }));
  const result = formForRows(rows);
  assert.equal(result.n, 10);
  assert.equal(result.form, 6.5);
  assert.equal(result.trend, 2);
});

test('golden fixture includes only the detailed rows passed to it; compact totals require a separate explicit aggregate input', () => {
  const detailed = [{ kills: 12, deaths: 8, assists: 4 }];
  const a = fixtureAggregate('fixture-player', detailed, false);
  assert.deepEqual({ maps: a.maps, k: a.k, d: a.d, a: a.a }, { maps: 1, k: 12, d: 8, a: 4 });
});


test('Player Index is zero when there are no counted maps, instead of awarding a neutral-baseline score', () => {
  const stability = (_id, rr, _fullPool) => realStability(_id, rr, false, rr.length);
  const form = (_id, rr) => formForRows(rr);
  const result = realIndexBreakdown(fixtureAggregate, stability, form, fixtureImpact)(
    'empty-player', [], false, false
  );
  assert.equal(result.maps, 0);
  assert.equal(result.total, 0);
  assert.equal(result.diffScore, 50); // component baseline remains documented; no-data total is explicitly suppressed.
});
