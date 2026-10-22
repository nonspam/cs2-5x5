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

const aggregateRows = extractFunction('aggregateRows', 'impact');
const formForRows = extractFunction('formForRows', 'form');

test('aggregateRows totals K/D/A and computes K/D from totals, not average per-map K/D', () => {
  const result = aggregateRows([
    { kills: 30, deaths: 10, assists: 5 },
    { kills: 2, deaths: 8, assists: 3 },
    { kills: 0, deaths: 0, assists: 0 }
  ]);
  assert.deepEqual(result, { maps: 3, k: 32, d: 18, a: 8, kd: 32 / 18, kdDiff: 14 });
});

test('aggregateRows safely handles empty history and numeric strings/missing values', () => {
  assert.deepEqual(aggregateRows([]), { maps: 0, k: 0, d: 0, a: 0, kd: 0, kdDiff: 0 });
  assert.deepEqual(aggregateRows([{ kills: '7', deaths: '0', assists: null }, {}]),
    { maps: 2, k: 7, d: 0, a: 0, kd: 0, kdDiff: 7 });
});

test('formForRows uses chronological input and limits current form to last ten rows', () => {
  const rows = Array.from({ length: 12 }, (_, i) => ({ kills: i + 10, deaths: 10 }));
  const result = formForRows(rows);
  assert.equal(result.n, 10);
  assert.equal(result.form, 6.5);
  assert.equal(result.trend, 2);
});

test('formForRows returns explicit empty state when no rows exist', () => {
  assert.deepEqual(formForRows([]), { form: null, trend: null, n: 0 });
});

test('production metrics expose their current documented weights', () => {
  const start = app.indexOf('function index(');
  const end = app.indexOf('function indexBreakdown(', start);
  assert.ok(start >= 0 && end > start, 'index and indexBreakdown functions must exist');
  const source = app.slice(start, end);
  for (const weight of ['.35*kdScore', '.25*diffScore', '.15*impact', '.10*st.score', '.10*vol', '.05*formScore']) {
    assert.ok(source.includes(weight), 'missing Player Index weight ' + weight);
  }
});
