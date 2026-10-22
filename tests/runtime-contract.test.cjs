const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app_v57.js'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'supabase_adapter.js'), 'utf8');
const adminEdge = fs.readFileSync(path.join(root, 'supabase/functions/cs2-admin/index.ts'), 'utf8');

test('production entrypoint loads the canonical runtime files with cache-busting versions', () => {
  for (const file of ['style_v57.css', 'validation.js', 'supabase_adapter.js', 'data_embedded.js', 'app_v57.js']) {
    assert.match(html, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=[^"\\s]+'), `index.html must load ${file} with a versioned URL`);
  }
  assert.doesNotMatch(html, /(?:src|href)="(?:app|style)\.(?:js|css)(?:\?|")/, 'legacy app.js/style.css must not be the production entrypoint');
});

test('player profile labels recent series by current ordered active-match position, not stale stored series_number', () => {
  assert.match(app, /function seriesNumberForMatch\(match\)\{[^}]*return i>=0\?i\+1:null\}/,
    'seriesNumberForMatch should derive the visible label from current ordered matches');
  assert.match(app, /const matchRows=recentMatches\.map\(q=>\{const n=q\.m\?seriesNumberForMatch\(q\.m\):''/,
    'recent-series profile rows must use the canonical visible series number');
  assert.doesNotMatch(app, /const matchRows=recentMatches\.map\(q=>\{[^\n]*q\.m\.series_number/,
    'recent-series profile rows must not render the legacy stored series_number directly');
});

test('username admin login stays server-side and all other Edge Function routes remain guarded', () => {
  assert.match(adapter, /functions\\/v1\\/cs2-admin/,
    'username login must use the guarded Edge Function');
  assert.doesNotMatch(adapter, /client\\.rpc\\(['"]resolve_cs2_admin_login/,
    'browser must not call the email-resolving RPC directly');
  assert.match(adminEdge, /if\\(body\\?\\.action===["']sign_in["']\\)return await signInByLogin\\(body\\)/,
    'Edge Function must explicitly route sign-in before bearer authentication');
  assert.match(adminEdge, /authClient\\.auth\\.signInWithPassword/,
    'Edge Function must verify credentials with Supabase Auth');
  assert.match(adminEdge, /from\\(["']app_admins["']\\)/,
    'Edge Function must verify that the authenticated user is an admin');
  assert.match(adminEdge, /const user=await authUser\\(req\\);if\\(!user\\)return json\\(\\{ok:false,error:["']Unauthorized["']\\},401\\)/,
    'all non-login routes must retain explicit token/admin authorization');
});
