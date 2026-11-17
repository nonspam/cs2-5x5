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
  assert.match(app, /Пока отображаются нулевые значения-заглушки. Это не фактическая статистика матча./);
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
  assert.ok(ownerWidthFix.includes('width:100%!important;max-width:none!important;min-width:0!important;'));
});


test('Match Room follows FACEIT hierarchy: view tabs, map, then statistics sub-tabs without a player roster', () => {
  const roomPage = app.slice(app.indexOf('const roomPage='));
  assert.ok(roomPage.indexOf('data-match-view-tab="overview"') < roomPage.indexOf("'+roomHero+'"));
  assert.ok(roomPage.indexOf("'+roomHero+'") < roomPage.indexOf('data-match-view="overview"'));
  assert.doesNotMatch(app, /match-room-player-strip|match-room-player-chip|roomPlayerStrip/);
});

test('Match Room has no standalone roster strip or like/dislike controls beneath the hero', () => {
  const ownerFix = css.slice(css.lastIndexOf('/* 2026-11-17 — owner correction: no standalone player roster'));
  assert.match(ownerFix, /\.match-room-player-strip\{display:none!important/);
  assert.doesNotMatch(ownerFix, /thumb|like|нравит/i);
});




test('Persistent sidebar exposes real-player search with suggestions and Enter-to-open profile', () => {
  const railMarkup = app.slice(app.indexOf('function faceitAppRailMarkup'), app.indexOf('function bindAppShell'));
  assert.match(railMarkup, /id="sitePlayerSearch"/);
  assert.match(railMarkup, /id="sitePlayerSearchInput"/);
  assert.match(railMarkup, /id="sitePlayerSearchResults"/);
  assert.doesNotMatch(app.slice(app.indexOf('function home(v)'), app.indexOf('function homeLastRows')), /sitePlayerSearch/);
  assert.match(app.slice(app.indexOf('function bindAppShell'), app.indexOf('function renderRouteShell')), /bindSitePlayerSearch\(root\)/);
  const binder = app.slice(app.indexOf('function bindSitePlayerSearch'), app.indexOf('if(document.readyState', app.indexOf('function bindSitePlayerSearch')));
  assert.match(binder, /activePlayers\(\)/);
  assert.match(binder, /event\.key==='Enter'/);
  assert.match(binder, /openPublicPlayerProfile\(pid\)/);
});

test('Match Room compact polish keeps content slightly narrower and adds breathing room', () => {
  const polish = css.slice(css.lastIndexOf('/* 2026-11-17 — final compact Match Room proportions'));
  assert.match(polish, /calc\(100% - 80px\),1500px/);
  assert.match(polish, /\.match-stat-subtabs\s*\{[\s\S]*margin-top:12px!important/);
  assert.match(polish, /\.match-stat-awards\s*\{[\s\S]*margin-top:18px!important/);
  assert.match(polish, /\.faceit-route-shell\s*\{grid-template-columns:185px/);
});


test('Player search is placed at the top of the left sidebar, outside the home content columns', () => {
  const railMarkup = app.slice(app.indexOf('function faceitAppRailMarkup'), app.indexOf('function bindAppShell'));
  assert.ok(railMarkup.indexOf('faceit-exact-brand') < railMarkup.indexOf('faceit-rail-search'));
  assert.ok(railMarkup.indexOf('faceit-rail-search') < railMarkup.indexOf('faceit-exact-game'));
  assert.ok(railMarkup.indexOf('faceit-rail-search') < railMarkup.indexOf('<nav'));
  const homeMarkup = app.slice(app.indexOf('function home(v)'), app.indexOf('function homeLastRows'));
  assert.doesNotMatch(homeMarkup, /home-player-search-row|sitePlayerSearch/);
  assert.match(css, /\.faceit-route-shell \.faceit-rail-search/);
});

test('Desktop navigation rail uses the actual top-level app grid and has FACEIT-like width', () => {
  const polish = css.slice(css.lastIndexOf('/* 2026-11-17 — corrective FACEIT spacing'));
  assert.match(polish, /#view>\.faceit-route-shell\.faceit-app-shell/);
  assert.match(polish, /grid-template-columns:210px minmax\(0,1fr\)/);
  assert.match(polish, /min-width:210px!important/);
  assert.match(polish, /margin-top:22px!important;margin-bottom:28px!important/);
});


test('FACEIT reference pass widens the persistent rail and increases match statistics spacing', () => {
  const rail = css.slice(css.lastIndexOf('/* 2026-11-17 — FACEIT reference spacing pass'));
  assert.match(rail, /grid-template-columns:216px minmax\(0,1fr\)!important/);
  assert.match(rail, /margin:30px 0 10px!important/);
  assert.match(rail, /margin-top:34px!important/);
  assert.match(rail, /margin-bottom:52px!important/);
  assert.match(rail, /\.match-stat-awards\s*\{[\s\S]*margin-top:0!important/);
});


test('desktop FACEIT app rail uses 236px width from live screenshot correction', () => {
  const pass = css.slice(css.lastIndexOf('final desktop rail width correction'));
  assert.match(pass, /#view > \.faceit-exact-shell\.faceit-app-shell\.faceit-route-shell/);
  assert.match(pass, /grid-template-columns:236px minmax\(0,1fr\)!important/);
  assert.match(pass, /width:236px!important;min-width:236px!important;max-width:236px!important/);
  assert.match(pass, /height:38px!important;min-height:38px!important/);
});


test('desktop navigation rail width override is not dependent on #view direct-child structure', () => {
  const pass = css.slice(css.lastIndexOf('robust desktop rail override'));
  assert.match(pass, /body \.faceit-exact-shell\.faceit-app-shell\.faceit-route-shell/);
  assert.match(pass, /grid-template-columns:236px minmax\(0,1fr\)!important/);
  assert.match(pass, /width:236px!important;min-width:236px!important;max-width:236px!important/);
});


test('profile overlay starts after the widened persistent rail and uses the shared content width', () => {
  const pass = css.slice(css.lastIndexOf('align profile overlay and all route content'));
  assert.match(pass, /#playerProfileWindow\.player-profile-window\s*\{[\s\S]*left:236px!important/);
  assert.match(pass, /#playerProfileWindow \.player-profile-window-backdrop\s*\{[\s\S]*left:236px!important/);
  assert.match(pass, /grid-template-columns:252px minmax\(0,1fr\)!important/);
  assert.match(pass, /\.faceit-route-content\s*\{[\s\S]*max-width:none!important/);
});

test('home dashboard columns are fluid and cannot overflow the widened route content', () => {
  const pass = css.slice(css.lastIndexOf('align profile overlay and all route content'));
  assert.match(pass, /grid-template-columns:minmax\(205px,260px\) minmax\(0,1fr\) minmax\(190px,260px\)!important/);
  assert.match(pass, /\.home-rebuild>\.home-right\s*\{[\s\S]*max-width:100%!important/);
});
