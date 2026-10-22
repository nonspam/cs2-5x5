const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app_v57.js'), 'utf8');

test('production entrypoint loads the canonical runtime files with cache-busting versions', () => {
  for (const file of ['style_v57.css', 'validation.js', 'supabase_adapter.js', 'data_embedded.js', 'app_v57.js']) {
    assert.match(html, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=[^"\\s]+'), `index.html must load ${file} with a versioned URL`);
  }
  assert.doesNotMatch(html, /(?:src|href)="(?:app|style)\.(?:js|css)(?:\?|")/, 'legacy app.js/style.css must not be the production entrypoint');
});

test('player profile labels recent series by current ordered active-match position, not stale stored series_number', () => {
  assert.match(app, /function seriesNumberForMatch\(match\)\{[^}]*return i\+1:null\}/,
    'seriesNumberForMatch should derive the visible label from current ordered matches');
  assert.match(app, /const matchRows=recentMatches\.map\(q=>\{const n=q\.m\?seriesNumberForMatch\(q\.m\):''/,
    'recent-series profile rows must use the canonical visible series number');
  assert.doesNotMatch(app, /const matchRows=recentMatches\.map\(q=>\{[^\n]*q\.m\.series_number/,
    'recent-series profile rows must not render the legacy stored series_number directly');
});
