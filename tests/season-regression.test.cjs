const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'app_v57.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style_v57.css'), 'utf8');
const matches = JSON.parse(fs.readFileSync(path.join(root, 'data', 'matches.json'), 'utf8')).matches;

const seasonStart = app.indexOf('const FACEIT_SEASONS=');
const seasonEnd = app.indexOf('function selectProfileSeason(', seasonStart);
assert.ok(seasonStart >= 0 && seasonEnd > seasonStart, 'season catalogue and resolver must exist');
const seasonSource = app.slice(seasonStart, seasonEnd);

test('season catalogue exposes only future S1 with the requested three-month boundary',()=>{
  assert.match(seasonSource,/key:'s1'/);
  assert.doesNotMatch(seasonSource,/key:'s[2-9]/);
  assert.match(seasonSource,/key:'s1'.*label:'S1'.*09\\.12\\.2026 — 09\\.03\\.2027/);
  assert.match(seasonSource,/2026-12-09T00:00:00/);
  assert.match(seasonSource,/2027-03-09T00:00:00/);
});

test('match-to-season resolver uses explicit season metadata or a real timestamp only',()=>{
  const api = vm.runInNewContext(seasonSource + '\n({FACEIT_SEASONS,faceitSeasonForMatch});\n',
    {matchTime:m=>{const d=Date.parse(m?.played_at||m?.date||m?.created_at||'');return Number.isFinite(d)?d:0}});
  assert.equal(api.faceitSeasonForMatch({season_number:1}), 's1');
  assert.equal(api.faceitSeasonForMatch({season_number:9}), null);
  assert.equal(api.faceitSeasonForMatch({season:'Season 8'}), null);
  assert.equal(api.faceitSeasonForMatch({played_at:'2026-12-10T20:00:00+03:00'}), 's1');
  assert.equal(api.faceitSeasonForMatch({played_at:'2026-11-30T20:00:00+03:00'}), null);
  assert.equal(api.faceitSeasonForMatch({match_id:'undated'}), null);
});

test('existing imported matches without dates or season metadata are not assigned to a season',()=>{
  assert.ok(matches.length>0);
  for(const match of matches){
    const explicit=['faceit_season','season_number','season_key','season_id','season'];
    assert.equal(explicit.some(key=>match[key]!=null),false,'match metadata unexpectedly contains a season assignment');
    assert.equal(Boolean(match.played_at||match.date||match.created_at),false,'match unexpectedly gained a timestamp');
  }
  assert.match(app,/all=selectedSeasonKey==='all'\?careerAll:careerAll\.filter\(row=>faceitSeasonForMatch\(row\.m\)===selectedSeasonKey\)/);
  assert.match(app,/Сезонная статистика появится после привязки матчей/);
  assert.match(app,/playerSeasonAggregate\(id,seasonKey='all'\)/);
});

test('Profile exposes its season card, archive picker, and Overview/History/Track navigation',()=>{
  const start=app.indexOf('function profilePage(v){');
  const end=app.indexOf('async function handleProfileImage',start);
  const profile=app.slice(start,end);
  assert.match(profile,/faceit-season-widget/);
  assert.match(profile,/faceit-season-picker-grid/);
  assert.match(profile,/data-profile-season=/);
  assert.match(profile,/data-profile-section="track"/);
  assert.match(profile,/state\.profileSection==='history'/);
  assert.match(profile,/selectProfileSeason\(/);
});

test('Track has a season selector and filters rows by the same season resolver',()=>{
  const start=app.indexOf('function track(v,embedded=false){');
  const end=app.indexOf('function bindTrackChart(',start);
  const track=app.slice(start,end);
  assert.match(track,/const seasonKey=state\.trackSeasonKey\|\|state\.profileSeasonKey\|\|'all'/);
  assert.match(track,/faceitSeasonForMatch\(q\.m\)===seasonKey/);
  assert.match(track,/СЕЗОН<select/);
  assert.match(track,/track-embedded/);
  assert.match(css,/\.track-page\.track-embedded/);
});

test('Season UI is responsive and uses square archive tiles',()=>{
  assert.match(css,/\.faceit-season-picker-grid\{display:grid!important;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)!important/);
  assert.match(css,/\.faceit-season-pick-card[\s\S]*aspect-ratio:1 \/ 1!important/);
  assert.match(css,/@media\(max-width:560px\)[\s\S]*\.faceit-season-picker-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
});

test('Statistics exposes an ALL TIME/S1 switch and calculates season rows from scoped match history',()=>{
  const start=app.indexOf('function players(v){'),end=app.indexOf('function compare(v){',start),source=app.slice(start,end);
  assert.match(source,/state\.statsSeasonKey\|\|'all'/);
  assert.match(source,/playerSeasonAggregate\(p\.player_id,seasonKey\)/);
  assert.match(source,/ALL TIME/);
  assert.match(source,/09\.12\.2026/);
});
test('Track labels BO format as its own column and maps photos are reduced',()=>{
  const start=app.indexOf('function track(v,embedded=false){'),end=app.indexOf('function bindTrackChart(',start),source=app.slice(start,end);
  assert.match(source,/track-match-format/);
  assert.match(source,/ФОРМАТ/);
  assert.match(css,/\.track-match-format/);
  assert.match(css,/\.maps-page \.map-card-grid \.map-card-image\{height:104px!important/);
});
