## 2026-11-17 — Statistics width aligned to Match Room hero (IN PROGRESS)
- Owner compared current Statistics screenshot with FACEIT and requested the full Statistics content to stretch horizontally to the same left/right boundaries as the Match Room map hero, without values or columns overflowing.
- Expanded the awards/MVP + leader cards, category toolbar, category table panels, team tables and their wrappers to 100% of the Match Room content width; removed legacy 1080/1360/1480px child caps and centered margins where they constrained these sections. Kept table layout and metric data semantics unchanged.
- Files: style_v57.css, tests/match-room-statistics-layout.test.cjs, index.html (app cache marker v14).
- Source commit: 9e678403dfad772879ad7c38ea5406bcddcabbc6; regression assertion correction: 06381d5cda074131c1f2a2e1fd94e59a33c9ace0.
- Quality Gate [43976277524](https://github.com/nonspam/cs2-5x5/actions/runs/43976277524): **314 passed / 0 failed / 0 skipped**, confirmed from validate job log.
- Not verified: browser rendering, screenshot comparison, DEV deployment, owner visual acceptance. No DB, SQL, migration, production or main changes.
- Next: owner refreshes DEV and checks that MVP/leader cards, controls and both team tables align with hero left/right edges and no table content clips. If visual review identifies issues, make a narrowly scoped follow-up.

## 2026-11-16 — Latest Statistics follow-up (IN PROGRESS)
- Fixed highlight name clipping and targeted the actual team scoreboard header with a higher-specificity translucent style.
- Cache marker matchroom-statistics-layout-20261116-v6; Quality Gate [43948380693](https://github.com/nonspam/cs2-5x5/actions/runs/43948380693) on commit `2af3b8ec3484d30ba37a270582a1a7d14f744a70`: **305 passed / 0 failed / 0 skipped**, confirmed from the validate job log. Browser visual QA and DEV deployment are still not verified.



## 2026-11-16 — Latest Statistics visual correction (IN PROGRESS)
- Owner requested the four Statistics highlight cards to stretch to the MVP card's full desktop height, the kill leader value/label to align to the far right, and the table header to become translucent instead of solid gray.
- Scoped CSS and regression assertions updated; cache marker v5.
- Quality Gate [43947209379](https://github.com/nonspam/cs2-5x5/actions/runs/43947209379) passed: 303/303. Browser/DEV visual verification pending. MVP layout/content and match data calculations intentionally unchanged.
# CS2 Analytics — Current State

> Актуальная краткая сводка. Последняя точка продолжения находится в [SESSION_CHECKPOINT.md](SESSION_CHECKPOINT.md). При конфликте сначала проверь живой код, свежие сообщения владельца и checkpoint.

## Snapshot

- Date: 2026-11-16
- Repository: `nonspam/cs2-5x5`
- Working branch: `faceit-dev`
- Last branch HEAD checked before the memory-system update: `e13320fc8069fb78d650c0ff2ea01d3a1168acc0`
- Latest application implementation commit identified in the inspected recent history: `71dca4dcee8b0dca0092b3565735c54cb0011634`
- The commits after that implementation commit in the inspected history are documentation/project-memory journal updates.
- Latest recorded Quality Gate: [run 43631741156](https://github.com/nonspam/cs2-5x5/actions/runs/43631741156), 236 passed / 0 failed / 0 skipped (previously verified from job log). Re-check newer runs before relying on this.

## Product and architecture

CS2 Analytics is one integrated FACEIT-inspired application for the team's CS2 5×5 history, players, matches, maps, analytics, records, profiles and future competition systems. Do not create a parallel app.

- Vanilla JavaScript SPA.
- Main runtime: `app_v57.js`.
- Main styles: `style_v57.css`.
- Account/profile module: `account_module.js`.
- ELO implementation: `elo_v3.js`.
- Automated tests: `tests/*.test.cjs`.
- Quality Gate: `npm run check` via GitHub Actions.
- Make scoped changes; do not rewrite the monolith wholesale.

## Demo analytics direction (owner decision — 2026-11-16)

- Decision: finish and stabilize the current product/routes first; add automatic demo processing afterwards. Do not build the parser prematurely.
- Future workflow: upload a CS2 `.dem` to a draft match → background parser → normalized events and versioned calculations → admin review → publish.
- One canonical match dataset must feed Match Room Overview/MVP/highlights, detailed stats, Duels, Equipment/Utility, profiles and Track. No manual re-entry into separate sections.
- Planned match overview: Impact Rating, K/D/A, ADR, KD, kills/round, headshots/HS%, 2K–5K, MVP rounds; MVP card; highlights for most kills, highest damage, best KAST and most entry kills.
- Planned detailed sections: General, Entry, Trades, Clutches, Duels, Equipment/Utility; CT/T filters where supported.
- Impact Rating is our own model, not a claimed FACEIT formula. Elo/level and crosshair are external/profile data, not derived from a demo.
- Full architecture, metric groups, uncertainty boundaries, phases and acceptance criteria: [DEMO_ANALYTICS_PLAN.md](DEMO_ANALYTICS_PLAN.md).
- Documentation only at this stage: no parser, upload flow, DB schema, SQL/migration, deployment or production changes.

## Current focus

The latest owner-directed correction is Match Room Statistics: restore the MVP card and four leader highlights, and remove pill/outlined category controls. Source and regression tests are updated on faceit-dev. Quality Gate run 43890650551 passed (292/292). Browser visual QA and DEV deployment verification remain pending.

## Confirmed implementation baseline

- Profile opens in a contained window reusing the existing profile renderer; vertical navigation: Overview, Match History, Track, Close.
- Match Room uses a contained workspace window intended to preserve the desktop global left rail.
- Both windows use full-screen behavior at widths up to 700px.
- Relevant source files: `app_v57.js`, `style_v57.css`; regression tests: `tests/faceit-v2-shell.test.cjs`.
- Implementation commit: `71dca4dcee8b0dca0092b3565735c54cb0011634`.

## Verification boundaries

- Automated Quality Gate evidence exists as listed above.
- Browser visual/interaction QA: not evidenced in the latest recorded checkpoint.
- Screenshot comparison: not evidenced.
- DEV deployment verification: not evidenced.
- Production deployment: not evidenced.
- Do not claim visual acceptance or deployment based on CI.

## Safety and unresolved areas

- Work only on `faceit-dev` unless the owner explicitly authorizes otherwise.
- No production, database, SQL, migrations, RLS, grants or Edge Function changes without separate explicit permission.
- Do not deploy or perform browser QA without separate explicit permission.
- Preserve real project data and existing functions during UI work.
- Do not infer unresolved ELO/series/roster semantics; consult the technical decision documents before touching them.

## Continuation

1. Read SESSION_CHECKPOINT.md.
2. Check live faceit-dev HEAD and commits again.
3. Incorporate the owner's newest screenshots/messages.
4. Inspect current source and relevant regression tests.
5. Continue only the current approved task.
6. Update SESSION_CHECKPOINT.md after each logical stage and before ending the chat.


## Latest owner correction — 2026-11-14 (IN PROGRESS)
- Profile backdrop is designed to hide the route beneath it; the Profile panel separately paints the account wallpaper with a dark overlay.
- Desktop Profile window aligns to the 170px global rail; tablet/mobile offsets are preserved.
- Right utility avatar is a compact circular 38px tile.
- Match Room previously reused body::before, overriding the global wallpaper pseudo-element. That conflict is removed; Match Room now uses the same account wallpaper variable on its own surface.
- New source contracts passed Quality Gate run 43639401323 (253/253) at 6640706cf6ffae0377715a3e95da5b04723eb8c4. Browser QA, live DEV deployment SHA and screenshot comparison remain unverified.


## 2026-11-15 — Profile media follow-up (IN PROGRESS)
- Latest change moves upload notifications above the Profile overlay, changes the right utility avatar to a 42px circle, and increases wallpaper visibility across the app.
- Cover upload now explicitly reapplies the wallpaper and checks that the public storage URL returns a loadable image; failure is surfaced in the toast.
- Latest implementation/test commits: `eb9b4b465e0e6fbfa387da5ae90507096b187b0c`, `37301675bd4c56080b9b42121b37bce79c737811`, `757ae2f8ba96c8fadf0f5ff10d0ec53dc4c9a13f`, `718b26e5cb32d665ee9b91f4754c6c64c1c13896`.
- CI and browser/upload verification pending; no deployment performed.


## 2026-11-15 — VS / profile scroll / wallpaper follow-up (IN PROGRESS)
- VS popover now has explicit compact layout rules to stop inherited oversized button typography and wrapping.
- Toast is reparented to document.body to avoid being trapped inside the app stacking context.
- Profile 5/10/20 selector updates only the profile mount and restores its scroll position.
- Wallpaper overlay reduced and route/profile shells explicitly transparent; live storage application still needs verification.
- Implementation/test commits: `f3168228b399239118efe46665fce5d3cfceffc3`, `554b5be7252241165450223379cc093f2450acd7`, `3a97e7ce7b4450ed5b405bbeeb0501e2c0c51a34`, `8ecf3848e9f1fa6ba31114cbe2aeebb8c98d40e0`.
- No CI result, browser QA or deployment yet.


## 2026-11-15 — Latest profile interaction corrections (IN PROGRESS)
- Compact VS recent-match list and header layout.
- Toast moved to body root to appear above the Profile window.
- 5/10/20 profile selector rerenders only profile content and restores scrollTop.
- Wallpaper overlay reduced and route/profile shells made transparent; real upload remains unverified.
- Latest regression test commit: `4522c4fc3b9685cf4f0775e5c37d0649e0ba0c7f`.
- No CI/browser QA/deployment evidence yet.


## 2026-11-15 — Wallpaper upload succeeds but image is not visible (IN PROGRESS)
- Owner confirms upload success toast but no visible wallpaper.
- CSS now paints `--account-wallpaper` directly on `.app` instead of relying on the behind-app body pseudo-element; shells remain transparent and cache-bust updated.
- CSS/index/test commits: `9e5e7b66cc74f772c33ae2ccb5881e953d70da29`, `e4d7dd2ee2b8e09e5fece037a2971afa20497488`, `f6384f26873818a46ff7470685db7ed8136824b0`.
- Browser verification not performed; no deployment or DB/storage-policy changes.


## 2026-11-15 — Wallpaper in Profile and Match Room (IN PROGRESS)
- Owner screenshot confirms global wallpaper works on main routes but not Profile/Match Room.
- Source cause: Profile shell .faceit-exact-shell is 94% opaque; Match Room page and content later set opaque #050505 backgrounds. Added direct wallpaper image backgrounds to both independent surfaces and made their inner shells transparent/translucent. CSS cache key bumped.
- Commits: 73bbb25a83fd611cc1ca1ebf73e481c2367f5734, 31cfe855268dd1b97bc09e7ff4615650560e48cc, c2980ad2beb2e0b46354ce00fc938104ce3ee644.
- Browser verification pending; no deployment or DB/storage-policy changes.


## 2026-11-15 — Unify Matches, Statistics, Home and Records palette (IN PROGRESS)
- Owner selected Teams' dark palette as the common reference: tile #121617, panel #0d1012, border #2a3035. Maps should remain unchanged.
- Scoped CSS now applies the palette to Matches and Match Room cards/tables, Statistics player table, Home panels/metrics/recent games (hero art preserved), and Records panels/rows. Semantic positive/negative colors and lime states remain.
- Commits: 41e31ee097a7eb6f0beb6f6496a241ebccc4214f, fbaa22fc8b5921e3d92c29cd01295f5c299bb4ec, 4e141bbeece3315328fe08f01a30324ceefa8017.
- CI and browser visual QA pending; no deployment or DB/storage-policy changes.


## 2026-11-15 — Profile return path and hard palette correction (IN PROGRESS)
- Added dedicated “Вернуться в профиль” action when Match Room was opened from a public Profile. Existing “К матчам” remains a separate route action; pending profile context is cleared when leaving to Matches.
- Owner screenshot feedback showed prior CSS selectors were not strong enough to beat later/ID-scoped blue styles. Added high-specificity graphite overrides for Matches route table/panel, Statistics table/panel, and Match Room roster/stat cards.
- Commits: app `8f2e6964eaac56e628ac9e2549dfe9ced5dcca2f`; CSS `fd5bec0334540d2e0797d2642f90f0293e99b0c3`; cache `cd5039ec4da5b26150ec6c2d944e269d02c2730e`; tests `d88c824a458749e7f8e78b238fa937566fb35ba1`.
- CI and browser visual QA pending; no deployment or DB changes.


## 2026-11-15 — Profile navigation and Match Room statistics polish (IN PROGRESS)
- Profile tabs pinned with sticky positioning; FACEIT level ring now uses tier colors (4–6 yellow, 7–9 orange, 10 red). Match Room has a single plain “Вернуться” action and returns to the originating Profile's History section. “К матчам” removed from this header.
- Explicit dark graphite overrides added to Match Room statistics roster table and Matches/Statistics route tables after owner screenshot still showed blue fills.
- Commits: app e5e8443d0fe4208a202c43639c8a3b18105c9fe5; CSS 0f9a4ce148dcb228a480fad5b578f5dd65f9e2ed; cache 34c824b8efbbe8fbf48b716c4cbb6f5f8f03200b; tests e777ea141fb456ea9a1fabc023befe6d471afd04.
- CI/browser QA pending; no deployment or DB changes.


## 2026-11-15 — Current owner task: Profile and Match Room transparency
- Working branch remains faceit-dev.
- Latest owner-requested implementation is in progress: sticky translucent Profile tabs, text-only W/L, translucent Profile and Match Room surfaces, team identity-cell coloring, Profile FACEIT arc, and map-statistics return to parent series.
- Latest Quality Gate is pending for commit 25afe5ddc75765cf1950e4fc99692b2431ec6df5; an earlier run failed and was corrected.
- Browser QA, screenshot comparison, live navigation verification and deployment SHA remain unverified.
- See SESSION_CHECKPOINT.md for the exact implementation and next action.

- Latest owner UI package: Quality Gate run 43731859881 passed on tests commit ba201a31edf605a575181a781a2ddd21f7e42ab0 (273/273). Browser QA, owner visual acceptance and deployment remain pending.

- Final follow-up CSS/test package (Profile history rows and Match Room roster/map cards): Quality Gate run 43731959484 passed, 274/274. Visual browser QA and deployment remain unverified.


## 2026-11-15 — Latest owner screenshot corrections
- Profile navigation has only Overview / Match History / Track; latest pass removes the CS2 icon/label, reinforces sticky translucent tabs, removes the square from the level arc, renders W/L as text and fixes history-row hover target.
- Match Room latest pass: translucent MVP, overview player cards, map/veto and statistics tables; approved three mini highlights untouched; team color on avatar/icon only; Team A score green, Team B white; KD >1 green, =1 white/bold, <1 red.
- Quality Gate 43733541030 passed: 278/278.
- Browser visual QA and deployed DEV verification are still pending. See SESSION_CHECKPOINT.md.

- TOP-tab player rows now use translucent cards (three approved mini highlight cards unchanged); latest Quality Gate 43733694196: 279/279 passed. Browser visual QA remains pending.


## 2026-11-15 — Latest screenshot corrections
- Match Room Overview roster cards now have translucent identity/metrics layers and circular real avatars; fallback initials are hidden when an image exists.
- Match Room Statistics player cells all use translucent blurred backgrounds; MVP and three mini highlights remain unchanged.
- Track point tooltip now uses fixed viewport positioning above the Profile overlay and follows scroll/resize.
- Quality Gate 43735324791: 282/282 passed. Live browser verification remains pending.


## 2026-11-15 — Current focus: matchmaking leaderboard prototype
- New route `ranking` is implemented in source and placed between Statistics and Matches in the left rail.
- Season 0 (Test) and Season 1 selectors are clickable. Both currently show active players with Elo 1000 as placeholder data; season snapshots are not persisted and no real season rating calculation exists yet.
- Matchmaking-only table has Rank / Player / Skill Level / Elo; temporary top-three row outlines remain, rank numerals are plain white, skill badges carry rank colors.
- Latest Quality Gate [43757606058](https://github.com/nonspam/cs2-5x5/actions/runs/43757606058): 285/285 passed.
- Browser visual QA and DEV deployment verification are not evidenced. Continue with DEV visual review; do not modify database or deploy without separate approval.

## 2026-11-15 — Latest leaderboard changes
- Rating now has translucent glass table rows matching Match Room Statistics (rgba(8,12,14,.14), 9px blur, subtle borders); the surrounding panel is transparent.
- Season 0 uses active players' ALL TIME aggregates, sorted by the same K/D and tie-break rules as Statistics. Shows K/D, not placeholder Elo.
- Season 1 selector remains clickable and shows an upcoming-season empty state.
- Latest Quality Gate [43760767947](https://github.com/nonspam/cs2-5x5/actions/runs/43760767947): 286/286 passed.
- No browser visual QA or deployment verification yet.


## 2026-11-16 — Match Room full-player statistics test scaffold
- Match Room Statistics now presents one combined 10-player comparison table instead of two isolated team tables. Numeric columns are clickable and sort descending on first selection; selecting the same column again reverses the order.
- Columns: K, D, A, K/D, +/−, ADR, HS%, KAST, damage, MVP, entry kills/deaths, flash assists, utility damage, clutches and 3K/4K/5K. Team remains visible as a side label.
- Latest detailed match `match_032` (`map_066`, `map_065`, `map_064`) now has a complete zero-filled advanced-stat schema for all 30 player-map rows. Existing K/D/A source values are preserved. Missing advanced values are explicitly `0` for UI/data-contract testing; they are NOT measured demo statistics.
- Aggregation carries the advanced fields to the series comparison; missing fields in older matches also safely render as `0`.
- All menu surfaces (navigation, custom selects, account menus, player search and Match Room menus) now use translucent glass backgrounds with blur. Inner menu surfaces and comparison rows remain transparent enough to reveal the map/background.
- No demo parser, metric calculation, backend schema, Supabase migration, production deployment or `main` change was made. Visual browser QA and automated quality-gate result are still pending.

- Expanded the zero-filled test contract across the full planned stat families: Impact Rating, K/R, ADR, HS kills/%, KAST, accuracy, shots/hits, damage, MVP, rounds, survival, entry/opening kills and deaths, trade kills/traded deaths, flash assists, utility damage/enemies, total and 1v1–1v5 clutches, duels won/lost/win%, 2K–5K, CT/T kills and deaths. Rate-like values are averaged across maps; count metrics are summed. All fields are present for every player-map row in the latest match, with zero placeholders until demo-derived values exist.


## 2026-11-16 — Match Room statistics layout correction
- Replaced the always-on 10-player mega-table with FACEIT-style statistic categories: Общee, Расширенное, Энтри, Размены, Клатчи.
- Default view is two separate team tables (five players per team); the optional «Сортировать по игрокам» mode combines both rosters into one ten-player table.
- Added Все / T / CT side controls. T and CT values use the source's t_kills/t_deaths and ct_kills/ct_deaths fields; side-specific fields not supplied by the source remain 0 rather than being fabricated.
- Sorting applies to the visible category and current display mode. Removed the old comparison mega-table and its 40+ simultaneously visible columns.
- Team header shows average ELO. First/second-half score is displayed as unavailable (—) because the current map data schema does not provide half scores.
- Visual styles are compact and transparent, with no decorative oval header frames.
- Validation: JavaScript syntax checks passed for app_v57.js and tests/faceit-v2-shell.test.cjs. Full automated test suite and browser visual QA have not yet been run.


## 2026-11-16 — Latest Match Room Statistics fix
- K/D/A mapping now uses the actual roster fields (`k/d/a`), correcting the zeroed General table.
- Unavailable advanced values display `—`, not fabricated zeros; real zeros remain visible when other source rows establish that metric is present.
- T/CT side K/D is calculated from split kills/deaths when available.
- MVP left + four leader cards right in 2×2 layout; controls reduced in size and spacing.
- CI run 43892597145: 295/295 tests passed. Visual acceptance/deployment still pending.


## 2026-11-16 — Match Room navigation regression fix
- User reported that opening some matches returned to the home page.
- Root issue in route handling: Match Room previously pushed only the `?match=<id>` query parameter and left the previous hash route (often `#/home`) unchanged. History restoration then resolved the stale hash route independently of the match query and could render the wrong page.
- `openMatchDetail` now normalizes the match ID, verifies it against the loaded match list, writes both `?match=<id>` and canonical `#/base`, sets the base route before rendering, and uses replaceState for restore flows to avoid duplicate history entries.
- `restoreAppRouteFromHistory` now gives a valid match query priority, keeps the base route active while the Match Room is open, and closes the room only when navigating to a history entry without a match query.
- Added regression coverage for opening matches, query-priority restoration, and browser back/forward behavior. Asset cache marker refreshed in `index.html`.
- Files changed: `app_v57.js`, `index.html`, `tests/faceit-v2-shell.test.cjs`.
- Quality Gate run [43894272728](https://github.com/nonspam/cs2-5x5/actions/runs/43894272728): **296 passed / 0 failed / 0 skipped**.
- Browser click-through and DEV deployment were not directly verified from this session. Await user refresh and visual confirmation.
- No production/main/DB/SQL/migration/RLS/storage-policy changes.
- Status: SOURCE + TESTS PASS; visual/browser acceptance pending.


## 2026-11-16 — Match Room rendering runtime error fix
- Follow-up user report: clicking a match switched the app to the Matches route but did not display the selected match room.
- Root cause confirmed in `openMatchDetail`: `statCategories` was read in the `statDataAvailable` and `statSideAvailable` loops before its `const` declaration later in the same function. This hit the JavaScript temporal dead zone and aborted Match Room construction after the route switch.
- Moved the complete `statCategories` declaration above its first use, before `statPlayers` and the availability loops. The Match Room can now finish rendering after route normalization.
- Added a regression assertion that the declaration precedes the first read. Updated the `index.html` asset cache marker to `matchroom-navigation-runtime-fix-20261116-v3`.
- Files changed: `app_v57.js`, `tests/faceit-v2-shell.test.cjs`, `index.html`.
- Quality Gate run [43895298970](https://github.com/nonspam/cs2-5x5/actions/runs/43895298970): **296 passed / 0 failed / 0 skipped**.
- Browser click-through / DEV deployment still not directly verified from this session; user refresh and visual confirmation pending.
- Status: SOURCE + TESTS PASS; visual/browser acceptance pending.
