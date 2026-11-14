## 2026-11-14 — Profile and Match Room contained-window prototype
- Code under test: `71dca4dcee8b0dca0092b3565735c54cb0011634`.
- Quality Gate run [43631637819](https://github.com/nonspam/cs2-5x5/actions/runs/43631637819): **236 passed / 0 failed / 0 skipped**, confirmed from actual `validate` job log.
- Scope: repository syntax checks and Node regression/static contracts, including profile-window mount/navigation, profile-local rerender behavior, and Match Room contained-window/responsive-layout contracts.
- Earlier run [43631304007](https://github.com/nonspam/cs2-5x5/actions/runs/43631304007) failed one newly added assertion because its test regex escaped quotes incorrectly; the assertion was rewritten as a literal substring check and the follow-up passed.
- No browser QA, screenshot comparison, DEV deployment verification or production deployment. CI does not prove visual correctness or actual browser interaction.

# Quality History

This file stores verifiable evidence, not optimistic status claims.

## 2026-11-14 — Match Room application-code quality gate

- Workflow: [CS2-5x5 quality gate](https://github.com/nonspam/cs2-5x5/actions/runs/43614439431)
- Commit tested: `bb8c161d9d2d4e66c48a6bf06f1d938286941e62`
- Result: **226 passed / 0 failed**
- Job: `validate`, successful.
- Scope: repository syntax checks and automated Node regression/static contract tests.
- Not covered: visual browser rendering, real user click flows in a browser, responsive screenshot comparison, live DEV data behavior, Cloudflare deployment.

## 2026-11-14 — CI after Project Memory / Project Master documentation update

- Workflow: [CS2-5x5 quality gate](https://github.com/nonspam/cs2-5x5/actions/runs/43615475472)
- Commit tested: `cb7fade324acde39b2bcb6f764b3ffde9d9a2786` (documentation and Project Master link update; no application runtime changes in this commit).
- Command: `npm run check`.
- Result from job log: **226 passed / 0 failed**.
- Scope and limitations: same syntax and Node regression suite; this does not prove browser QA or deployment.

## 2026-11-14 — Project Memory pre-hardening quality gate

- Workflow: [CS2-5x5 quality gate](https://github.com/nonspam/cs2-5x5/actions/runs/43615568846)
- Commit tested: `dbe2e982cf7b712413ace4981f2424012b46450f`.
- Job: `validate`, successful.
- Command: `npm run check`.
- Result confirmed in the actual job log: **226 passed / 0 failed**, 0 skipped.
- Scope: repository syntax checks and Node regression/static contract tests.

## 2026-11-14 — Project Memory recovery hardening quality gate

- Workflow: [CS2-5x5 quality gate](https://github.com/nonspam/cs2-5x5/actions/runs/43615940711)
- Commit tested: `1644527855ec257b10c7d2999531f6a974e80b66`, containing the Project Memory recovery hardening and semantic log update.
- Job: `validate`, completed successfully.
- Command: `npm run check`.
- Actual job log: **226 passed / 0 failed / 0 skipped**.
- Scope: repository syntax checks and Node regression/static contract tests. The changes in this run were documentation-only; the test result confirms the repository quality gate remained green, not browser rendering or product behavior.

## 2026-11-14 — Final Project Memory snapshot quality gate

- Workflow: [CS2-5x5 quality gate](https://github.com/nonspam/cs2-5x5/actions/runs/43616036526)
- Commit tested: `1390c1ebbad62b857dcac4f20d2b038a88e3dbfe`, the finalized CURRENT_STATE snapshot after the memory hardening.
- Job: `validate`, completed successfully.
- Actual job log: **226 passed / 0 failed / 0 skipped**.
- Scope: repository syntax checks and Node regression/static contract tests. This was a documentation-only update; it does not prove browser QA, live DEV data correctness or deployment.

## Evidence rules

Every new entry must include:
- Date and exact commit SHA.
- Exact workflow/run URL where available.
- Passed/failed counts from actual logs, not inferred from a green badge.
- What the test actually exercises.
- What it does not prove.

Use separate labels for:
- Local automated tests.
- GitHub Actions CI.
- Browser QA (browser, URL/environment, viewport, flows checked).
- Deployment verification (environment and deployed SHA).
- Data integrity checks (read-only vs write operation).

A failed or partial run must remain in history. A later successful run can supersede it, but must not erase the failure.

## Current verification boundary

The latest confirmed CI evidence recorded here is run `43616036526` on commit `1390c1ebbad62b857dcac4f20d2b038a88e3dbfe`. Check newer runs before relying on it. No browser QA or deployment is confirmed by these CI runs.


## 2026-11-14 — Match Room Statistics and TOP refinement

- UI/test commit: `fc402e571e117eb4f74d462bddfb274b145f653d`; cache-key commit: `0a82131ad0788618cad16a9a15c96b13a93b1a4b`.
- Quality Gate run [43621076848](https://github.com/nonspam/cs2-5x5/actions/runs/43621076848), tested UI/test commit: **227 passed / 0 failed / 0 skipped**; actual `validate` job log inspected.
- Quality Gate run [43621142715](https://github.com/nonspam/cs2-5x5/actions/runs/43621142715), tested cache-key commit: **227 passed / 0 failed / 0 skipped**; actual `validate` job log inspected.
- Scope: syntax checks and Node regression/static contracts. No browser QA, visual comparison, deployment, DB writes, SQL, migrations, schema/RLS/grants, or `main` changes.


## 2026-11-14 — Match Room Statistics/TOP second layout correction

- Commit: `88d0c7c27e0f9db5d9e5b506994c0d3eaf4f60b5`.
- Quality Gate run [43622133983](https://github.com/nonspam/cs2-5x5/actions/runs/43622133983): **228 passed / 0 failed / 0 skipped**, verified from the actual `validate` job log.
- Scope: syntax and Node regression/static contracts. No browser QA, visual comparison, deployment, DB writes, SQL, migrations, schema/RLS/grants, or `main` changes.


## 2026-11-14 — Match Room Statistics compact table and FACEIT rank badge

- Final Quality Gate run [43623053804](https://github.com/nonspam/cs2-5x5/actions/runs/43623053804), tested commit `83952fc1abd889420950c9fbae9efa3ca1ab6c1d`: **229 passed / 0 failed / 0 skipped**, confirmed from actual job log.
- Two intermediate runs failed during implementation (JS quote-escaping syntax error; then a test assertion that matched legacy profile markup outside the Match Room). Both were corrected before final passing run.
- CI scope: syntax and Node regression/static contracts only. No browser QA, visual comparison, or deployment.


## 2026-11-14 — Statistics amber losing-team identity and FACEIT SVG badge
- Quality Gate run [43623604285](https://github.com/nonspam/cs2-5x5/actions/runs/43623604285), tested commit `5a68847bec8e083960baa53019a6b2eb0566daca`: **229 passed / 0 failed / 0 skipped**, verified from actual job log.
- Scope: syntax and Node regression/static contracts only. No browser QA or deployment.


## 2026-11-14 — Neutral rank column and corrected FACEIT SVG arc
- Quality Gate run [43624895321](https://github.com/nonspam/cs2-5x5/actions/runs/43624895321), tested commit `c86bac0a9e4260ad697d85e3e0f1ada62777f558`: **229 passed / 0 failed / 0 skipped**, confirmed from actual job log.
- Scope: syntax and Node regression/static contracts only. No browser QA or visual screenshot comparison.


## 2026-11-14 — Amber rank divider and FACEIT numeral sizing
- Quality Gate run [43625555498](https://github.com/nonspam/cs2-5x5/actions/runs/43625555498), tested commit `532b204d4ab8194922107960539579676cfef572`: **229 passed / 0 failed / 0 skipped**, confirmed from actual job log.
- Scope: syntax and Node regression/static contracts only. No browser QA or screenshot comparison.


## 2026-11-14 — K/D-based full score coloring and FACEIT numeral alignment
- Quality Gate run [43625641567](https://github.com/nonspam/cs2-5x5/actions/runs/43625641567), tested commit `74e280a4ebba26c6f99a73841f187e35ea0b72cc`: **229 passed / 0 failed / 0 skipped**, confirmed from actual job log.
- Scope: syntax and Node regression/static contracts only. No browser QA or screenshot comparison.


## 2026-11-14 — Neutral rank divider and site-wide helper tooltip cleanup
- Quality Gate run [43626860712](https://github.com/nonspam/cs2-5x5/actions/runs/43626860712), tested commit `999bcb8cb684f68ce613f6606f51370e9daa0856`: **231 passed / 0 failed / 0 skipped**, confirmed from actual job log.
- Scope: syntax and Node regression/static contracts only. No browser QA or screenshot comparison.


## 2026-11-14 — Team A rank divider follow-up
- Added regression check and neutralized Team A's previously blue right rank divider to `#424242`, matching Team B.
- Quality run for this follow-up is pending at documentation time; no browser QA.


## 2026-11-14 — FACEIT workspace rails and cover propagation
- Quality Gate run [43633959427](https://github.com/nonspam/cs2-5x5/actions/runs/43633959427), tested commit `35c5381e6beee2ddae42640fe0509bf657967c4a`: **241 passed / 0 failed / 0 skipped**, verified from the actual `validate` job log.
- Earlier implementation attempts had failing runs: an initial JS quote-escaping syntax error, then stale/new rail contract assertions. These were corrected; the final run above passed.
- Scope: Node syntax checks and regression/static contracts. No browser QA, screenshot comparison, deployment, DB/SQL, schema/RLS/grants, or `main` changes. Visual behavior remains unverified.


## 2026-11-14 — Profile restoration, account wallpaper and transparent navigation
- Quality Gate run [43635690684](https://github.com/nonspam/cs2-5x5/actions/runs/43635690684), tested implementation/test commit ff3a4e4b038c31b6c89be15e71ddc559f9e4aede: **244 passed / 0 failed / 0 skipped**, verified from actual validate job log.
- The run covers syntax and Node regression/static contracts for account wallpaper, restored horizontal profile tabs, right utility rail and transparent lime-hover navigation.
- Intermediate failed runs remain in workflow history: tests still expected the removed profileCoverFile and vertical nav; a later temporary test regex over-escaped the tab quotes. The contracts were updated before the final passing run.
- No browser QA, screenshot comparison or deployment. No DB/SQL/migration/RLS/grants changes.


## 2026-11-14 — Modal navigation, map statistics and wallpaper repair
- Quality Gate run [43637929383](https://github.com/nonspam/cs2-5x5/actions/runs/43637929383), tested commit dcce90cd009caa8ff6b2733cb96dad22a4291009: **250 passed / 0 failed / 0 skipped**, verified from the actual validate job log.
- Coverage added/updated for route navigation closing both contained windows, stale modal body-class cleanup, Match Room back-to-Matches behavior, map rows opening the shared Match Room Statistics view with map-specific stats, direct profile wallpaper picker, full-viewport wallpaper layer, taller profile avatar and right-side current-account portrait tile.
- Intermediate CI failures occurred on temporary commits during inline-handler escaping and static-contract updates. The final commit above passed.
- Browser QA, screenshot comparison and deployment remain unverified. No DB/schema/migration/RLS/grants/storage-policy changes.


## 2026-11-14 — Profile isolation, circular utility avatar and Match Room wallpaper
- Source/test commit: `6640706cf6ffae0377715a3e95da5b04723eb8c4`.
- Quality Gate run [43639401323](https://github.com/nonspam/cs2-5x5/actions/runs/43639401323): **253 passed / 0 failed / 0 skipped**, verified from the actual validate job log.
- Scope: syntax and Node regression/static contracts. Includes profile overlay isolation, shared wallpaper in Profile and Match Room, no body pseudo-element conflict, and circular 38px utility avatar.
- One initial run failed on a stale assertion that expected the removed Match Room body pseudo-element; the test was corrected and the final run passed.
- No browser QA, screenshot comparison, DEV deployment verification, database writes, SQL, migrations, RLS/grants/storage policy changes, or production changes.
