const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const app = read('app_v57.js');
const html = read('index.html');
const config = read('supabase-config.js');

test('the DEV frontend is explicitly branded as a test environment', () => {
  assert.match(html, /<title>CS2 Analytics DEV — тестовая среда<\/title>/);
  assert.match(html, /name="description" content="Изолированная тестовая среда CS2 Analytics\."/);
});

test('the DEV browser config points only to the isolated DEV Supabase project', () => {
  assert.match(config, /url:\s*['"]https:\/\/nwujudniysolpevbtggd\.supabase\.co['"]/);
  assert.doesNotMatch(config, /agetaoekkbhbmfmhxseu/);
  assert.match(config, /DEV ONLY/);
});

test('DEV config is loaded before the application runtime', () => {
  const configIndex = html.indexOf('src="supabase-config.js');
  const appIndex = html.indexOf('src="app_v57.js');
  assert.notEqual(configIndex, -1, 'supabase-config.js is included');
  assert.notEqual(appIndex, -1, 'app_v57.js is included');
  assert.ok(configIndex < appIndex, 'DEV config must load before app runtime');
});

test('the shared application shell has one explicit allowlist of supported routes', () => {
  assert.match(app, /const APP_ROUTE_IDS=\['home','analytics','base','maps','teams','records','seasons','settings','profile','compare'\]/);
  assert.match(app, /function appRouteFromLocation\(\)[\s\S]*?APP_ROUTE_IDS\.includes\(route\)\?route:'home'/);
});

test('route navigation writes browser history and rejects unknown routes', () => {
  const start = app.indexOf('function navigateApp(tab,options={})');
  const end = app.indexOf('function restoreAppRouteFromHistory()', start);
  assert.ok(start >= 0 && end > start, 'navigateApp implementation exists');
  const body = app.slice(start, end);
  assert.match(body, /if\(!APP_ROUTE_IDS\.includes\(tab\)\)return/);
  assert.match(body, /window\.history\[method\]/);
  assert.match(body, /state\.tab=tab;state\.accountMenuOpen=false;render\(\)/);
});

test('browser back and forward restore the route from the location hash', () => {
  assert.match(app, /function restoreAppRouteFromHistory\(\)[\s\S]*?const tab=appRouteFromLocation\(\)/);
  assert.match(app, /window\.addEventListener\('popstate',restoreAppRouteFromHistory\)/);
  assert.match(app, /window\.addEventListener\('hashchange',restoreAppRouteFromHistory\)/);
  assert.match(app, /document\.addEventListener\('DOMContentLoaded',[\s\S]*?state\.tab=appRouteFromLocation\(\)/);
});

test('shared shell navigation is wired through data-app-route controls', () => {
  assert.match(app, /data-app-route=/);
  assert.match(app, /function bindAppShell\(root\)[\s\S]*?querySelectorAll\('\[data-app-route\]'\)[\s\S]*?navigateApp\(button\.dataset\.appRoute\)/);
  assert.match(app, /function renderRouteShell\(v,page\)[\s\S]*?bindAppShell\(v\)/);
});

test('every supported route has a renderer or an explicit profile special case', () => {
  assert.match(app, /const pages=\{home,base,analytics,players,compare,maps,teams,records,seasons,settings\}/);
  assert.match(app, /if\(state\.tab==='profile'\)\{profilePage\(v\)\}/);
  assert.match(app, /function profilePage\(v\)[\s\S]*?faceit-exact-shell[\s\S]*?bindAppShell\(v\)/);
});

test('settings remains reachable through the persistent settings shortcut', () => {
  assert.match(html, /id="settingsBtn"/);
  assert.match(app, /function nav\(\)[\s\S]*?\$\('#settingsBtn'\)\.onclick=\(\)=>navigateApp\('settings'\)/);
  assert.match(app, /APP_ROUTE_IDS=\[[^\]]*'settings'/);
});

test('Track is exposed as an account-scoped shell route', () => {
  const routeList = app.match(/const APP_ROUTE_IDS=\[([^\]]+)\]/)?.[1] || '';
  assert.match(routeList, /['"]track['"]/);
  assert.match(app, /function track\(v\)/);
  assert.match(app, /const pages=\{[^}]*track/);
});

test('every inline click/change handler resolves to a declared runtime function', () => {
  const expressions = [...app.matchAll(/\bon(?:click|change)\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
  const handlerNames = [...new Set(expressions.map(expression => expression.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/)?.[1]).filter(Boolean))];
  const functionNames = new Set([...app.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]));
  const variableNames = new Set([...app.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)].map(match => match[1]));
  const unresolved = handlerNames.filter(name => !functionNames.has(name) && !variableNames.has(name));
  assert.deepEqual(unresolved, [], `unresolved inline handlers: ${unresolved.join(', ')}`);
  assert.ok(handlerNames.length >= 50, 'the source scan should cover the existing inline handler surface');
});

test('critical legacy workflows remain present behind the shared application shell', () => {
  const required = [
    'openMatchDetail', 'openMapDetail', 'openAddGame', 'selectNewFormat',
    'toggleNewMap', 'continueNewGame', 'renderNewSetupStep',
    'renderNewStatsStep', 'collectNewMapStats', 'reviewNewGame',
    'commitNewGame', 'openEditMatch', 'saveMatchEdit', 'saveMatchTiming',
    'deleteMatch', 'archiveMatch', 'openTrash', 'restoreMatch',
    'openPlayerDrilldown', 'openPlayerDetail', 'openPublicPlayerProfile',
    'openPlayerAdmin', 'savePlayerAdmin', 'editPlayer', 'savePlayerEdit',
    'archivePlayer', 'restorePlayer', 'purgeArchivedPlayer',
    'randomTeams', 'balanceTeams', 'exportBackup', 'importBackup',
    'login', 'accountSignOut', 'handleProfileImage'
  ];
  const declared = new Set([...app.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]));
  const missing = required.filter(name => !declared.has(name));
  assert.deepEqual(missing, [], `missing workflow functions: ${missing.join(', ')}`);
});

test('cross-section controls use centralized route navigation and never mutate route state to a literal', () => {
  assert.ok(app.includes(String.raw`state.profileSection=\'overview\';navigateApp(\'profile\')`), 'account menu profile link uses navigateApp');
  assert.ok(app.includes(String.raw`navigateApp(\'base\')`), 'season history link uses navigateApp');
  assert.doesNotMatch(app, /state\.tab\s*=\s*(?:\\)?['"](home|analytics|base|maps|teams|records|seasons|settings|profile|compare)['"]/);
});

test('analytics deliberately reuses the existing player analytics renderer', () => {
  assert.match(app, /function analytics\(v\)\{players\(v\)\}/);
  assert.match(app, /const pages=\{home,base,analytics,players,compare,maps,teams,records,seasons,settings\}/);
  assert.match(app, /if\(state\.tab==='profile'\)\{profilePage\(v\)\}/);
});

test('match archive and restore remain paired workflows over series and child maps', () => {
  const archiveStart = app.indexOf('function deleteMatch(');
  const archiveEnd = app.indexOf('function archiveMatch(', archiveStart);
  const restoreStart = app.indexOf('function restoreMatch(');
  const restoreEnd = app.indexOf('function openEditMatch(', restoreStart);
  assert.ok(archiveStart >= 0 && archiveEnd > archiveStart, 'match archive function exists');
  assert.ok(restoreStart >= 0 && restoreEnd > restoreStart, 'match restore function exists');
  const archiveBody = app.slice(archiveStart, archiveEnd);
  const restoreBody = app.slice(restoreStart, restoreEnd);
  assert.ok(archiveBody.includes("kind:'match_patch'") && archiveBody.includes('archived:true'));
  assert.ok(archiveBody.includes("kind:'map_patch'") && archiveBody.includes('archived:true'));
  assert.ok(restoreBody.includes("kind:'match_patch'") && restoreBody.includes('archived:false'));
  assert.ok(restoreBody.includes("kind:'map_patch'") && restoreBody.includes('archived:false'));
});
