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
  const start = app.indexOf('function indexBreakdown(');
  const end = app.indexOf('function eraRows(', start);
  assert.ok(start >= 0 && end > start, 'indexBreakdown function must exist');
  const source = app.slice(start, end);
  for (const weight of ['.35*kdScore', '.25*diffScore', '.15*imp', '.10*st.score', '.10*vol', '.05*formScore']) {
    assert.ok(source.includes(weight), 'missing Player Index weight ' + weight);
  }
});


test('the public index() wrapper delegates to the canonical indexBreakdown() calculation', () => {
  assert.match(app, /function index\(id,rows=detailRows\(id\),includeCompact=true\)\{return indexBreakdown\(id,rows,includeCompact\)\.total\}/);
});


test('form does not invent a flat trend when fewer than two ten-map windows are available', () => {
  const one = formForRows([{ kills: 20, deaths: 10 }]);
  assert.equal(one.form, 10);
  assert.equal(one.trend, null);
  const ten = formForRows(Array.from({ length: 10 }, () => ({ kills: 10, deaths: 10 })));
  assert.equal(ten.form, 0);
  assert.equal(ten.trend, null);
  const eleven = formForRows(Array.from({ length: 11 }, (_, i) => ({ kills: i + 10, deaths: 10 })));
  assert.notEqual(eleven.trend, null);
});

test('records runtime declares all helpers used by the records route', () => {
  for (const name of ['bo1RecordRows', 'recordAvgRows', 'recordWinRate', 'recordWinRows']) {
    assert.ok(app.includes('function ' + name + '('), name + ' must exist');
  }
  assert.ok(app.includes("const winRowsAll=recordWinRows(source,filter,state.recordMap||'all')"));
});

test('recordAvgRows weights series rows by the number of maps represented', () => {
  const start = app.indexOf('function recordAvgRows(');
  const end = app.indexOf('\nfunction recordWinRate(', start);
  assert.ok(start >= 0 && end > start);
  const fn = Function('return (' + app.slice(start, end).trim() + ')')();
  const rows = fn([
    { playerId: 'p1', k: 20, d: 10, a: 4 },
    { playerId: 'p1', k: 30, d: 20, a: 6, maps: 2 },
    { playerId: 'p1', k: 12, d: 8, a: 3, maps: 3 }
  ]);
  assert.equal(rows[0].maps, 6);
  assert.equal(rows[0].avg, 62 / 6);
  assert.equal(rows[0].k, 62);
  assert.equal(rows[0].d, 38);
});

test('recordWinRate preserves map-level denominator and correctly scopes format/map filters', () => {
  const rows = [
    { matchId: 'bo1', map: 'mirage', result: 'WIN' },
    { matchId: 'bo1', map: 'dust2', result: 'LOSS' },
    { matchId: 'bo3', map: 'mirage', result: 'WIN' },
    { matchId: 'bo3', map: 'inferno', result: 'WIN' },
    { matchId: 'bo5', map: 'mirage', result: 'LOSS' }
  ];
  const matches = [
    { match_id: 'bo1', format: 'BO1' },
    { match_id: 'bo3', format: 'BO3' },
    { match_id: 'bo5', format: 'BO5' }
  ];
  const fnStart = app.indexOf('function recordWinRate(');
  const fnEnd = app.indexOf('\nfunction recordWinRows(', fnStart);
  assert.ok(fnStart >= 0 && fnEnd > fnStart);
  const fn = Function('careerResultsForPlayer', 'DB', 'latestMatch',
    'return (' + app.slice(fnStart, fnEnd).trim() + ')')(
      () => rows, { matches }, () => ({ match_id: 'bo3' })
    );
  assert.deepEqual(fn('p1', 'career'), { played: 5, wins: 3, rate: 0.6 });
  assert.deepEqual(fn('p1', 'bo3'), { played: 2, wins: 2, rate: 1 });
  assert.deepEqual(fn('p1', 'map', 'mirage'), { played: 3, wins: 2, rate: 2/3 });
  assert.deepEqual(fn('p1', 'match'), { played: 2, wins: 2, rate: 1 });
});

test('profileSummary keeps match-level winrate separate from map-level record winrate', () => {
  const start = app.indexOf('function profileSummary(');
  const end = app.indexOf('\nconst APP_ROUTE_IDS=', start);
  assert.ok(start >= 0 && end > start);
  const summarize = Function('return (' + app.slice(start, end).trim() + ')')();
  const result = summarize([
    { result: 'WIN', hasStats: true, k: 30, d: 20, a: 8, mapCount: 2 },
    { result: 'LOSS', hasStats: true, k: 20, d: 30, a: 6, mapCount: 2 },
    { result: 'DRAW', hasStats: true, k: 12, d: 12, a: 4, mapCount: 1 }
  ]);
  assert.equal(result.matches, 3);
  assert.equal(result.wins, 1);
  assert.equal(result.losses, 1);
  assert.equal(result.draws, 1);
  assert.ok(Math.abs(result.winrate - 100 / 3) < 1e-12);
  assert.equal(result.maps, 5);
  assert.equal(result.k, 62);
  assert.equal(result.d, 62);
  assert.equal(result.kd, 1);
});


test('profile polish removes share action and gives every match column a full-width aligned grid', () => {
  assert.doesNotMatch(app, /navigator\.clipboard\?\.writeText\(location\.href\).*ПОДЕЛИТЬ/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'style_v57.css'), 'utf8');
  assert.match(css, /FACEIT polish pass — full-width profile match rows/);
  assert.match(css, /\.faceit-profile-v2 \.faceit-match-table-head,\s*\.faceit-profile-v2 \.faceit-match-row\s*\{\s*grid-template-columns:minmax\(125px,1\.25fr\)/);
  assert.match(css, /\.faceit-profile-v2 \.faceit-exact-lower\s*\{\s*width:100%/);
  assert.match(css, /background:rgba\(14,18,23,\.42\)!important/);
});


test('profile history header and match values share a wide aligned grid; K/D is color-coded', () => {
  assert.ok(app.includes('faceit-match-rating '+"'+personalTone+'"+''));
  const css = fs.readFileSync(path.join(__dirname, '..', 'style_v57.css'), 'utf8');
  assert.ok(css.includes('grid-template-columns:minmax(145px,1.35fr)'));
  assert.ok(css.includes('.faceit-match-rating.kd-positive{color:#42d99a}'));
  assert.ok(css.includes('.faceit-match-rating.kd-negative{color:#ff5968}'));
});


test('Track route is registered, linked in navigation, and renders data-driven filters and metrics', () => {
  assert.match(app, /APP_ROUTE_IDS=\[[^\]]*'track'/);
  assert.match(app, /\['track','⌁','Track'\]/);
  assert.match(app, /function track\(v\)/);
  assert.match(app, /state\.trackPeriod/);
  assert.match(app, /profileMatchesForPlayer\(targetId\)/);
  assert.match(app, /const pages=\{[^}]*track/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'style_v57.css'), 'utf8');
  assert.match(css, /Track Stats — functional first implementation/);
  assert.match(css, /\.track-kpis/);
});

test('Track is account-scoped by linked player and never falls back to an arbitrary active player', () => {
  const trackStart = app.indexOf('function track(v){');
  const trackEnd = app.indexOf('\nfunction render(){', trackStart);
  const track = app.slice(trackStart, trackEnd);
  assert.match(track, /const targetId=state\.trackTargetId\|\|state\.myPlayerId\|\|null/);
  assert.match(track, /if\(!targetId\)/);
  assert.ok(track.includes('state.accountUser?'));
  assert.ok(track.includes('link'));
  assert.ok(track.includes('login'));
  assert.match(track, /profileMatchesForPlayer\(targetId\)/);
  assert.doesNotMatch(track, /activePlayers\(\).*sort|people\[0\]/);
    assert.ok(app.includes("state.trackTargetId=\\'"));
  assert.ok(app.includes("state.trackTargetId=\\'"));
});

test('Track stays in the global rail and is removed from the individual profile tabs', () => {
  const profileStart=app.indexOf('function profilePage(v)');
  const trackTab=app.indexOf("state.profileSection==='track'",profileStart);
  assert.equal(trackTab,-1);
  assert.match(app,/\\['track','⌁','Track'\\]/);
});


test('Track chart points bind interactive match tooltips and a direct open-match action', () => {
  assert.match(app,/function bindTrackChart\\(root,points,metric,metricLabel\\)/);
  assert.match(app,/track-point-wrap/);
  assert.match(app,/track-tooltip-open/);
  assert.match(app,/openMatchDetail\\(q\\.m\\.match_id\\)/);
  assert.match(app,/pointerenter/);
  assert.match(app,/pinnedIndex/);
});

test('Track match rows color the complete K/D/A string by K-to-D relation', () => {
  const start=app.indexOf('function track(v){'),end=app.indexOf('\\nfunction bindTrackChart',start),track=app.slice(start,end);
  assert.match(track,/const kdTone=\\(k,d\\)=>Number\\(k\\)>Number\\(d\\)\\?'positive':Number\\(k\\)<Number\\(d\\)\\?'negative':'neutral'/);
  assert.match(track,/track-match-kda '\\+tone\\+'/);
  assert.match(track,/kdTone\\(summary\\.k,summary\\.d\\)/);
  const css=fs.readFileSync(path.join(__dirname,'..','style_v57.css'),'utf8');
  assert.match(css,/\\.track-owner-avatar \\.player-avatar\\{display:flex!important/);
  assert.match(css,/\\.track-match-row \\.track-match-map\\{font-size:11px/);
});
