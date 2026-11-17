const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('app_v57.js');
const account = read('account_module.js');
const css = read('style_v57.css');
const html = read('index.html');
const elo = read('elo_v3.js');

test('FACEIT V2 exposes existing site sections from one profile-inspired rail', () => {
  assert.match(app, /function faceitAppRailMarkup\(\)/);
  for (const route of ['home','analytics','base','maps','teams','records']) {
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
  assert.match(app, /const APP_ROUTE_IDS=\['home','analytics','ranking','base','maps','teams','records','seasons','track','settings','profile','compare'\]/);
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
  assert.match(app, /data-utility-action="profile"/);
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
  const i=app.indexOf('function openMatchDetail(id,options={}){'),j=app.indexOf('function base(v){',i),s=app.slice(i,j);
  for(const x of ['match-room-hero','match-room-result','match-room-team','match-room-center-column','match-room-map-list','match-room-veto','match-career-grid','match-player-level','match-player-card-ref','match-player-rating','profileSummary(profileMatchesForPlayer','CS2EloV3?.player(id)']) assert.ok(s.includes(x),x);
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
  const i=app.indexOf('function openMatchDetail(id,options={}){'),j=app.indexOf('function base(v){',i),source=app.slice(i,j);
  assert.ok(i>=0&&j>i);
  for(const marker of ['matchRoomPage','match-room-hero-meta','match-room-result','match-room-roster-heading','match-room-map-list','match-room-veto','matchRoomPlayerSearch','matchRoomAccountMenu']) assert.ok(source.includes(marker),marker);
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
  assert.ok(app.includes("metric(c.matches,'МАТЧИ')"));
  assert.ok(!app.includes("metric(c.rating==null?'—':fmt(c.rating,0),'РЕЙТИНГ')"));
  assert.ok(app.includes('metric-avg-kda'));
  assert.match(app,/metric-winrate '\+\(c\.wr>=60\?'is-good':c\.wr>=40\?'is-mid':'is-bad'\)/);
  assert.match(app,/<strong>'\+esc\(r\.name\)/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.match-career-grid\{[\s\S]*grid-template-columns:56px repeat\(4,minmax\(0,1fr\)\)!important/);
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
  assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover:after\{background:transparent!important;opacity:0!important/);
  assert.match(css,/\.match-map-row-cover \.match-map-row-copy strong\{[\s\S]*font-size:18px!important/);
  assert.match(css,/\.match-map-row-cover \.match-map-row-score\{[\s\S]*font-size:21px!important/);
});


test('Match Room keeps the approved simple match-first view without a separate Top or Statistics tab',()=>{
  const i=app.indexOf('function openMatchDetail(id,options={}){'),j=app.indexOf('function base(v){',i),source=app.slice(i,j);
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
  assert.match(app,/cs2Route:'base',cs2MatchRoom:matchId/);
  assert.match(app,/window\.history\[options\.restore\?'replaceState':'pushState'\]/);
  assert.match(app,/function closeMatchRoom\(options=\{\}\)/);
  assert.doesNotMatch(app,/modal-back match-detail-backdrop/);
});
test('match room uses the site-wide header and approved three-column layout',()=>{
  assert.match(html,/sitePlayerSearchInput/);
  assert.match(app,/bindSitePlayerSearch/);
  assert.match(app,/match-room-columns/);
  assert.match(app,/match-room-score-a/);
  assert.match(css,/#matchRoomPage \.match-room-result\{[\s\S]*background:transparent!important;border:0!important/);
  const roomStart=app.indexOf('const roomPage=');
  const roomEnd=app.indexOf("document.getElementById('matchRoomPage')?.remove()",roomStart);
  const room=app.slice(roomStart,roomEnd);
  assert.doesNotMatch(room,/match-room-global-header|matchRoomPlayerSearch/);
  assert.match(css,/body\.match-room-open \.match-room-page\{[\s\S]*inset:0!important/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.match-career-grid\{[\s\S]*repeat\(5,minmax\(0,1fr\)\)/);
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
  const i=app.indexOf('function openMatchDetail(id,options={}){'),j=app.indexOf('function base(v){',i),source=app.slice(i,j);
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
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref\{min-height:98px!important;height:98px!important\}/);
  assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover\{[^}]*height:94px!important/);
});
test('Match Room has explicit tablet and mobile layout breakpoints without horizontal overflow',()=>{
  assert.match(css,/@media\(max-width:1100px\)\{#matchRoomPage \.match-room-columns\{grid-template-columns:minmax\(0,1fr\) minmax\(260px,1fr\)!important\}/);
  assert.match(css,/@media\(max-width:760px\)\{#matchRoomPage>\.match-room-content/);
  assert.match(css,/\.match-room-page\{[^}]*overflow-x:hidden!important/);
});

test('Match Room player cards use explicit colored levels and compact FACEIT-like dimensions',()=>{
  assert.match(app,/class="match-player-level elo-level-'\+\(c\?\.level\|\|'unknown'\)\+'/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.match-player-identity\{grid-template-columns:46px[\s\S]*min-height:58px!important;height:58px!important/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.elo-level-4\{border-color:#facc15!important/);
});
test('Match Room map cards have no gray overlay and show score directly over unfiltered map art',()=>{
  assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover:after\{background:transparent!important;opacity:0!important/);
  assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover \.match-map-row-thumb \.map-thumb-photo\{opacity:1!important;filter:none!important/);
  assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover \.match-map-row-score\{font-size:21px!important;font-weight:950!important/);
});

test('FACEIT level badges use the supplied palette and visible progressive ring',()=>{
  assert.match(app,/level\?String\(level\):'—'/);
  assert.match(app,/c\?\.level\?String\(c\.level\):'—'/);
  for(const [level,color] of [['1','#f4f4f4'],['2','#20d83a'],['3','#20d83a'],['4','#ffd21a'],['5','#ffd21a'],['6','#ffd21a'],['7','#ffd21a'],['8','#ff7900'],['9','#ff7900'],['10','#ff2424']]){
    assert.ok(css.includes('#matchRoomPage .elo-level-'+level+'{--level-color:'+color));
  }
  assert.match(css,/\.match-player-level:before/);
  assert.match(css,/mask:radial-gradient/);
  assert.match(css,/z-index:1/);
  for(const degrees of [12,36,60,84,108,132,162,198,234,270]) assert.ok(css.includes('--level-arc:'+degrees+'deg!important'));
});

test('FACEIT level rings keep the numeric label visible above the masked arc',()=>{const expected=[12,36,60,84,108,132,162,198,234,270];expected.forEach((degrees,index)=>{assert.ok(css.includes('--level-arc:'+degrees+'deg!important'));if(index>0)assert.ok(degrees>expected[index-1]);});assert.match(css,/\.match-player-level:before/);assert.match(css,/mask:radial-gradient/);assert.match(css,/z-index:1/);});


test('Match Room desktop layout expands beyond the former fixed 1080px roster width',()=>{
  assert.match(css,/#matchRoomPage \.match-room-hero\{[^}]*width:100%!important;max-width:none!important/);
  assert.match(css,/#matchRoomPage \.match-room-columns\{[^}]*max-width:none!important[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(320px,1\.08fr\) minmax\(0,1fr\)!important/);
  assert.match(css,/#matchRoomPage \.match-room-team,[\s\S]*max-width:none!important/);
});
test('Match Room AVG KDA remains a visible single-line metric and neutral K/D is white',()=>{
  assert.match(app,/metric-avg-kda/);
  assert.match(app,/Math\.abs\(c\.kd-1\)<1e-9\?'is-neutral':c\.kd>1\?'is-good':'is-bad'/);
  assert.match(css,/\.metric-avg-kda b\{[\s\S]*white-space:nowrap!important/);
  assert.match(css,/\.metric-kd\.is-neutral b\{[\s\S]*color:#f2f2f2!important/);
});
test('Match Room score is unbadged and slightly raised within the hero',()=>{
  assert.match(css,/#matchRoomPage \.match-room-score\{[\s\S]*transform:translateY\(-4px\)!important/);
  assert.match(css,/#matchRoomPage \.match-room-score>span\{[\s\S]*border-radius:0!important[\s\S]*background:transparent!important/);
});

test('Match Room player career strip omits rating, uses rounded integer KDA and four compact metrics',()=>{
 assert.match(app,/Math\.round\(c\.avg\)\+' \/ '\+Math\.round\(c\.avgDeaths\)\+' \/ '\+Math\.round\(c\.avgAssists\)/);
 assert.match(app,/<small>KDA<\/small>/);
 assert.doesNotMatch(app,/metric\(c\.rating==null\?'—':fmt\(c\.rating,0\),'РЕЙТИНГ'\)/);
 assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.match-career-grid\{[\s\S]*grid-template-columns:56px repeat\(4,minmax\(0,1fr\)\)!important/);
});
test('Match Room uses balanced medium-width rosters, taller cards and larger map artwork',()=>{
 assert.match(css,/#matchRoomPage \.match-room-columns\{[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(0,1\.16fr\) minmax\(0,1fr\)!important/);
 assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref\{[^}]*height:104px!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover\{[^}]*height:112px!important/);
 assert.match(css,/#matchRoomPage>\.match-room-content\{[\s\S]*max-width:1560px!important/);
});
test('Match Room VS has no oval container or background',()=>{
 assert.match(css,/#matchRoomPage \.match-room-score\{[\s\S]*border-radius:0!important[\s\S]*background:transparent!important[\s\S]*transform:translateY\(-6px\)!important/);
});

test('Match Room desktop gently spreads the side rosters, lowers them and shifts/widens map column',()=>{
 assert.match(css,/@media\(min-width:1121px\)\{[\s\S]*\.match-room-columns>\.match-room-team:first-child\{\s*transform:translate\(-8px,8px\)!important/);
 assert.match(css,/@media\(min-width:1121px\)\{[\s\S]*\.match-room-columns>\.match-room-team:last-child\{\s*transform:translate\(8px,8px\)!important/);
 assert.match(css,/@media\(min-width:1121px\)\{[\s\S]*\.match-room-center-column\{\s*width:calc\(100% \+ 16px\)!important;[\s\S]*transform:translateX\(8px\)!important/);
 assert.match(css,/@media\(max-width:1120px\)\{[\s\S]*\.match-room-columns>\.match-room-team\{\s*transform:translateY\(8px\)!important/);
});


test('Match Room player cards are compact, with a narrower K/D cell and more space between cards',()=>{
  assert.match(css,/@media\(min-width:1121px\)\{[\s\S]*#matchRoomPage \.match-room-columns\{[\s\S]*max-width:1196px!important[\s\S]*grid-template-columns:minmax\(0,350px\) minmax\(320px,440px\) minmax\(0,350px\)!important[\s\S]*gap:28px!important/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-team-roster\{\s*gap:15px!important/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.match-career-grid\{\s*grid-template-columns:40px minmax\(0,1\.2fr\) minmax\(0,\.45fr\) minmax\(0,\.8fr\) minmax\(0,\.85fr\)!important/);
  assert.match(css,/#matchRoomPage \.match-room-columns>\.match-room-team\{\s*transform:translateY\(16px\)!important/);
});


test('Match Room keeps separate compact KDA/KD cells, slightly wider rosters and lower player columns',()=>{
  assert.match(app,/metric-avg-kda"><b>'\+Math\.round\(c\.avg\)/);
  assert.match(app,/class="match-career-metric metric-kd '\+\(Math\.abs\(c\.kd-1\)/);
  assert.doesNotMatch(app,/class="match-kda-values"/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.match-career-grid\{[\s\S]*grid-template-columns:48px 58px 85px 64px minmax\(64px,1fr\)!important/);
  assert.match(css,/@media\(min-width:1121px\)\{[\s\S]*max-width:1220px!important[\s\S]*grid-template-columns:minmax\(0,380px\) minmax\(0,400px\) minmax\(0,380px\)!important[\s\S]*gap:30px!important/);
  assert.match(css,/#matchRoomPage \.match-room-columns>\.match-room-team\{transform:translateY\(24px\)!important\}/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.match-career-grid\{\s*grid-template-columns:48px 48px minmax\(0,1fr\) 62px!important/);
  assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref \.metric-avg-kda b\{[\s\S]*font-size:clamp\(8px,\.64vw,10px\)!important/);
});


test('Match Room exposes working Overview and Statistics tabs with source-backed player data',()=>{
 assert.ok(app.includes('data-match-view-tab="overview"'));
 assert.ok(app.includes('data-match-view-tab="statistics"'));
 assert.ok(app.includes('data-match-view-tab="top"'));
 assert.ok(app.includes('data-match-view="top"'));
 assert.ok(app.includes('ТОП-10 ИГРОКОВ МАТЧА'));
 assert.ok(app.includes('match-stat-team-score'));
 assert.ok(app.includes('match-stat-rank'));
 assert.ok(app.includes('match-stat-highlight-value'));
 assert.ok(app.includes('match-stat-mvp-profile'));
 assert.ok(app.includes('data-match-view="overview"'));
 assert.ok(app.includes('data-match-view="statistics"'));
 assert.ok(app.includes('onclick="setMatchRoomView(&quot;statistics&quot;)'));
 assert.ok(app.includes('function setMatchRoomView(target)'));
 assert.ok(app.includes('view.hidden=view.dataset.matchView!==target'));
 assert.ok(app.includes("statMvp=leaderBy('kills')"));
 assert.ok(app.includes("table(A,'a')+table(B,'b')"));
 assert.match(css,/\.match-room-view-tabs button\.active:after/);
 assert.match(css,/\.match-statistics-summary\{display:grid/);
});

test('Match Room active binder leaves direct Overview / Statistics actions available',()=>{
 assert.equal(app.split('function bindMatchRoomHeader(){').length-1,1,'Match Room must have a single active header binder');
 const activeBind=app.slice(app.lastIndexOf('function bindMatchRoomHeader'));
 assert.ok(activeBind.includes('Tab buttons call setMatchRoomView() directly'));
 assert.ok(app.includes('function setMatchRoomView(target)'));
 assert.ok(app.includes('buttons.forEach'));
 assert.ok(app.includes('views.forEach'));
});




test('Match Room Statistics/TOP owner refinements preserve initials, compact rows and side identity',()=>{
 assert.match(app,/function profileAvatarMarkup\(id,size='sm',displayName=''\)/);
 assert.match(app,/profileAvatarMarkup\(id,size,name\)/);
 assert.match(app,/r\.kd>1\?'stat-positive':r\.kd<1\?'stat-negative':'stat-neutral'/);
 assert.match(app,/class="match-stat-top-score/);
 assert.match(css,/#matchRoomPage \.match-room-view-tabs button\{[\s\S]*border-radius:0!important/);
 assert.match(css,/#matchRoomPage \.match-stat-team\{[\s\S]*background:transparent!important;border:0!important/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-a \.match-stat-team-head>div>span\{color:#6da8ff/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-b \.match-stat-team-head>div>span\{color:#e7bd55/);
 assert.match(css,/#matchRoomPage \.match-stat-top-list\{max-width:1080px/);
});


test('Match Room second Statistics/TOP refinement adds row barriers, centered compact TOP and consistent player result colors',()=>{
 assert.match(app,/statMvp\?matchRoomInitialAvatar\(statMvp\.player_id\|\|null,'lg',statMvp\.name\)/);
 assert.match(app,/const resultClass=r\.kd>1\?'stat-positive':r\.kd<1\?'stat-negative':'stat-neutral'/);
 assert.match(app,/<strong class="'\+resultClass\+'">'\+esc\(r\.name\)/);
 assert.doesNotMatch(app,/Сортировка по суммарному K\/D · все карты серии/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-a \.match-scoreboard tbody td\.name[\s\S]*rgba\(87,91,185/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-b \.match-scoreboard tbody td\.name[\s\S]*rgba\(47,151,123/);
 assert.match(css,/#matchRoomPage \.match-stat-top-list\{[\s\S]*margin:12px auto 0/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>strong\{[\s\S]*white-space:nowrap/);
});


test('Match Room Statistics uses compact centered player/rank columns and FACEIT-style level badges',()=>{
 assert.match(app,/const faceitLevelBadge=level=>/);
 assert.match(app,/match-faceit-level-svg level-/);
 assert.match(app,/aria-label="FACEIT уровень /);
 assert.match(app,/<th>ИГРОК<\/th><th>РАНГ<\/th><th>K<\/th>/);
 assert.match(app,/colgroup><col class="match-col-player"><col class="match-col-rank">/);
 assert.match(css,/#matchRoomPage \.match-stat-teams\{\s*width:min\(100%,1080px\);margin:0 auto/);
 assert.match(css,/#matchRoomPage \.match-stat-teams \.match-scoreboard col\.match-col-player\{width:28%\}/);
 assert.match(css,/#matchRoomPage \.match-stat-teams \.match-scoreboard td\.match-stat-rank\{[\s\S]*border-left:1px solid[\s\S]*border-right:1px solid/);
 assert.match(app,/match-faceit-level-svg level-/);
 assert.match(app,/pathLength="270" stroke=/);
 assert.match(app,/stroke-dasharray=.*270/);
 assert.match(css,/#matchRoomPage \.match-stat-teams \.match-scoreboard tbody td\.match-stat-rank\{\s*background:#101010!important/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-b \.match-scoreboard tbody td:nth-child\(2\)\{\s*border-right-color:#d8ad25!important/);
 assert.match(css,/#matchRoomPage \.match-faceit-level-svg text\{font-size:12px!important/);
 assert.match(css,/#matchRoomPage \.match-faceit-level-svg \.level-track,\s*#matchRoomPage \.match-faceit-level-svg \.level-progress\{[\s\S]*stroke-width:4/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-b \.match-scoreboard tbody td\.name\{background:#30270f/);
 assert.match(css,/#matchRoomPage \.match-faceit-level-svg\{[\s\S]*width:28px;height:28px/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-b \.match-stat-team-head>div>span,\s*#matchRoomPage \.match-stat-team\.team-b \.match-stat-team-score\{color:#f0c52e/);
});


// Match Room score coloring: K, D, A and K/D share the player's K/D status.
assert.match(app,/stat-k .*stat-positive/);
assert.match(app,/stat-d .*stat-negative/);
assert.match(app,/stat-a .*stat-neutral/);
assert.match(app,/<text x="16" y="18\.4"/);
assert.match(css,/tbody td\.stat-positive\{color:#35d69a!important/);
assert.match(css,/tbody td\.stat-neutral\{color:#f2f2f2!important/);
assert.match(css,/tbody td\.stat-negative\{color:#ff5656!important/);


test('site-wide helper and native hover hints are removed while accessible labels remain',()=>{
  assert.doesNotMatch(app,/\s+title="/);
  assert.doesNotMatch(account,/\s+title="/);
  assert.doesNotMatch(html,/\s+title="/);
  assert.doesNotMatch(app,/setAttribute\(['"]title['"]/);
  assert.doesNotMatch(app,/match-statistics-footnote|Только показатели, полученные из источника матча/);
  assert.match(html,/aria-label="Настройки"/);
});

test('Match Room rank column divider remains neutral grey for both teams',()=>{
  assert.match(css,/#matchRoomPage \.match-stat-team\.team-b \.match-scoreboard tbody td:nth-child\(2\)\{\s*border-right-color:#424242!important/);
});


test('both Match Room rank-column right dividers stay neutral grey',()=>{
  assert.match(css,/#matchRoomPage \.match-stat-team\.team-a \.match-scoreboard tbody td:nth-child\(2\),[\s\S]*#matchRoomPage \.match-stat-team\.team-b \.match-scoreboard tbody td:nth-child\(2\)\{border-right-color:#424242!important\}/);
});


test('player profiles open in a contained window with the original horizontal top navigation',()=>{
 assert.match(app,/id="playerProfileWindow"/);
 assert.match(app,/id="playerProfileMount"/);
 assert.match(app,/function closePlayerProfileWindow\(options=\{\}\)/);
 assert.match(app,/faceit-exact-game-tabs/);
 assert.doesNotMatch(app,/faceit-profile-vertical-nav/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-shell\{[\s\S]*grid-template-columns:252px minmax\(0,1fr\)/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-global-rail\{display:none!important\}/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-game-tabs\{\s*display:flex!important/);
});

test('Match Room opens as a contained desktop window while the global site rail stays visible',()=>{
 assert.doesNotMatch(css,/body\.match-room-open:before/);
 assert.match(css,/body\.match-room-open \.match-room-page,#matchRoomPage\.match-room-page\{[\s\S]*inset:0 64px 0 170px!important/);
 assert.match(css,/@media\(max-width:700px\)[\s\S]*#matchRoomPage\.match-room-page\{inset:0!important/);
 assert.match(app,/function openMatchDetail\(id,options=\{\}\)/);
 assert.match(app,/function closeMatchRoom\(options=\{\}\)/);
});

test('profile horizontal tabs keep Overview, Match History and Track in the top content header',()=>{
 assert.match(app,/faceit-exact-game-tabs/);
 assert.match(app,/state\.profileSection/);
 assert.match(app,/data-profile-section/);
 assert.doesNotMatch(app,/faceit-profile-vertical-nav/);
});


test('profile window stays mounted and rerenders for all profile sections and profile-local controls',()=>{
 assert.match(app,/function render\(\)[\s\S]*const profileMount=document\.getElementById\('playerProfileMount'\);if\(profileMount\)\{profilePage\(profileMount\);enhanceSelects\(profileMount\)\}/);
 assert.match(app,/\['overview','history','track'\]\.includes\(section\)/);
 assert.match(app,/if\(section==='track'\)state\.trackSeasonKey=state\.profileSeasonKey\|\|'all'/);
 assert.match(app,/data-profile-section\]'.*setPlayerProfileSection\(button\.dataset\.profileSection\)/);
});

test('FACEIT workspace windows meet the persistent side rails without a dim full-page gap',()=>{
 assert.match(css,/body\.match-room-open \.match-room-page,#matchRoomPage\.match-room-page\{[\s\S]*inset:0 64px 0 170px!important/);
 assert.doesNotMatch(css,/body\.match-room-open:before/);
 assert.match(css,/#playerProfileWindow\.player-profile-window\{[\s\S]*inset:0 64px 0 170px!important/);
 assert.match(css,/\.faceit-utility-rail\{[\s\S]*width:64px!important/);
});
test('account wallpaper is applied globally for the signed-in user and is not part of the profile card',()=>{
 assert.match(app,/function accountWallpaperUrl\(\)/);
 assert.match(app,/function applyAccountWallpaper\(\)/);
 assert.match(app,/document\.body\.style\.setProperty\('--account-wallpaper'/);
 assert.match(app,/function clearAccountWallpaper\(\)/);
 assert.match(app,/ОБОИ САЙТА/);
 assert.doesNotMatch(app,/profileCoverStyle|profileCoverUrl|profileCoverFile|faceit-profile-vertical-nav/);
 assert.match(app,/handleProfileImage\('cover'/);
});

test('right utility rail exposes the signed-in profile and real recent match history',()=>{
 assert.match(app,/function renderUtilityRail\(\)/);
 assert.match(app,/profileMatchesForPlayer\(id\)\.slice\(0,6\)/);
 assert.match(app,/data-utility-match=/);
 assert.match(app,/renderUtilityRail\(\)\}/);
});

test('global navigation keeps Profile in the right utility rail rather than duplicating it on the left',()=>{
 const rail=app.slice(app.indexOf('function faceitAppRailMarkup'),app.indexOf('function bindAppShell'));
 assert.doesNotMatch(rail,/\['profile'.*Профиль/);
 assert.match(app,/data-utility-action=\"profile\"/);
 assert.match(css,/#view>.faceit-route-shell,#view>.faceit-profile-shell\{width:calc\(100% - 64px\)!important/);
});
test('profile shell cover image is not overwritten by a transparent background shorthand',()=>{
 assert.match(css,/#playerProfileWindow \.faceit-exact-shell\{[\s\S]*background:rgba\(8,8,8,\.42\)!important/);
});

test('profile keeps the original horizontal tabs and no longer renders a cover editor',()=>{
 assert.match(app,/faceit-exact-game-tabs/);
 assert.doesNotMatch(app,/profileCoverFile|▧ ОБЛОЖКА|faceit-profile-vertical-nav/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-game-tabs\{\s*display:flex!important/);
 assert.ok(css.includes('background:rgba(8,8,8,.58)!important'));
});
test('utility rail is limited to avatar and VS, with transparent hover-only controls and semantic score colors',()=>{
 const fn=app.slice(app.indexOf('function renderUtilityRail'),app.indexOf('function render(){',app.indexOf('function renderUtilityRail')));
 assert.match(fn,/data-utility-action="profile"/);
 assert.match(fn,/data-utility-action="matches"/);
 assert.doesNotMatch(fn,/data-utility-action="settings"/);
 assert.match(fn,/is-win/);assert.match(fn,/is-loss/);
 assert.match(css,/\.faceit-utility-button\{[^}]*border:0!important[^}]*background:transparent!important/);
 assert.match(css,/\.faceit-utility-match\.is-win strong\{color:#35df91!important\}/);
 assert.match(css,/\.faceit-utility-match\.is-loss strong\{color:#ff5656!important\}/);
});
test('global navigation uses transparent controls with lime hover instead of pill backgrounds',()=>{
 assert.match(css,/\.faceit-exact-global-rail nav button:hover[\s\S]*color:#c6ff45!important/);
 assert.match(css,/\.faceit-exact-global-rail nav button,\.faceit-exact-rail-bottom button,[\s\S]*border-radius:0!important/);
});

test('global route navigation closes both contained windows before rendering the selected route',()=>{
 assert.match(app,/function navigateApp\(tab,options=\{\}\)\{[\s\S]*closePlayerProfileWindow\(\);[\s\S]*closeMatchRoom\(\);/);
 assert.match(app,/function bindAppShell\(root\)[\s\S]*navigateApp\(button\.dataset\.appRoute\)/);
});
test('match room back returns to the matches list and closing clears stale modal state',()=>{
 assert.match(app,/function matchRoomNavigate\(route='base'\)/);
 assert.match(app,/function closeMatchRoom\(options=\{\}\)\{[\s\S]*page\?\.remove\(\);[\s\S]*classList\.remove\('match-room-open'\)/);
 assert.match(app,/function closePlayerProfileWindow\(options=\{\}\)\{[\s\S]*root\?\.remove\(\);[\s\S]*classList\.remove\('profile-window-open'\)/);
});
test('every map row opens the shared Match Room statistics view scoped to that map',()=>{
 assert.match(app,/function openMapDetail\(mapId\)[\s\S]*openMatchDetail\(match\.match_id,\{initialView:'statistics',mapId:map\.map_id,restore:returningToSeries,returnToSeries:returningToSeries\}\)/);
 assert.match(app,/function openMatchDetail\(id,options=\{\}\)/);
 assert.match(app,/const selectedMap=options\.mapId\?maps\.find/);
 assert.match(app,/if\(options\.initialView\)setMatchRoomView\(options\.initialView\)/);
});
test('profile provides a direct site-wallpaper action while retaining the avatar editor',()=>{
 assert.match(app,/profileWallpaperFile/);
 assert.match(app,/ОБОИ САЙТА/);
 assert.match(app,/profileAvatarFile/);
});
test('account wallpaper is a full-viewport layer and is shared behind all workspaces',()=>{
 assert.match(app,/document\.body\.style\.setProperty\('--account-wallpaper'/);
 assert.match(css,/body\.has-account-wallpaper:before\{[\s\S]*position:fixed;inset:0;z-index:0/);
 assert.match(css,/body\.match-room-open \.match-room-page,#matchRoomPage\.match-room-page\{[\s\S]*inset:0 64px 0 170px!important/);
 assert.match(css,/body\.match-room-open \.match-room-page,#matchRoomPage\.match-room-page\{[\s\S]*var\(--account-wallpaper,none\)/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-avatar-frame\{[\s\S]*height:333px!important/);
});
test('right rail uses the current account avatar as a large portrait tile above VS',()=>{
 const rail=app.slice(app.indexOf('function renderUtilityRail'),app.indexOf('function render(){',app.indexOf('function renderUtilityRail')));
 assert.match(rail,/state\.myPlayerId\|\|state\.myProfile\?\.player_id/);
 assert.match(rail,/faceit-utility-avatar-image/);
 assert.match(css,/\.faceit-utility-profile\{[\s\S]*width:46px!important;height:62px!important/);
});


test("profile overlay isolates the underlying route while retaining account wallpaper",()=>{
 assert.match(css,/#playerProfileWindow \.player-profile-window-backdrop\{[\s\S]*background:rgba\(0,0,0,\.995\)!important/);
 assert.match(css,/#playerProfileWindow \.player-profile-window-panel\{[\s\S]*linear-gradient\(rgba\(8,8,8,\.86\),rgba\(8,8,8,\.91\)\),var\(--account-wallpaper,none\)/);
 assert.match(css,/#playerProfileWindow\.player-profile-window\{[\s\S]*inset:0 64px 0 170px!important/);
});
test("Match Room no longer overrides the global body wallpaper pseudo-element",()=>{
 assert.doesNotMatch(css,/body\.match-room-open:before/);
 assert.match(css,/body\.has-account-wallpaper:before\{[\s\S]*var\(--account-wallpaper,none\)/);
 assert.match(css,/body\.match-room-open \.match-room-page,#matchRoomPage\.match-room-page\{[\s\S]*var\(--account-wallpaper,none\)/);
});
test("right utility avatar restores the taller portrait tile",()=>{
 assert.match(css.slice(css.lastIndexOf('.faceit-utility-profile{')),/width:42px!important;height:42px!important;flex:0 0 42px!important;border-radius:50%!important/);
 assert.match(css.slice(css.lastIndexOf('.faceit-utility-avatar-image,')),/border-radius:50%!important/);
});


test('profile media feedback stays above the profile window and reports unreadable uploaded images',()=>{
 assert.match(css.slice(css.lastIndexOf('.toast{')),/z-index:2147483000!important/);
 assert.match(app,/Файл сохранён, но изображение не открывается из хранилища/);
 assert.match(app,/applyAccountWallpaper\(\);render\(\);renderUtilityRail\(\)/);
});
test('utility avatar is circular and the account wallpaper remains visible behind app surfaces',()=>{
 assert.match(css.slice(css.lastIndexOf('.faceit-utility-profile{')),/width:42px!important;height:42px!important;flex:0 0 42px!important;border-radius:50%!important/);
 assert.match(css.slice(css.lastIndexOf('.faceit-utility-avatar-image,')),/border-radius:50%!important/);
 assert.match(css,/body\.has-account-wallpaper \.app\{background:transparent!important\}/);
 assert.match(css,/body\.has-account-wallpaper:before\{background-image:linear-gradient\(rgba\(5,5,5,\.34\),rgba\(5,5,5,\.44\)\),var\(--account-wallpaper,none\)!important\}/);
});


test('toast is moved out of the app stacking context before showing upload feedback',()=>{
 assert.match(app,/function toast\(message\)[\s\S]*if\(box\.parentElement!==document\.body\)document\.body\.appendChild\(box\)/);
});
test('VS recent matches panel uses compact rows with explicit grid layout',()=>{
 assert.match(css,/\.faceit-utility-match-list\{display:flex!important;flex-direction:column!important/);
 assert.match(css,/\.faceit-utility-match\{display:grid!important;grid-template-columns:1fr auto!important/);
 assert.match(css,/\.faceit-utility-match-result\{grid-area:result!important/);
});
test('profile 5 10 20 selector updates profile content without full page rerender',()=>{
 assert.match(app,/function setProfileWindowSize\(size\)[\s\S]*profilePage\(mount\);enhanceSelects\(mount\)/);
 assert.match(app,/const scrollTop=content\?\.scrollTop\|\|0;[\s\S]*refreshed\.scrollTop=scrollTop/);
 assert.match(app,/onclick="setProfileWindowSize\('\+n\+'\)"/);
});
test('account wallpaper has a visible layer behind transparent route shells',()=>{
 assert.match(css,/body\.has-account-wallpaper \.faceit-route-shell,body\.has-account-wallpaper \.faceit-profile-shell\{background:transparent!important/);
 assert.match(css,/body\.has-account-wallpaper:before\{background-image:linear-gradient\(rgba\(5,5,5,\.20\),rgba\(5,5,5,\.28\)\),var\(--account-wallpaper,none\)!important/);
});


test('account wallpaper is painted directly on the app surface, not only behind it',()=>{
 const wallpaperRule=css.slice(css.lastIndexOf('/* 2026-11-15 — paint account wallpaper on the actual app surface */'));
 assert.match(wallpaperRule,/body\.has-account-wallpaper \.app\{[\s\S]*background-image:linear-gradient\(rgba\(5,5,5,\.18\),rgba\(5,5,5,\.26\)\),var\(--account-wallpaper,none\)!important/);
 assert.match(wallpaperRule,/background-size:cover!important;background-position:center center!important/);
 assert.match(wallpaperRule,/body\.has-account-wallpaper:before\{background-image:none!important/);
});


test('account wallpaper is explicitly painted inside the Profile window',()=>{
 const wallpaperRules=css.slice(css.lastIndexOf('/* 2026-11-15 — account wallpaper continuity inside Profile and Match Room */'));
 assert.match(wallpaperRules,/body\.has-account-wallpaper #playerProfileWindow \.player-profile-window-panel\{[\s\S]*var\(--account-wallpaper,none\)!important/);
 assert.match(wallpaperRules,/body\.has-account-wallpaper #playerProfileWindow \.faceit-exact-shell,[\s\S]*background:transparent!important/);
});
test('account wallpaper is explicitly painted inside Match Room despite its opaque base styles',()=>{
 const wallpaperRules=css.slice(css.lastIndexOf('/* 2026-11-15 — account wallpaper continuity inside Profile and Match Room */'));
 assert.match(wallpaperRules,/body\.has-account-wallpaper #matchRoomPage\.match-room-page\{[\s\S]*var\(--account-wallpaper,none\)!important/);
 assert.match(wallpaperRules,/body\.has-account-wallpaper #matchRoomPage>\.match-room-content\{[\s\S]*background:transparent!important/);
});


test('Matches, Statistics, Home and Records reuse the approved Teams graphite palette',()=>{
 const palette=css.slice(css.lastIndexOf('/* 2026-11-15 — unify card surfaces with the approved Teams palette */'));
 assert.match(palette,/--team-surface:#0d1012/);
 assert.match(palette,/--team-card:#121617/);
 assert.match(palette,/--team-border:#2a3035/);
 assert.match(palette,/\.base-page \.data-table tbody tr,[\s\S]*var\(--team-card\)!important/);
 assert.match(palette,/\.stats-page \.players-table tbody tr\{[\s\S]*var\(--team-card\)!important/);
 assert.match(palette,/\.home-rebuild \.home-panel,[\s\S]*var\(--team-surface\)!important/);
 assert.match(palette,/\.records-page \.record-row\{[\s\S]*var\(--team-card\)!important/);
 assert.match(palette,/\.match-room-page \.match-player-card-ref,[\s\S]*var\(--team-card\)!important/);
});
test('Teams palette pass leaves the approved Maps page untouched',()=>{
 const palette=css.slice(css.lastIndexOf('/* 2026-11-15 — unify card surfaces with the approved Teams palette */'));
 assert.doesNotMatch(palette,/\.maps-page/);
});


test('opening a Match Room from a public profile preserves a dedicated return-to-profile action',()=>{
 assert.match(app,/const profileReturnId=window\.__activePlayerProfileId\|\|null/);
 assert.match(app,/window\.__matchRoomProfileReturnId=profileReturnId/);
 assert.match(app,/match-room-back-profile[\s\S]*matchRoomReturnToProfile\(\)/);
 assert.match(app,/function matchRoomReturnToProfile\(\)[\s\S]*openPublicPlayerProfile\(id,\{section:'history'\}\)/);
});
test('Match Room back-to-matches action remains separate from return-to-profile',()=>{
 assert.match(app,/function matchRoomNavigate\(route='base'\)/);
 assert.match(app,/window\.__matchRoomProfileReturnId=null;closeMatchRoom\(\);navigateApp/);
});
test('legacy blue fills are explicitly overridden on Matches, Statistics and Match Room',()=>{
 const fix=css.slice(css.lastIndexOf('/* 2026-11-15 — hard override for the two surfaces that retained legacy blue fills */'));
 assert.match(fix,/#view \.base-page>\.panel\.card,[\s\S]*background:#0d1012!important/);
 assert.match(fix,/#view \.stats-page \.players-table tbody tr:nth-child\(even\)\{background:#121617!important\}/);
 assert.match(fix,/#matchRoomPage\.match-room-page \.match-room-team \.match-player-card,[\s\S]*background:#121617!important/);
});


test('profile game tabs remain sticky and profile level ring uses FACEIT tier color',()=>{
 assert.match(css,/faceit-exact-game-tabs\{[\s\S]*position:sticky!important;top:0!important/);
 assert.match(app,/profileLevelColor=profileLevel>=10\?'#ff3b30':profileLevel>=7\?'#ff8a00':profileLevel>=4\?'#ffd43b'/);
 assert.match(app,/faceit-exact-level" style="--faceit-level-color:/);
});
test('Match Room has one minimal return action that restores profile match history',()=>{
 assert.match(app,/match-room-back-profile[\s\S]*>‹　Вернуться</);
 assert.doesNotMatch(app,/match-room-back-actions[^;]*К матчам/);
 assert.match(app,/openPublicPlayerProfile\(id,\{section:'history'\}\)/);
});
test('Match Room statistics roster rows receive explicit graphite fills',()=>{
 assert.match(css,/#matchRoomPage\.match-room-page \.match-room-statistics-view \.match-stat-teams \.match-stat-team \.data-table tbody tr,[\s\S]*background:#121617!important/);
});


test('profile navigation remains pinned and translucent; recent W/L are text-only and level is an arc',()=>{
 assert.match(css,/#playerProfileWindow \.faceit-exact-game-tabs\{[\s\S]*position:sticky!important[\s\S]*background:rgba\(9,12,14,\.34\)!important/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-form \.faceit-form-dot\{[\s\S]*background:transparent!important/);
 assert.match(app,/faceit-exact-level-ring/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-level-ring \.progress/);
});
test('Match Room map statistics can return to the parent series before returning to profile history',()=>{
 assert.match(app,/function openMapDetail\(mapId\)[\s\S]*__matchRoomSeriesReturn[\s\S]*returnToSeries:returningToSeries/);
 assert.match(app,/function matchRoomReturnToSeries\(\)[\s\S]*openMatchDetail\(context\.matchId/);
 assert.match(app,/match-room-back-series[\s\S]*matchRoomReturnToSeries\(\)/);
});
test('Match Room statistics use translucent surfaces and color only team identity cells',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-a \.match-scoreboard tbody td\.name\{[\s\S]*rgba\(44,111,206,\.30\)/);
 assert.match(css,/#matchRoomPage \.match-stat-team\.team-b \.match-scoreboard tbody td\.name\{[\s\S]*rgba\(35,148,103,\.28\)/);
 assert.match(css,/#matchRoomPage \.match-stat-mvp-card,[\s\S]*backdrop-filter:blur\(8px\)/);
});

test('Profile history rows and Match Room roster/map cards reveal the account wallpaper',()=>{
 assert.match(css,/#playerProfileWindow \.faceit-match-row\{[\s\S]*background:rgba\(9,13,15,\.26\)!important/);
 assert.match(css,/#matchRoomPage \.match-room-team \.match-player-card-ref\{[\s\S]*background:rgba\(9,13,15,\.46\)!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover\{[\s\S]*background-color:rgba\(9,13,15,\.42\)!important/);
});


test('Profile navigation has no duplicate CS2 label and uses a translucent sticky bar',()=>{
 const profile=app.slice(app.indexOf('function profilePage(v){'),app.indexOf('function openPublicPlayerProfile'));
 assert.match(profile,/faceit-exact-game-tabs"><button/);
 assert.doesNotMatch(profile,/faceit-exact-game-tabs"><span class="faceit-exact-cs-icon">CS2/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-game-tabs\{[\s\S]*position:sticky!important[\s\S]*rgba\(8,10,12,\.38\)/);
});
test('Profile W/L are letters only and FACEIT level arc has no square frame',()=>{
 assert.match(css,/#playerProfileWindow \.faceit-form-large \.faceit-form-dot\{[\s\S]*background:transparent!important/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-level\{[\s\S]*border:0!important[\s\S]*background:transparent!important/);
});
test('Match Room surfaces are translucent, team colors stay on avatars, and KD typography is consistent',()=>{
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-mvp-card\{[\s\S]*rgba\(10,13,15,\.40\)/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-team\.team-a \.match-scoreboard tbody td\.name \.player-avatar\{[\s\S]*outline:2px solid rgba\(65,145,255,\.82\)/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-team\.team-b \.match-scoreboard tbody td\.name \.player-avatar\{[\s\S]*outline:2px solid rgba\(53,210,145,\.78\)/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-scoreboard tbody td\.stat-neutral\{[\s\S]*font-weight:900!important/);
});
test('Profile match history keeps one continuous hover target and W/L labels have no tiles',()=>{
 assert.match(css,/#playerProfileWindow \.faceit-match-row:hover,[\s\S]*border-color:rgba\(198,255,69,\.52\)!important/);
 assert.match(css,/#playerProfileWindow \.faceit-form-large \.faceit-form-dot\.win\{color:#35d99a!important\}/);
});

test('Match Room TOP player rows use translucent wallpaper-revealing cards',()=>{
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-top-row\{[\s\S]*rgba\(10,13,15,\.34\)!important/);
});


test('Match Room Overview player cards expose wallpaper through identity and metric layers and use circular avatars',()=>{
 assert.match(css,/#matchRoomPage\.match-room-page \.match-room-team \.match-player-card-ref\{[\s\S]*rgba\(8,12,14,\.16\)!important[\s\S]*backdrop-filter:blur\(11px\)!important/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-room-team \.match-player-card-ref \.match-player-identity,[\s\S]*background:rgba\(8,12,14,\.12\)!important/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-room-team \.match-player-card-ref \.match-player-avatar-wrap,[\s\S]*border-radius:50%!important/);
 assert.match(css,/\.player-avatar img \+ span\{display:none!important\}/);
});
test('Match Room Statistics player row cells are translucent across all columns',()=>{
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-team \.match-scoreboard tbody td,[\s\S]*background:rgba\(8,12,14,\.18\)!important[\s\S]*backdrop-filter:blur\(10px\)!important/);
});
test('Track chart tooltip is fixed above Profile and follows the viewport while scrolling',()=>{
 assert.match(app,/tooltip\.style\.position='fixed';tooltip\.style\.zIndex='13050'/);
 assert.match(app,/window\.addEventListener\('scroll',reposition,\{capture:true,signal:controller\.signal\}\)/);
 assert.match(css,/\.track-chart-tooltip\{[\s\S]*position:fixed!important;z-index:13050!important/);
});


test('Match Room Statistics removes opaque table wrapper and table backgrounds',()=>{
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-teams \.match-stat-team \.table-wrap,[\s\S]*background:transparent!important/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-teams \.match-stat-team \.match-scoreboard tbody tr:nth-child\(even\)[\s\S]*background:transparent!important/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-stat-teams \.match-stat-team \.match-scoreboard tbody td\{[\s\S]*rgba\(8,12,14,\.16\)!important[\s\S]*backdrop-filter:blur\(11px\)!important/);
});


test('Match Room Statistics glass cells override the more-specific legacy opaque row selectors',()=>{
 assert.match(css,/#matchRoomPage\.match-room-page \.match-room-statistics-view \.match-stat-teams \.match-stat-team \.data-table tbody tr td\{[\s\S]*rgba\(8,12,14,\.20\)!important[\s\S]*backdrop-filter:blur\(10px\)!important/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-room-statistics-view \.match-stat-teams \.match-stat-team \.data-table tbody tr:nth-child\(even\) td/);
});

test('Season 0 leaderboard uses current ALL TIME K/D standings and Season 1 waits for launch',()=>{
 assert.match(app,/const APP_ROUTE_IDS=\['home','analytics','ranking','base'/);
 const start=app.indexOf('function ranking(v){'),end=app.indexOf('function analytics(v){',start),source=app.slice(start,end);
 assert.ok(start>=0&&end>start);
 for(const label of ['РЕЙТИНГ','МАТЧМЕЙКИНГ','Ранг','Игрок','Уровень скилла','K/D','Сезон 0 (Текущий)','Сезон 1','Текущие места по K/D'])assert.ok(source.includes(label),'ranking includes '+label);
 assert.ok(source.includes("playerSeasonAggregate(p.player_id,'all')"));
 assert.ok(source.includes('b.x.kd-a.x.kd'));
 assert.ok(source.includes('kdMarkup(q.x.k,q.x.d)'));
 assert.ok(source.includes('Сезон 1 ещё не начался'));
 assert.ok(source.includes("rank===1?'gold'"));
 assert.ok(source.includes("rank===2?'silver'"));
 assert.ok(source.includes("rank===3?'bronze'"));
 assert.ok(source.includes("'red'"));
 assert.doesNotMatch(source,/венок|laurel|country|страна|регион/i);
});



test('Leaderboard rows use Match Room Statistics glass styling and translucent podium tints',()=>{
 assert.match(css,/\.ranking-panel\{background:transparent!important;border:0!important;box-shadow:none!important/);
 const glassStart=css.indexOf('/* 2026-11-16 — Fix leaderboard glass seams'); const glassEnd=css.indexOf('}',css.indexOf('.ranking-table tbody tr.ranking-bronze td{',glassStart)); const glassFix=css.slice(glassStart,glassEnd+1);
 assert.match(glassFix,/\.ranking-table tbody td[\s\S]*backdrop-filter:none!important/);
 assert.match(glassFix,/background:rgba\(8,12,14,\.42\)!important/);
 assert.doesNotMatch(glassFix,/backdrop-filter:blur/);
 assert.match(css,/\.ranking-table tbody tr\.ranking-gold td\{background:rgba\(255,211,0,\.045\)!important/);
});


test('Match Room statistics defaults to two teams and supports category, player and T/CT filters',()=>{
 assert.match(app,/data-stat-mode="team"/);
 assert.match(app,/data-stat-mode="players" hidden/);
 assert.match(app,/id:'general',label:'Общее'/);
 assert.match(app,/id:'advanced',label:'Расширенное'/);
 assert.match(app,/id:'entry',label:'Энтри'/);
 assert.match(app,/id:'trades',label:'Размены'/);
 assert.match(app,/id:'clutches',label:'Клатчи'/);
 assert.match(app,/function setMatchRoomStatsMode\(mode\)/);
 assert.match(app,/function setMatchRoomStatCategory\(category\)/);
 assert.match(app,/function setMatchRoomStatsSide\(side\)/);
 assert.match(app,/Сортировать по команде/);
 assert.match(app,/Сортировать по игрокам/);
 assert.match(app,/data-stat-side-button="all"/);
 assert.match(app,/data-stat-side-button="t"/);
 assert.match(app,/data-stat-side-button="ct"/);
 assert.doesNotMatch(app,/\['swing','Swing'\]|<th>Рейтинг<\/th>|match-stat-rating/);
 assert.match(app,/data-team-side=/);
 assert.match(app,/statRowsMarkup\(rs,mode,category,side\)/);
 assert.doesNotMatch(app,/СРАВНЕНИЕ 10 ИГРОКОВ/);
 assert.doesNotMatch(app,/match-comparison-table/);
});
test('Last detailed match map rows have a complete zero-filled advanced-stat schema',()=>{
 const data=JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname,'../data/maps.json'),'utf8'));
 const rows=data.maps.filter(m=>m.match_id==='match_032').flatMap(m=>m.player_stats||[]);
 assert.equal(rows.length,30);
 for(const row of rows)for(const key of ["impact_rating","kills_per_round","adr","hs_kills","hs_percent","kast","accuracy","shots_fired","shots_hit","damage","mvp","rounds_played","survival_rate","entry_kills","entry_deaths","opening_kills","opening_deaths","trade_kills","traded_deaths","flash_assists","utility_damage","utility_enemies","clutches","clutch_1v1","clutch_1v2","clutch_1v3","clutch_1v4","clutch_1v5","duels_won","duels_lost","duel_win_percent","two_kills","three_kills","four_kills","five_kills","ct_kills","ct_deaths","t_kills","t_deaths"])assert.equal(row[key],0,'missing '+key+' for '+row.player_id);
});
test('Match Room menus and comparison table remain translucent',()=>{
 assert.match(css,/#matchRoomPage \.match-room-account-menu\{background:rgba\(9,13,15,\.48\)!important/);
 assert.match(css,/\.nav-menu,[\s\S]*\.custom-select-menu,[\s\S]*\.account-menu-pop,[\s\S]*\.site-player-search-results/);
 assert.match(css,/#matchRoomPage \.match-comparison-table tbody tr td\{padding:[\s\S]*rgba\(8,12,14,\.18\)!important[\s\S]*backdrop-filter:blur\(11px\)!important/);
});

test('Match Room statistics tables are compact and category-driven',()=>{
 assert.match(css,/#matchRoomPage \.match-mode-table\{width:100%;min-width:0/);
 assert.match(css,/#matchRoomPage \.match-stat-toolbar/);
 assert.match(css,/#matchRoomPage \.match-stat-mode button\.active/);
});


test('Match Room Statistics restores the MVP card and four leader highlights above category tables',()=>{
 assert.match(app,/const statMvpCard='<section class="match-stat-mvp-card"/);
 assert.match(app,/const statHighlights='<section class="match-stat-awards">'\+statMvpCard/);
 assert.match(app,/statLeaderCard\('БОЛЬШЕ ВСЕГО УБИЙСТВ',statMvp/);
 assert.match(app,/statLeaderCard\('НАИБОЛЬШИЙ УРОН',statDamageLeader/);
 assert.match(app,/statLeaderCard\('KAST',statKastLeader/);
 assert.match(app,/statLeaderCard\('ЭНТРИ-УБИЙСТВА',statEntryLeader/);
 assert.match(app,/match-stat-mvp-tag">★ MVP/);
 assert.match(app,/match-stat-mvp-metrics[\s\S]*У\/С\/А[\s\S]*ADR[\s\S]*КД[\s\S]*УБИЙСТВА В ГОЛОВУ/);
 assert.match(app,/<strong>0<\/strong>/);
 assert.match(app,/<strong>0%<\/strong>/);
 assert.doesNotMatch(app,/match-stat-mvp-elo|Влияние на рез\.|FACEIT Рейтинг/);
 assert.match(app,/data-match-view="statistics" hidden><nav class="match-stat-subtabs"/);
 assert.match(app,/data-stat-subview="results">'\+statHighlights\+'/);
 assert.match(app,/data-stat-subview="duels"/);
 assert.match(app,/data-stat-subview="equipment"/);
});

test('Match Room statistic categories are plain text controls with underline-only active state',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-categories button,[\s\S]*border:0!important[\s\S]*border-radius:0!important[\s\S]*background:transparent!important/);
 assert.match(css,/#matchRoomPage \.match-stat-categories button\.active[\s\S]*border-bottom-color:#ff5a1f!important/);
});


test('Match Room statistics maps real K/D/A fields and shows unavailable metrics as dashes',()=>{
 assert.match(app,/if\(key==='kills'\)return Number\(r\.k\)\|\|0/);
 assert.match(app,/if\(key==='deaths'\)return Number\(r\.d\)\|\|0/);
 assert.match(app,/if\(key==='assists'\)return Number\(r\.a\)\|\|0/);
 assert.match(app,/const statDataAvailable=new Set\(\['kills','deaths','assists','kd','diff'\]\)/);
 assert.match(app,/if\(!statDataAvailable\.has\(key\)\)return null/);
 assert.match(app,/if\(value==null\|\|!Number\.isFinite\(value\)&&value!==Infinity\)return '—'/);
 assert.match(app,/statDamageLeader=statDataAvailable\.has\('damage'\)\?leaderBy\('damage'\):null/);
 assert.match(app,/statKastLeader=statDataAvailable\.has\('kast'\)\?leaderBy\('kast'\):null/);
 assert.match(app,/statEntryLeader=statDataAvailable\.has\('entry_kills'\)\?leaderBy\('entry_kills'\):null/);
 assert.match(app,/const value=cell\.dataset\[side\]\?\?'—'/);
});

test('Match Room top four highlights sit beside the MVP and controls are compact',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-awards\{[\s\S]*grid-template-columns:minmax\(250px,\.88fr\) minmax\(0,1\.12fr\)/);
 assert.match(css,/#matchRoomPage \.match-stat-highlight-grid\{[\s\S]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/#matchRoomPage \.match-stat-categories button,[\s\S]*font-size:10\.5px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-mode button\{font-size:10px!important\}/);
});


test('T/CT K/D is calculated from side kills and deaths, not missing precomputed fields',()=>{
 assert.match(app,/key==='kd'\|\|key==='diff'\?\['t_kills','ct_kills','t_deaths','ct_deaths'\]/);
 assert.match(app,/const missing=value==='—'/);
});


test('opening any match establishes the Match Room route and history restoration prioritizes the match query',()=>{
 const open=app.slice(app.indexOf('function openMatchDetail'),app.indexOf('function teamNameForRoom',app.indexOf('function openMatchDetail')));
 const restore=app.slice(app.indexOf('function restoreAppRouteFromHistory'),app.indexOf('function faceitAppRailMarkup',app.indexOf('function restoreAppRouteFromHistory')));
 assert.match(open,/const matchId=String\(id\?\?''\)\.trim\(\)/);
 assert.match(open,/String\(x\.match_id\?\?''\)===matchId/);
 assert.match(open,/roomUrl\.searchParams\.set\('match',matchId\)/);
 assert.match(open,/roomUrl\.hash='#\/base'/);
 assert.match(open,/cs2Route:'base',cs2MatchRoom:matchId/);
 assert.match(open,/state\.tab!=='base'[\s\S]*state\.tab='base'[\s\S]*render\(\)/);
 assert.match(restore,/window\.location\.search\|\|''\)\.match\(\/\[\?&\]match=\(\[\^&\]\+\)\//);
 assert.match(restore,/if\(routeMatch\)[\s\S]*state\.tab='base'[\s\S]*openMatchDetail\(routeMatch,\{restore:true\}\)/);
 assert.match(restore,/if\(window\.__activeMatchRoomId\)closeMatchRoom\(\{fromPop:true\}\)/);
 const categoriesDeclaration=open.indexOf('const statCategories=[');
 const firstCategoriesUse=open.indexOf('for(const category of statCategories)');
 assert.ok(categoriesDeclaration>=0&&categoriesDeclaration<firstCategoriesUse,'statCategories must be initialized before Match Room reads it');
});


test('Match Room award highlights stretch to the MVP height and values align to the right edge',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-highlight-grid\{[\s\S]*height:100%!important;min-height:270px!important;[\s\S]*grid-template-rows:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/#matchRoomPage \.match-stat-awards \.match-stat-highlight\{[\s\S]*height:100%!important;min-height:0!important/);
 assert.match(css,/#matchRoomPage \.match-stat-awards \.match-stat-highlight-value\{[\s\S]*align-items:flex-end!important;text-align:right!important/);
 assert.match(css,/#matchRoomPage \.match-stat-awards \.match-stat-highlight-value small\{[\s\S]*text-align:right!important/);
});

test('Match Room statistics table header uses a translucent surface instead of a solid gray fill',()=>{
 assert.match(css,/#matchRoomPage \.match-mode-table thead th\{[\s\S]*background:rgba\(12,16,18,\.34\)!important[\s\S]*backdrop-filter:blur\(8px\)/);
});


test('Match Room highlight player names are not ellipsized and have a usable grid column',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-awards \.match-stat-highlight\{[\s\S]*grid-template-columns:32px minmax\(90px,1fr\) minmax\(120px,1fr\)!important/);
 assert.match(css,/#matchRoomPage \.match-stat-awards \.match-stat-highlight-player strong\{[\s\S]*overflow:visible!important;text-overflow:clip!important;white-space:nowrap!important/);
});

test('Match Room statistics team scoreboard header overrides the opaque gray base rule',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-teams \.match-scoreboard thead th\{[\s\S]*background:rgba\(12,16,18,\.22\)!important[\s\S]*backdrop-filter:blur\(10px\)!important/);
});

test('Match Room statistics information header is fully transparent and most-kills value is pushed right',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-category-panel \.match-mode-table thead th,[\s\S]*background:transparent!important[\s\S]*backdrop-filter:none!important/);
 assert.match(css,/#matchRoomPage\.match-room-page \.match-room-statistics-view \.match-stat-awards \.match-stat-highlight\.is-kills-leader \.match-stat-highlight-value\{[\s\S]*position:absolute!important;right:12px!important[\s\S]*text-align:right!important/);
});

test('Match Room team information strip is transparent and most-kills block is shifted right',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-team-mode > \.match-stat-team,[\s\S]*\.match-stat-team-summary\{[\s\S]*background:transparent!important[\s\S]*backdrop-filter:none!important/);
 assert.match(css,/\.match-stat-highlight\.is-kills-leader/);
 assert.doesNotMatch(css,/translateX\(10px\)!important|margin-right:-12px!important/);
});



test('Profile statistics stay inside the content column and cannot overlap the identity rail',()=>{
 assert.match(css,/#playerProfileWindow #playerProfileMount>\.faceit-exact-shell\{[\s\S]*grid-template-columns:minmax\(0,300px\) minmax\(0,1fr\)!important;[\s\S]*column-gap:32px!important/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-player-column\{[\s\S]*box-sizing:border-box!important;[\s\S]*overflow-x:hidden!important/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-player-card,[\s\S]*width:100%!important;min-width:0!important;max-width:100%!important/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-content\{[\s\S]*overflow-x:hidden!important/);
 assert.match(css,/#playerProfileWindow \.faceit-profile-top-widgets\{[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(160px,190px\)!important/);
});

test('profile and Match Room workspaces use centered bounded desktop canvases',()=>{
  assert.match(css,/#playerProfileWindow \.faceit-exact-content\{[\s\S]*justify-self:center!important[\s\S]*width:min\(100%,1120px\)!important[\s\S]*max-width:1120px!important/);
  assert.match(css,/#matchRoomPage>\.match-room-content\{[\s\S]*justify-self:center!important[\s\S]*width:min\(calc\(100% - 48px\),1240px\)!important[\s\S]*max-width:1240px!important/);
});

test('Profile and Home layout normalization keeps columns constrained and readable',()=>{
 assert.match(css,/#playerProfileWindow #playerProfileMount\{[\s\S]*display:block!important/);
 assert.doesNotMatch(css,/#playerProfileWindow #playerProfileMount,\s*#playerProfileWindow \.faceit-profile-shell,\s*#playerProfileWindow \.faceit-exact-shell\{[\s\S]*display:grid!important/);
 assert.match(html,/matchroom-overview-columns-aligned-20261117-v43/);
 assert.match(css,/grid-template-columns:minmax\(220px,260px\) minmax\(0,1fr\) minmax\(200px,240px\)!important/);
 assert.match(css,/\.home-rebuild>\.home-left/);
 assert.match(css,/#playerProfileWindow #playerProfileMount>\.faceit-exact-shell\{[\s\S]*column-gap:32px!important/);
 assert.match(css,/#playerProfileWindow \.faceit-main-grid\{[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(210px,280px\)!important/);
 assert.match(css,/@media\(max-width:1050px\)[\s\S]*#playerProfileWindow \.faceit-main-grid\{grid-template-columns:minmax\(0,1fr\)!important\}/);
});


test('Profile analytics column is pulled away from the identity card on desktop',()=>{
 assert.match(css,/#playerProfileWindow #playerProfileMount>\.faceit-exact-shell\{[\s\S]*grid-template-columns:minmax\(0,300px\) minmax\(0,1fr\)!important;[\s\S]*column-gap:32px!important/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-player-column\{[\s\S]*max-width:300px!important[\s\S]*padding:18px 20px!important/);
 assert.match(css,/#playerProfileWindow \.faceit-exact-content\{[\s\S]*padding-left:0!important/);
 assert.match(html,/matchroom-overview-columns-aligned-20261117-v43/);
});


test('Match Room overview and statistics use a wider desktop canvas without scaling UI elements',()=>{
 assert.match(css,/#matchRoomPage>\.match-room-content\{[\s\S]*width:min\(calc\(100% - 64px\),1360px\)!important;[\s\S]*max-width:1360px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-awards\{[\s\S]*width:min\(100%,1240px\)!important;[\s\S]*max-width:1240px!important/);
 assert.match(css,/#matchRoomPage \.match-room-overview-view,[\s\S]*#matchRoomPage \.match-room-statistics-view\{[\s\S]*width:100%!important;max-width:none!important/);
 assert.match(html,/matchroom-overview-columns-aligned-20261117-v43/);
});


test('Match Room TOP keeps the compact FACEIT-like row sizing',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-top-list\{[\s\S]*width:min\(100%,1080px\)!important;max-width:1080px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row\{[\s\S]*min-height:52px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>strong\{[\s\S]*text-align:left!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>\.match-stat-top-score\{[\s\S]*font-size:11px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>b:last-child\{[\s\S]*font-size:16px!important/);
 assert.match(html,/matchroom-overview-columns-aligned-20261117-v43/);
});


test('Match Room TOP stays compact while Overview and Statistics receive the wider canvas',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-top-list\{[\s\S]*max-width:1080px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row\{[\s\S]*min-height:52px!important[\s\S]*grid-template-columns:28px 38px minmax\(180px,1fr\) max-content 58px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>strong\{[\s\S]*text-align:center!important/);
 assert.match(css,/#matchRoomPage \.match-room-columns\{[\s\S]*minmax\(340px,1\.12fr\)/);
 assert.match(css,/#matchRoomPage \.match-stat-awards\{[\s\S]*max-width:1400px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-teams\{[\s\S]*max-width:1400px!important/);
 assert.match(html,/matchroom-overview-columns-aligned-20261117-v43/);
});


test('Match Room TOP centers K/D/A in the row while keeping name left and K/D right',()=>{
 assert.match(css,/#matchRoomPage \.match-stat-top-row\{[\s\S]*grid-template-columns:28px 38px minmax\(0,1fr\) 58px!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>\.match-stat-top-score\{[\s\S]*left:50%!important;top:50%!important;[\s\S]*transform:translate\(-50%,-50%\)!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>strong\{[\s\S]*text-align:left!important/);
 assert.match(css,/#matchRoomPage \.match-stat-top-row>b:last-child\{[\s\S]*text-align:right!important/);
 assert.match(html,/matchroom-overview-columns-aligned-20261117-v43/);
});


test('Match Room Overview aligns map with player roster headers and balances the center column',()=>{
 assert.match(css,/@media\(min-width:1101px\)\{[\s\S]*#matchRoomPage \.match-room-view-tabs\{[\s\S]*width:100%!important;max-width:none!important/);
 assert.match(css,/#matchRoomPage \.match-room-columns\{[\s\S]*grid-template-columns:minmax\(0,1fr\) minmax\(380px,1\.22fr\) minmax\(0,1fr\)!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column\{[\s\S]*padding-top:32px!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover\{[\s\S]*height:142px!important;min-height:142px!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column \.match-room-veto\{[\s\S]*min-height:104px!important/);
 assert.match(html,/matchroom-overview-columns-aligned-20261117-v43/);
});


test('Match Room Overview map cards are slightly shorter and center column stretches to roster height',()=>{
 assert.match(css,/@media\(min-width:1101px\)\{[\s\S]*#matchRoomPage \.match-room-columns\{\s*align-items:stretch!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column\{\s*display:flex!important;flex-direction:column!important;[\s\S]*align-self:stretch!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column \.match-room-map-list\{\s*display:grid!important;flex:1 1 auto!important;[\s\S]*grid-template-rows:repeat\(2,minmax\(112px,1fr\)\)!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column \.match-map-row-cover\{\s*height:auto!important;min-height:112px!important;max-height:none!important/);
 assert.match(css,/#matchRoomPage \.match-room-center-column \.match-room-veto\{\s*flex:0 0 auto!important/);
 assert.match(html,/matchroom-overview-map-balanced-20261117-v44/);
});
