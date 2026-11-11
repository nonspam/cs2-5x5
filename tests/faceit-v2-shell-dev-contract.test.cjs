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

test('Track is not exposed as a completed shell route', () => {
  const routeList = app.match(/const APP_ROUTE_IDS=\[([^\]]+)\]/)?.[1] || '';
  assert.doesNotMatch(routeList, /['"]track['"]/);
});
