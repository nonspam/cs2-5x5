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
  assert.ok(adapter.includes('/functions/v1/cs2-admin'),
    'username login must use the guarded Edge Function');
  assert.ok(!adapter.includes("client.rpc('resolve_cs2_admin_login"),
    'browser must not call the email-resolving RPC directly');
  assert.ok(adminEdge.includes('if(body?.action==="sign_in")return await signInByLogin(body);'),
    'Edge Function must explicitly route sign-in before bearer authentication');
  assert.ok(adminEdge.includes('authClient.auth.signInWithPassword'),
    'Edge Function must verify credentials with Supabase Auth');
  assert.ok(adminEdge.includes('from("app_admins")'),
    'Edge Function must verify that the authenticated user is an admin');
  assert.ok(adminEdge.includes('const user=await authUser(req);if(!user)return json({ok:false,error:"Unauthorized"},401);'),
    'all non-login routes must retain explicit token/admin authorization');
});


test('compact BO3 player history uses the saved aggregate K/D/A instead of rendering false zeroes', () => {
  assert.match(app, /const compactStats=m\.source_kind==='compact_bo3'[\s\S]{0,180}\?\(m\.series_aggregate_stats\|\|\[\]\)\.find\(s=>s\.player_id===id\)/);
  assert.match(app, /const k=rs\.length[\s\S]{0,100}\:\(Number\(compactStats\?\.kills\)\|\|0\)/);
  assert.match(app, /const d=rs\.length[\s\S]{0,100}\:\(Number\(compactStats\?\.deaths\)\|\|0\)/);
  assert.match(app, /const a=rs\.length[\s\S]{0,100}\:\(Number\(compactStats\?\.assists\)\|\|0\)/);
});

test('player-history K/D color is independent from the series WIN/LOSS/DRAW color', () => {
  assert.match(app, /tone=q\.result==='WIN'\?'positive':q\.result==='LOSS'\?'negative':q\.result==='DRAW'\?'neutral':'neutral',personalTone=q\.kd>1\?'positive':q\.kd<1\?'negative':'neutral'/);
});


test('map history does not fall back to every map when the selected player has no row in the current map summary', () => {
  assert.match(app, /historyMs=\(isAll\?DB\.maps\.filter\(m=>m\.archived!==true\):ms\)\.filter\(m=>state\.mapPlayer==='all'\|\|\(m\.player_stats\|\|\[\]\)\.some\(s=>s\.player_id===state\.mapPlayer\)\)/);
  assert.doesNotMatch(app, /state\.mapPlayer==='all'\|\|!rows\.some\(x=>x\.p\.player_id===state\.mapPlayer\)/);
});


test('Player Index explanation exposes detailed-map coverage without changing the score formula', () => {
  assert.match(app, /подробные карты: \\?\$\{rows\.length\} из \\?\$\{b\.maps\} учтённых/);
  assert.match(app, /Math\.round\(rows\.length\/b\.maps\*100\):0\}% покрытия/);
});


test('missing form trend stays unavailable instead of being coerced to numeric zero', () => {
  assert.match(app, /const trendMarkup=\(value,label=''\)=>\{if\(value==null\|\|value===''\)return/);
});


test('series team detail resolves guest rows by guest ID or normalized raw/display name before showing missing stats', () => {
  assert.match(app, /const top=rows\.slice\(0,10\),team=ids=>ids\.map\(pid=>\{const guest=\(m\.guest_players\|\|\[\]\)\.find\(g=>g\.guest_id===pid\),label=guest\?\.display_name\|\|playerName\(pid\),norm=value=>String\(value\?\?''\)\.normalize\('NFKC'\)/);
  assert.match(app, /stat=rows\.find\(r=>r\.player_id===pid\)\|\|rows\.find\(r=>!r\.player_id&&\[r\.raw_name,r\.name\]\.some/);
});
