# CS2 Analytics — Current State

> Актуальная краткая сводка. Последняя точка продолжения находится в [SESSION_CHECKPOINT.md](SESSION_CHECKPOINT.md). При конфликте сначала проверь живой код, свежие сообщения владельца и checkpoint.

## Snapshot

- Date: 2026-11-14
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

## Current focus

The active owner-directed task is stabilizing the contained Profile window and making the signed-in user's wallpaper visible consistently across all routes and Match Room. The latest CSS/test correction isolates the underlying route, aligns the Profile edge to the global rail, makes the utility avatar circular, and removes a conflicting Match Room body pseudo-element. Quality Gate and visual confirmation are pending.

Implemented in source:
- Global route navigation closes both contained windows; stale body modal classes are removed.
- Match Room back action returns to Matches (base).
- “Все игры” map rows open the shared Match Room Statistics tab scoped to the selected map.
- Profile includes direct “ОБОИ САЙТА” upload action; Settings retains upload/removal.
- Right utility rail uses the current account avatar as a larger portrait tile above VS; profile avatar frame is taller.
- Wallpaper is a fixed full-viewport layer behind the route shell, Profile, Match Room and side rails.

Quality Gate run 43637929383: 250 passed / 0 failed / 0 skipped.

**Not yet confirmed:** browser appearance, actual upload/persistence, wallpaper visibility across all routes, avatar loading, route interaction while overlays are open, and responsive layout. No DEV deployment or browser QA is evidenced.

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
