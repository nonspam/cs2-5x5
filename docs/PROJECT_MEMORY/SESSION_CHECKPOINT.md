# SESSION CHECKPOINT — read this first

> The single latest recovery point for a new chat or an interrupted session. Read this before older summaries.

## Snapshot

- Updated: 2026-11-14
- Repository: `nonspam/cs2-5x5`
- Working branch: `faceit-dev`
- Branch HEAD checked before this checkpoint refresh: `057b66f53963ce79b04330e11fcca9cc7867d754`
- Latest implementation package Quality Gate commit: `35c5381e6beee2ddae42640fe0509bf657967c4a`
- Latest confirmed Quality Gate: [run 43633959427](https://github.com/nonspam/cs2-5x5/actions/runs/43633959427) — **241 passed / 0 failed / 0 skipped**, confirmed from the actual job log.
- This is automated syntax + Node regression/static-contract evidence only. No browser QA, screenshot comparison or deployment is evidenced.

## Current task — IN PROGRESS: FACEIT-style central workspace shell

### Owner's latest direction (from four screenshots and the latest clarification)

1. Preserve the visible left global navigation when opening Match Room and other sections; the content should live in the central workspace, not cover the whole site.
2. The Match Room should meet the side-rail boundaries. Remove the awkward empty gap and the heavy dim overlay that makes the whole site look muddy.
3. Move Profile out of the left navigation. Add a compact persistent right-side rail with the user's avatar/profile and a VS action that opens recent personal matches. Other actions may be added after design/approval.
4. Reuse the profile cover image as the background layer behind the current workspace/window, including Match Room and relevant route sections, with readable dark overlays.
5. The long-term direction includes Match Room, Profile, Track, Seasons and other sections in one consistent central workspace. Do not claim all routes have been converted unless verified in source.

### Implemented in the current source package

- Match Room desktop frame now aligns flush between a 170px left rail and a 48px right utility rail; below 900px the left offset is 82px; below 700px the content is full-screen.
- Match Room dim layer is constrained to the central workspace and reduced from 0.56 opacity to 0.14.
- The existing current-user `cover_path` URL is reused for route workspace and Match Room backgrounds. Profile keeps its existing cover renderer; no duplicate media storage was introduced.
- Added persistent right utility rail:
  - Avatar opens the signed-in user's profile; signed-out state opens account auth.
  - VS opens up to six recent matches from the existing `profileMatchesForPlayer` result; selecting a match opens the existing Match Room.
  - Settings navigates to the settings route.
- Removed Profile from the left global rail and hid the duplicate topbar account avatar.
- Existing match/player data, statistics, match tabs and calculations were not intentionally changed.

### Files changed

- `app_v57.js`
- `style_v57.css`
- `index.html` (cache keys)
- `tests/faceit-v2-shell.test.cjs`

### Verification

- Quality Gate run [43633959427](https://github.com/nonspam/cs2-5x5/actions/runs/43633959427), tested commit `35c5381e6beee2ddae42640fe0509bf657967c4a`: 241 passed / 0 failed / 0 skipped.
- Intermediate CI attempts failed due to a JS string-escaping syntax issue and stale/new rail test expectations; these were corrected before the final passing run.
- Browser visual/interaction QA: NOT performed.
- Screenshot comparison: NOT performed.
- DEV deployment: NOT verified.
- Production deployment: NOT performed.
- Notifications, friends/social actions and additional right-rail items: NOT implemented.

## Next step

The code package is committed and CI-green. Before calling it visually accepted:
1. Obtain explicit owner authorization for browser QA (project rule: do not perform browser QA without separate permission).
2. Verify at desktop and mobile sizes: left/right rail adjacency, Match Room edges, lightness of the central overlay, cover image crop/readability, avatar-to-profile action, VS panel content and dismissal, selecting a recent match, settings navigation.
3. Ask the owner for a screenshot from DEV if browser QA cannot be performed directly.
4. Fix only evidenced visual/interaction issues, then update this checkpoint and project logs.
5. Do not deploy without separate explicit permission.

## Confidence and limits

The implementation is present in `faceit-dev` and the final recorded Quality Gate is green. This does not prove that the live DEV site has the new build or that the design matches the reference in a browser. Treat visual acceptance as pending.
