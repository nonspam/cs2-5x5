# SESSION CHECKPOINT — read this first

> Latest recovery point. This supersedes the previous wallpaper-only checkpoint.

## Snapshot

- Updated: 2026-11-14
- Repository: nonspam/cs2-5x5
- Working branch: faceit-dev
- HEAD before this checkpoint update: 479c3bfc524adefceabb24d0478fa30aafa78c4a
- Main implementation commits: app c644d6da8b878b39e5705f1cfe824ca25927838a; CSS 1ae551391f3761f456b13ab62fe2279459bd6bfb; final route cleanup app 35cbf61e8cbcc597d9f6e88194bafb9fae1c1ba8; final regression contracts dcce90cd009caa8ff6b2733cb96dad22a4291009.
- Quality Gate: [run 43637929383](https://github.com/nonspam/cs2-5x5/actions/runs/43637929383), **250 passed / 0 failed / 0 skipped**, verified from the actual validate job log.
- Automated syntax and Node regression/static contracts only. Browser QA, screenshot comparison and deployment are NOT verified.

## Current owner-directed task — IN PROGRESS

The owner supplied three new screenshots and reported that the previous profile / Match Room windows could visually obscure the underlying app and intercept navigation. The wallpaper appeared as a narrow strip in Match Room and was too faint elsewhere; the right account avatar was missing; the avatar frame was too short; wallpaper upload was hard to find; and map rows in “Все игры” opened a separate legacy modal rather than the shared Match Room Statistics view.

### Owner requirements

1. Clicking any global left navigation item while Profile or Match Room is open must close the contained window and open the selected route. The main app must never remain visually frozen behind a stale modal.
2. Match Room “К матчам” must return to Matches (base), not reveal an arbitrary route that was open underneath.
3. Every map/game row in “Все игры” opens the shared Match Room interface, initially on Statistics and scoped to the selected map.
4. The current signed-in user's avatar must be visible in the right utility rail above VS as a larger vertical portrait tile.
5. The left profile avatar frame must return to a taller vertical proportion.
6. Wallpaper upload must be directly discoverable in the owner's profile as “ОБОИ САЙТА”; Settings must retain upload/removal.
7. Personal wallpaper must cover the full viewport behind all site sections, Profile, Match Room and both side rails. No uncovered Mexico-color strip, no per-window wallpaper mismatch.
8. Preserve the current profile top tabs and the existing real player/match statistics. Do not change DB or storage policies.

### Implemented in source

- navigateApp() closes Profile and Match Room before changing the route. The cleanup functions also remove stale body classes even if the window DOM node is already missing.
- Match Room back button now calls matchRoomNavigate('base'), which returns to the Matches list.
- openMatchDetail(id, options) now supports initialView and mapId. openMapDetail(mapId) opens the same Match Room with Statistics selected and map-specific player_stats, historical team grouping and map score. The legacy separate map-stat modal was removed.
- Added an owner-only “ОБОИ САЙТА” button and hidden file input beside the profile avatar action. Settings retains the existing wallpaper picker and removal action.
- Right utility rail resolves the account id from myPlayerId or myProfile.player_id, renders the current avatar image directly in a larger 46×62 portrait tile above VS, and resolves the current id dynamically when clicked.
- Increased the profile avatar frame to 300px desktop / 260px tablet / 190px mobile.
- Consolidated the appended contained-window CSS tail into one coherent block. Account wallpaper now uses a fixed body pseudo-element spanning the entire viewport behind the route shell, Profile, Match Room and both rails. Match Room fills the central workspace using top/right/bottom/left insets rather than a fixed height that could leave a bottom strip.
- Updated tests for navigation cleanup, Match Room back behavior, map-to-statistics routing, wallpaper controls, full-viewport background, and avatar sizing.

### Files changed

- app_v57.js
- style_v57.css
- index.html (cache keys)
- tests/faceit-v2-shell.test.cjs
- tests/account-profile.test.cjs

### Verification and limitations

- Quality Gate run [43637929383](https://github.com/nonspam/cs2-5x5/actions/runs/43637929383), tested source/test commit dcce90cd009caa8ff6b2733cb96dad22a4291009: **250 passed / 0 failed / 0 skipped**.
- Intermediate runs failed while inline HTML handlers were over-escaped and while old source-contract assertions still expected previous window geometry. These were corrected before the final passing run.
- Browser visual/interaction QA: NOT performed.
- Screenshot comparison: NOT performed.
- DEV deployment / deployed SHA: NOT verified.
- Production: NOT touched.
- DB/SQL/schema/migrations/RLS/grants/storage policies: NOT touched.

### Wallpaper caveat

Wallpaper reuses the existing profile cover_path and current media upload/storage behavior. The UI applies the current signed-in user's wallpaper globally in the frontend. This does not create new private-file guarantees; actual media access remains governed by the existing storage policy.

## Next step

Wait for the owner to reload the current DEV build and send a fresh screenshot. Verify these exact cases against the new screenshots:
1. Profile: left avatar frame is tall again; “ОБОИ САЙТА” picker is visible for the owner; top tabs remain in the content header.
2. Right rail: current account avatar appears above VS, using the avatar saved in the account profile.
3. Wallpaper: image covers the whole viewport behind Home, Statistics, Matches, Profile, Match Room and both rails; no narrow uncovered strip at the bottom or sides.
4. Navigation: while Profile is open, click Home / Statistics / Matches; while Match Room is open, click the same items. Each must close the window and show the selected route.
5. Match Room “К матчам” returns to Matches every time.
6. “Все игры”: open multiple map rows; each should use the shared Match Room and start on Statistics with the selected map's own stats.
7. Check mobile/tablet overflow and wallpaper crop only after desktop behavior is accepted.

Do not deploy, perform browser QA, touch production or change DB/storage policy without separate explicit authorization.

## Confidence

Source changes and automated CI are confirmed. Visual acceptance, live upload/persistence and deployed DEV SHA remain unverified. Treat the task as IN PROGRESS.
