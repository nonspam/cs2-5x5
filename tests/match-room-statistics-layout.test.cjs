const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app_v57.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'style_v57.css'), 'utf8');

test('Match Room statistics keeps player/rank identity, removes rating and Swing, and supports team colors', () => {
  const start = app.indexOf('const statCategories=');
  const end = app.indexOf('const statPlayers=', start);
  const categories = app.slice(start, end);
  assert.ok(start >= 0 && end > start, 'statistics categories must exist');
  assert.match(categories, /id:'general'/);
  assert.doesNotMatch(categories, /swing|Swing/);
  assert.match(app, /<th>Игрок<\/th><th>Ранг<\/th>/);
  assert.doesNotMatch(app, /<th>Рейтинг<\/th>/);
  assert.doesNotMatch(app, /<td class="match-stat-rating">/);
  assert.match(app, /data-team-side=/);
  assert.match(app, /statRowsMarkup\(rs,mode,category,side\)/);
});

test('Match Room statistics gives MVP the main width and compresses the four right-side cards', () => {
  const finalMvpCss = css.slice(css.lastIndexOf('/* 2026-11-16 — owner refinement: MVP takes focus'));
  assert.match(finalMvpCss, /grid-template-columns:minmax\(0,1\.55fr\) minmax\(300px,\.78fr\)/);
  assert.match(finalMvpCss, /height:258px!important/);
  assert.match(finalMvpCss, /grid-template-rows:repeat\(4,44px\)/);
  assert.match(finalMvpCss, /min-height:44px!important;height:44px!important/);
  assert.match(finalMvpCss, /position:absolute!important;top:15px!important;right:20px!important/);
});

test('Match Room Top 4 follows FACEIT leader fields instead of duplicating MVP metrics', () => {
  assert.match(app, /statLeaderCard\('БОЛЬШЕ ВСЕГО УБИЙСТВ',statMvp/);
  assert.match(app, /statLeaderCard\('НАИБОЛЬШИЙ УРОН',statDamageLeader/);
  assert.match(app, /statLeaderCard\('KAST',statKastLeader/);
  assert.match(app, /statLeaderCard\('ЭНТРИ-УБИЙСТВА',statEntryLeader/);
  assert.match(app, /matchRoomInitialAvatar\(r\.player_id\|\|null,'md',r\.name\)/);
});


test('MVP card puts U/S/A and K/D in the left metric column, ADR and headshots in the right', () => {
  assert.match(app, /match-stat-mvp-tag">★ MVP/);
  assert.match(app, /У\/С\/А[\s\S]*ADR[\s\S]*КД[\s\S]*УБИЙСТВА В ГОЛОВУ/);
  assert.match(app, /<small>ADR<\/small><strong>0<\/strong>/);
  assert.match(app, /<small>УБИЙСТВА В ГОЛОВУ<\/small><strong>0%<\/strong>/);
  assert.doesNotMatch(app, /match-stat-mvp-elo|Влияние на рез\.|FACEIT Рейтинг/);
});


test('Match Room team names remain explicit and MVP/Top 4 ratio favors the MVP', () => {
  const finalMvpCss = css.slice(css.lastIndexOf('/* 2026-11-16 — owner refinement: MVP takes focus'));
  assert.match(app, /displayName=\/\^\(тим\|team\)\\s\/i\.test\(rawName\)\?rawName:'Тим '\+rawName/);
  assert.match(finalMvpCss, /grid-template-columns:minmax\(0,1\.55fr\) minmax\(300px,\.78fr\)/);
  assert.match(finalMvpCss, /grid-template-rows:repeat\(4,44px\)/);
  assert.match(css, /data-team-side="a"[\s\S]*data-team-side="b"/);
});

