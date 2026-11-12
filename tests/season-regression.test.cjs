const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app_v57.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style_v57.css'), 'utf8');
const matches = JSON.parse(fs.readFileSync(path.join(root, 'data', 'matches.json'), 'utf8'));
const maps = JSON.parse(fs.readFileSync(path.join(root, 'data', 'maps.json'), 'utf8'));

const start = app.indexOf('function seasons(v){');
const end = app.indexOf('function track(v){', start);
assert.ok(start >= 0 && end > start, 'seasons route must exist');
const season = app.slice(start, end);
const detailStart = season.indexOf("if(selected==='season1')");
const detailEnd = season.indexOf('const cards=', detailStart);
const seasonDetail = season.slice(detailStart, detailEnd);

test('Season 1 remains an upcoming season and does not reuse all-time player statistics', () => {
  assert.ok(seasonDetail.includes('СЕЗОН 1 ·') || seasonDetail.includes('SEASON 01'));
  assert.ok(seasonDetail.includes('СТАРТ СЕЗОНА'));
  assert.ok(seasonDetail.includes('Не назначен'));
  assert.ok(seasonDetail.includes('СЕЗОННЫЙ РЕЙТИНГ'));
  assert.ok(seasonDetail.includes('Ожидает настройки'));
  assert.ok(seasonDetail.includes('прошлые матчи не попадают сюда автоматически'));
  assert.doesNotMatch(seasonDetail, /profileSummary\(|\.sum\.|\.idx\b/);
});

test('All-time totals and leaderboard are clearly distinguished from seasonal results', () => {
  assert.ok(season.includes('МАТЧИ · ALL TIME'));
  assert.ok(season.includes('КАРТЫ · ALL TIME'));
  assert.ok(season.includes('ИГРОКИ · ALL TIME'));
  assert.ok(season.includes('ВИНРЕЙТ · ALL TIME'));
  assert.ok(season.includes('ALL TIME · АРХИВ'));
  assert.ok(season.includes('Лидеры общей истории'));
});

test('All-time leaderboard header has a matching ELO column for every rendered value', () => {
  assert.ok(season.includes('<span>ИНДЕКС</span><span>ELO</span><span>МАТЧИ</span><span>K/D</span>'));
  assert.ok(season.includes("'<div class=\"season-player-row\"><span class=\"season-rank\">"));
  assert.match(season, /'<div class="season-player-row"><span class="season-rank">'...[\s\S]*?'<strong>'\+fmt\(x\.sum\.kd,2\)\+'<\/strong><\/div>'/);
  assert.match(css, /\.season-player-head,\.season-player-row\{grid-template-columns:30px minmax\(0,1fr\) 62px 58px 65px 55px\}/);
});

test('Recent all-time matches show the same map mini-emblems as Track and profile history', () => {
  assert.ok(season.includes('matchMaps(m).map(mp=>mp.map||mp.map_name||mp.name)'));
  assert.ok(season.includes('mapRows.map(mapMiniMarkup).join'));
  assert.ok(season.includes('season-history-maps'));
  assert.match(css, /\.season-history-maps \.map-mark-inline img/);
});

test('Current imported match and map records do not pretend to carry season assignments', () => {
  assert.ok(Array.isArray(matches.matches) && matches.matches.length > 0);
  assert.ok(Array.isArray(maps.maps) && maps.maps.length > 0);
  for (const row of matches.matches) {
    assert.equal(Object.keys(row).some(key => /season/i.test(key)), false, 'match ' + row.match_id + ' unexpectedly acquired season metadata');
  }
  for (const row of maps.maps) {
    assert.equal(Object.keys(row).some(key => /season/i.test(key)), false, 'map ' + row.map_id + ' unexpectedly acquired season metadata');
  }
});

test('Upcoming season presentation is compact and remains responsive', () => {
  assert.match(css, /\.season-status-pill/);
  assert.match(css, /\.season-detail-status/);
  assert.match(css, /@media\(max-width:600px\)[\s\S]*\.season-detail-page/);
  assert.match(css, /\.season-pick-row\{[\s\S]*?min-height:76px/);
});
