# SESSION CHECKPOINT — read this first

 > Updated after the latest profile feedback: stop route bleed-through and restore the taller avatar in the right utility rail.

## Snapshot
- Date: 2026-11-14
- Repository: nonspam/cs2-5x5
- Branch: faceit-dev
- Parent HEAD before this implementation: 54a7f3956dd99b6113c5d0dae84e37f37c86685e
- Prior source/test commit: 6640706cf6ffae0377715a3e95da5b04723eb8c4. Follow-up profile correction commits: `d4f851177d1aa87d95633f1fbcfbb98b23466355`, `cb6935f399c2377d74520e62971f822e14cb3f24`, `278a012e20f278c508ac8a71257b86f3c2c37274`, tests `9ce4e439d8a0267a18cfe7e69527ec7c7cb4dfe3` and `3fed2e478d29cf8dbff44f87460fbc85dd213ac7`.
- Quality Gate: run 43639401323, **253 passed / 0 failed / 0 skipped**, verified from the validate job log at source/test commit 6640706cf6ffae0377715a3e95da5b04723eb8c4.
- Scope: frontend CSS, regression tests, asset cache key and project docs only. No deployment, browser QA, database or production changes.

## Current owner-directed task — IN PROGRESS
The owner reported that Profile showed the route underneath it (map forecast, AVG, balance and other controls), Profile overlapped left navigation labels, and the right utility avatar had been reduced to a small square/circle instead of the previously larger, vertically extended portrait. The latest instruction is to restore that taller avatar and keep the profile's avatar-change control available.

## Implemented in source (CI pending)
- Profile backdrop is now near-opaque (99.5%). Profile panel paints the account wallpaper beneath a stronger dark gradient (86–91%) so wallpaper remains visible but underlying route content does not show through.
- Desktop Profile window/backdrop left inset aligns to the 170px global navigation rail; tablet 82px and mobile full-screen rules are retained.
- Removed the conflicting body.match-room-open:before overlay. It reused the same body pseudo-element as body.has-account-wallpaper:before and replaced the global wallpaper whenever Match Room opened.
- Match Room now draws the same --account-wallpaper URL under a dark overlay on its own surface.
- Right utility rail avatar restored to a taller 46×62px portrait tile with 7px corner radius; image and fallback use the same shape. The previous 38×38 circular regression is removed.
- Existing upload/save logic, account media fields, player data, profile renderer, route navigation and Match Room handlers are unchanged.

## Files changed
- style_v57.css
- tests/faceit-v2-shell.test.cjs
- index.html (asset cache keys)
- docs/PROJECT_MEMORY/SESSION_CHECKPOINT.md
- docs/PROJECT_MEMORY/DEVELOPMENT_LOG.md
- docs/PROJECT_MEMORY/CURRENT_STATE.md
- TECHNICAL_STATE.md

## Verification
- Regression assertions updated for 99.5% profile backdrop, stronger wallpaper overlay, 46×62 portrait utility avatar, and 333px profile avatar frame. Existing CI run 43639401323 (253/253) applies to the previous CSS revision only; no CI result is yet available for the follow-up commits.
- Quality Gate for this implementation: run 43639401323 passed (253/253).
- Browser visual QA, screenshot comparison, live upload/persistence and deployed DEV SHA: not verified.
- Production, Supabase data, SQL, migrations, RLS, grants and storage policies: not touched.

## Next step
1. Verify the latest Quality Gate for commit `3fed2e478d29cf8dbff44f87460fbc85dd213ac7`; current combined commit status returned no statuses yet.
2. Browser visual QA/deployment are not performed; do not claim visual acceptance or deployment.
3. Keep the existing avatar-change action (`✎ АВАТАР`) and wallpaper action (`ОБОИ САЙТА`) intact; no account upload logic changed.


## Owner feedback — media upload, avatar shape and wallpaper (2026-11-15)
- New screenshot feedback: avatar/cover upload feedback appeared behind the contained Profile window near the lower edge; right utility avatar remained a rectangle; wallpaper selection appeared not to apply.
- Root cause confirmed in source: global `.toast` had z-index 80 while Profile window uses z-index 12040, hiding upload success/error messages behind the Profile surface.
- Root cause confirmed in source: right utility avatar was explicitly styled 46×62px with 7px radius, contradicting the owner's round-avatar request.
- Upload path reviewed: `handleProfileImage` uploads to `cs2-player-media`, persists `avatar_path` / `cover_path` via `savePlayerProfile`, then rerenders. Added explicit wallpaper refresh and public-image load verification so storage/public URL failures become visible instead of appearing successful.
- New implementation commits: app `eb9b4b465e0e6fbfa387da5ae90507096b187b0c`; CSS `37301675bd4c56080b9b42121b37bce79c737811`; cache keys `757ae2f8ba96c8fadf0f5ff10d0ec53dc4c9a13f`; regression tests `718b26e5cb32d665ee9b91f4754c6c64c1c13896`.
- CSS now places upload feedback above the Profile window, restores a 42px circular utility avatar, makes the app surface transparent over the global wallpaper layer, and reduces wallpaper dark overlays so the image is actually visible.
- Verification: source changes committed on faceit-dev. Combined status returned no statuses and workflow-run lookup returned no runs for latest test commit. Browser upload/persistence and screenshot QA are not verified. No deployment or database/storage policy changes were made.
- Status: IN PROGRESS — awaiting CI and owner browser verification.


## Owner feedback — VS match list, wallpaper and profile scroll (2026-11-15)
- Latest screenshot shows the VS recent-match popover's rows inheriting oversized/global button styling, causing text to wrap and controls to fill the panel incorrectly. Added explicit compact grid row layout, fixed panel width, header flex layout, and a scrollable match list.
- The upload toast was initially inside `.app`, which is a positioned stacking context below the contained Profile window. `toast()` now reparents the toast to `document.body` before showing it; a higher z-index alone was insufficient.
- Profile 5/10/20 controls previously called global `render()`, replacing the route and profile DOM and resetting the inner profile scroll container. They now call `setProfileWindowSize()`, rerender only the profile mount, and restore the profile content scrollTop.
- Wallpaper visibility layer is less dark and route/profile shells remain transparent so the body wallpaper pseudo-element can be seen behind the UI. This is source-level only; actual persisted wallpaper selection still needs live verification.
- Commits: app `f3168228b399239118efe46665fce5d3cfceffc3`; CSS `554b5be7252241165450223379cc093f2450acd7`; cache `3a97e7ce7b4450ed5b405bbeeb0501e2c0c51a34`; tests `8ecf3848e9f1fa6ba31114cbe2aeebb8c98d40e0`.
- No deployment, browser QA, live upload test, DB, or storage-policy change.
- Status: IN PROGRESS pending CI and live visual/upload verification.


## Owner feedback — VS panel / profile window switch / wallpaper (follow-up 2, 2026-11-15)
- VS popover issue: the compact match panel inherited oversized button styling. Added fixed panel width, flex header, grid-based rows, compact typography and a bounded scroll list.
- Toast issue: `#toast` was initially rendered inside `.app`, which forms a stacking context below the Profile window. `toast()` now moves the node to `document.body` before showing feedback.
- Profile 5/10/20 buttons no longer call global `render()`. `setProfileWindowSize()` updates the selected count, rerenders only the profile mount and restores the profile content scrollTop.
- Wallpaper visibility: route/app/profile shells are transparent over the body wallpaper pseudo-element and the dark overlay has been reduced. This is CSS/JS source work only; actual successful upload and visible wallpaper still require browser verification.
- Latest app commit: `f3168228b399239118efe46665fce5d3cfceffc3`; CSS: `554b5be7252241165450223379cc093f2450acd7`; cache: `3a97e7ce7b4450ed5b405bbeeb0501e2c0c51a34`; final regression tests (including updated circular-avatar expectation): `4522c4fc3b9685cf4f0775e5c37d0649e0ba0c7f`; docs commit prior to this note: `fa5af253392d3654eb1d986225f0d1dd1b7b5975`.
- Latest combined CI status and workflow-run lookup returned no checks/runs. No browser QA, live upload verification or deployment. Production and DB/storage policies untouched.
- Status: IN PROGRESS — waiting for CI and owner verification.


## Owner report — upload succeeds, wallpaper remains invisible (2026-11-15)
- Owner confirms upload toast now appears and reports “Обои сайта применены”, but wallpaper still is not visible.
- Source review: `applyAccountWallpaper()` assigns the public image URL to `--account-wallpaper`; previous CSS painted it only on `body::before` below the positioned app. The app's own surface could obscure that layer.
- Follow-up CSS now paints the same variable directly on `.app` with cover sizing and a light dark overlay; the body pseudo-layer is disabled to avoid competing backgrounds. Route/profile shells remain transparent. Cache-bust updated.
- Commits: CSS `9e5e7b66cc74f772c33ae2ccb5881e953d70da29`; index `e4d7dd2ee2b8e09e5fece037a2971afa20497488`; test `f6384f26873818a46ff7470685db7ed8136824b0`.
- Status: IN PROGRESS. Source-level hypothesis corrected; browser visibility and persisted image URL still require live verification. No deployment, DB, storage policy, or production changes.


## Owner screenshot — wallpaper missing only in Profile and Match Room (2026-11-15)
- Owner confirms wallpaper now appears on main site routes (e.g. Records/Statistics) but is missing in the contained Profile window and Match Room. Supplied screenshots show Profile's inner shell remains nearly opaque and Match Room's page/content use opaque #050505 backgrounds.
- Source cause confirmed: Profile panel has a strong dark overlay and .faceit-exact-shell has background:rgba(8,8,8,.94); Match Room later overrides its surface with background:#050505!important and content with the same opaque color. The wallpaper on .app cannot show through either independent surface.
- Added explicit wallpaper background-image to Profile panel and Match Room page using --account-wallpaper; made inner Profile shell and Match Room content transparent with subtle translucent surfaces. Updated CSS cache key.
- Commits: CSS 73bbb25a83fd611cc1ca1ebf73e481c2367f5734; index 31cfe855268dd1b97bc09e7ff4615650560e48cc; tests c2980ad2beb2e0b46354ce00fc938104ce3ee644.
- Status: IN PROGRESS until DEV browser confirms image visible in Profile and Match Room. No deployment, DB/storage policy or production changes.


## Owner-approved Teams palette unification (2026-11-15)
- Owner approved the exact dark graphite palette from the Teams page for Matches, Statistics, Home and Records; Maps is already approved and must remain unchanged. Screenshots show Teams tile #121617 and deep panel/slot #0d1012 with graphite border #2a3035; the Statistics table has a cooler, lighter row fill that should be removed.
- Added shared CSS surface tokens and scoped overrides: Matches/base table and Match Room player/stat cards; Statistics player table; Home panels/metric tiles/recent games (illustrated hero preserved); Records panels, Top-10 cards and rows. Positive/negative metric colors and lime interactions remain intact. Maps selectors are deliberately untouched.
- Commits: CSS 41e31ee097a7eb6f0beb6f6496a241ebccc4214f; cache key fbaa22fc8b5921e3d92c29cd01295f5c299bb4ec; regression tests 4e141bbeece3315328fe08f01a30324ceefa8017.
- Status: IN PROGRESS pending CI and owner screenshot/browser confirmation. No deployment, DB, storage policy or production changes.


## Match Room return-to-profile + graphite palette correction (2026-11-15)
- Owner reports that opening a map/match from public Profile closes the Profile window; the existing “К матчам” button navigates to the Matches route instead of returning to the originating Profile. Added source-profile capture before closing the Profile window and a distinct “Вернуться в профиль” action in Match Room. “К матчам” remains separate and clears the pending profile return context.
- Owner reports prior palette rollout did not visually change Matches and Statistics: blue fills persisted. Inspection found existing late/high-specificity Match Room rules (`#matchRoomPage...`) and legacy route table styles could override earlier generic selectors. Added explicit high-specificity graphite overrides for Matches route panel/table, Statistics panel/table rows, and Match Room player/stat surfaces. Kept Home/Records/Maps untouched in this corrective pass; existing semantic stat colors retained.
- Commits: app `8f2e6964eaac56e628ac9e2549dfe9ced5dcca2f`; CSS `fd5bec0334540d2e0797d2642f90f0293e99b0c3`; cache `cd5039ec4da5b26150ec6c2d944e269d02c2730e`; tests `d88c824a458749e7f8e78b238fa937566fb35ba1`.
- Status: source and regression assertions updated; CI/browser QA pending. No deployment, DB, production or main-branch changes.


## Profile navigation and Match Room statistics polish (2026-11-15)
- Owner screenshot feedback: profile game tabs should stay pinned while scrolling; level 4 ring must be yellow (red reserved for level 10); Match Room should expose one plain “Вернуться” control (no pill/oval and no “К матчам”) returning to the originating profile's match-history section; Match Room statistics table still had blue row fills.
- Added stronger sticky positioning for profile tabs in the profile's own scroll container. Profile ring color now follows level tiers: 1–3 muted grey, 4–6 yellow, 7–9 orange, 10 red. Match Room back action simplified to plain text “‹ Вернуться”; return opens the original profile directly on History. Removed the separate “К матчам” control from Match Room header.
- Added exact CSS overrides for the Match Room statistics roster table rows and route Matches/Statistics table surfaces, using the approved graphite palette.
- Commits: app e5e8443d0fe4208a202c43639c8a3b18105c9fe5; CSS 0f9a4ce148dcb228a480fad5b578f5dd65f9e2ed; cache 34c824b8efbbe8fbf48b716c4cbb6f5f8f03200b; tests e777ea141fb456ea9a1fabc023befe6d471afd04.
- Source anchors re-fetched and confirmed. CI and browser visual QA pending; no deployment, DB, production or main changes.


## Owner feedback — transparent profile/Match Room and map-to-series return (2026-11-15)
- Owner supplied seven screenshots/references and requested: pinned transparent Profile game tabs; text-only green W/red L results; more translucent profile/history surfaces; Match Room Overview/Statistics/TOP surfaces that reveal account wallpaper; blue Team A and green Team B identity-cell backgrounds (not colored player text); white team labels, blue Team A score and white Team B score; FACEIT level arc in Profile; and map-statistics back navigation to the parent BO3 series rather than profile match history.
- Source changes on faceit-dev:
  - app_v57.js: Profile level indicator changed from a full circular border to an SVG arc using the level-tier color and 27 degrees per level. Opening a map while already inside its parent Match Room stores the parent series context; the map-specific statistics view exposes 'Вернуться к серии', which restores the unfiltered series Overview and retains the profile-return context.
  - style_v57.css: Profile tabs stay sticky but use a translucent blurred surface; W/L marks render as colored letters without tiles; Profile shell/content/cards and Match Room surfaces are translucent; Match Room Statistics colors only the player identity cell (blue Team A, green Team B), with white team labels and blue/white team scores.
  - tests/faceit-v2-shell.test.cjs: added regression checks for the new behaviors and aligned stale navigation assertions with the actual current implementation.
  - index.html: refreshed CSS/JS cache keys.
- Commits: app b24922a34541d633153d4eda65d8e5c40f66c429; CSS 1d51f6c2f578cfccb18d0229a84b33fa6a979387, follow-up translucency ca849c9dbdb141fa9b374fae3166e57d8a1f6289; tests 63a77713537d7033140c5ec4a7265e8c729e4f66, follow-up 25afe5ddc75765cf1950e4fc99692b2431ec6df5; cache keys 0b115feb64720a2ec2c0903944158cd1cd6c2aad.
- Verification: initial Quality Gate run 43731610757 failed (263 passed / 7 failed / 0 skipped). Failures included stale source assertions for shell opacity/navigation/media z-index and one updated map-open contract; the Profile shell opacity issue was also a real visual defect and was corrected to rgba(8,8,8,.42). Regression assertions were updated. Latest Quality Gate run 43731859881 for commit ba201a31edf605a575181a781a2ddd21f7e42ab0 passed: 273 passed / 0 failed / 0 skipped, confirmed from the validate job log. Follow-up test commit corrected stale assertions for the toast z-index and dynamically generated profile-window button handler.
- Not performed: browser visual QA, screenshot comparison in a running DEV browser, live click-through of map → series → profile, deployment verification. No production, database, SQL, migrations, RLS, grants, storage policy or main changes.
- Status: IN PROGRESS — wait for Quality Gate, then owner must verify visual appearance and the BO3 return flow in DEV.
- Next step: inspect latest Quality Gate job log; fix any genuine regressions, then ask owner to test the profile scroll, W/L marks, Match Room wallpaper transparency, team coloring and map return-to-series flow.

- Final source/test status after test correction: app b24922a34541d633153d4eda65d8e5c40f66c429; CSS ca849c9dbdb141fa9b374fae3166e57d8a1f6289; tests ba201a31edf605a575181a781a2ddd21f7e42ab0; cache keys 0b115feb64720a2ec2c0903944158cd1cd6c2aad.

- Final follow-up for history/Match Room translucency: CSS b67e298b3644936beeba1209bcc934463cdb523a; regression tests 7453b1d4a65b77f8282a75ec42b9161da3dd7272. Quality Gate run 43731959484 passed on tests commit 7453b1d4a65b77f8282a75ec42b9161da3dd7272: 274 passed / 0 failed / 0 skipped, verified from validate job log.


## 2026-11-15 — Owner correction pass after screenshot review (IN PROGRESS)
- Owner reported that only the 3 mini highlight cards looked correct; the large MVP card, player panels, statistics rows, Profile tabs, W/L markers, level badge and history-row hover still did not match the request.
- Changes in this pass:
  - app_v57.js: removed redundant CS2 icon/label from the Profile game navigation; tabs now contain only Overview, Match History and Track.
  - style_v57.css: tightened Profile scroll container and sticky translucent tab bar; removed square border/background/shadow from FACEIT level arc; W/L letters in both Recent Results and Recent Matches have no tile backgrounds; match history rows use a single full-width rectangular hover target.
  - Match Room: MVP card, Overview player cards, map/veto panel and Statistics player table surfaces now use translucent fills; approved three mini highlight cards intentionally left untouched. Team A/B colors are applied to player avatar/icon only, not the entire name cell. Team A score is green, Team B score white. K/D typography is unified: >1 green, exactly 1 white/bold, <1 red.
  - tests/faceit-v2-shell.test.cjs: four new regression tests.
  - index.html: cache keys refreshed.
- Commits: app 5cc88c0419b4970153a181d24c1b3c139ff2a5d7; CSS 6f7e2a89d8c6eedd387878f6a98702ab49f59b23; tests d38124db99f4b5cd1179cc5148e0ca879853f4cb; index 06ebc3d66e6e27ae2333cb1887149e994498c52a.
- Quality Gate run 43733541030 passed on tests commit d38124db99f4b5cd1179cc5148e0ca879853f4cb: 278 passed / 0 failed / 0 skipped. CSS-only commit run 43733538233 also passed.
- Not performed: live browser screenshot comparison or visual acceptance. No deployment, production, database or main-branch changes.
- Status: SOURCE + TESTS PASS; browser verification pending.
- Next: owner refreshes DEV (hard reload) and checks Profile scroll/tabs, W/L text, level arc, full-row hover, Match Room overview transparency, Statistics transparency, avatar-only team colors, team scores and KD colors. Adjust only mismatches reported from the refreshed build.

- Follow-up after owner explicitly said TOP still looked dark: CSS 38b09380a8dce42b850508cf4109541ebd4a4177 makes `.match-stat-top-row` translucent too; test commit 7a9b4724750db837bd67f7b6313d349cef196e89. Quality Gate run 43733694196 completed successfully; validate log confirms 279 tests / 279 passed / 0 failed / 0 skipped. Three approved mini highlight cards remain unchanged.


## 2026-11-15 — Match Room glass rows, circular avatars and Track tooltip layering
- Owner screenshot review confirmed: MVP and three mini highlights are already correct and must remain untouched; remaining defects were opaque Overview player identity/metric sublayers, opaque Statistics player cells, avatar initial printed over real photo / square avatar, and Track point tooltip appearing beneath wallpaper/profile.
- app_v57.js: Track tooltip now explicitly uses `position:fixed` and `z-index:13050`; pinned tooltip is repositioned on window scroll and resize using the existing abort controller.
- style_v57.css: Overview roster cards, identity headers and career metric cells now use translucent frosted surfaces; Overview avatar is circular; every Statistics player-row cell (name/rank/K/D/A/KD) now uses the same translucent blurred treatment instead of dark opaque cell backgrounds. Existing MVP and three mini-highlight cards were not modified. Real avatar images hide their fallback initial; if image is removed/failed the fallback span can show again.
- tests/faceit-v2-shell.test.cjs: three regression tests added.
- index.html cache keys refreshed.
- Commits: app 929a54d99671ae216362a24e2ee8d99676b9eb16; CSS 4131bf15fb09b5081b9dc8cbeb38472674d642a3; tests 8ecc95c13de75801f11af63589a949b86de43473; index 928b1940167748d923f39b2f98aa51a7e2fca7f6.
- Quality Gate [43735324791](https://github.com/nonspam/cs2-5x5/actions/runs/43735324791): **282 passed / 0 failed / 0 skipped**.
- Browser visual QA and live deployed DEV verification are not performed; owner needs hard refresh and check real profile data / click behavior.


## 2026-11-15 — Match Room Statistics glass-wrapper correction
- Owner confirmed Overview now looks correct, but Statistics player rows still appeared opaque.
- Root cause identified from stylesheet cascade: legacy `.match-stat-teams .table-wrap` and table backgrounds remained solid `#0b0b0b`, behind the individually translucent cells.
- CSS commit `8299eea2dc4740f6ffd1aba258dca852da4b2e17`: explicitly clears background/background-image/shadow from the Statistics team wrapper, `.table-wrap`, `.match-scoreboard`, `tbody`, and odd/even rows; keeps a lightly frosted translucent fill on every player cell.
- Test commit `86d7567a47eddbd98abd9c0d319c8fa7f7e78c73`; cache-bust commit `08896c45f0637fca9e875f589eaf3e4179a40eff` (`style_v57.css?v=matchroom-statistics-wrapper-glass-20261115-v11`).
- Quality Gate run [43739021958](https://github.com/nonspam/cs2-5x5/actions/runs/43739021958): **283 passed / 0 failed / 0 skipped**.
- Browser visual acceptance is still pending owner refresh; Overview was confirmed good by owner, Statistics awaits re-check.


## 2026-11-15 — Statistics transparency: specificity-cascade root cause and final override
- Owner supplied a fresh screenshot showing Statistics table rows still opaque after the earlier wrapper fix.
- Re-inspection of the full stylesheet found the actual overriding rules at approximately lines 7312–7318: `.match-room-statistics-view ... .data-table tbody tr td` and even-row selectors forced solid `#121617` / `#0d1012` backgrounds with `!important`. The previous glass rules did not match this selector's specificity.
- CSS commit `9ceb8aa86dc13ba755529856e025af4843761d1a` adds a later, equally/more-specific override for the exact Statistics view and all body cells, including even rows and hover; uses translucent `rgba(8,12,14,.20)` with blur. Header remains dark for legibility.
- Cache-bust commit `8fd1ba861b1bca229ef30b0b50920cff58858456`: `style_v57.css?v=matchroom-statistics-cascade-glass-20261115-v12`.
- Test commit `821c7b111e91ab0e2017db66b7eee7a977ddc2a2`; Quality Gate run [43739375950](https://github.com/nonspam/cs2-5x5/actions/runs/43739375950): **284 passed / 0 failed**.
- Browser visual acceptance still requires owner refresh after deployment. Do not claim visual success until confirmed.


## 2026-11-15 — Matchmaking leaderboard prototype (IN PROGRESS)
- Owner approved implementation directly in `faceit-dev`: add a dedicated left-rail Rating route between Statistics and Matches; retain only Matchmaking; four columns (Rank, Player, Skill Level, Elo); remove countries/regions and wreath decorations; rank numbers remain plain white; keep temporary gold/silver/bronze outlines on places 1–3; skill pills retain #1/#2/#3 and red for the rest.
- Added a prototype season selector with clickable `Season 0 (Test)` and `Season 1`. Both currently render the active player roster with a fixed Elo of 1000 for every player; the roster is sorted deterministically by display name. This is placeholder presentation data, not a persisted season snapshot, not a real rating calculation, and not yet a historical standings system.
- Files changed: `app_v57.js` (new `ranking` route and renderer; route registry/rail updated), `style_v57.css` (leaderboard styling and podium outlines), `index.html` (stylesheet cache key), `tests/faceit-v2-shell.test.cjs`, `tests/faceit-v2-shell-dev-contract.test.cjs`, `tests/metrics-regression.test.cjs` (route and UI regression expectations).
- Source commits: app `9655c90accde8e7ff2d7b620f6fe4e6ee845f8e4`; CSS `57689953361d3913844855123f9712034b4ee881`; index `cff8b4e00100194048a49b2704b6bf4042849544`. Regression tests updated through `fe3e437ac3b384f232300a588cf61265afc32630`.
- Quality Gate [43757606058](https://github.com/nonspam/cs2-5x5/actions/runs/43757606058): **285 passed / 0 failed / 0 skipped**, verified from the validate job log.
- Not performed: browser visual QA, screenshot comparison, DEV deployment verification. No production, main, database, SQL, migrations, RLS, grants or Edge Function changes.
- Status: SOURCE + TESTS PASS; visual verification/deployment pending. Do not claim it is visible on the deployed site until the DEV environment is separately updated and checked.
- Next: inspect the rendered Rating route in DEV after the owner refreshes/opens the latest build; adjust only visual mismatches. Then design real season snapshots and historical Elo separately before treating season results as permanent.

## 2026-11-15 — Leaderboard glass + Season 0 current K/D standings
- Owner asked to make the Rating page transparent like Match Room and populate Season 0 with current standings ordered by K/D.
- Updated `ranking(v)`: Season 0 uses `playerSeasonAggregate(player_id,'all')` and the exact same sort priority as the existing Statistics player table (K/D, K-D, kills, Elo, nickname). Displays K/D with existing `kdMarkup` coloring. Current note explicitly says ALL TIME, because Season 0 has no separately persisted match history yet.
- Season 0 label is now `Сезон 0 (Текущий)`. Season 1 remains clickable but correctly shows a not-started empty state rather than fabricated standings.
- Replaced the Elo placeholder column with K/D; no longer displays fake 1000 ratings in the ranking table.
- Rating panel/wrappers are transparent; leaderboard rows use the same glass fill `rgba(8,12,14,.14)`, 9px backdrop blur and light borders as Match Room Statistics. Podium outlines remain, with much subtler translucent tints.
- Files changed: `app_v57.js`, `style_v57.css`, `index.html`, `tests/faceit-v2-shell.test.cjs`.
- Quality Gate [43760767947](https://github.com/nonspam/cs2-5x5/actions/runs/43760767947): **286 passed / 0 failed / 0 skipped**, verified from validate job log.
- Browser visual QA and DEV deployment verification remain pending. No production/database changes.
- Latest implementation commit at this checkpoint: `fee87fc4085b0a07b7ef0736b305efdab8bd4389`.


## 2026-11-16 — Demo analytics direction (PLANNED, documentation only)
- Owner decision: complete/stabilize the current site and its systems first; only then implement automatic CS2 demo upload and processing. Continue designing current match/stat features around future canonical data contracts, but do not start parser integration yet.
- Intended flow: upload `.dem` to a draft match → background parser → normalized raw events → versioned metric calculations → admin review/correction → publish.
- One canonical match dataset will power Match Room Overview/MVP/highlights, General, Entry, Trades, Clutches, Duels, Equipment/Utility, CT/T splits, player profiles and Track. No duplicated manual data entry.
- Overview fields: Impact Rating, K/D/A, ADR, KD, kills/round, headshot kills and %, 2K–5K, MVP rounds. MVP card: K/D/A, ADR, HS%. Four highlights: most kills, highest damage, best KAST, most entry kills.
- Detailed sections: General/advanced (KAST, accuracy, shots/hits, multi-kills, participation/survival), Entry, Trades, Clutches (1v1–1v5), Duels (player-vs-player), Equipment/Utility (general, damage, support).
- Impact Rating must be our own documented model; do not claim FACEIT formula parity. Elo/level and crosshair are not demo-derived. Ambiguous labels/formulas (e.g. RWS, RP/RS) remain unresolved until confirmed.
- Preserve raw events, round/player-side context and calculation version; process in a background service; validate and review before publication; make retries idempotent; published matches alone update Track.
- Full plan: [DEMO_ANALYTICS_PLAN.md](DEMO_ANALYTICS_PLAN.md).
- No parser, upload, DB/schema/SQL/migration, deployment or production changes in this documentation decision.


## 2026-11-16 — Match Room statistics test scaffold
- One combined 10-player comparison table replaces the separate team tables in Match Room Statistics. K, D, A, K/D, +/−, ADR, HS%, KAST, damage, MVP, entry kills/deaths, flash assists, utility damage, clutches and 3K/4K/5K columns are sortable; the first click sorts descending and the next click reverses.
- The latest detailed match `match_032` has zero-filled advanced fields on all 30 player-map rows; original K/D/A values remain unchanged. These zeros are UI/schema test placeholders, not measured demo stats. Older matches safely default missing advanced metrics to 0.
- Navigation, select, account, player-search and Match Room menus now use translucent glass backgrounds. Browser visual QA and automated quality-gate result remain pending; no parser, backend schema, Supabase migration, deployment or `main` changes were made.

- Expanded the zero-filled test contract across the full planned stat families: Impact Rating, K/R, ADR, HS kills/%, KAST, accuracy, shots/hits, damage, MVP, rounds, survival, entry/opening kills and deaths, trade kills/traded deaths, flash assists, utility damage/enemies, total and 1v1–1v5 clutches, duels won/lost/win%, 2K–5K, CT/T kills and deaths. Rate-like values are averaged across maps; count metrics are summed. All fields are present for every player-map row in the latest match, with zero placeholders until demo-derived values exist.
