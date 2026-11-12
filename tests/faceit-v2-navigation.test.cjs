const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app_v57.js'), 'utf8');
const routeSource = app.slice(app.indexOf('const APP_ROUTE_IDS='), app.indexOf('function faceitAppRailMarkup'));
assert.ok(routeSource.includes('function navigateApp'), 'route controller must exist');

function harness(initialHash = '') {
  const listeners = {};
  const renders = [];
  const state = { tab: 'home', accountMenuOpen: false };
  const historyEntries = [{ hash: initialHash, state: null }];
  let index = 0;
  const location = { hash: initialHash };
  const history = {
    state: null,
    pushState(nextState, _title, url) {
      historyEntries.splice(index + 1);
      historyEntries.push({ hash: url.slice(url.indexOf('#')), state: nextState });
      index = historyEntries.length - 1;
      this.state = nextState;
      location.hash = historyEntries[index].hash;
    },
    replaceState(nextState, _title, url) {
      historyEntries[index] = { hash: url.slice(url.indexOf('#')), state: nextState };
      this.state = nextState;
      location.hash = historyEntries[index].hash;
    }
  };
  const window = {
    location, history,
    addEventListener(name, callback) { listeners[name] = callback; }
  };
  const context = { window, state, render() { renders.push(state.tab); } };
  vm.runInNewContext(routeSource + '\nthis.routeApi={appRouteFromLocation,navigateApp,restoreAppRouteFromHistory};', context);
  return {
    ...context.routeApi, state, renders, historyEntries, location, listeners,
    back() {
      if (index <= 0) return;
      index--;
      location.hash = historyEntries[index].hash;
      history.state = historyEntries[index].state;
      listeners.popstate();
    },
    forward() {
      if (index >= historyEntries.length - 1) return;
      index++;
      location.hash = historyEntries[index].hash;
      history.state = historyEntries[index].state;
      listeners.popstate();
    }
  };
}

test('direct hash entry resolves supported routes and safely falls back for unknown routes', () => {
  for (const route of ['home','analytics','base','maps','teams','records','seasons','track','settings','profile','compare']) {
    const h = harness('#/' + route);
    assert.equal(h.appRouteFromLocation(), route);
  }
  assert.equal(harness('#/not-a-route').appRouteFromLocation(), 'home');
  assert.equal(harness('').appRouteFromLocation(), 'home');
});

test('navigation writes history and browser back/forward restores the rendered route', () => {
  const h = harness('');
  h.navigateApp('base');
  h.navigateApp('maps');
  assert.equal(h.state.tab, 'maps');
  assert.equal(h.location.hash, '#/maps');
  assert.deepEqual(h.renders, ['base','maps']);
  h.back();
  assert.equal(h.state.tab, 'base');
  h.back();
  assert.equal(h.state.tab, 'home');
  h.forward();
  assert.equal(h.state.tab, 'base');
  h.forward();
  assert.equal(h.state.tab, 'maps');
  assert.deepEqual(h.renders, ['base','maps','base','home','base','maps']);
});

test('reselecting the current route replaces its canonical hash instead of adding a duplicate entry', () => {
  const h = harness('');
  h.navigateApp('home');
  assert.equal(h.historyEntries.length, 1);
  assert.equal(h.location.hash, '#/home');
  h.navigateApp('home');
  assert.equal(h.historyEntries.length, 1);
});

test('invalid navigation requests do not mutate route state or browser history', () => {
  const h = harness('');
  h.navigateApp('missing');
  assert.equal(h.state.tab, 'home');
  assert.equal(h.historyEntries.length, 1);
  assert.deepEqual(h.renders, []);
});
