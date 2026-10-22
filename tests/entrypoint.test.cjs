const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('production entrypoint loads the intended V57 runtime and stylesheet', () => {
  const html = read('index.html');
  assert.match(html, /href="style_v57\.css\?v=[^"]+"/, 'entrypoint should use cache-busted V57 CSS');
  assert.match(html, /src="app_v57\.js\?v=[^"]+"/, 'entrypoint should use cache-busted V57 JavaScript');
  assert.doesNotMatch(html, /src="app\.js(?:\?|")/, 'legacy app.js must not silently become the runtime');
  assert.doesNotMatch(html, /href="style\.css(?:\?|")/, 'legacy style.css must not silently become the stylesheet');
});

test('production entrypoint loads validation before the cloud adapter and runtime', () => {
  const html = read('index.html');
  const validation = html.indexOf('validation.js?');
  const adapter = html.indexOf('supabase_adapter.js?');
  const embedded = html.indexOf('data_embedded.js?');
  const runtime = html.indexOf('app_v57.js?');
  assert.ok(validation >= 0 && adapter > validation, 'validation must load before adapter');
  assert.ok(embedded > adapter && runtime > embedded, 'data and adapter must load before runtime');
});

test('quality gate and package scripts stay aligned', () => {
  const pkg = JSON.parse(read('package.json'));
  const workflow = read('.github/workflows/quality-gate.yml');
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.cjs');
  assert.match(workflow, /npm run check/);
});
