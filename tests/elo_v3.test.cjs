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
    played_at: '2026-11-13T03:09:00+03:00',
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


test('keeps provisional K through the tenth rated series and switches to established K on the eleventh', () => {
  const players = makePlayers();
  const matches = Array.from({ length: 11 }, (_, index) => makeMatch({
    match_id: 'series_' + (index + 1),
    series_number: index + 1
  }));
  const api = createApi({ players, matches });

  const tenth = api.match('series_10');
  const eleventh = api.match('series_11');
  const expectedTenth = Math.round(32 * 0.85 * (1 - tenth.expectedA) * 10) / 10;
  const expectedEleventh = Math.round(24 * 0.85 * (1 - eleventh.expectedA) * 10) / 10;

  assert.equal(api.summary().ratedSeries, 11);
  assert.equal(tenth.ratingChanges.p1.delta, expectedTenth);
  assert.equal(eleventh.ratingChanges.p1.delta, expectedEleventh);
  assert.equal(api.player('p1').history.length, 11);
});

test('rates a BO5 as one series event rather than one event per map', () => {
  const players = makePlayers();
  const match = makeMatch({
    match_id: 'bo5_series',
    series_number: 1,
    format: 'BO5',
    series_score: '3:2',
    map_ids: ['map1', 'map2', 'map3', 'map4', 'map5']
  });
  const api = createApi({ players, matches: [match] });

  assert.equal(api.summary().activeSeries, 1);
  assert.equal(api.summary().ratedSeries, 1);
  assert.equal(api.match('bo5_series').resultA, 'WIN');
  assert.equal(api.player('p1').history.length, 1);
});

test('falls back to map scores when a series score is absent', () => {
  const players = makePlayers();
  const match = makeMatch({
    match_id: 'map_score_series',
    series_number: 1,
    format: 'BO3',
    series_score: null,
    map_ids: ['map1', 'map2']
  });
  const maps = [
    { map_id: 'map1', match_id: 'map_score_series', score: { team_a: 9, team_b: 13 } },
    { map_id: 'map2', match_id: 'map_score_series', score: { team_a: 13, team_b: 9 } }
  ];
  const api = createApi({ players, matches: [match], maps });

  assert.equal(api.summary().ratedSeries, 1);
  assert.equal(api.match('map_score_series').resultA, 'DRAW');
  assert.equal(api.player('p1').history[0].result, 'DRAW');
});

test('series aggregate K/D/A produces the same ELO event as the sum of map-level rows', () => {
  const players = makePlayers();
  const match = makeMatch({
    match_id: 'aggregate_parity',
    series_number: 1,
    map_ids: ['map1', 'map2']
  });
  const firstMapRows = players.map((player, index) => ({
    player_id: player.player_id,
    kills: 12 + index,
    deaths: 8 + (index % 4),
    assists: 3 + (index % 5)
  }));
  const secondMapRows = players.map((player, index) => ({
    player_id: player.player_id,
    kills: 15 + (index % 6),
    deaths: 9 + (index % 3),
    assists: 4 + (index % 4)
  }));
  const aggregate = players.map((player, index) => ({
    player_id: player.player_id,
    kills: firstMapRows[index].kills + secondMapRows[index].kills,
    deaths: firstMapRows[index].deaths + secondMapRows[index].deaths,
    assists: firstMapRows[index].assists + secondMapRows[index].assists
  }));
  const maps = [
    { map_id: 'map1', match_id: 'aggregate_parity', player_stats: firstMapRows },
    { map_id: 'map2', match_id: 'aggregate_parity', player_stats: secondMapRows }
  ];

  const mapApi = createApi({ players, matches: [match], maps });
  const aggregateApi = createApi({
    players,
    matches: [{ ...match, series_aggregate_stats: aggregate }],
    maps
  });

  assert.equal(
    aggregateApi.player('p1').history[0].impact,
    mapApi.player('p1').history[0].impact
  );
  assert.equal(
    aggregateApi.player('p1').history[0].delta,
    mapApi.player('p1').history[0].delta
  );
  assert.equal(
    aggregateApi.player('p1').rating,
    mapApi.player('p1').rating
  );
});

test('FACEIT-style ELO level thresholds match the supplied reference bands',()=>{
  assert.equal(levelForRating(100),1); assert.equal(levelForRating(500),1);
  assert.equal(levelForRating(501),2); assert.equal(levelForRating(750),2);
  assert.equal(levelForRating(751),3); assert.equal(levelForRating(900),3);
  assert.equal(levelForRating(901),4); assert.equal(levelForRating(1050),4);
  assert.equal(levelForRating(1051),5); assert.equal(levelForRating(1200),5);
  assert.equal(levelForRating(1201),6); assert.equal(levelForRating(1300),6);
  assert.equal(levelForRating(1301),7); assert.equal(levelForRating(1530),7);
  assert.equal(levelForRating(1531),8); assert.equal(levelForRating(1750),8);
  assert.equal(levelForRating(1751),9); assert.equal(levelForRating(2000),9);
  assert.equal(levelForRating(2001),10);
});
