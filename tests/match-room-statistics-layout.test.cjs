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
  assert.match(app, /const teamLabel=rawName\.replace\(\/\^\(\?:тим\|team\)\\s\+\/i,''\)\.trim\(\);const displayName=teamLabel\?'Team '\+teamLabel:'Team'/);
  assert.match(finalMvpCss, /grid-template-columns:minmax\(0,1\.55fr\) minmax\(300px,\.78fr\)/);
  assert.match(finalMvpCss, /grid-template-rows:repeat\(4,44px\)/);
  assert.match(css, /data-team-side="a"[\s\S]*data-team-side="b"/);
});



test('Most-kills value is pinned to the far right edge of its own card', () => {
  assert.match(app, /statLeaderCard\('БОЛЬШЕ ВСЕГО УБИЙСТВ',statMvp,statMvp\?\.kills,'is-kills-leader'\)/);
  assert.match(app, /match-stat-highlight\x27\+\(extraClass\?\x27 \x27\+extraClass:\x27\x27\)/);
  const fix = css.slice(css.lastIndexOf('/* 2026-11-17 — final FACEIT statistics overrides'));
  assert.match(fix, /\.match-stat-highlight\.is-kills-leader\s*\{[\s\S]*position:relative!important[\s\S]*display:flex!important/);
  assert.match(fix, /\.is-kills-leader \.match-stat-highlight-value\s*\{[\s\S]*position:absolute!important;right:12px!important[\s\S]*text-align:right!important/);
  assert.doesNotMatch(fix, /translateX/);
});

test('Team information strip and wrapper are transparent while scoreboard remains independent', () => {
  const fix = css.slice(css.lastIndexOf('/* 2026-11-17 — transparent team info strip: remove only the strip surface */'));
  assert.match(fix, /\.match-stat-teams\.match-stat-team-mode > \.match-stat-team,[\s\S]*\.match-stat-team-summary\s*\{[\s\S]*background:transparent!important[\s\S]*backdrop-filter:none!important/);
});


test('FACEIT team colors tint only the player-name cells by team side and outrank legacy resets', () => {
  const faceitTint = css.slice(css.lastIndexOf('/* 2026-11-17 — final FACEIT statistics overrides'));
  assert.match(faceitTint, /#matchRoomPage\.match-room-page[\s\S]*tr\[data-team-side="a"\] > td\.name,[\s\S]*background:#24213f!important/);
  assert.match(faceitTint, /#matchRoomPage\.match-room-page[\s\S]*tr\[data-team-side="b"\] > td\.name,[\s\S]*background:#234239!important/);
  assert.doesNotMatch(faceitTint, /td\.match-stat-rank|td:not\(\.name\)|nth-child/);
});


test('Team info labels always use English Team prefix without duplicating existing prefixes', () => {
  assert.match(app, /const teamLabel=rawName\.replace\(\/\^\(\?:тим\|team\)\\s\+\/i,''\)\.trim\(\)/);
  assert.match(app, /const displayName=teamLabel\?'Team '\+teamLabel:'Team'/);
});


test('Match Room statistics has working Results, Duels and Equipment subviews before MVP', () => {
  assert.match(app, /class="match-stat-subtabs"[\s\S]*data-stat-subview-button="results"[\s\S]*data-stat-subview-button="duels"[\s\S]*data-stat-subview-button="equipment"/);
  assert.match(app, /function setMatchRoomStatSubview\(target\)/);
  assert.match(app, /data-stat-subview="results"/);
  assert.match(app, /data-stat-subview="duels"/);
  assert.match(app, /data-stat-subview="equipment"/);
  assert.match(app, /duels_won[\s\S]*duels_lost[\s\S]*duel_win_percent/);
  assert.match(app, /В текущих данных матча нет статистики по оружию и экипировке/);
});

test('Match Room hero and statistics navigation share the same responsive horizontal container', () => {
  const finalLayout = css.slice(css.lastIndexOf('/* 2026-11-17 — FACEIT match report: aligned hero'));
  assert.match(finalLayout, /\.match-room-content\s*\{[\s\S]*width:min\(calc\(100% - 56px\),1600px\)!important/);
  assert.match(finalLayout, /\.match-room-hero\s*\{[\s\S]*width:100%!important/);
  assert.match(finalLayout, /\.match-room-view-tabs\s*\{[\s\S]*width:100%!important/);
  assert.match(finalLayout, /\.match-stat-subtabs button\.active:after/);
});


test('FACEIT Statistics sections stretch to the full Match Room hero width', () => {
  const ownerWidthFix = css.slice(css.lastIndexOf('/* 2026-11-17 — owner request: expand all Statistics content'));
  for (const selector of ['.match-stat-awards', '.match-stat-toolbar', '.match-stat-category-panel', '.match-stat-teams']) {
    assert.match(ownerWidthFix, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?width:100%!important;max-width:none!important'));
  }
  assert.ok(ownerWidthFix.includes('#matchRoomPage .match-stat-category-panel .table-wrap,'));
  assert.ok(ownerWidthFix.includes('#matchRoomPage .match-stat-teams .table-wrap{'));
  assert.match(ownerWidthFix, /\.match-stat-category-panel \.table-wrap[\\s\\S]*?width:100%!important;max-width:none!important/);
});
