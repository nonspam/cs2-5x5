# V58.3 — Micro Fix / Nuke map-history spacing / 66-map counters

## Scope

Small stability/UI cleanup on top of the V58.3 active release chain. No V58.4 FAST LOADING code was used.

## Fixed

- Player recent-map rows now render as `#N · map · K/D/A`, with explicit spacing/separators.
- Map number, map name, and the player's K/D/A are visually separated instead of running together.
- Global active-map counters now use one authoritative `activeMapCount()` helper.
- Home counter uses the authoritative active-map count.
- Matches page uses the same 66-map source for its global counters.
- Maps page explicitly shows the active total.
- Current release QA/audit scripts were updated from the retired 67-map/33-match expectations to the current 66-map/32-match dataset.

## Data verification

- Supabase production state: version 30.
- Active maps: 66.
- Total matches/series: 32.
- Last map: `map_066` — `nuke`.
- No archived maps in the current production state.

## Verification

- `node --check app_v57.js` — PASS
- `node V58_3_HOME_STABILITY_QA.js` — PASS
- `python QA_CHECK.py` — PASS
- `python FULL_FUNCTION_AUDIT.py` — PASS
- `python RELEASE_GATE_V57.py` — PASS

Browser visual E2E was not claimed because no browser runner is installed in this environment.
