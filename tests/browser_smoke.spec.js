const { test, expect } = require('@playwright/test');

async function openOffline(page) {
  // Deliberately prevent all connections to production Supabase.
  await page.route('**/supabase-config.js*', route => route.fulfill({
    status: 200, contentType: 'application/javascript',
    body: 'window.CS2_SUPABASE_CONFIG = {};'
  }));
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({
    status: 200, contentType: 'application/javascript', body: 'window.supabase = {};'
  }));
  await page.goto('http://127.0.0.1:8123/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#view')).not.toBeEmpty();
  const loaded = await page.evaluate(() => ({ maps: DB.maps.length, matches: DB.matches.length, players: DB.players.length }));
  expect(loaded.maps).toBeGreaterThan(0);
  expect(loaded.matches).toBeGreaterThan(0);
  expect(loaded.players).toBeGreaterThan(0);
}

test('home and historical matches load from validated embedded data', async ({ page }) => {
  await openOffline(page);
  await expect(page.locator('#nav')).toContainText('МАТЧИ');
  await page.evaluate(() => { state.tab = 'base'; render(); });
  await expect(page.locator('.base-page')).toBeVisible();
  await expect(page.locator('.base-page')).toContainText('СТАТИСТИКА ИГР');
  const size = await page.evaluate(() => ({
    maps: DB.maps.length, matches: DB.matches.length,
    valid: validateBase(DB)
  }));
  expect(size.valid).toBe(true);
  expect(size.maps).toBe(80);
  expect(size.matches).toBe(37);
});

test('offline admin wizard accepts nine real players without manufacturing a tenth', async ({ page }) => {
  await openOffline(page);
  await page.evaluate(() => {
    state.logged = true;
    openAddGame();
    const roster = DB.players.filter(p => p.is_active !== false).slice(0, 9).map(p => p.player_id);
    window.__newTeamA = roster.slice(0, 5);
    window.__newTeamB = roster.slice(5);
    window.__newMaps = ['mirage'];
    document.querySelector('#newScore').value = '13:10';
    renderNewMaps();
    renderNewTeams();
    renderNewPlayerPool();
    continueNewGame();
  });
  await expect(page.locator('#newK_0_0')).toBeVisible();
  const inputs = await page.locator('[data-new-map]').count();
  expect(inputs).toBe(27);
  await page.evaluate(() => {
    document.querySelectorAll('[data-new-map]').forEach(el => { el.value = '1'; });
    reviewNewGame();
  });
  await expect(page.locator('.modal')).toContainText('9 / 10');
  await page.evaluate(async () => { await commitNewGame(); });
  const persisted = await page.evaluate(() => {
    const match = DB.matches.at(-1);
    const map = DB.maps.at(-1);
    return {
      players: match?.player_ids?.length,
      teamA: match?.team_a?.length,
      teamB: match?.team_b?.length,
      statRows: map?.player_stats?.length,
      statsAvailable: match?.series_stats_available,
      playedAt: match?.played_at,
      valid: validateBase(DB)
    };
  });
  expect(persisted).toMatchObject({
    players: 9, teamA: 5, teamB: 4, statRows: 9,
    statsAvailable: true, playedAt: null, valid: true
  });
});

test('a guest-only entry preserves a participant without fabricated KDA', async ({ page }) => {
  await openOffline(page);
  await page.evaluate(() => {
    state.logged = true;
    openAddGame();
    const id = DB.players[0].player_id;
    window.__newTeamA = [id];
    window.__newTeamB = [];
    window.__newMaps = ['mirage'];
    window.__newTargetTeam = 'B';
    document.querySelector('#newScore').value = '13:10';
    document.querySelector('#newGuestName').value = 'Temporary Guest';
    addNewGuest();
    continueNewGame();
  });
  await expect(page.locator('#newK_0_0')).toBeVisible();
  expect(await page.locator('[data-new-map]').count()).toBe(3);
  await page.evaluate(() => {
    document.querySelectorAll('[data-new-map]').forEach(el => { el.value = '0'; });
    reviewNewGame();
  });
  await page.evaluate(async () => { await commitNewGame(); });
  const output = await page.evaluate(() => {
    const match = DB.matches.at(-1), map = DB.maps.at(-1);
    return {guests:match?.guest_players?.length, kda:map?.player_stats?.length, known:match?.player_ids?.length,valid:validateBase(DB)};
  });
  expect(output).toMatchObject({guests:1,kda:1,known:1,valid:true});
});
