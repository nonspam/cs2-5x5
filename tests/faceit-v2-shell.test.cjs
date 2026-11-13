const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('app_v57.js');
const account = read('account_module.js');
const css = read('style_v57.css');
const elo = read('elo_v3.js');

test('FACEIT V2 exposes existing site sections from one profile-inspired rail', () => {
  assert.match(app, /function faceitAppRailMarkup\(\)/);
  for (const route of ['home','analytics','base','maps','teams','records','profile']) {
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
  assert.match(app,/DOMContentLoaded',\(\)=>\{state\.tab=appRouteFromLocation\(\);load\(\)\.then/);
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

test('map catalogue cards stay compact and do not reserve a square blank image area',()=>{
  assert.match(css,/\.maps-page \.map-card-grid \.map-card\{[\s\S]*aspect-ratio:auto!important/);
  assert.match(css,/\.maps-page \.map-card-grid \.map-card-image\{[\s\S]*height:150px!important[\s\S]*max-height:150px!important/);
});
test('player Statistics table removes Matches column and keeps Maps',()=>{
  const start=app.indexOf('function players(v){');
  const end=app.indexOf('function compare',start);
  const source=app.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.ok(source.includes('<th>Игрок</th><th>Карты</th><th>K</th>'));
  assert.doesNotMatch(source,/<th>Матчи<\/th>/);
  assert.doesNotMatch(source,/<td>\$\{q\.x\.matches\}<\/td>/);
});
test('ELO V3 starts every player at 1000 and ignores matches before the reset cutoff',()=>{
  assert.match(elo,/const START_RATING=1000/);
  assert.match(elo,/const RESET_AT=Date\.parse\('2026-11-13T03:08:26\+03:00'\)/);
  assert.match(elo,/\.filter\(match=>\{[\s\S]*timestamp>=RESET_AT/);
  assert.match(elo,/resetPolicy:'Все игроки стартуют с 1000/);
});
test('profile game history keeps only the map count row',()=>{
  const start=app.indexOf("const gameHistory=");
  const end=app.indexOf("const activity=",start);
  const source=app.slice(start,end);
  assert.ok(start>=0&&end>start);
  assert.match(source,/<span>Карты<\/span>/);
  assert.doesNotMatch(source,/<span>Матчи<\/span>/);
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
test('Match map cards render inside the responsive center column',()=>{assert.ok(app.includes('match-room-map-list'));assert.match(css,/\.match-room-map-list\{[\s\S]*grid-template-columns:1fr/);assert.match(css,/\.match-room-center \.match-room-map-list\{[\s\S]*grid-template-columns:repeat\(auto-fit,minmax\(150px,1fr\)\)/);assert.match(css,/#modal \.modal\.panel\.wide::-webkit-scrollbar/);});
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
  const trackStart=app.indexOf('function track(v,embedded=false){');
  const trackEnd=app.indexOf('function bindTrackChart(',trackStart);
  const trackCode=app.slice(trackStart,trackEnd);
  assert.ok(trackCode.includes('const recent=rows.slice().reverse().map(q=>'));
  assert.doesNotMatch(trackCode,/rows\.slice\(-\d+\)/);
  assert.ok(trackCode.includes('Матчи в треке'));
});
test('Track match list defines seven columns including the BO series format',()=>{
  assert.match(app,/track-match-format/);
  assert.match(css,/\.track-match-head,\.track-match-row\{[\s\S]*minmax\(58px,\.42fr\)[\s\S]*minmax\(145px,1\.15fr\)/);
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

test('Track and season archive live inside Profile instead of occupying permanent rail slots',()=>{
  const rail=app.slice(app.indexOf('function faceitAppRailMarkup()'),app.indexOf('function bindAppShell'));
  assert.doesNotMatch(rail,/\['seasons'/);
  assert.doesNotMatch(rail,/\['track'/);
  const profile=app.slice(app.indexOf('function profilePage(v){'),app.indexOf('async function handleProfileImage'));
  assert.match(profile,/data-profile-section="track"/);
  assert.match(profile,/data-season-picker-toggle/);
  assert.match(profile,/data-profile-season=/);
  assert.ok(profile.includes('seasonWidgetMarkup'));
  assert.ok(profile.includes('widgetSeason.label'));
});

test('Match Room renders the approved standalone roster, map and veto layout',()=>{
  const i=app.indexOf('function openMatchDetail(id){'),j=app.indexOf('function base(v){',i),s=app.slice(i,j);
  for(const x of ['match-room-hero','match-room-result','match-room-team','match-room-center-column','match-room-map-list','match-room-veto','match-room-global-header','matchRoomPlayerSearch','matchRoomAccountMenu','match-career-grid','match-player-level','match-player-card-ref','match-player-rating','profileSummary(profileMatchesForPlayer','CS2EloV3?.player(id)']) assert.ok(s.includes(x),x);
  assert.doesNotMatch(s,/CS2EloV3\?\.playerData/);
  assert.doesNotMatch(s,/СМОТРЕТЬ ДЕМО|К ПОДБОРУ ИГРОКОВ|WINLINE|ВНЕСИТЕ ДЕПОЗИТ/);
});

test('Match Center responsive styles include full-screen layout and map artwork',()=>{
  for(const x of ['.match-detail-modal','.match-room-hero','.match-room-layout','.match-room-team','.match-room-map-list','.match-scoreboard','.match-detail-tabs']) assert.ok(css.includes(x),x);
  assert.match(css,/@media\(max-width:600px\)/);
});
test('Match Center reference styling uses compact rectangular map rows and square player avatars',()=>{
  assert.ok(css.includes('.match-room-center .match-map-row{display:grid;grid-template-columns:38px minmax(0,1fr) auto'));
  assert.ok(css.includes('.match-room-team .match-player-card-ref .player-avatar{width:40px!important;height:40px!important'));
  assert.ok(css.includes('.match-awards{display:grid'));
});

test('Match Room follows the approved full-page FACEIT-inspired hierarchy without inventing match metadata',()=>{
  const i=app.indexOf('function openMatchDetail(id){'),j=app.indexOf('function base(v){',i),source=app.slice(i,j);
  assert.ok(i>=0&&j>i);
  for(const marker of ['matchRoomPage','match-room-global-header','match-room-hero-meta','match-room-result','match-room-roster-heading','match-room-map-list','match-room-veto','matchRoomPlayerSearch','matchRoomAccountMenu']) assert.ok(source.includes(marker),marker);
  assert.match(source,/CS2EloV3\?\.player\(r\.id\)\?\.rating/);
  assert.match(source,/Пики и баны не записаны в источнике матча/);
  assert.doesNotMatch(source,/Moscow|XPLAY\.GG|EXT · ПРОГНОЗ|Смотреть демо|WINLINE/);
  assert.doesNotMatch(source,/match-detail-backdrop|data-match-tab=/);
});

test('Match Overview uses the dark FACEIT surface palette and adapts the scorecard and roster grid',()=>{
  for(const selector of ['.match-room-nav','.match-room-tabs','.match-room-breadcrumbs','.match-room-result','.match-room-roster-heading']) assert.ok(css.includes(selector),selector);
  assert.match(css,/\.match-room-hero\{[\s\S]*background:#121212/);
  assert.match(css,/\.match-room-result\{[\s\S]*background:#1d1d1d/);
  assert.match(css,/@media\(max-width:700px\)[\s\S]*\.match-room-result\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/@media\(max-width:1050px\)[\s\S]*\.match-room-layout\{grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
});


test('Match Overview player metrics are one FACEIT-style strip and player names are not forcibly ellipsized',()=>{
  assert.ok(app.includes("metric(c.wins+'/'+c.losses,'W/L')"));
  assert.match(app,/<strong title="'\+esc\(r\.name\)\+'">'\+esc\(r\.name\)/);
  assert.match(css,/\.match-room-team \.match-career-grid\{[\s\S]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)!important/);
  assert.match(css,/background:transparent!important/);
  assert.match(css,/white-space:normal!important/);
  assert.match(css,/\.match-room-side\{grid-template-columns:minmax\(0,1fr\) 40px auto!important\}/);
});


test('Match Overview player card follows the FACEIT single-surface column layout',()=>{
  assert.match(app,/match-career-grid/);
  assert.match(app,/matchRoomInitialAvatar\(r\.id,'md',r\.name\)/);
  assert.match(app,/match-player-rating/);
  assert.match(app,/match-player-level/);
  assert.match(css,/\.match-room-team \.match-player-card-ref\{[\s\S]*padding:10px 11px 8px 52px!important/);
  assert.match(css,/\.match-room-team \.match-player-card-ref \.match-career-grid\{[\s\S]*grid-template-columns:repeat\(6,minmax\(0,1fr\)\)!important/);
  assert.match(css,/\.match-room-team \.match-player-card-ref \.match-career-metric\{[\s\S]*background:transparent!important/);
  assert.match(css,/overflow-wrap:anywhere!important/);
  assert.match(css,/border-top:1px solid #292929!important/);
});


test('Match Overview corrective player card keeps avatar visible and restores readable proportions',()=>{
  assert.match(app,/match-player-avatar-wrap/);
  assert.match(app,/match-player-avatar-wrap[^]*matchRoomInitialAvatar\(r\.id,'md',r\.name\)/);
  assert.match(css,/min-height:126px!important/);
  assert.match(css,/grid-template-columns:40px minmax\(0,1fr\) auto 30px!important/);
  assert.match(css,/\.match-player-avatar-wrap \.player-avatar\{[\s\S]*width:40px!important;height:40px!important/);
  assert.match(css,/\.match-career-metric b\{[\s\S]*font-size:12px!important/);
});


test('Match Overview map result tiles use map-specific full-bleed artwork',()=>{
  assert.match(app,/match-map-row match-map-row-cover/);
  assert.match(app,/mapThumb\(mp\.map,'match-map-thumb'\)/);
  assert.match(css,/\.match-map-row-cover \.match-map-row-thumb \.map-thumb-photo\{[\s\S]*object-fit:cover!important/);
  assert.match(css,/\.match-map-row-cover::after\{[\s\S]*linear-gradient/);
  assert.match(css,/\.match-map-row-cover \.match-map-row-copy strong\{[\s\S]*font-size:18px!important/);
  assert.match(css,/\.match-map-row-cover \.match-map-row-score\{[\s\S]*font-size:21px!important/);
});


test('Match Room keeps the approved simple match-first view without a separate Top or Statistics tab',()=>{
  const i=app.indexOf('function openMatchDetail(id){'),j=app.indexOf('function base(v){',i),source=app.slice(i,j);
  assert.ok(i>=0&&j>i);
  assert.match(source,/match-room-columns/);
  assert.match(source,/match-room-map-list/);
  const pageStart=source.indexOf('const roomPage=');
  const pageEnd=source.indexOf('bindMatchRoomHeader();',pageStart);
  const renderedPage=source.slice(pageStart,pageEnd);
  assert.doesNotMatch(renderedPage,/data-match-tab="top"|data-match-tab="stats"|match-top-table/);
});

test('Profile ELO chart uses delegated capture-phase clicks and expanded SVG hit targets',()=>{
  assert.match(app,/const pointFromEvent=e=>/);
  assert.match(app,/root\.addEventListener\('click',[\s\S]*?\},true\)/);
  assert.match(app,/root\.addEventListener\('keydown'/);
  assert.match(app,/distance<=28\?nearest:null/);
  assert.match(app,/const resolvedMatch=findMatch\(event\)/);
  assert.match(app,/openMatchDetail\(resolvedMatch\.match_id\)/);
  assert.match(css,/\.faceit-elo-chart \.faceit-elo-hit\{r:14/);
});
test('Profile ELO point actions resolve the canonical match id before opening its match room',()=>{
  assert.match(app,/const resolvedMatch=findMatch\(event\)/);
  assert.match(app,/openMatchDetail\(resolvedMatch\.match_id\)/);
  assert.match(app,/Матч для этой точки ELO не найден в текущей базе/);
});

test('Section headers and active controls use the shared lime accent across core pages',()=>{
  for(const page of ['stats-page','base-page','teams-page','records-page','maps-page']){
    assert.ok(app.includes('class="section '+page+'"'));
    assert.ok(css.includes('.'+page+'>.section-head'));
  }
  assert.ok(css.includes('--site-lime:#b8ef45'));
  assert.ok(css.includes('border:2px solid var(--site-lime)'));
  assert.ok(css.includes('.base-page>.section-head .toolbar .btn.primary'));
  assert.ok(css.includes('.teams-page>.section-head .toolbar .btn.primary'));
  assert.ok(css.includes('.records-page>.section-head .toolbar .btn.primary'));
  assert.ok(css.includes('padding-left:3px!important'));
});

test('Nested Maps, Teams and Records headers get lime backgrounds while titles stay white',()=>{
  assert.ok(css.includes('.maps-page .map-lab-panel>.section-head'));
  assert.ok(css.includes('.teams-page .team-roster-picker>.section-head'));
  assert.ok(css.includes('.records-page .record-block>.section-head'));
  assert.ok(css.includes('.records-page>.section>.section-head'));
  assert.ok(css.includes('.maps-page .map-lab-panel>.section-head h3{color:#fff!important'));
  assert.ok(css.includes('.teams-page .team-roster-picker>.section-head h3{color:#fff!important'));
  assert.ok(css.includes('.records-page .record-block>.section-head h3{color:#fff!important'));
  assert.ok(css.includes('.stats-page>.section-head h2,.base-page>.section-head h2'));
  assert.ok(css.includes('color:#fff!important'));
});

test('Section headers use soft lime-to-charcoal gradients instead of solid lime fills',()=>{
  assert.ok(css.includes('linear-gradient(100deg,rgba(184,239,69,.20) 0%,rgba(115,151,49,.13) 34%,rgba(30,36,28,.72) 70%,rgba(12,15,17,.96) 100%)'));
  assert.ok(css.includes('.maps-page .map-lab-panel>.section-head'));
  assert.ok(css.includes('.teams-page .team-roster-picker>.section-head'));
  assert.ok(css.includes('.records-page .record-block>.section-head'));
  assert.ok(css.includes('color:#fff!important'));
});

test('Lime gradient remains only on main page headers, not nested module headers',()=>{
  for(const selector of ['.maps-page .map-selected-head>.section-head','.maps-page .map-lab-panel>.section-head','.teams-page .team-roster-picker>.section-head','.records-page .record-block>.section-head','.records-page>.section>.section-head']) assert.ok(css.includes(selector));
  const reset=css.slice(css.lastIndexOf('/* 2026-11-13 — Reduce lime usage'));
  assert.ok(reset.includes('background:transparent!important'));
  assert.ok(reset.includes('border:0!important'));
  assert.ok(css.includes('.stats-page>.section-head'));
  assert.ok(css.includes('.base-page>.section-head'));
  assert.ok(css.includes('.teams-page>.section-head'));
  assert.ok(css.includes('.records-page>.section-head'));
  assert.ok(css.includes('.maps-page>.section-head'));
});

test('match room opens as a standalone full-page route, not a modal overlay',()=>{
  assert.match(app,/id="matchRoomPage"/);
  assert.match(app,/history\.pushState\(\{\.\.\.history\.state,cs2MatchRoom:id\}/);
  assert.match(app,/function closeMatchRoom\(options=\{\}\)/);
  assert.doesNotMatch(app,/modal-back match-detail-backdrop/);
});
test('match room reproduces the approved black three-column layout with search and profile menu',()=>{
  assert.match(app,/match-room-global-header/);
  assert.match(app,/matchRoomPlayerSearch/);
  assert.match(app,/matchRoomAccountMenu/);
  assert.match(app,/match-room-columns/);
  assert.match(css,/\.match-room-page\{position:fixed!important;z-index:12000!important/);
  assert.match(css,/\.match-room-columns\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(300px,1\.12fr\) minmax\(0,1fr\)/);
  assert.match(css,/body\.match-room-open\{overflow:hidden!important;background:#000!important/);
});
test('match room excludes unavailable demo, matchmaking, deposit and promotional integrations',()=>{
  const start=app.indexOf('const roomPage=');
  const end=app.indexOf('bindMatchRoomHeader();',start);
  const source=app.slice(start,end);
  for(const label of ['СМОТРЕТЬ ДЕМО','К ПОДБОРУ ИГРОКОВ','WINLINE','ВНЕСИТЕ ДЕПОЗИТ']) assert.ok(!source.includes(label),'match room excludes '+label);
});

test('Match Room hero map artwork is layered above the hero background and below readable content',()=>{
  assert.match(css,/#matchRoomPage \.match-room-hero-art\{display:block!important;position:absolute!important;z-index:0!important/);
  assert.match(css,/#matchRoomPage \.match-room-hero-art:after\{content:""!important;display:block!important;position:absolute!important;z-index:1!important/);
  assert.match(css,/#matchRoomPage \.match-room-hero-meta,#matchRoomPage \.match-room-result\{position:relative!important;z-index:2!important/);
  assert.match(css,/#matchRoomPage \.match-room-hero-art \.map-thumb-photo\{display:block!important/);
});
test('Match Room main content is full-width and not constrained by the global main max-width',()=>{
  assert.match(css,/#matchRoomPage>\.match-room-content\{display:block!important;width:100%!important;max-width:none!important/);
  assert.match(css,/#matchRoomPage \.match-room-columns\{width:100%!important;max-width:none!important/);
});

test('Match Room uses temporary first-letter avatars instead of image placeholders',()=>{
  assert.match(app,/function matchRoomInitialAvatar\(id,size='md',displayName=''\)/);
  const i=app.indexOf('function openMatchDetail(id){'),j=app.indexOf('function base(v){',i),source=app.slice(i,j);
  assert.ok(source.includes('matchRoomInitialAvatar('));
  assert.doesNotMatch(source,/profileAvatarMarkup\(/);
  assert.match(source,/matchRoomInitialAvatar\(p\.player_id,'xs'\)/);
});

test('Match Room uses resolved player display names for initials, including guests and search results',()=>{
  assert.match(app,/function matchRoomInitialAvatar\(id,size='md',displayName=''\)/);
  assert.match(app,/matchRoomInitialAvatar\(r\.id,'md',r\.name\)/);
  assert.match(app,/matchRoomInitialAvatar\(candidate\?\.id,'md',candidate\?\.name\)/);
  assert.match(app,/matchRoomInitialAvatar\(p\.player_id,'xs',p\.display_name\)/);
});
test('Match Room hero includes real team-average ELO and a level ring derived from CS2 ELO V3',()=>{
  assert.match(app,/const teamLevel=rs=>/);
  assert.match(app,/const eloBadge=\(rating,level\)=>/);
  assert.match(app,/eloBadge\(elo,teamLevel\(rs\)\)/);
  assert.match(app,/CS2EloV3\?\.player\(r\.id\)\?\.level/);
});
test('Match Room desktop geometry follows the approved 1 : 1.18 : 1 three-column reference',()=>{
  assert.match(css,/#matchRoomPage \.match-room-columns\{[^}]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.18fr\) minmax\(0,1fr\)!important/);
  assert.match(css,/#matchRoomPage>\.match-room-content\{[^}]*padding:18px clamp\(18px,1\.75vw,32px\) 38px!important/);
  assert.match(css,/#matchRoomPage \.match-room-hero\{[^}]*min-height:146px!important/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref\{[^}]*min-height:116px!important/);
  assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover\{[^}]*height:94px!important/);
});
test('Match Room has explicit tablet and mobile layout breakpoints without horizontal overflow',()=>{
  assert.match(css,/@media\(max-width:1100px\)\{#matchRoomPage \.match-room-columns\{grid-template-columns:minmax\(0,1fr\) minmax\(260px,1fr\)!important\}/);
  assert.match(css,/@media\(max-width:760px\)\{#matchRoomPage>\.match-room-content/);
  assert.match(css,/\.match-room-page\{[^}]*overflow-x:hidden!important/);
});
