const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('app_v57.js');
const account = read('account_module.js');
const css = read('style_v57.css');

test('FACEIT V2 exposes existing site sections from one profile-inspired rail', () => {
  assert.match(app, /function faceitAppRailMarkup\(\)/);
  for (const route of ['home','analytics','base','maps','teams','records','seasons','profile']) {
    assert.ok(app.includes("['" + route + "'"), 'rail should include route ' + route);
  }
  assert.match(app, /function navigateApp\(tab,options=\{\}\)/);
  assert.match(app, /data-app-route=/);
  assert.match(app, /function renderRouteShell\(v,page\)/);
  assert.match(app, /renderRouteShell\(v,pages\[state\.tab\]\|\|home\)/);
});

test('all non-profile routes render inside the shared shell and profile uses the same rail', () => {
  assert.match(app, /function render\(\)\{[^\n]*if\(state\.tab==='profile'\)\{profilePage\(v\)\}else\{const pages=/);
  assert.match(app, /faceitAppRailMarkup\(\)/);
});

test('inactive profile placeholders are removed instead of appearing as disabled tabs', () => {
  const start = app.indexOf('function profilePage(v){');
  const end = app.indexOf('async function handleProfileImage', start);
  const profile = app.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.doesNotMatch(profile, /button disabled/);
  assert.doesNotMatch(profile, /ДРУЗЬЯ|ГОСТЕВАЯ КНИГА|Матчмейкинг|Турниры/);
  assert.match(profile, /state\.profileSection==='overview'.*onclick=/);
  assert.match(profile, /state\.profileSection==='history'.*onclick=/);
});

test('unlinked account state is still rendered inside the shared shell', () => {
  assert.match(account, /renderRouteShell\(view,function\(content\)/);
  assert.match(account, /content\.querySelector\('#accountProfileAction'\)/);
});

test('shared shell has responsive layout and mobile navigation rules', () => {
  assert.match(css, /FACEIT V2 — one profile-inspired application shell/);
  assert.match(css, /\.faceit-route-shell \.faceit-exact-global-rail nav/);
  assert.match(css, /@media\(max-width:700px\)[\s\S]*faceit-route-shell/);
});

test('application routes support direct hash entry and browser back/forward navigation', () => {
  assert.match(app, /const APP_ROUTE_IDS=\['home','analytics','base','maps','teams','records','seasons','track','settings','profile','compare'\]/);
  assert.match(app, /function appRouteFromLocation\(\)/);
  assert.match(app, /window\.location\.hash/);
  assert.match(app, /window\.history\[method\]/);
  assert.match(app, /function restoreAppRouteFromHistory\(\)/);
  assert.match(app, /window\.addEventListener\('popstate',restoreAppRouteFromHistory\)/);
  assert.match(app, /DOMContentLoaded',\(\)=>\{state\.tab=appRouteFromLocation\(\);load\(\)\}/);
  assert.match(app, /function render\(\)\{[^\n]*pages\[state\.tab\]\|\|home/);
});

test('cross-route dashboard links use the common navigation function', () => {
  assert.doesNotMatch(app, /onclick="state\.tab='(?:base|analytics|settings)';render\(\)"/);
  assert.doesNotMatch(app, /state\.tab='compare';render\(\)/);
  assert.match(app, /closePlayerDetail\(\);navigateApp\('compare'\)/);
});

test('the active application rail item exposes the current page to assistive technology', () => {
  assert.match(app, /state\.tab===id\?'aria-current="page" '/);
  assert.match(app, /state\.tab==='settings'\?'aria-current="page" '/);
  assert.match(app, /\['profile','◉','Профиль'\]/);
  assert.ok(app.includes('items.map(([id,ico,label])=>'), 'rail renders all routes from its shared item list');
});


test('player center uses the compact requested column order and removes legacy rating columns', () => {
  const start = app.indexOf('function players(v){');
  const end = app.indexOf('function compare', start);
  const source = app.slice(start, end);
  assert.ok(start >= 0 && end > start);
  for (const label of ['Игрок','Карты','K','D','A','K/D','+/−','ELO']) assert.ok(source.includes('<th>'+label+'</th>'), 'player table includes '+label);
  for (const label of ['Серии ELO','Импакт','Форма','Стабильность','Индекс игрока']) assert.ok(!source.includes(label), 'legacy player column removed: '+label);
  assert.ok(source.indexOf('<th>Игрок</th>') < source.indexOf('<th>Карты</th>'));
  assert.ok(source.indexOf('<th>+/−</th>') < source.indexOf('<th>ELO</th>'));
});

test('profile and route workspaces keep the rail fixed and scroll their content panes', () => {
  assert.match(css, /\.faceit-exact-shell:not\(\.faceit-route-shell\) \.faceit-exact-content\{height:100vh;min-height:0;overflow-y:auto/);
  assert.match(css, /\.faceit-route-shell\{height:100vh;min-height:100vh!important;overflow:hidden!important;grid-template-columns:170px minmax\(0,1fr\)!important\}/);
  assert.match(css, /background-attachment:fixed!important/);
  assert.match(css, /\.faceit-exact-rail-bottom\{padding-bottom:26px\}/);
});

test('player ranking sorts by K/D first and restores visible rank numbers',()=>{const s=app.indexOf('function players(v){'),e=app.indexOf('function compare',s),x=app.slice(s,e);assert.ok(x.includes('b.x.kd-a.x.kd'));assert.ok(x.includes('class="player-rank-head"'));assert.ok(x.includes('class="player-rank-cell"'));assert.ok(x.includes('ps.map((q,i)=>'));});
test('profile and Track match scores use player-relative score badges',()=>{assert.ok(app.includes('playerScoreMarkup(playerSeriesScoreLabel(q.m,id,q.maps)'));assert.ok(app.includes('playerScoreMarkup(playerSeriesScoreLabel(q.m,targetId,q.maps)'));assert.match(css,/\.faceit-match-score \.score-positive/);assert.match(css,/\.track-match-score \.score-negative/);});
test('Profile and route rails share readable navigation dimensions and hide the rail scrollbar',()=>{assert.match(app,/faceit-exact-shell faceit-app-shell faceit-route-shell/);assert.match(app,/faceit-exact-shell faceit-app-shell faceit-profile-shell/);assert.match(css,/\.faceit-app-shell \.faceit-exact-global-rail nav button/);assert.match(css,/grid-template-columns:170px minmax\(0,1fr\)!important/);assert.match(css,/scrollbar-width:none!important/);assert.match(css,/overflow-x:clip!important/);});
test('map catalogue photos fill the tile and K/D uses tabular numerals',()=>{assert.match(css,/\.maps-page \.map-card-grid \.map-card-photo\{display:block!important;position:absolute!important;inset:0!important/);assert.match(css,/font-variant-numeric:tabular-nums lining-nums!important/);});

test('Profile and Track render player-relative scores with a muted opponent number',()=>{assert.ok(app.includes('playerScoreMarkup(playerSeriesScoreLabel(q.m,id,q.maps)'));assert.ok(app.includes('playerScoreMarkup(playerSeriesScoreLabel(q.m,targetId,q.maps)'));assert.match(app,/function playerScoreMarkup\(score\)/);assert.match(css,/\.score-muted\{color:rgba\(220,226,232,\.52\)!important/);});
test('Match map buttons wrap into a responsive grid and their modal scrollbar is visually hidden',()=>{assert.ok(app.includes('toolbar match-map-buttons'));assert.match(css,/\.match-map-buttons\{[\s\S]*grid-template-columns:repeat\(auto-fit,minmax\(180px,1fr\)\)!important/);assert.match(css,/#modal \.modal\.panel\.wide::-webkit-scrollbar/);});
test('Map catalogue photo reaches the card edge without a divider gap',()=>{assert.match(css,/\.maps-page \.map-card-grid \.map-card-image\{[\s\S]*margin-bottom:-1px!important/);assert.match(css,/height:calc\(100% \+ 1px\)!important/);});

test('The global rail spaces navigation and aligns Settings at the same bottom offset',()=>{
  assert.match(css,/\.faceit-app-shell \.faceit-exact-global-rail nav\{[\s\S]*gap:12px!important/);
  assert.match(css,/\.faceit-app-shell \.faceit-exact-rail-bottom\{[\s\S]*padding-bottom:12px!important/);
  assert.match(css,/\.faceit-app-shell \.faceit-exact-global-rail\{[\s\S]*height:100vh!important/);
});
test('Home workspace fills the available route width without the old 1480px cap',()=>{
  assert.match(css,/\.faceit-route-shell \.faceit-route-content\{[\s\S]*max-width:none!important/);
  assert.match(css,/\.home-rebuild\{[\s\S]*width:100%!important[\s\S]*max-width:none!important/);
  assert.match(css,/\.faceit-route-shell:has\(\.home-rebuild\)/);
});
test('Players table is slightly larger and map cards give more space to the photograph',()=>{
  assert.match(css,/\.players-table td\{[\s\S]*font-size:13px!important/);
  assert.match(css,/\.maps-page \.map-card-grid \.map-card\{[\s\S]*aspect-ratio:1\.15 \/ 1!important/);
  assert.match(css,/\.maps-page \.map-card-grid \.map-card-image\{[\s\S]*min-height:150px!important/);
  assert.match(css,/\.maps-page \.map-card-grid \.map-card-photo\{[\s\S]*inset:-1px!important[\s\S]*width:calc\(100% \+ 2px\)!important/);
});
test('All scrollbars are hidden without disabling overflow scrolling',()=>{
  assert.match(css,/html,body,\*\{[\s\S]*scrollbar-width:none!important/);
  assert.match(css,/\*::-webkit-scrollbar\{[\s\S]*display:none!important/);
  assert.doesNotMatch(css,/html,body,\*\{[^}]*overflow:\s*hidden/);
});

test('Track lists every match in the active filter, newest first',()=>{
  const trackStart=app.indexOf('function track(v){');
  const trackEnd=app.indexOf('function bindTrackChart(',trackStart);
  const trackCode=app.slice(trackStart,trackEnd);
  assert.ok(trackCode.includes('const recent=rows.slice().reverse().map(q=>'));
  assert.doesNotMatch(trackCode,/rows\.slice\(-\d+\)/);
  assert.ok(trackCode.includes("'Матчи в треке'"));
});
test('Track match list defines six columns for six visible fields',()=>{
  assert.match(css,/\.track-match-head,\.track-match-row\{[\s\S]*minmax\(66px,\.46fr\)[\s\S]*minmax\(100px,\.72fr\)/);
});
test('Track and Seasons have a slightly wider content canvas than the base profile route',()=>{
  assert.match(css,/\.track-page,\.season-page\{[\s\S]*max-width:1580px!important/);
});
test('Map catalogue cards are restored to square tiles with a larger flexible photo row',()=>{
  const restoreAt=css.lastIndexOf('/* Restore the earlier square map catalogue cards');
  const mapRules=css.slice(restoreAt);
  assert.match(mapRules,/aspect-ratio:1 \/ 1!important/);
  assert.match(mapRules,/grid-template-rows:minmax\(0,1fr\) auto auto!important/);
  assert.match(mapRules,/\.maps-page \.map-card-grid \.map-card-image\{[\s\S]*min-height:0!important/);
  assert.match(mapRules,/\.maps-page \.map-card-grid \.map-card-photo\{[\s\S]*height:100%!important/);
});
