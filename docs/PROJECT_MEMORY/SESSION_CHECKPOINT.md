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
