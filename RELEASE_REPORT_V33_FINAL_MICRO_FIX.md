# V33 FINAL MICRO FIX

Base: V32 DEVICE READY

## Requested fixes
1. Native browser select popup blue highlight replaced with a custom dark/graphite + lime menu for all `<select>` controls, including dynamically created modal selects via MutationObserver.
2. Home dynamic chart `AVG` fixed to use cumulative kills / detailed maps and no longer relies on repeated row lookup.
3. Player selection in Home Dynamics no longer calls the full-site `render()`; it refreshes only the player picker and chart, reducing visible selection latency.

## Scope
- Runtime files changed: `app_v57.js`, `style_v57.css`.
- Data files were not changed.
- Supabase was not changed.
- No map/match/player values were changed.

## Verification
- `node --check app_v57.js`: PASS
- `QA_CHECK.py`: PASS
- CSS braces: 2016 / 2016
- Original V32 data hashes match exactly for:
  - data/players.json
  - data/maps.json
  - data/matches.json
  - data/aliases.json
  - shared_state.json
  - data_embedded.js
- Custom select source present and wired through `render()` + MutationObserver.
- No browser visual test is claimed; this environment previously timed out on Chromium headless navigation.

Status: **FINAL MICRO FIX / READY FOR FINAL QA**
