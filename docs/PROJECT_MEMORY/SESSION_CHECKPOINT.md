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
