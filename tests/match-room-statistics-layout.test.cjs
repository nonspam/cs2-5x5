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

test('Match Room statistics CSS keeps the MVP plus four right-side cards inside bounded layout', () => {
  assert.match(css, /grid-template-columns:minmax\(330px,\.82fr\) minmax\(0,1\.18fr\)/);
  assert.match(css, /grid-template-rows:repeat\(4,minmax\(62px,1fr\)\)/);
  assert.match(css, /max-width:1360px/);
  assert.match(css, /data-team-side="a"/);
  assert.match(css, /data-team-side="b"/);
  assert.match(css, /match-stat-mvp-profile>\.player-avatar\.lg/);
  assert.match(css, /match-player-profile-link \.player-avatar\.xs/);
  assert.match(css, /match-sort-button:hover/);
});
