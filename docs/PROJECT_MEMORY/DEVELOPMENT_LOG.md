## 2026-11-17 — Profile statistics column bleed fix (SOURCE UPDATED; QA PENDING)
- Owner screenshot showed the Profile statistics/content area visually touching and bleeding into the left identity/ELO column.
- Root cause in the active stylesheet: the modal's two-column grid had no gutter; child cards retained legacy sizing behavior and the profile content allowed horizontal overflow. The left identity card and statistics canvas were not isolated as independent boxes.
- Added a 16px desktop grid gutter, border-box sizing and width constraints to the identity card/badges, horizontal clipping on both columns, and bounded the season/statistics widget grid to the available content width. No profile data, calculations, navigation or upload behavior changed.
- Files: style_v57.css, index.html (CSS cache key profile-stats-column-guard-20261117-v35), tests/faceit-v2-shell.test.cjs, SESSION_CHECKPOINT.md, CURRENT_STATE.md, DEVELOPMENT_LOG.md.
- Status: source change committed to faceit-dev; CI, DEV deployment, live browser rendering and owner visual acceptance pending. Do not claim the live site is fixed until deployment and screenshot QA are verified.
- Next: inspect the quality-gate result, then verify the Profile at the same desktop viewport and confirm the stats column remains fully right of the identity rail without clipping its own content.

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


## 2026-11-16 — Match Room rendering runtime error fix
- Follow-up user report: clicking a match switched the app to the Matches route but did not display the selected match room.
- Root cause confirmed in `openMatchDetail`: `statCategories` was read in the `statDataAvailable` and `statSideAvailable` loops before its `const` declaration later in the same function. This hit the JavaScript temporal dead zone and aborted Match Room construction after the route switch.
- Moved the complete `statCategories` declaration above its first use, before `statPlayers` and the availability loops. The Match Room can now finish rendering after route normalization.
- Added a regression assertion that the declaration precedes the first read. Updated the `index.html` asset cache marker to `matchroom-navigation-runtime-fix-20261116-v3`.
- Files changed: `app_v57.js`, `tests/faceit-v2-shell.test.cjs`, `index.html`.
- Quality Gate run [43895298970](https://github.com/nonspam/cs2-5x5/actions/runs/43895298970): **296 passed / 0 failed / 0 skipped**.
- Browser click-through / DEV deployment still not directly verified from this session; user refresh and visual confirmation pending.
- Status: SOURCE + TESTS PASS; visual/browser acceptance pending.


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


## 2026-11-16 — Owner correction: Match Room Statistics MVP/TOP and text-only categories
- Owner screenshot showed the Statistics layout had lost the MVP player card and four top-player highlights, and category labels were incorrectly presented as outlined/pill controls.
- Source root cause: `statMvpCard` and `statLeaderCard` were still generated but were not inserted into the new `statsView` markup. Restored the MVP card plus four leader cards (most kills, best K/D, most assists, best ADR) above the category/table controls.
- Category, team/player mode and T/CT controls are now plain text; active state is indicated by an orange underline only. No oval/outlined button treatment.
- Existing category switching, team/player mode, T/CT filters and sortable table handlers remain in place.
- Files: `app_v57.js`, `style_v57.css`, `index.html`, `tests/faceit-v2-shell.test.cjs`.
- App correction commit: `34d3cfa12e400ef3b7f6cef9cad990856135d5fe`; CSS commits: `d2e486c29da82782a57716038aef96ebe39c32d8`, `a9b03f12649e9081b7b5793d2eb92f12002304b3`; asset cache commit: `4a31e8b2232124095afda72943bc22ce60176976`; test correction commit: `d4defd01113461b689d33a5101cec098a9ca3029`.
- Quality Gate run [43890650551](https://github.com/nonspam/cs2-5x5/actions/runs/43890650551): **292 passed / 0 failed / 0 skipped**, verified from validate job log.
- Not performed: browser screenshot QA, DEV deployment or visual acceptance. The screenshot's DEV URL has not been changed by this work. No production, main, DB, SQL, migration, RLS or storage-policy changes.
- Status: SOURCE + TESTS PASS; pending owner visual verification in DEV.
## 2026-11-14 — Profile and Match Room contained-window prototype

**Owner direction:** Try player profiles as a separate window with compact vertical navigation, and keep the Match Room in a separate window while leaving the main site navigation available.

**Implemented:**
- Player links now open the existing profile renderer inside `#playerProfileWindow`; the underlying application route is not replaced.
- Added a compact vertical profile menu: Overview, Match History, Track, and Close Profile.
- Profile Overview/History controls rerender the profile mount itself, rather than rerendering the underlying route.
- Profile window supports close button, backdrop click, and Escape.
- Match Room desktop layout is now a contained overlay over the workspace; the global left rail remains visible. Existing Overview / Statistics / TOP tabs and match data renderers are retained.
- On narrow screens both windows use full-screen layout.
- No match/player calculations, data contracts, DB schema, or DB contents were changed.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, plus decision/design/technical/project-memory documentation.

**Code commits:** `eebccfff8cb4405770d86ff0e04476c606928956` (initial window prototype), `68583e754eea50628635c0eb07f44352e285812f` (profile section navigation fix), `e609976d0f7f040631dab8b9088f70c87b1107a2` (test assertion correction), `71dca4dcee8b0dca0092b3565735c54cb0011634` (keep profile mount in sync for Overview/History/Track and profile-local rerenders).

**Verification:** Quality Gate run [43631637819](https://github.com/nonspam/cs2-5x5/actions/runs/43631637819), tested code commit `71dca4dcee8b0dca0092b3565735c54cb0011634`: **236 passed / 0 failed / 0 skipped**, verified from the actual job log. Earlier runs include one failed test-only assertion caused by an incorrectly escaped regex; corrected assertion and final run passed.

**Not performed:** browser QA, screenshot comparison, DEV deployment verification, production deployment, database/SQL writes, migrations, RLS/grants changes, or `main` changes.

# Semantic Development Log

This is the human/AI-readable history of completed project tasks. It complements, but does not duplicate, the automatic root [CHANGELOG.md](../../CHANGELOG.md).

Each entry records intent, actual behavior, source files, evidence and remaining work. Entries must be based on inspected diffs, source, tests or explicit owner decisions. Never infer details from a commit subject alone.

---

## 2026-11-14 — Match Room Statistics compact layout and FACEIT level badges

**Owner direction:** Keep the accepted compact TOP and Overview unchanged. Finish Statistics by removing the rank-row numbering, tightening and centering the table, tinting only the player identity cell, separating the rank column with vertical rules, and using FACEIT-style colored level rings.

**Implemented:**
- Statistics scoreboard now has six columns: player, rank, K, D, A, K/D. The leading row number and its blank gutter are removed.
- Statistics team tables are centered and constrained to a 1080px desktop width. Player and rank columns have explicit compact widths.
- Only the player identity cell is team-tinted: blue/purple for team A, green/teal for team B. Rank cells remain neutral and are separated from player and K/D/A metrics by vertical borders.
- Team B label and score use green rather than yellow.
- Numeric rank text/star is replaced with a circular FACEIT-style badge. Levels 1–10 use the supplied reference's color groups: level 1 white; 2–3 green; 4–7 yellow; 8–9 orange; 10 red. The arc grows with the level. Missing level remains a neutral placeholder; no level is inferred from rating.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Implementation commit:** `2577465ad1440e107e21cea0ef245cd687bc63dd`; follow-up syntax/test-contract corrections: `edc69431f6242903e8ad283c8e1ebdd5e47d99e9`, `08e30b6c2a0667c7a6bdb5ca5e497de7b9d84a74`, `83952fc1abd889420950c9fbae9efa3ca1ab6c1d`.

**Verification:** Final Quality Gate run [43623053804](https://github.com/nonspam/cs2-5x5/actions/runs/43623053804), tested commit `83952fc1abd889420950c9fbae9efa3ca1ab6c1d`: **229 passed / 0 failed / 0 skipped**, confirmed from the actual `validate` job log. Two earlier runs failed during this implementation: first on a JS quote-escaping syntax error, then on an overly broad legacy-markup assertion; both were corrected before the passing run.

**Not performed:** browser QA, live screenshot comparison, deployment, database/SQL changes, or changes to `main`. CI is not visual acceptance.


## 2026-11-14 — Match Room Statistics/TOP layout correction (second pass)

**Owner feedback:** The first refinement still left the three leader cards visually cramped, the TOP list left-aligned with excessive internal whitespace, player names wrapping, and team rows lacking individual identity boundaries.

**Implemented in `app_v57.js`:**
- MVP always renders the large player avatar component using the display name as its initials fallback when no profile ID/avatar exists.
- TOP removes the right-side sort hint.
- Each TOP player's name, K/D/A line and K/D value share one result class based on the actual K/D ratio: >1 green, =1 neutral white, <1 red.

**Implemented in `style_v57.css`:**
- Leader cards now have a clear left identity group and a right-aligned value/label group.
- Statistics team tables keep the outer team wrapper removed, but each player row now has its own separated dark row surface. The player + rank cells form a tinted team-color block with a visible right boundary: blue/purple for team A, teal/green for team B.
- TOP list is centered with a 980px desktop maximum width; rows use non-wrapping player names and a more compact content-driven grid.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Commit:** `88d0c7c27e0f9db5d9e5b506994c0d3eaf4f60b5`.

**Verification:** Quality Gate run [43622133983](https://github.com/nonspam/cs2-5x5/actions/runs/43622133983), actual `validate` job log: **228 passed / 0 failed / 0 skipped**.

**Not performed:** browser QA, live screenshot comparison, deployment, database/SQL changes, or changes to `main`. CI covers syntax and Node regression/static contracts only; visual acceptance remains pending.


## 2026-11-14 — Match Room Statistics and TOP visual refinement

**Goal:** Apply the owner's next visual corrections to the Match Room Statistics and TOP views without changing Overview behavior or match data.

**Implemented:**
- Match Room tabs are forced to plain text controls with no pill/oval background, border or shadow; the active tab keeps its orange underline.
- Player initials now use the supplied display name when no linked profile/avatar record exists. Statistics leaders and TOP rows therefore have a stable circular initial fallback instead of a dash/empty identity.
- MVP avatar presentation is enlarged; the Statistics award cards use a tighter identity/value grid to reduce unused space.
- Removed the enclosing card/background/border around each Statistics team table. Team headings distinguish the first roster in blue and the second in yellow; winning score remains green.
- TOP rows are narrower, names can wrap instead of being cut off, and both K/D/A score and K/D use the same result color: above 1.00 green, exactly 1.00 neutral white, below 1.00 red.
- Added focused regression assertions and refreshed app/CSS cache keys.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Commits:**
- UI and regression tests: `fc402e571e117eb4f74d462bddfb274b145f653d`.
- Cache-key refresh: `0a82131ad0788618cad16a9a15c96b13a93b1a4b`.

**Verification:** Quality Gate run [43621076848](https://github.com/nonspam/cs2-5x5/actions/runs/43621076848) on `fc402e571e117eb4f74d462bddfb274b145f653d`: **227 passed / 0 failed / 0 skipped** from the actual `validate` job log. Cache-key commit Quality Gate run [43621142715](https://github.com/nonspam/cs2-5x5/actions/runs/43621142715): **227 passed / 0 failed / 0 skipped** from its actual job log.

**Not performed:** browser QA, screenshot comparison in a live browser, deployment, database/SQL changes, or changes to `main`. CI confirms syntax and Node regression/static contracts only; visual acceptance remains pending.


## 2026-11-14 — Project Memory recovery hardening

**Goal:** Make the single-link handoff more reliable and prevent a new chat from guessing when repository access or required documents are unavailable.

**Changes:**
- README now explicitly treats the single Project Memory URL as the entry point and gives the new assistant a mandatory read order.
- Added a direct GitHub branch metadata endpoint to the recovery procedure so the assistant can resolve the live `faceit-dev` HEAD instead of trusting an old SHA in a snapshot.
- Added a strict failure path: if GitHub or a required file cannot be opened, the assistant must disclose the exact gap, ask for access/the missing file, and must not edit based on assumptions.
- NEW_CHAT now requires checking commits specifically on `faceit-dev`, inspecting diffs newer than the snapshot, and reading actual CI job logs before claiming test results.
- CURRENT_STATE refreshed with the branch HEAD checked during this update and the latest confirmed quality evidence.
- QUALITY_HISTORY records run `43615940711`, tested commit `1644527855ec257b10c7d2999531f6a974e80b66`, and the actual job-log result: **226 passed / 0 failed / 0 skipped**.

**Files changed:** `docs/PROJECT_MEMORY/README.md`, `docs/PROJECT_MEMORY/NEW_CHAT.md`, `docs/PROJECT_MEMORY/CURRENT_STATE.md`, `docs/PROJECT_MEMORY/QUALITY_HISTORY.md`, `docs/PROJECT_MEMORY/DEVELOPMENT_LOG.md`.

**Commits created in this sequence:**
- `a2c61f5aa86eaf8be591bbcae09e597ca07c43c4` — strengthen entry point.
- `0c285116b4fe40ab495412121d4ad9f374128962` — explicit new-chat recovery protocol.
- `d860a99a170b6e8dff7d58a362f325a5f364d8cc` — refresh current snapshot.
- `39168ee0b71adab3a913f326fe5f4a5ecbd728a8` — record prior verified quality evidence.
- `1644527855ec257b10c7d2999531f6a974e80b66` — semantic log and completed recovery-hardening package.

**Verification:** GitHub source files and live branch metadata were read successfully. Quality run `43615940711` completed successfully on the final package commit; its job log reports 226 passed / 0 failed / 0 skipped. No runtime code, database, deployment or browser QA was changed/performed.

**Remaining:** None for this documentation-hardening package. Future tasks must continue the same update/test/evidence cycle.

---

## 2026-11-14 — Match Room refinement sequence (baseline reconstructed from branch history)

**Scope:** Match Room / match detail page. This baseline consolidates the recent sequence; it is not a claim that every intermediate chat message has been recovered.

**Confirmed changes from recent commit subjects, inspected source diffs and TECHNICAL_STATE.md:**
- Match Room layout was refined toward a compact full-page composition.
- Player cards and level rings were reduced and adjusted; level badge progression/palette and ELO rating boundaries received regression coverage.
- Match score alignment and map artwork layering were corrected.
- Match statistics table was simplified to rank, K/D/A and K/D; team score presentation was adjusted.
- MVP and highlight layout was refined.
- A TOP tab was added, showing the top players by aggregate K/D for the match/series. Zero-death positive-kill rows may display infinity; missing source data is not fabricated.
- Match Room tab switching was corrected and tests were added for direct tab actions.
- Profile avatar rendering was reused for Match Room player avatars.

**Files confirmed in the inspected diffs:** `app_v57.js`, `style_v57.css`, Match Room regression tests under `tests/`, `TECHNICAL_STATE.md`, and automatic journal updates in `CHANGELOG.md`.

**Latest relevant code commit inspected:** `bb8c161d9d2d4e66c48a6bf06f1d938286941e62` — `feat: use linked profile avatars in Match Room`.

**Quality evidence:** GitHub Actions run [43614439431](https://github.com/nonspam/cs2-5x5/actions/runs/43614439431), 226 passed / 0 failed on the linked code commit.

**Not confirmed:** browser interaction/visual QA, pixel-perfect comparison, owner acceptance of every latest visual detail, and deployment of this code.

**Next:** continue only from fresh HEAD and latest owner feedback. Do not jump to Statistics as a separate product task or another section unless the owner directs it.

---

## 2026-11-14 — Project Memory system created

**Goal:** Establish one stable GitHub entry point so future chats can restore current project context without asking the owner to repeat the project history.

**System design:**
- Current state snapshot: CURRENT_STATE.md.
- Semantic task history: DEVELOPMENT_LOG.md.
- Test/QA/deployment evidence: QUALITY_HISTORY.md.
- New-chat protocol: NEW_CHAT.md.
- Memory index: README.md.

**Important limitation:** GitHub Actions automatically captures commit metadata and changed paths, but it cannot read private ChatGPT conversations or infer why a change was made. Semantic notes must be written by the assistant as part of task completion.

**Repository changes:** see the memory-system commit and its changed paths in the root CHANGELOG.md.

**Verification:** documentation-only change. No application runtime, database, deployment or browser QA was performed as part of creating these documents.


## 2026-11-14 — Statistics losing-team amber and FACEIT badge refinement

**Owner feedback:** The green tint on the lower/losing team made it look like the winner. Change that team's identity treatment to amber/yellow. The rank badge should look closer to the supplied FACEIT reference; the previous numeral was too large and the CSS crescent looked artificial.

**Implemented:**
- Team B (the lower/losing side in the supplied match) now uses amber/yellow for its team label, score, player-cell tint and left row accent. The previous green identity tint is removed. The badge/rank column remains neutral and independent from team colors.
- Replaced the CSS-conic rank badge with a compact inline SVG: dark circular center, neutral track, colored level arc, smaller centered numeral. Arc length scales with the actual FACEIT level; colors retain the supplied mapping (1 white, 2–3 green, 4–7 yellow, 8–9 orange, 10 red). Missing levels remain unknown, not inferred.
- Refreshed the app cache key and updated regression assertions.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Implementation commit:** `bba653f52a7fcc047d95b018309aef9732e18a74`; test contract correction: `5a68847bec8e083960baa53019a6b2eb0566daca`.

**Verification:** Quality Gate run [43623604285](https://github.com/nonspam/cs2-5x5/actions/runs/43623604285), tested commit `5a68847bec8e083960baa53019a6b2eb0566daca`: **229 passed / 0 failed / 0 skipped**, verified from the job log. An earlier run failed only because the static assertion still expected the old span-based badge markup; the assertion was updated for the SVG markup before the passing run.

**Not performed:** browser QA, screenshot comparison, deployment, database/SQL changes, or `main` changes. CI is not visual acceptance.


## 2026-11-14 — Neutral rank column and corrected FACEIT arc geometry

**Owner correction:** The rank column must remain a default neutral column; team tint belongs only to the player-name column. The previous level-4 arc was visibly malformed and the numeral did not resemble the reference.

**Implemented:**
- Explicitly neutralized both the rank header and every rank cell for both teams, with the existing vertical separators retained. Team-specific background and accent remain confined to the player-name column.
- Rebuilt the badge progress as an SVG 270-degree arc beginning at the lower-left and sweeping over the top toward the lower-right, with a neutral track, level-colored progress, and smaller centered numeral. This replaces the previous partial-circle dash geometry that produced the visibly misplaced arc.
- Updated the static regression contract and refreshed the app cache key.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Implementation commit:** `c86bac0a9e4260ad697d85e3e0f1ada62777f558`.

**Verification:** Quality Gate run [43624895321](https://github.com/nonspam/cs2-5x5/actions/runs/43624895321), tested commit `c86bac0a9e4260ad697d85e3e0f1ada62777f558`: **229 passed / 0 failed / 0 skipped**, confirmed from the actual job log.

**Not performed:** browser QA, visual screenshot comparison, deployment, database/SQL changes, or `main` changes. CI does not prove visual similarity to the FACEIT reference.


## 2026-11-14 — Amber rank divider and FACEIT numeral sizing

**Owner feedback:** The losing team's rank column still showed a teal divider; the level numeral was too small.

**Implemented:**
- Changed the lower/losing team's right divider on the rank column from teal to amber, matching its player-cell left accent. The rank cell background remains neutral; no team fill is applied to the rank column.
- Increased the FACEIT SVG badge to 28px and the centered level numeral to 12px for better legibility while retaining the corrected 270-degree progress arc.
- Updated regression assertions and refreshed the application cache key.

**Files changed:** `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Implementation commit:** `532b204d4ab8194922107960539579676cfef572`.

**Verification:** Quality Gate run [43625555498](https://github.com/nonspam/cs2-5x5/actions/runs/43625555498), tested commit `532b204d4ab8194922107960539579676cfef572`: **229 passed / 0 failed / 0 skipped**, confirmed from actual job log.

**Not performed:** browser QA, visual screenshot comparison, deployment, database/SQL changes, or `main` changes.


## 2026-11-14 — K/D-based full score coloring and FACEIT numeral alignment

**Owner clarification:** Color the complete player score (K, D, A and K/D) by the player's K/D ratio, not just the K/D cell. The FACEIT level numeral needed a very small upward adjustment.

**Implemented:**
- K, D, A and K/D cells now share one status based on the player's K/D: above 1.00 green, exactly 1.00 white, below 1.00 red. If K/D is unavailable, values retain the default neutral color; no ratio is inferred.
- Raised the numeral inside the FACEIT level SVG by 1.2px without changing the ring geometry or badge size.
- Added regression assertions and refreshed the app cache key.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Implementation commit:** `610600ebd533ec5476f30a2219498fbdf6b7d845`.

**Verification:** Quality Gate run [43625641567](https://github.com/nonspam/cs2-5x5/actions/runs/43625641567), tested commit `74e280a4ebba26c6f99a73841f187e35ea0b72cc`: **229 passed / 0 failed / 0 skipped**, confirmed from actual job log. The run includes the implementation commit plus subsequent automated documentation journal changes.

**Not performed:** browser QA, visual screenshot comparison, deployment, database/SQL changes, or `main` changes.


## 2026-11-14 — Neutral rank divider and site-wide helper tooltip cleanup

**Owner request:** Make the lower team's rank-column right divider the same neutral grey as the left divider; remove the explanatory Match Room statistics footnote and similar helper/native hover hints across the site.

**Implemented:**
- Changed the lower/losing team's right rank-column divider from amber to neutral grey `#424242`, matching the opposite divider. Rank cell backgrounds remain neutral.
- Removed the explanatory Match Room statistics subtitle and footnote shown in the supplied screenshot.
- Removed native browser `title` hover hints from generated app markup, account controls and static shell controls; removed dynamic `setAttribute('title', ...)` assignments as well. Accessible labels such as `aria-label` remain.
- Kept interactive chart data tooltips; these show actual chart data on interaction and are not static helper hints.
- Added regression coverage and retained the settings button's accessible label.

**Files changed:** `app_v57.js`, `account_module.js`, `index.html`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`.

**Implementation commit:** `999bcb8cb684f68ce613f6606f51370e9daa0856`.

**Verification:** Quality Gate run [43626860712](https://github.com/nonspam/cs2-5x5/actions/runs/43626860712), tested commit `999bcb8cb684f68ce613f6606f51370e9daa0856`: **231 passed / 0 failed / 0 skipped**, confirmed from actual job log.

**Not performed:** browser QA, screenshot comparison, deployment, database/SQL changes, or `main` changes.


## 2026-11-14 — Match Room top-team rank divider correction
- Follow-up screenshot revealed the Team A rank-column right divider still had a blue override while Team B was neutral grey.
- Changed Team A right rank divider to the same neutral grey `#424242` and added an explicit final rule covering both teams.
- Files: `style_v57.css`, `tests/faceit-v2-shell.test.cjs`. No runtime logic, DB, deployment or browser QA changes.


## 2026-11-14 — Single latest-session recovery checkpoint

**Owner request:** Make every latest project update recoverable when a ChatGPT conversation ends, is interrupted, or moves to a new chat. A new chat should immediately know the exact last completed/in-progress step instead of reviving stale tasks.

**Implemented (documentation/process only):**
- Added `docs/PROJECT_MEMORY/SESSION_CHECKPOINT.md` as the single latest-session handoff, with task status, latest owner feedback, implementation baseline, verification limits and next actions.
- Changed `docs/PROJECT_MEMORY/README.md` so every new chat reads SESSION_CHECKPOINT first and treats it as the latest handoff.
- Rewrote `docs/PROJECT_MEMORY/NEW_CHAT.md` with a checkpoint-first recovery protocol, source-of-truth priority and mandatory save steps after every logical stage and before ending a chat.
- Refreshed `docs/PROJECT_MEMORY/CURRENT_STATE.md` to remove stale conflicting task summaries and point to the current Match Room handoff.
- Kept the existing GitHub Actions workflow: it records commit metadata/changed paths, but cannot infer private chat meaning. Semantic checkpoint updates remain an explicit assistant responsibility.

**Current handoff:** FACEIT-style Match Room opening should not darken the whole site; the global left navigation should remain visible. The owner is about to provide the newest screenshots/messages, which supersede provisional visual notes.

**Verification:** Documentation-only. No application code, automated tests, browser QA, screenshot comparison, deployment, database or production changes were performed. The live branch HEAD must be checked again by the next chat.


## 2026-11-14 — FACEIT workspace rails and profile-cover propagation (IN PROGRESS)

**Owner direction, based on four supplied screenshots and clarification:**
- Keep the existing CS2 Analytics left navigation visible and remove Profile from that left navigation.
- Open Match Room as a central workspace that touches the side-rail boundaries; remove the empty offset/gap and stop dimming the whole page heavily.
- Add a persistent right utility rail with the user's avatar/profile and a VS action that opens the user's recent matches. Settings is also exposed there.
- Reuse the existing profile cover image as the background layer for route workspaces and Match Room. Do not duplicate or rewrite stored profile media.
- Long-term direction is one consistent central workspace for match, profile, Track, seasons and other sections. Do not claim every route has been converted yet.

**Implemented on `faceit-dev`:**
- Adjusted Match Room window geometry to run flush from the 170px desktop left rail to a 48px right rail; responsive offsets use the narrower 82px left rail below 900px and full-screen behavior below 700px.
- Reduced the Match Room backdrop dim from 0.56 to 0.14 and constrained it to the central workspace rather than dimming the side rails.
- Applied the current user's existing `cover_path` URL to route workspace and Match Room backgrounds; Profile retains its existing cover renderer. Corrected CSS URL quoting after a syntax check failure.
- Added a right-side utility rail: avatar opens the signed-in user's profile (or account auth when signed out); VS opens up to six recent matches from `profileMatchesForPlayer`; selecting a row opens that existing Match Room; Settings navigates to settings.
- Removed the Profile item from the left global navigation and hid the duplicate topbar account avatar.
- Kept all existing match/player data and match statistics unchanged.

**Files changed:** `app_v57.js`, `style_v57.css`, `index.html`, `tests/faceit-v2-shell.test.cjs`.

**Current status:** implementation committed; automated checks pass. Visual acceptance is still IN PROGRESS because no browser QA or screenshot comparison has been performed. The right rail currently implements Profile, VS/recent matches and Settings; notifications/friends/other actions are not implemented and must not be shown as working.

**Next steps:** inspect the live DEV browser at desktop and mobile sizes after owner authorization; verify rail alignment, cover image cropping/readability, avatar, VS recent-match list, panel dismissal, profile opening, and route behavior. Then tune from screenshots. Do not deploy without explicit permission.


## 2026-11-14 — Profile layout rollback, account wallpaper and transparent navigation (IN PROGRESS)

**Owner correction:** The previous contained-window pass put Overview / Match History / Track below the avatar, hid the original horizontal tabs, and allowed the underlying page to bleed through the profile window. The owner rejected this presentation and supplied a reference showing the original left player card with tabs across the top of the content area.

**Implemented:**
- Removed the vertical profile nav and the profile cover edit button/input. The profile now retains the left player/avatar column and restores the existing horizontal top tabs.
- Reused the existing cover_path media as the signed-in user's site wallpaper, rather than painting it as a profile cover. The current user's own profile record is the source; wallpaper is applied to the document background and a shared CSS variable for contained windows.
- Added wallpaper choose/remove controls to Settings. Existing upload/save flow is reused; no new DB schema, SQL, migration, storage bucket or RLS policy was introduced.
- Right utility rail now contains only avatar/profile and VS. Settings remains at the bottom of the left rail.
- Global navigation, utility buttons and profile top tabs now use transparent resting states and lime hover/focus glow. Removed pill treatment from the right-side controls.
- VS match score uses green for WIN and red for LOSS.
- Increased the profile backdrop opacity and made the central profile content opaque enough to prevent the underlying route from bleeding through, while allowing the current account wallpaper to remain behind the workspace.

**Files changed:** app_v57.js, style_v57.css, index.html, tests/account-profile.test.cjs, tests/faceit-v2-shell.test.cjs, DECISIONS.md.

**Implementation/test commit:** ff3a4e4b038c31b6c89be15e71ddc559f9e4aede.

**Verification:** Quality Gate run [43635690684](https://github.com/nonspam/cs2-5x5/actions/runs/43635690684), tested commit ff3a4e4b038c31b6c89be15e71ddc559f9e4aede: **244 passed / 0 failed / 0 skipped**, verified from the actual job log.

**Not performed:** browser QA, screenshot comparison, DEV deployment verification, production deployment, DB/SQL/migration/RLS/grants changes. The wallpaper reuses the existing cover_path and storage policy; the frontend only applies it for the signed-in user's own site. This does not create new private-file guarantees.

**Current status:** source and CI are updated; visual acceptance remains IN PROGRESS pending a fresh DEV screenshot / explicitly authorized browser QA.
## 2026-11-14 — Fix modal navigation, unify map details and restore wallpaper controls (IN PROGRESS)

**Owner feedback and screenshots:** The owner reported that global navigation appeared frozen while Profile / Match Room was open; closing Match Room returned to whichever route had been selected behind it rather than consistently returning to Matches. The right-side account avatar was missing/too small, the left profile avatar needed a taller frame, wallpaper upload was hard to find, and wallpaper appeared as a narrow strip/underlay rather than across the viewport. The owner also asked for each entry in the “Все игры” (map rows) list to open the same Match Room Statistics interface.

**Source changes:**
- Centralized contained-window cleanup in navigateApp(): route navigation closes Profile and Match Room before rendering the selected route. Cleanup functions now remove stale body classes even if the corresponding window node is already absent.
- Match Room “К матчам” now explicitly navigates to the Matches route (base) after closing the window, rather than merely revealing whichever page was behind it.
- openMatchDetail accepts options; map rows now call openMatchDetail(seriesId, { initialView: 'statistics', mapId }). When opened from “Все игры”, Match Room uses the selected map's player_stats, team grouping and map score, then selects the same Statistics tab used by series details. This replaces the separate legacy map-stat modal.
- Restored a direct “ОБОИ САЙТА” file picker beside the owner avatar action in the profile card; Settings retains its wallpaper controls. The media field and existing upload path remain cover_path / handleProfileImage('cover', ...).
- Right utility rail now resolves the signed-in player's id from myPlayerId or myProfile.player_id, renders the actual avatar file directly, and uses a larger vertical portrait tile above VS. Its click handler resolves the current account dynamically instead of capturing a possibly-null id from the first render.
- Increased the profile avatar frame to 300px on desktop (260px tablet / 190px mobile).
- Replaced the contradictory appended shell CSS tail with one consolidated set of contained-window, full-viewport wallpaper, right-rail, profile-tab and transparent/lime-hover rules. Wallpaper is now a fixed viewport pseudo-layer behind route shell, Profile, Match Room and both rails; Match Room uses top/right/bottom/left insets rather than a fixed height that could leave an uncovered strip.
- Updated source-contract tests for the new modal lifecycle and map-to-Match-Room flow.

**Files changed:** app_v57.js, style_v57.css, index.html, tests/faceit-v2-shell.test.cjs, tests/account-profile.test.cjs.

**Implementation commits:** app/markup and CSS updates include c644d6da8b878b39e5705f1cfe824ca25927838a, 1ae551391f3761f456b13ab62fe2279459bd6bfb, 59793e4b67246582712fde1bcd6363a1e103ec58, 0d39da40974303c2b70472ce1bc92ab46f4bcf7b, 35cbf61e8cbcc597d9f6e88194bafb9fae1c1ba8. Final test-contract commit: dcce90cd009caa8ff6b2733cb96dad22a4291009.

**Quality Gate:** run [43637929383](https://github.com/nonspam/cs2-5x5/actions/runs/43637929383), final tested commit dcce90cd009caa8ff6b2733cb96dad22a4291009: **250 passed / 0 failed / 0 skipped**, verified from the actual validate job log.

**Known intermediate failures:** Several intermediate commits failed CI while the new HTML inline handlers were over-escaped, then while older static contracts still expected the previous shell geometry. Those were corrected; the final run above passed.

**Not performed:** Browser QA, screenshot comparison, DEV deployment verification or production deployment. No DB/SQL/schema/migration/RLS/grants/storage-policy changes. Visual correctness and live wallpaper upload/persistence are still unverified.

**Next step:** owner should reload the current DEV build and send screenshots after checking: (1) profile portrait size and direct wallpaper picker; (2) account avatar tile above VS; (3) wallpaper across home/profile/Match Room/rails with no Mexico strip; (4) left nav works while either contained window is open; (5) Match Room back always returns to Matches; (6) each “Все игры” map row opens the shared Statistics tab with that map's stats. Do not deploy or claim visual acceptance without explicit authorization and actual browser evidence.


## 2026-11-14 — Profile isolation, round utility avatar and Match Room wallpaper correction (IN PROGRESS)

**Owner feedback:** the Profile window showed the route underneath it; its left edge covered part of the global navigation labels; the right account avatar was rectangular; and the wallpaper disappeared in Match Room.

**Implementation on faceit-dev:**
- Made the Profile backdrop near-opaque so the underlying route cannot bleed through, while rendering the account wallpaper inside the Profile panel beneath a dark readability gradient.
- Aligned the desktop Profile window to the 170px global navigation rail; retained 82px tablet and full-screen mobile offsets.
- Found the wallpaper regression: body.has-account-wallpaper:before was the persistent wallpaper layer, but a later body.match-room-open:before rule reused and overrode that same pseudo-element. Removed the conflicting rule and applied the shared account wallpaper variable to the Match Room surface with a dark overlay.
- Reduced the right utility avatar to a circular 38×38px tile; avatar image and fallback both use a 50% radius. Existing account avatar loading and media update behavior are preserved.
- Added regression contracts and refreshed asset cache keys.

**Not changed:** upload/save handlers, account/profile schema, player/match data, database, storage policy, production or deployment.

**Status:** source/test update committed; Quality Gate pending. Browser QA and deployed DEV appearance remain unverified.


**Quality Gate result:** run [43639401323](https://github.com/nonspam/cs2-5x5/actions/runs/43639401323), source/test commit 6640706cf6ffae0377715a3e95da5b04723eb8c4: **253 passed / 0 failed / 0 skipped**, verified from the actual validate job log. The first attempt exposed one stale test expecting the old body pseudo-element overlay; that contract was corrected before the passing run.


## 2026-11-15 — Profile media feedback, round utility avatar and wallpaper visibility
- **Problem:** Owner reported hidden upload feedback, rectangular right-rail avatar and wallpaper upload with no visible effect.
- **Implementation:** Raised toast above contained windows and moved it clear of the utility rail; made utility avatar circular (42×42); exposed the global wallpaper layer by keeping the app surface transparent and reducing dark overlays; explicitly reapplied wallpaper after successful cover upload and verifies the uploaded public image can load.
- **Files:** `app_v57.js`, `style_v57.css`, `index.html`, `tests/faceit-v2-shell.test.cjs`.
- **Commits:** `eb9b4b465e0e6fbfa387da5ae90507096b187b0c`, `37301675bd4c56080b9b42121b37bce79c737811`, `757ae2f8ba96c8fadf0f5ff10d0ec53dc4c9a13f`, `718b26e5cb32d665ee9b91f4754c6c64c1c13896`.
- **Verification:** CI pending; no browser QA or live upload test. No deployment or DB/storage-policy changes.


## 2026-11-15 — VS popover, profile scroll and wallpaper layer follow-up
- Corrected the VS recent-match popover with a compact fixed-width panel, explicit header layout and grid-based match rows; added a bounded scrollable list.
- Fixed toast stacking by moving the toast node to document.body before display, escaping the app stacking context.
- Replaced the profile 5/10/20 buttons' full app render with a profile-only update that preserves the profile content scroll position.
- Reduced the wallpaper dark overlay and explicitly kept route/profile shells transparent so the global wallpaper layer can show.
- Files: `app_v57.js`, `style_v57.css`, `index.html`, `tests/faceit-v2-shell.test.cjs`.
- Commits: `f3168228b399239118efe46665fce5d3cfceffc3`, `554b5be7252241165450223379cc093f2450acd7`, `3a97e7ce7b4450ed5b405bbeeb0501e2c0c51a34`, `8ecf3848e9f1fa6ba31114cbe2aeebb8c98d40e0`.
- CI, live browser QA and real wallpaper upload remain unverified; no deployment or DB/storage-policy changes.


## 2026-11-15 — VS panel, scroll reset and wallpaper visibility correction
- VS recent matches panel now has explicit compact geometry, typography and grid row layout.
- Toast node is moved to document.body before display to escape the app stacking context that hid upload feedback behind the Profile overlay.
- 5/10/20 profile controls use profile-only rendering and restore the scroll position rather than invoking full application render.
- Global wallpaper is exposed by transparent route/profile shells and reduced darkening overlay.
- Latest test commit: `4522c4fc3b9685cf4f0775e5c37d0649e0ba0c7f`; app/CSS/cache commits: `f3168228b399239118efe46665fce5d3cfceffc3`, `554b5be7252241165450223379cc093f2450acd7`, `3a97e7ce7b4450ed5b405bbeeb0501e2c0c51a34`.
- CI/browser/live upload verification pending. No deployment or DB/storage policy changes.


## 2026-11-15 — Paint wallpaper on app surface
- **Problem:** User reports image upload success toast but no visible wallpaper.
- **Source finding:** Wallpaper variable is applied to body pseudo-element behind the positioned app; app surface may obscure it.
- **Change:** Paint wallpaper directly on `.app` with cover sizing and a modest dark overlay; disable competing body pseudo background; keep route/profile shells transparent; update cache-busting token.
- **Files:** `style_v57.css`, `index.html`, `tests/faceit-v2-shell.test.cjs`.
- **Commits:** `9e5e7b66cc74f772c33ae2ccb5881e953d70da29`, `e4d7dd2ee2b8e09e5fece037a2971afa20497488`, `f6384f26873818a46ff7470685db7ed8136824b0`.
- **Verification:** Browser QA pending; no deployment or DB/storage-policy changes.


## 2026-11-15 — Extend account wallpaper to Profile and Match Room
- Problem: Wallpaper is visible on main routes but absent from Profile and Match Room.
- Cause confirmed in CSS: Profile inner shell uses opaque rgba(8,8,8,.94); Match Room page and content later set opaque #050505 backgrounds.
- Change: Apply --account-wallpaper directly to Profile panel and Match Room page; make Profile shell and Match Room content transparent/translucent; bump CSS cache key; add regression tests.
- Files: style_v57.css, index.html, tests/faceit-v2-shell.test.cjs.
- Commits: 73bbb25a83fd611cc1ca1ebf73e481c2367f5734, 31cfe855268dd1b97bc09e7ff4615650560e48cc, c2980ad2beb2e0b46354ce00fc938104ce3ee644.
- Browser verification pending; no deployment or DB/storage-policy changes.


## 2026-11-15 — Apply Teams graphite palette across core pages
- **Owner direction:** Use the exact dark palette from Teams across Matches, Statistics, Home and Records. Maps already matches and is intentionally left alone.
- **Palette:** card #121617, deep panel #0d1012, border #2a3035, based on supplied Teams screenshot.
- **Implementation:** Added scoped CSS variables/overrides for base Matches table, Match Room player and statistics cards, Statistics table rows, Home panels/metrics/recent games (preserve hero art), and Records panels/Top-10 rows. Kept positive/negative stat semantics and lime hover states.
- **Files:** style_v57.css, index.html (cache key), tests/faceit-v2-shell.test.cjs.
- **Commits:** 41e31ee097a7eb6f0beb6f6496a241ebccc4214f, fbaa22fc8b5921e3d92c29cd01295f5c299bb4ec, 4e141bbeece3315328fe08f01a30324ceefa8017.
- **Verification:** static regression assertions added; CI/browser screenshot QA pending. No deployment or DB/storage-policy changes.


## 2026-11-15 — Profile return action and Matches/Statistics palette correction
- Added a return-to-originating-profile action in Match Room, preserving the originating public profile ID before closing the Profile window. The existing return-to-Matches action remains distinct.
- Corrected the prior incomplete palette pass: traced remaining blue surfaces to higher-specificity and later CSS rules, then added explicit graphite overrides to Matches route and Match Room surfaces plus Statistics table/panel. Existing Home, Records, Maps and semantic stat colors were not changed in this corrective pass.
- Commits: `8f2e6964eaac56e628ac9e2549dfe9ced5dcca2f`, `fd5bec0334540d2e0797d2642f90f0293e99b0c3`, `cd5039ec4da5b26150ec6c2d944e269d02c2730e`, `d88c824a458749e7f8e78b238fa937566fb35ba1`.
- Static regression tests added. CI/browser QA pending. No deployment, production, main or DB changes.


## 2026-11-15 — Profile navigation and Match Room table palette follow-up
- Fixed profile scroll navigation styling, tier-specific level ring color, and the Match Room return path. Match Room now offers only a plain “Вернуться” link when opened from Profile and restores the profile on History; the separate “К матчам” button was removed.
- Added narrowly scoped, high-specificity graphite fills to the actual Match Room statistics table selector (previous pass targeted the wrong view class), plus explicit route table overrides.
- Commits: e5e8443d0fe4208a202c43639c8a3b18105c9fe5, 0f9a4ce148dcb228a480fad5b578f5dd65f9e2ed, 34c824b8efbbe8fbf48b716c4cbb6f5f8f03200b, e777ea141fb456ea9a1fabc023befe6d471afd04.
- Source re-fetch confirmed anchors; CI and browser QA pending. No deployment/DB/production changes.


## 2026-11-15 — Profile transparency, FACEIT level arc and map-to-series return (IN PROGRESS)

**Owner direction:** Keep Profile game tabs pinned with a subtle translucent background; replace W/L tiles with colored letters; make Profile and Match Room surfaces reveal account wallpaper; color only team identity cells in Match Room Statistics; show team labels in white and Team A/Team B scores in blue/white; render Profile FACEIT level as a progressive arc; return from map-specific statistics to the parent BO3 series.

**Implemented in source:**
- Profile level badge is now an SVG arc with level-tier color and progress proportional to level.
- Match Room map selection captures the parent series context and opens map-specific Statistics; “Вернуться к серии” restores the same series Overview, preserving the previous Profile return target.
- Profile horizontal tabs remain sticky and now use a translucent blurred surface. W/L indicators are text-only green/red letters.
- Profile shell/content/cards and Match Room Overview/Statistics/TOP surfaces use translucent dark surfaces so account wallpaper can show through.
- Match Room Statistics colors only player identity cells: Team A blue, Team B green. Team labels are white; Team A score is blue and Team B score white.
- Added/updated source regression tests and refreshed asset cache keys.

**Files:** app_v57.js, style_v57.css, tests/faceit-v2-shell.test.cjs, index.html.

**Commits:** app b24922a34541d633153d4eda65d8e5c40f66c429; CSS 1d51f6c2f578cfccb18d0229a84b33fa6a979387, ca849c9dbdb141fa9b374fae3166e57d8a1f6289; tests 63a77713537d7033140c5ec4a7265e8c729e4f66, 25afe5ddc75765cf1950e4fc99692b2431ec6df5; cache key commit 0b115feb64720a2ec2c0903944158cd1cd6c2aad.

**Verification:** Initial Quality Gate run 43731610757 failed (263 passed / 7 failed / 0 skipped). The failures exposed stale assertions that did not match current implementation, plus the Profile shell was still too opaque; shell transparency was corrected and tests were updated. Final Quality Gate run [43731859881](https://github.com/nonspam/cs2-5x5/actions/runs/43731859881), tested commit ba201a31edf605a575181a781a2ddd21f7e42ab0: 273 passed / 0 failed / 0 skipped, confirmed from the validate job log. Two remaining failures were stale test expectations for toast z-index and a dynamically generated handler string; assertions were corrected without changing runtime behavior.

**Not performed:** browser visual QA, screenshot comparison, live BO3 navigation test, DEV deployment verification, production or DB changes.

**Next:** inspect latest Quality Gate; if green, ask owner to verify all requested interactions in DEV before further design work.

**Follow-up:** Added translucent backgrounds to Profile history rows and Match Room roster/map cards so the account wallpaper is visible in those subviews too. CSS commit b67e298b3644936beeba1209bcc934463cdb523a; regression tests commit 7453b1d4a65b77f8282a75ec42b9161da3dd7272. Final Quality Gate run [43731959484](https://github.com/nonspam/cs2-5x5/actions/runs/43731959484): **274 passed / 0 failed / 0 skipped**, confirmed from the validate job log.


## 2026-11-15 — Owner screenshot correction pass (278 tests passed)

The owner supplied refreshed screenshots and clarified that the three mini highlight cards in Match Room Statistics are the approved transparency reference and must not be changed.

- Removed the redundant CS2 icon/label from Profile's horizontal navigation.
- Reinforced the Profile's sticky translucent tab bar and scroll container.
- Removed the square border/background/shadow from the FACEIT level arc.
- Made W/L markers text-only in both Recent Results and Recent Matches.
- Corrected Profile match-history rows to have a full-width rectangular hover target.
- Made the large MVP card, Overview player cards, map/veto surfaces and Statistics player tables translucent; retained the three approved mini highlight cards unchanged.
- Moved Team A blue / Team B green treatment from the entire name cell to the player avatar/icon only.
- Team A score green, Team B score white. K/D-dependent player stat text has unified typography: KD > 1 green, KD = 1 white and bold, KD < 1 red.
- Files: app_v57.js, style_v57.css, tests/faceit-v2-shell.test.cjs, index.html.
- Commits: app 5cc88c0419b4970153a181d24c1b3c139ff2a5d7; CSS 6f7e2a89d8c6eedd387878f6a98702ab49f59b23; tests d38124db99f4b5cd1179cc5148e0ca879853f4cb; index 06ebc3d66e6e27ae2333cb1887149e994498c52a.
- Quality Gate [43733541030](https://github.com/nonspam/cs2-5x5/actions/runs/43733541030): **278 passed / 0 failed / 0 skipped**.
- Visual browser QA and DEV deployment verification remain pending. Do not claim visual acceptance until owner tests refreshed DEV.


**TOP follow-up:** Owner noted the TOP player cards were still opaque; appended a targeted translucent `.match-stat-top-row` override while leaving the three approved mini highlights untouched. CSS commit 38b09380a8dce42b850508cf4109541ebd4a4177; test commit 7a9b4724750db837bd67f7b6313d349cef196e89. Latest Quality Gate [43733694196](https://github.com/nonspam/cs2-5x5/actions/runs/43733694196): **279 passed / 0 failed / 0 skipped**.


## 2026-11-15 — Match Room Overview/Statistics transparency and Track tooltip fix

Owner's latest screenshots showed the outer cards were translucent but inner layers still opaque. The Track point tooltip was also appearing behind the profile wallpaper/modal.

- Match Room Overview: made the player card, identity header and career metric strip translucent/frosted; forced player avatar to a circle.
- Avatar markup retains its fallback initial but CSS hides it while a real image is present, preventing the initial from covering the photo.
- Match Room Statistics: applied the same translucent blurred treatment to every player-row cell, including name and rank, rather than only the table wrapper. MVP and three approved mini highlights intentionally left unchanged.
- Track: fixed tooltip positioning to viewport coordinates (`position:fixed`), raised z-index above Profile (`13050`) and repositioned a pinned tooltip on scroll/resize.
- Quality Gate [43735324791](https://github.com/nonspam/cs2-5x5/actions/runs/43735324791): **282 passed / 0 failed / 0 skipped**.
- Files changed: app_v57.js, style_v57.css, tests/faceit-v2-shell.test.cjs, index.html.
- Visual acceptance still pending owner hard-refresh and browser verification; no production deployment was made.


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


## 2026-11-15 — Matchmaking leaderboard route and season prototype
- Added a dedicated `Рейтинг` page to the global left rail, positioned between `Статистика` and `Матчи`.
- Implemented the Matchmaking-only leaderboard with exactly four columns: Rank, Player, Skill Level, Elo. No country or region controls and no wreath/laurel graphics. Rank numbers stay white; skill pills carry podium rank colors and red for other ranks.
- Kept gold/silver/bronze row outlines for ranks 1–3 as a temporary owner-approved experiment.
- Added clickable Season 0 (Test) and Season 1 options. Both currently use a deterministic active-player list and placeholder Elo 1000 for every player. This is explicitly a visual/interaction prototype, not saved historical season data or a rating engine.
- Updated route, navigation, UI and metrics regression contracts.
- Quality Gate [43757606058](https://github.com/nonspam/cs2-5x5/actions/runs/43757606058): **285 passed / 0 failed / 0 skipped**.
- Browser QA, screenshot comparison and DEV deployment verification remain pending.

## 2026-11-15 — Leaderboard glass styling and current K/D standings
- Updated Rating page to use the same translucent glass rows as Match Room Statistics: 14% dark glass fill, 9px backdrop blur, subtle white borders. Panel wrapper is transparent; podium row borders retained with reduced tint.
- Season 0 is now marked current and shows the existing active roster ranked by current K/D, using the same aggregate and tie-break ordering as Statistics. K/D is shown in the final column with the existing positive/neutral/negative colors.
- The displayed basis is explicitly labelled ALL TIME because the repo has no separate persisted Season 0 snapshot. Season 1 remains clickable and shows a not-started state instead of fabricated values.
- Quality Gate [43760767947](https://github.com/nonspam/cs2-5x5/actions/runs/43760767947): **286/286 passed**.
- Browser visual QA and deployment remain unverified.


## 2026-11-16 — Demo analytics product plan (documentation only)

**Owner decision:** Finish and stabilize the existing product and its systems first. Add automatic demo processing afterwards. Current work should be designed with future match-data contracts in mind, but parser integration is deliberately deferred.

**Planned workflow:** Upload a CS2 `.dem` to a draft match; process it in a separate background service; normalize raw events; calculate versioned metrics; let an administrator review/correct the draft; publish one canonical match dataset.

**Planned output:** Match overview (Impact Rating, K/D/A, ADR, KD, kills/round, headshots/HS%, 2K–5K, MVP rounds), MVP card, four highlights (most kills, highest damage, best KAST, most entry kills), detailed General/Advanced, Entry, Trades, Clutches, Duels and Equipment/Utility sections, with CT/T splits where supported. The same published data feeds Match Room, profiles and Track.

**Important boundaries:** Impact Rating is our own model, not FACEIT's proprietary formula. Elo/level and crosshair are external/profile data. Ambiguous metrics/formulas such as RWS and abbreviated RP/RS are not guessed. Preserve raw events and calculation versions; validate, review and publish; retries must not double-count Track.

**Plan:** [DEMO_ANALYTICS_PLAN.md](DEMO_ANALYTICS_PLAN.md) contains the metric groups, data principles, phases and acceptance criteria.

**Files:** `docs/PROJECT_MEMORY/DEMO_ANALYTICS_PLAN.md`, `CURRENT_STATE.md`, `SESSION_CHECKPOINT.md`, `DEVELOPMENT_LOG.md`.

**Scope:** Documentation only. No parser, upload flow, runtime code, database/schema, SQL/migrations, deployment, production or `main` changes.


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


## 2026-11-16 — Match Room Statistics layout follow-up
- Removed the Rating and Swing columns from the Match Room statistics table; general metrics now start with Kills / Deaths / Assists.
- Expanded the player identity column and retained rank as the adjacent identity column.
- Added team-side metadata to every stat row so player + rank cells keep the correct team tint in both team and player sort modes.
- Rebuilt the awards area as a larger MVP panel with four leader cards stacked in a right-hand column on desktop.
- Reworked the stat toolbar, category tabs, and table wrapper to stay inside a shared max-width container; metric headings are plain clickable text without oval borders.
- Added `tests/match-room-statistics-layout.test.cjs` and updated the existing shell test to assert the removed fields and team identity metadata.
- Quality Gate run [43937919845](https://github.com/nonspam/cs2-5x5/actions/runs/43937919845): **298 passed / 0 failed / 0 skipped**.
- Browser visual QA has not been performed; viewport fit and actual appearance still require user confirmation.

- Follow-up QA correction: the avatar markup emits `.player-avatar.lg/md/xs`; CSS now targets those actual classes (not nonexistent `match-player-avatar-*` selectors). Final asset cache marker is `matchroom-statistics-layout-20261116-v2`. Quality Gate run [43938228641](https://github.com/nonspam/cs2-5x5/actions/runs/43938228641): **298 passed / 0 failed / 0 skipped**.


## 2026-11-16 — Match Room MVP and leader cards refinement
- Rebuilt the MVP award panel: removed FACEIT rating/ELO and result impact; MVP tag sits at the upper-right; the panel now shows U/S/A and K/D.
- Replaced the four right-side awards with compact text-only rows: most kills, best K/D, ADR (0), and headshot kills (0%). The headshot metric is explicitly shown below ADR; no locked highlight or oversized avatar placeholders.
- Increased the MVP panel share and avatar size, reduced right-side row height/gaps, and tightened table player/rank cells while preserving team-side tint in both sort modes.
- Team section headings now receive a `Тим ` prefix unless the source already labels them as Team/Тим.
- Added regression tests; asset marker is `matchroom-statistics-layout-20261116-v3`.
- Quality Gate [43942434063](https://github.com/nonspam/cs2-5x5/actions/runs/43942434063): **300 passed / 0 failed / 0 skipped**. Browser visual QA remains pending.


## 2026-11-16 — MVP focus and FACEIT-style Top 4 compacting
- Rebalanced the Statistics awards area so the MVP panel gets the dominant width (1.55fr vs 0.78fr) and the Top 4 sits in a narrower right column.
- MVP badge is positioned at the top-right of the whole MVP card. The card now uses a 2×2 metric layout: U/S/A, ADR 0, K/D below U/S/A, and headshot kills 0% below ADR.
- Replaced the right-hand cards with FACEIT-style Top 4 fields: most kills, most damage, KAST, and entry kills. Restored player avatars/names and aligned values/labels on the right. Each row is 44px tall with tight gaps.
- Only render source-backed leaders for damage/KAST/entry; unavailable values remain unavailable rather than being invented.
- Cache marker advanced to `matchroom-statistics-layout-20261116-v4`.
- Quality Gate [43944687653](https://github.com/nonspam/cs2-5x5/actions/runs/43944687653): **301 passed / 0 failed / 0 skipped**. Browser visual QA is not yet verified.
