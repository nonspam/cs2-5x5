## 2026-11-17 — Normalize Profile and Home dashboard geometry (SOURCE + TESTS PASS; DEV DEPLOYMENT BLOCKED)
- Owner approved fixing both Profile and Home and deploying only to DEV.
- Replaced the conflicting tail-end layout overrides in style_v57.css with one consolidated responsive geometry block. Desktop app shell reserves the right utility rail once; route rail/content widths are explicit; Home uses stable readable side columns with the center absorbing remaining width; Profile uses a fixed 252px identity column, an 18px gutter, and a minmax(0,1fr) content column. Profile inner widgets and match history are constrained to their own column; tablet/mobile collapse to a single content column.
- Updated stylesheet cache key in index.html to profile-home-layout-normalized-20261117-v36. Added regression coverage in tests/faceit-v2-shell.test.cjs.
- Commits: CSS c7daf9f44af6d86dd66d029ad83ef492d61fb71f; cache 7348bf84c4af5687f8d79553a22f20cf2006201a; tests c370d7b0a3d49ffb282c9407d273edcd70b7b814.
- Quality Gate [44125152842](https://github.com/nonspam/cs2-5x5/actions/runs/44125152842): **328 passed / 0 failed / 0 skipped**, confirmed from validate job log.
- Deployment is NOT performed: faceit-dev currently contains only quality-gate.yml and project-memory.yml; there is no deployment workflow or connected Cloudflare deploy action available in this session. Browser visual QA could not be started because the browser automation service has insufficient wallet balance. Do not claim DEV is updated.
- Next: deploy only this faceit-dev HEAD to the DEV Cloudflare Worker through the project's authorized Cloudflare deployment path, then visually verify Home and Profile at the owner's desktop viewport. Never deploy to production.

## 2026-11-17 — Profile statistics column bleed fix (SOURCE + TESTS PASS; VISUAL QA PENDING)
- Owner screenshot showed the Profile statistics/content area visually touching and bleeding into the left identity/ELO column.
- Root cause in the active stylesheet: the modal's two-column grid had no gutter; child cards retained legacy sizing behavior and the profile content allowed horizontal overflow. The left identity card and statistics canvas were not isolated as independent boxes.
- Added a 16px desktop grid gutter, border-box sizing and width constraints to the identity card/badges, horizontal clipping on both columns, and bounded the season/statistics widget grid to the available content width. No profile data, calculations, navigation or upload behavior changed.
- Files: style_v57.css, index.html (CSS cache key profile-stats-column-guard-20261117-v35), tests/faceit-v2-shell.test.cjs, SESSION_CHECKPOINT.md, CURRENT_STATE.md, DEVELOPMENT_LOG.md.
- Status: source change committed to faceit-dev; Quality Gate [44123578615](https://github.com/nonspam/cs2-5x5/actions/runs/44123578615): **327 passed / 0 failed / 0 skipped**, confirmed from the validate job log. Browser visual QA, DEV deployment and owner visual acceptance remain pending. Do not claim the live site is fixed until deployment and screenshot QA are verified.
- Next: after owner authorizes DEV deployment, verify the deployed SHA and inspect the Profile at the same desktop viewport; confirm the stats column remains fully right of the identity rail without clipping its own content.

## 2026-11-17 — Narrow and center Profile / Match Room canvas (SOURCE UPDATED; QA PENDING)
- Owner reported that the previous 1200px profile width change produced no visible improvement. Review of the live CSS cascade found the profile modal uses a two-column grid (identity + content); the prior width cap was not paired with an explicit centered grid-item alignment and did not sufficiently constrain the visible content.
- Added a final, high-specificity desktop rule: profile content is centered within its own grid column and capped at 1120px; Match Room content is centered and capped at 1240px. Identity/avatar column, global left rail, right utility rail, profile entry, and VS utility are not changed.
- Updated stylesheet cache key to profile-match-centered-canvas-20261117-v34.
- Files: style_v57.css, index.html, tests/faceit-v2-shell.test.cjs.
- Commits: CSS 2885af7c0535072e779c27cfe2b50d6c78c375d6; cache 07818b4a0d0d0eac1f8e901c48e9dc509463de64; regression contract bdcd4994d579120d03eb7605c70e7b24459e627c.
- Status: source changes pushed to faceit-dev; automated tests, Cloudflare deployment, live browser rendering and owner visual acceptance are NOT yet verified. Do not claim the DEV site has changed until deployment is confirmed.
- Next: verify the deployment SHA / workflow, then inspect the profile and Match Room at the same desktop viewport. If deployment is not automatic, deploy only the faceit-dev DEV worker after owner authorization; never touch production.

## 2026-11-17 — Corrective rail width, visible home search and added FACEIT spacing (SOURCE + TESTS PASS)
- User reported the previous desktop navigation rail still looked too narrow and the player search was not obvious/visible. Root cause of discoverability: search was overlaid inside the home hero artwork. Moved it into a dedicated, clearly labeled row immediately above the hero on the home page, with a visible input and dropdown. Existing live activePlayers() lookup, click-to-profile and Enter behavior retained; no hard-coded names.
- Corrected desktop rail sizing using the actual top-level #view > .faceit-route-shell.faceit-app-shell grid and direct child rail selectors, rather than only styling the generic route wrapper. Desktop grid/rail now 210px, with an explicit breakpoint for narrow screens.
- Added more vertical breathing room after the map hero, around Results/Duels/Equipment tabs, between MVP/highlights and before team tables. Existing match content, data and tab behavior unchanged.
- Files: app_v57.js, style_v57.css, index.html (app cache v17, CSS cache v21), tests/match-room-statistics-layout.test.cjs.
- Validate workflow [44092488128](https://github.com/nonspam/cs2-5x5/actions/runs/44092488128): **320 passed / 0 failed / 0 skipped**, confirmed from validate job log.
- Source commit: cd88613660006232f5120757b03e2e4fe091390a. Latest HEAD at this checkpoint: fce5491b8ec95e4d1952ce35d0aadc22e420d3dc.
- Browser screenshot / live DEV deployment / visual acceptance still not verified from an interactive browser. Do not claim the screenshot result is fixed until owner refreshes and confirms.
- Next: refresh DEV with hard reload, visit Главная to see the clearly labeled search row, test a real player name and Enter/click, then compare desktop left rail and Match Room spacing.

## 2026-11-17 — Compact Match Room polish and home player search (SOURCE + TESTS PASS)
- Owner screenshot comparison requested slightly narrower/denser Match Room, reduced map/statistics width, compacted MVP/highlight cards and more breathing room between map hero, sub-tabs, awards and team table controls. Match Room content max width is now 1500px with 80px side allowance (was 1600px/56px); MVP/leader block height is 250px; sub-tabs, awards and toolbar have additional deliberate spacing. Existing stats/data behavior unchanged.
- Desktop left navigation rail widened from 170px to 185px.
- Added player search to the home hero. It searches the live activePlayers() data by display name or player ID, prioritizes exact/prefix/word-prefix matches, shows up to 8 suggestions, opens the selected public profile on click or Enter, and closes suggestions on Escape. No hard-coded player names.
- Files: app_v57.js, style_v57.css, index.html (app cache v16, CSS cache v20), tests/match-room-statistics-layout.test.cjs.
- Validate workflow [43978940515](https://github.com/nonspam/cs2-5x5/actions/runs/43978940515): **318 passed / 0 failed / 0 skipped**, confirmed from validate job log.
- Source commit: 06e018a630223efb0e04f11a67332ea892b84249. Latest HEAD at checkpoint update: afac9923732c820ae10c56bbc613fecff21af786.
- Not verified: browser rendering, DEV deployment, screenshot comparison, owner visual acceptance. No database, SQL, migration, production or main changes.
- Next: owner refreshes DEV; verify narrower Match Room, spacing, wider desktop rail, search suggestions and profile opening with Enter/click.

## 2026-11-17 — Compact Match Room polish and home player search (SOURCE + TESTS PENDING)
- Owner requested a slightly narrower/denser Match Room matching FACEIT, with softer vertical spacing between the map hero, Results/Duels/Equipment tabs, MVP/leader cards and team tables. Reduced Match Room content max width from 1600px to 1500px with 80px side allowance; compacted MVP/leader card height to 250px; added deliberate gaps around sub-tabs, awards and table toolbar. Existing data and tab behavior unchanged.
- Widened desktop global navigation rail from 170px to 185px.
- Added a player search field to the home hero. Suggestions are sourced from activePlayers() in the live project data, sorted exact/prefix/word-prefix first; clicking a result or pressing Enter opens the real player's public profile. Escape closes suggestions. No hard-coded player list.
- Files: app_v57.js, style_v57.css, index.html (app cache v16, CSS cache v20), tests/match-room-statistics-layout.test.cjs.
- Browser rendering / DEV deployment / visual acceptance not yet verified.

## 2026-11-17 — Remove unwanted player-name strip under Match Room hero (SOURCE + TESTS PASS)
- Owner corrected the prior implementation: the ten-player roster strip beneath the map hero was explicitly unwanted. Removed the generated roster markup from app_v57.js and the associated layout styling from style_v57.css. The room now flows from top-level Overview / Statistics / Top tabs directly to the map hero, then the existing Statistics sub-tabs (Results / Duels / Equipment) and statistics content. No standalone list of player names or avatars is rendered under the map.
- Kept existing match hero, player data, MVP/leader cards, stats values and tab behavior unchanged. No like/dislike controls were added.
- Updated tests to assert absence of the roster markup and preserve the requested hierarchy. Updated asset cache keys in index.html: app v15, CSS v19.
- Validate workflow [43978200095](https://github.com/nonspam/cs2-5x5/actions/runs/43978200095): **316 passed / 0 failed / 0 skipped**, confirmed from validate job log.
- Final source commit before this checkpoint update: c06a167675411a7ef6a8ecb88f0de61e3f6adbb4.
- Not verified: browser rendering, DEV deployment, owner visual acceptance. No database, SQL, migration, production or main changes.
- Next: owner refreshes DEV and confirms the player strip is gone and spacing between map and statistics tabs is clean.

## 2026-11-17 — FACEIT Match Room hierarchy and clean player strip (SOURCE + TESTS PASS)
- Owner compared FACEIT and current Match Room screenshots. Requested top-level tabs (Overview / Statistics / Top) above the map hero; clear spacing between top navigation, map, roster, and Results / Duels / Equipment sub-tabs; explicitly does not want player likes/thumbs or like/dislike ranking controls.
- Moved the existing top-level navigation before the map hero. Kept the existing Results / Duels / Equipment tabs inside the Statistics view, below the hero.
- Added a compact horizontal roster strip below the map, with avatars and player names for both teams. No likes, thumbs, or player-ranking controls. Responsive layout: 10 columns desktop, 5 columns medium, 2 columns mobile.
- Added restrained spacing between navigation, hero, roster strip, and statistics sub-navigation. Existing tab actions and statistics data are unchanged.
- Files: app_v57.js, style_v57.css, tests/match-room-statistics-layout.test.cjs, index.html (app cache v14, CSS cache v18).
- Validate workflow [43977318494](https://github.com/nonspam/cs2-5x5/actions/runs/43977318494): **316 passed / 0 failed / 0 skipped**, confirmed from validate job log.
- Not verified: browser rendering, screenshot comparison, DEV deployment, owner visual acceptance. No database, SQL, migration, production or main changes.
- Next: owner refreshes DEV and checks that tabs sit above the map, roster strip contains names/avatars only, and Results / Duels / Equipment sit below the map/roster with visible spacing.

## 2026-11-17 — Statistics width aligned to Match Room hero (IN PROGRESS)
- Owner compared current Statistics screenshot with FACEIT and requested the full Statistics content to stretch horizontally to the same left/right boundaries as the Match Room map hero, without values or columns overflowing.
- Expanded the awards/MVP + leader cards, category toolbar, category table panels, team tables and their wrappers to 100% of the Match Room content width; removed legacy 1080/1360/1480px child caps and centered margins where they constrained these sections. Kept table layout and metric data semantics unchanged.
- Files: style_v57.css, tests/match-room-statistics-layout.test.cjs, index.html (stylesheet cache marker style_v57.css v17 (cache-key commit 89de41137b3e9ad3d2eca71025d38e296cd3651a; application JavaScript unchanged)).
- Source commit: 9e678403dfad772879ad7c38ea5406bcddcabbc6; regression assertion correction: 06381d5cda074131c1f2a2e1fd94e59a33c9ace0.
- Quality Gate [43976277524](https://github.com/nonspam/cs2-5x5/actions/runs/43976277524): **314 passed / 0 failed / 0 skipped**, confirmed from validate job log.
- Not verified: browser rendering, screenshot comparison, DEV deployment, owner visual acceptance. No DB, SQL, migration, production or main changes.
- Next: owner refreshes DEV and checks that MVP/leader cards, controls and both team tables align with hero left/right edges and no table content clips. If visual review identifies issues, make a narrowly scoped follow-up.


## 2026-11-16 — Statistics leader name and scoreboard header follow-up
- Owner screenshot showed the first highlight player's name clipped to "Рен..." and the actual player/rank/K/D/A scoreboard header remained opaque gray.
- Root causes: the highlight player-name cell was constrained by a narrow grid track and text-overflow:ellipsis; the prior translucent rule targeted .match-mode-table, while the visible team scoreboard is .match-stat-teams .match-scoreboard and has a more specific opaque base rule.
- CSS now reserves a usable name column and disables ellipsis for the short leader name; the exact team scoreboard header receives a higher-specificity translucent blurred background override.
- Files: style_v57.css, tests/faceit-v2-shell.test.cjs, index.html.
- Cache marker: matchroom-statistics-layout-20261116-v6.
- Status: SOURCE + TESTS PASS; browser/DEV visual verification pending. MVP layout, values, and match calculations unchanged.
- Quality Gate [43948380693](https://github.com/nonspam/cs2-5x5/actions/runs/43948380693) on commit `2af3b8ec3484d30ba37a270582a1a7d14f744a70`: **305 passed / 0 failed / 0 skipped**, confirmed from the validate job log. Browser visual QA and DEV deployment are still not verified.



## 2026-11-16 — Statistics awards alignment and translucent table header
- Owner screenshot correction: keep the approved MVP card unchanged; stretch the four right-side highlight cards to the same desktop height as MVP, align highlight values/labels to the far right, and remove the solid gray fill from the statistics table header.
- Source change: appended scoped CSS overrides in `style_v57.css`; desktop right stack now fills the MVP height with four equal rows, compact responsive behavior is retained below 1050px, highlight values/labels align right, and table header uses a translucent blurred surface.
- Regression coverage added in `tests/faceit-v2-shell.test.cjs`.
- Asset cache marker in `index.html`: `matchroom-statistics-layout-20261116-v5`.
- Status: SOURCE + TESTS PASS; browser visual QA and DEV deployment verification pending.
- Quality Gate [43947209379](https://github.com/nonspam/cs2-5x5/actions/runs/43947209379): **303 passed / 0 failed / 0 skipped**, confirmed from the actual `validate` job log. This validates syntax and Node regression contracts, not browser rendering or deployment.
- No application data, calculations, database, production, or `main` changes.
# SESSION CHECKPOINT — read this first

## 2026-11-16 — Statistics data mapping, unavailable values, MVP/top-four layout
- Owner feedback from DEV screenshot: General stats were incorrectly showing zero because table columns requested `kills/deaths/assists` while roster rows expose those values as `k/d/a`. Fixed the mapping so K/D/A columns display actual source values.
- Missing advanced fields no longer default visually to zero. Fields with no non-zero evidence in the match source render as `—`; fields with real values preserve actual per-player zeroes. ADR leader is omitted as unavailable when ADR is not present in source data.
- T/CT filters now read actual split fields where supplied and calculate side K/D from side kills/deaths; unsupported split metrics render `—`. Missing values sort below actual numeric values.
- MVP card is now left; four leader cards are arranged to its right in a 2×2 grid. Category, team/player sorting and T/CT controls have smaller typography, tighter gaps and shorter height. Plain-text/no-pill styling retained.
- Files changed: `app_v57.js`, `style_v57.css`, `index.html`, `tests/faceit-v2-shell.test.cjs`.
- Key commits: app mapping `e0bff15cf584578198d15d979d981ef99b828016`; layout `bb480d5fe1926abdff0406649b466532458a5fe6`; split/sort handling `5208b8cff383e2be8dfcd2b7c39e1d4ff6130e07` and `4a9d8f1dfdecf4cb8a848e880391aa54405aed6a`; asset cache `989b210029ea7de4a5a3e74a7fcf59d1a2a550c1`; regression tests `8dae52bfea8f6a8a52b8cacb665b8e72f03a7e8e`.
- Quality Gate run [43892597145](https://github.com/nonspam/cs2-5x5/actions/runs/43892597145): **295 passed / 0 failed / 0 skipped**.
- Browser screenshot QA and DEV deployment were not performed/verified. Await owner refresh and visual review. No production/main/DB/SQL/migration/RLS/storage-policy changes.
- Status: SOURCE + TESTS PASS; visual acceptance pending.


## Latest owner task — Match Room Statistics correction (2026-11-16)
- Status: SOURCE + TESTS PASS; owner browser verification pending.
- Restored MVP player card and four leader highlights above the Statistics category controls: most kills, best K/D, most assists and best ADR.
- Category labels and team/player plus T/CT controls are plain text with orange underline active state; no pills, outlines or oval backgrounds.
- Category selection, table mode switching, side filters and sortable columns remain implemented.
- Quality Gate run 43890650551: 292 passed / 0 failed / 0 skipped.
- App: 34d3cfa12e400ef3b7f6cef9cad990856135d5fe; CSS: d2e486c29da82782a57716038aef96ebe39c32d8 and a9b03f12649e9081b7b5793d2eb92f12002304b3; cache: 4a31e8b2232124095afda72943bc22ce60176976; tests: d4defd01113461b689d33a5101cec098a9ca3029.
- Next: owner hard-refreshes DEV and verifies Statistics layout and interactions. Do not claim deployed or visually accepted. No deployment/browser QA/DB/production changes.


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


## 2026-11-16 — Match Room statistics layout correction
- Replaced the always-on 10-player mega-table with FACEIT-style statistic categories: Общee, Расширенное, Энтри, Размены, Клатчи.
- Default view is two separate team tables (five players per team); the optional «Сортировать по игрокам» mode combines both rosters into one ten-player table.
- Added Все / T / CT side controls. T and CT values use the source's t_kills/t_deaths and ct_kills/ct_deaths fields; side-specific fields not supplied by the source remain 0 rather than being fabricated.
- Sorting applies to the visible category and current display mode. Removed the old comparison mega-table and its 40+ simultaneously visible columns.
- Team header shows average ELO. First/second-half score is displayed as unavailable (—) because the current map data schema does not provide half scores.
- Visual styles are compact and transparent, with no decorative oval header frames.
- Validation: JavaScript syntax checks passed for app_v57.js and tests/faceit-v2-shell.test.cjs. Full automated test suite and browser visual QA have not yet been run.


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


## 2026-11-16 — Match Room Statistics layout follow-up
- `app_v57.js`: removed Rating and Swing from the Match Room stat table; widened the player column; attached team identity to each row for persistent team colors in both sort modes.
- `style_v57.css`: larger MVP card, four vertically stacked leader cards on the right, plain text sort headings, wider table and bounded shared content container.
- Added regression tests for these layout contracts and updated the previous test that still expected Swing.
- Updated asset cache marker in `index.html` to `matchroom-statistics-layout-20261116-v1`.
- Quality Gate [43937919845](https://github.com/nonspam/cs2-5x5/actions/runs/43937919845): **298 passed / 0 failed / 0 skipped**.
- Browser visual QA/deployed rendering remains unverified; do not treat test success as screenshot acceptance.

- Avatar sizing selectors were aligned with the real `profileAvatarMarkup` output (`.player-avatar.lg/md/xs`); final `index.html` cache marker is `matchroom-statistics-layout-20261116-v2`.
- Latest Quality Gate [43938228641](https://github.com/nonspam/cs2-5x5/actions/runs/43938228641): **298 passed / 0 failed / 0 skipped**. Browser visual QA is still pending.


## 2026-11-16 — Match Room MVP and leader cards refinement
- `app_v57.js`: removed FACEIT Rating/ELO and result impact from MVP; MVP label moved to upper-right; MVP panel displays U/S/A and K/D. Right column now has compact text-only rows for kills, best K/D, ADR 0, and headshot kills 0%.
- `style_v57.css`: increased MVP panel size and avatar; shortened right-side cards and reduced gaps; team colors remain on player and rank cells; table row padding tightened.
- Team names in statistics headings now use the `Тим <name>` prefix unless already present.
- Cache marker: `matchroom-statistics-layout-20261116-v3`. Regression tests updated.
- Quality Gate [43942434063](https://github.com/nonspam/cs2-5x5/actions/runs/43942434063): **300 passed / 0 failed / 0 skipped**. Browser visual QA is not yet confirmed.


## 2026-11-16 — MVP focus and FACEIT-style Top 4 compacting
- `app_v57.js`: the MVP panel now places U/S/A and ADR on the first row, K/D and headshot percentage beneath; ADR and headshot placeholders are the requested 0 and 0%. The MVP badge is a sibling at card level for true top-right placement. Right-side highlights now match FACEIT categories: kills, damage, KAST, and entry kills, with player avatar/name and right-aligned value.
- `style_v57.css`: MVP area widened to 1.55fr against a .78fr Top 4 column; MVP card fixed at 258px high; Top 4 rows compressed to 44px, with a smaller gap and a compact avatar/name/value grid.
- `index.html` cache marker is `matchroom-statistics-layout-20261116-v4`.
- Quality Gate [43944687653](https://github.com/nonspam/cs2-5x5/actions/runs/43944687653): **301 passed / 0 failed / 0 skipped**. Browser rendering remains unverified.


## 2026-11-17 — Fix Profile mount collapsing its own content grid (SOURCE UPDATED; TEST/DEV QA PENDING)
- Owner screenshot showed the identity card compressed to roughly 185px and the statistics/content column missing from view, while Home appeared restored.
- Root cause confirmed in the latest CSS: the desktop grid rule incorrectly included both #playerProfileMount and its only child .faceit-exact-shell. Since the mount contains one shell child, making the mount itself a two-column grid constrained that entire shell to the first 252px track. The inner identity/content columns were therefore squeezed into that narrow track.
- Corrected the cascade: #playerProfileMount is now a full-width block; only its direct .faceit-exact-shell child owns the 252px + flexible content grid with an 18px gutter. Added a regression assertion and bumped the stylesheet cache key to profile-mount-grid-fix-20261117-v37.
- Source commits: CSS 9332805e5686fa0f099bc8ce53a03c64ad45d460; HTML ef01cb34a64f05d8a906b6b253c4abccbf25b2d7; tests ba906f58ca024ef703121ff01db3a49cd155b774.
- Not yet verified: latest Quality Gate, DEV deployment, or browser screenshot. Do not claim the live DEV page is fixed until the corrected stylesheet is deployed and the profile is visually checked. Home layout rules were left unchanged.


## 2026-11-17 — Profile identity/content separation (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- Owner screenshot showed the profile analytics column pressed directly against the identity card; the previous 252px identity track left the profile visually cramped.
- Desktop Profile window now uses a 300px identity column and a 32px column gap. Player card/avatar expand within that column; analytics content is shifted right. Mobile/tablet single-column rules are unchanged. Home CSS is untouched.
- Stylesheet cache key: `profile-identity-content-spacing-20261117-v38`.
- Commits: CSS `f9857ef255fe30d3b818bc8860b3ef0f1bc0fc85`; HTML `e39292551badc226849dbf25c6dd92718c06b45d`; tests `1e9e7e85d3dfc6662e55f8cc2811f54cc913f3d3`.
- Quality Gate run [44127100544](https://github.com/nonspam/cs2-5x5/actions/runs/44127100544): **329/329 passed**.
- Browser visual acceptance is not yet confirmed. User should refresh the DEV profile and compare the identity/statistics separation. No production, DB, or Home layout changes.


## 2026-11-17 — Match Room overview/statistics width adjustment (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- User screenshot showed Match Room overview and statistics content visually too narrow/small within the desktop viewport. This is horizontal canvas width, not a request to scale fonts or zoom UI.
- Desktop Match Room content canvas widened from 1240px to 1360px; statistics awards block widened from 1080px to 1240px. Overview and Statistics views explicitly occupy the available content width. No transform/zoom/font scaling added; mobile/tablet breakpoints unchanged.
- Stylesheet cache key: `matchroom-overview-statistics-width-20261117-v39`.
- Commits: CSS `e122621019fa1e6cb9d495ce303251a5a8588377`; HTML `3c588003c809cba54109392404d221080c796d0c`; tests `c7383631ce8a7532079a618ca4da1092b668660c`.
- Quality Gate run [44128113046](https://github.com/nonspam/cs2-5x5/actions/runs/44128113046): **330/330 passed**.
- Browser visual acceptance pending. User should refresh Match Room and verify Overview + Statistics. Profile spacing and Home layout intentionally untouched.


## 2026-11-17 — TOP tab sizing and readability pass (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- User screenshot showed TOP ranking rows too short/small, with K/D/A and K/D figures visually weaker than player names.
- Desktop TOP list now fills the available Match Room canvas (max-width 1320px), rows have 64px minimum height with increased vertical padding, avatars are 42px, player names 16px, K/D/A figures 15px bold, and K/D values 21px bold. Intermediate desktop widths use a slightly tighter version; mobile rules remain untouched.
- Stylesheet cache key: `match-top-list-readable-sizing-20261117-v40`.
- Commits: CSS `b1e4b5329e5b2e2e926e7d908a2479c666ab26d6`; HTML `a47020242b3b2071f80d6f9aba156a555fddd2dd`; test/cache assertion `db5101a454655ac3304e58fa6aa1659a236e636b`.
- Quality Gate run [44129352635](https://github.com/nonspam/cs2-5x5/actions/runs/44129352635): **331/331 passed**.
- Browser visual acceptance pending. Home, Profile, Overview and Statistics layout are not modified by this TOP-only change.


## 2026-11-17 — Restore compact TOP; expand Overview and Statistics (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- User clarified that the TOP list had been over-expanded while Overview and Statistics still felt undersized. Restored TOP rows to compact proportions (52px row, 36px avatar, 13px centered player name, 11px K/D/A, 16px K/D) and max-width 1080px. Column order remains rank, avatar, centered name, K/D/A, final K/D.
- Expanded Overview three-column canvas to use full match content width; team/map panels can grow without scaling text. Statistics awards and team tables now have up to 1400px width, with modestly taller cards/rows and increased internal spacing.
- Stylesheet cache key: `matchroom-overview-stats-expanded-top-restored-20261117-v41`.
- Commits: CSS `502b50278a72cb7d32a7dcc4669ed0919ee68689`; HTML `e2226f114bb7a96151ff394d013f30329933eaf9`; tests `7e794ce025ce7f276b239f2504dfdfe7ce29aa22`.
- Quality Gate run [44131472011](https://github.com/nonspam/cs2-5x5/actions/runs/44131472011): **332/332 passed**.
- Browser visual review pending. TOP is intentionally back to compact; Overview/Statistics are the only areas expanded. Existing Profile and Home layout left untouched.


## 2026-11-17 — Match Room Overview column alignment (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- User screenshots showed the center map/veto column starting above the two player rosters and ending much earlier, with the match-map cards visually narrower than desired.
- Desktop (>1100px) Overview now aligns the center map column down by 32px so its heading lines up with the player roster headings; center grid track widened to 1.22fr (minimum 380px) while left/right roster tracks remain equal; map cards are 142px tall and veto panel minimum height 104px. Top Overview tabs are centered and span the content width. Tablet/mobile breakpoints are unchanged. Statistics and TOP styling are untouched.
- Stylesheet cache key: `matchroom-overview-columns-aligned-20261117-v43`.
- Commits: CSS `8eea43c9f5abb16399010168b8b5a8bb763bb4f3`; HTML `e8ba8c2cf1db50f6ef8e01e5f518aeed46d61602`; tests `e41d23ead44f3b977e11a57b4f953bb08e1454fc`.
- Quality Gate run [44134654649](https://github.com/nonspam/cs2-5x5/actions/runs/44134654649): **334/334 passed**.
- Browser visual review pending; no deployment workflow or browser confirmation performed. Home, Profile, Statistics, and TOP are intentionally untouched.


## 2026-11-17 — Match Room Overview map sizing + vertical balance (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- Follow-up screenshots showed the map covers still visually oversized and the central map/veto stack still shorter than the five-player roster columns.
- Desktop (>1100px): central overview column now stretches to the grid row height (matching the roster columns); it is a flex column. Map list fills available vertical space with two equal rows, each at least 112px, so map covers are slightly shorter than the previous fixed 142px. VETO remains at least 104px. Previous 32px top offset is retained to align the map heading with roster headings. Tablet/mobile behavior unchanged.
- Cache key: `matchroom-overview-map-balanced-20261117-v44`.
- Commits: CSS `c5573f1913feb3b4c3ccbdeb645d279461b0d602`; HTML `b7c26c35c7333d85456aa06ad806a69e4b0fa811`; tests `5dd8816a5c941ce3cc651d44cce06a8ec33255f6`.
- Quality Gate run [44135592411](https://github.com/nonspam/cs2-5x5/actions/runs/44135592411): **335/335 passed**.
- Browser visual review pending. No production changes.


## 2026-11-17 — Revert oversized Overview map cards (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- User feedback: last attempt made map artwork cards much too tall; the requested adjustment was to restore normal compact card dimensions, not stretch them vertically.
- Desktop map covers restored to fixed 112px height; map list uses normal fixed 112px rows with 12px gap. Removed flex growth and equal-height row stretching from the center map stack; center column returns to natural content height and start alignment. Preserved the central column width proportions and 32px heading offset from v43. VETO follows map cards normally.
- Cache key: `matchroom-overview-map-size-restored-20261117-v45`.
- Commits: CSS `a5dea8d3a40f06064421f1dd45c644048841ffcb`; HTML `ebe9a3f90b8dee826092c62829b00c02a557f101`; tests `33f879d106774c286e4103fb5d646167ebe6aaa4`.
- Quality Gate run [44136157648](https://github.com/nonspam/cs2-5x5/actions/runs/44136157648): **335/335 passed**.
- Browser visual review pending; no production changes.


## 2026-11-17 — Statistics MVP alignment and compact Entry leader row (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- User screenshot showed the Statistics MVP/leader block and category controls visually offset relative to the scoreboard, with the Entry Kills leader card taller than the other leader cards.
- Desktop (>1050px) now constrains the MVP/leader block and category toolbar to `calc(100% - 34px)`, centered to align with the inner scoreboard width. MVP/leader split is 2:1, preserving the intended wide MVP panel and narrower leader stack. MVP card fixed at 220px; four leader cards fixed at 49px with 6px gaps. Leader grid explicitly uses avatar/name/value columns and labels remain on one line, preventing Entry Kills wrapping/height expansion. Tablet/mobile breakpoints untouched.
- Cache key: `matchroom-stats-centered-compact-leaders-20261117-v46`.
- Commits: CSS `a78b2e8db0907afd7c77fae5ab2b0b2e82308b37`; HTML `89ba1d2c9dec0abf6c33bf3050c8dcf4f8ec7337`; tests `7e6483a4e8d63159ba7a7067ea5e6a9858c893e7`.
- Quality Gate run [44137742140](https://github.com/nonspam/cs2-5x5/actions/runs/44137742140): **336/336 passed**.
- Browser visual review pending; no production changes.


## 2026-11-17 — MVP and TOP-4 hard-locked to identical outer dimensions (SOURCE + TESTS PASS; VISUAL REVIEW PENDING)
- User's screenshot still showed MVP card bottom edge about 11px above the bottom edge of the full four-card TOP stack. Percentage height on grid children had not produced identical visible borders.
- Replaced percentage-based sizing with explicit direct-child geometry at desktop widths (>1050px): `.match-stat-awards` is explicitly a two-column grid with a 225px row; both direct children `.match-stat-mvp-card` and `.match-stat-highlight-grid` have fixed height/min-height/max-height 225px and margin 0. TOP-4 remains four equal rows with 6px gaps; each child fills its row. This removes dependence on percentage-height resolution and stray margins.
- Cache key: `matchroom-stats-mvp-top4-fixed-225px-20261117-v49`.
- Commits: CSS `7e4c50112eae1dca122f53a93abea9cdbc00cee4`; HTML `623333a862a34bbb239f5440b4c7b6b5b495d5f3`; tests `b48ceb6a1a94ef4419f95e691ad2795a2af9f644`.
- Quality Gate run [44141411421](https://github.com/nonspam/cs2-5x5/actions/runs/44141411421): **339/339 passed**.
- Browser visual review pending; do not claim visual success until user screenshot confirms.


## 2026-11-17 — Duels and Equipment zero-state tables (SOURCE + TESTS PASS)
- User requested the Duels and Equipment subtabs to be opened up visually and populated with explicit zeros so the sections are not empty, while avoiding surprises later.
- Duels now renders every player row with columns: won, lost, total duels, win percentage; all cells are zero/0%. Equipment now renders every player row with columns: primary weapon, pistol, sniper rifle, grenades, grenade damage; all cells are zero. A visible note explicitly says these are zero placeholders and not factual match statistics.
- No real duel or equipment stats are inferred or fabricated; future source integration can replace these placeholders when data is available.
- Cache key: `matchroom-duels-equipment-zero-tables-20261117-v50`.
- Commits: app `0105db77997a26c83c9432c04cbecc5e12dc029d`; CSS `8b170194e4fda6f78af29b07b6f52dc3a1edb633`; HTML `7ca2fa2483eec92d1cc4e6ae7d1cb2896895a6c3`; tests `2064a5f9f16674c5605b686eab8d771377ec0b7b` and `8bfeff76b6afad1b6fff0b30041a4de5c1d89ead`.
- Quality Gate run [44142338085](https://github.com/nonspam/cs2-5x5/actions/runs/44142338085): **340/340 passed**.
- Browser visual review pending; no production changes.
