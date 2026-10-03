# CS2 Analytics V58.3 — Stage 3+4 Full Audit

Дата: 2026-10-02

## Runtime
- `index.html` -> `style_v57.css` + `app_v57.js`
- 157 named functions, 157 unique
- 36 inline handler references, all resolved
- Navigation coverage: Home / Analytics / Matches / Maps / Teams / Records / Settings
- No legacy `app.js` / `style.css` runtime load

## Data integrity
- 14 players total
- 13 active players
- 1 archived player: `player_new`
- 66 maps, IDs `map_001..map_066`
- 32 matches, unique IDs
- 10 map types
- Every map references an existing match
- Every map has player stats
- Every stat row references an existing player
- Frozen totals verified for Romanchestr and FLAFF1X

## Player Center
- Ranking is aggregate K/D descending
- Tie-breakers: K-D descending, then Player Index, then display name
- Explicit `#` place column restored
- Current expected active order:
  1. gletcher — 1.45
  2. DaDa_VoVa — 1.22
  3. FLAFF1X — 1.12
  4. donater — 1.10
  5. Romanchestr — 1.07
  6. vorenxy — 1.05
  7. подушка пердушка — 1.05
  8. Patr1k — 0.92
  9. bigchungus — 0.88
  10. gamiersanek — 0.88
  11. эгоист — 0.87
  12. пяточки — 0.84
  13. дядя — 0.84

## Home / Hero
- Working remote Nuke DOM image preserved
- CSS background override disabled for final Hero
- Hero overlay and counters preserved
- stray Hero note hidden
- no hard-coded 61-map counter
- map sorting logic preserved

## Performance improvements
1. Deferred all runtime scripts so HTML parsing is not blocked by the Supabase SDK.
2. Added `preconnect` / `dns-prefetch` for CDN, Supabase and the Hero image host.
3. Preloaded the Hero Nuke image with high fetch priority.
4. Added high fetch priority to the actual Hero `<img>`.
5. Cloud startup now loads authoritative remote state and admin status in parallel instead of sequentially.

These are intentionally small changes; data, maps and feature logic were not rewritten.

## Verification
- `STAGE_3_4_AUDIT_V58_3.py`: 34/34 PASS
- `FULL_FUNCTION_AUDIT.py`: PASS
- `QA_CHECK.py`: PASS
- `RELEASE_GATE_V57.py`: PASS
- `DATA_RECONCILIATION_QA_V58_5.js`: PASS
- `V58_3_HOME_STABILITY_QA.js`: PASS
- `LEGACY_CLEANUP_QA_20260930.js`: PASS
- JS syntax: PASS for current runtime/support scripts
- Python syntax: PASS for current audit/gate scripts

## Important historical QA note
Old V56/V57 QA scripts still contain historical expectations of 61 active maps. Those scripts are not current-data gates and were not used as release blockers. Current gates validate the present 66-map snapshot.
