const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'elo_v3.js'), 'utf8');

function createApi({ players, matches, maps = [], aliases = {} }) {
  const DB = { players, matches, maps, aliases };
  const context = {
    window: {},
    DB,
    renderEpoch: 1,
    normalizeStatName: value => String(value ?? '').normalize('NFKC').trim().toLowerCase().replace(/\\s+/g, ' '),
    activeMatches: () => matches,
    activePlayers: () => players.filter(player => player.is_active !== false && player.deleted_permanently !== true),
    matchMaps: match => maps.filter(map => map.match_id === match.match_id),
    historicalLobbyGroups: match => [match.team_a || [], match.team_b || []],
    matchOrder: match => Number(match.series_number || 0),
    seriesNumberForMatch: match => match.series_number ?? null,
    player: id => players.find(player => player.player_id === id) || null
  };
  vm.runInNewContext(source, context, { filename: 'elo_v3.js' });
  return context.window.CS2EloV3;
}

function makePlayers(count = 10) {
  return Array.from({ length: count }, (_, index) => ({
    player_id: 'p' + (index + 1),
    display_name: 'Player ' + (index + 1),
    is_active: true
  }));
}

function makeMatch(overrides = {}) {
  return {
    match_id: 'series_1',
    series_number: 1,
    series_score: '1:0',
    team_a: ['p1', 'p2', 'p3', 'p4', 'p5'],
    team_b: ['p6', 'p7', 'p8', 'p9', 'p10'],
    map_ids: [],
    ...overrides
  };
}

test('rates a complete 5v5 series and keeps win/loss delta direction', () => {
  const players = makePlayers();
  const api = createApi({ players, matches: [makeMatch()] });

  const winner = api.player('p1');
  const loser = api.player('p6');

  assert.equal(api.summary().activeSeries, 1);
  assert.equal(api.summary().ratedSeries, 1);
  assert.equal(api.match('series_1').resultA, 'WIN');
  assert.ok(winner.lastDelta > 0);
  assert.ok(loser.lastDelta < 0);
  assert.ok(winner.rating > 1000);
  assert.ok(loser.rating < 1000);
  assert.equal(winner.level, 4);
  assert.equal(winner.peakRating, winner.rating);
});

test('does not rate a series with an incomplete roster', () => {
  const players = makePlayers();
  const match = makeMatch({ team_a: ['p1', 'p2', 'p3', 'p4'], team_b: ['p6', 'p7', 'p8', 'p9', 'p10'] });
  const api = createApi({ players, matches: [match] });

  assert.equal(api.summary().activeSeries, 1);
  assert.equal(api.summary().ratedSeries, 0);
  assert.equal(api.player('p1').rating, 1000);
  assert.equal(api.player('p1').history.length, 0);
});

test('does not rate a series with an unknown result', () => {
  const players = makePlayers();
  const api = createApi({ players, matches: [makeMatch({ series_score: '0:0' })] });

  assert.equal(api.summary().ratedSeries, 0);
  assert.equal(api.player('p1').rating, 1000);
});

test('counts an unregistered guest as neutral 1000 ELO without creating a player', () => {
  const players = makePlayers(9);
  const match = makeMatch({
    team_a: ['p1', 'p2', 'p3', 'p4', 'p5'],
    team_b: ['p6', 'p7', 'p8', 'p9', 'guest_1']
  });
  const api = createApi({ players, matches: [match] });

  assert.equal(api.summary().ratedSeries, 1);
  assert.equal(api.match('series_1').guestCount, 1);
  assert.equal(api.player('p1').rating > 1000, true);
  assert.equal(api.leaderboard().length, 9);
});
