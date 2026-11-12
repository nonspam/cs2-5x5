const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app_v57.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style_v57.css'), 'utf8');

function section(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0 && end > start, 'expected source section: ' + startMarker);
  return source.slice(start, end);
}

test('the home navigation item is labelled Главное instead of Обзор', () => {
  const rail = section(app, 'function faceitAppRailMarkup()', 'function bindAppShell(root)');
  assert.ok(rail.includes("['home','⌂','Главное']"));
  assert.ok(!rail.includes("['home','⌂','Обзор']"));
});

test('non-profile routes no longer render the player avatar and profile card column', () => {
  const shell = section(app, 'function renderRouteShell(v,page)', 'function profilePage(v)');
  assert.ok(shell.includes('faceit-exact-global-rail'));
  assert.ok(shell.includes('faceit-route-content'));
  assert.ok(!shell.includes('faceitAppPlayerColumnMarkup'));
  assert.ok(!shell.includes('faceit-exact-player-column'));
  assert.ok(!shell.includes('faceit-route-player-card'));
});

test('the profile route keeps its own player card and exposes full match history', () => {
  const profile = section(app, 'function profilePage(v)', 'async function handleProfileImage');
  assert.ok(profile.includes('faceit-exact-player-column'));
  assert.ok(profile.includes("state.profileSection==='history'"));
  assert.ok(profile.includes('faceit-full-history'));
  assert.ok(profile.includes('matchRows(all)'));
});

test('season archive is a compact square-card widget inside the player Profile', () => {
  const profile = section(app, 'function profilePage(v)', 'async function handleProfileImage');
  assert.ok(profile.includes('faceit-season-widget'));
  assert.ok(profile.includes('faceit-season-picker-grid'));
  assert.ok(profile.includes('faceit-season-pick-card'));
  assert.ok(profile.includes('data-profile-season='));
  assert.ok(!profile.includes('season-page'));
});

test('season-filtered profile history reuses the common player-relative match score rows', () => {
  const profile = section(app, 'function profilePage(v)', 'async function handleProfileImage');
  assert.ok(profile.includes("state.profileSection==='history'"));
  assert.ok(profile.includes('matchRows(all)'));
  assert.ok(profile.includes('playerScoreMarkup(playerSeriesScoreLabel(q.m,id,q.maps)'));
});

test('the desktop shell gives navigation more room and keeps its controls outlined and transparent', () => {
  assert.ok(css.includes('.faceit-exact-shell.faceit-route-shell{'));
  assert.ok(css.includes('grid-template-columns:216px minmax(0,1fr)'));
  assert.ok(css.includes('background:transparent'));
  assert.ok(css.includes('border:1px solid rgba(235,240,245,.14)'));
  assert.ok(css.includes('.faceit-exact-global-rail nav button.active'));
  assert.ok(css.includes('box-shadow:none'));
});

test('the wider shell still has compact tablet and horizontal mobile navigation', () => {
  assert.match(css, /@media\(max-width:1050px\)[\s\S]*?grid-template-columns:70px minmax\(0,1fr\)/);
  assert.match(css, /@media\(max-width:700px\)[\s\S]*?faceit-route-shell[\s\S]*?display:block/);
});
