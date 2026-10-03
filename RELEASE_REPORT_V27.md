# CS2 Analytics — V27 Micro Fixes

Base: `CS2_ANALYTICS_V58_3_V26_PETER_FORTRESS_FAVICON.zip`

## Changes
- Unified the `CS2` wordmark so the `S` uses the exact same typography as `C` and `2`.
- Player Profile section headings changed to normal title case: `Карьерный итог`, `Форма`, `Карты`, `Последние серии`, `Последние подробные карты`, `Эры`.
- Reduced profile section-heading size/letter spacing and added breathing room above/below rounded profile blocks.
- Profile helper notes were shortened and made responsive so they no longer crowd the right edge.
- Selected-map photo atmosphere is explicitly disabled behind Map Lab/player metrics.
- Records layout/order is now exactly:
  - Row 1: Maximum kills / Best K/D / Best AVG
  - Row 2: Best K-D / Best assists / Top deaths
  - Row 3: Best Index / Best Impact / Best Winrate
- Career AVG is now calculated as total kills divided by all played detailed maps for the player (not just the career aggregate row treated as one map).
- Added map-level team assignments reconstructed from the historical match record and use them for profile/map winrate calculations.
- Player profile career W/L/Winrate now counts every played map with a known team side and score.

## Recalculated map-level results
- gletcher: 66 maps, 44 W / 22 L, 66.7%
- DaDa_VoVa: 24 maps, 14 W / 10 L, 58.3%
- donater: 66 maps, 44 W / 22 L, 66.7%
- подушка пердушка: 50 maps, 27 W / 23 L, 54.0%
- vorenxy: 47 maps, 26 W / 21 L, 55.3%
- Patr1k: 66 maps, 37 W / 29 L, 56.1%
- bigchungus: 32 maps, 21 W / 11 L, 65.6%
- gamiersanek: 27 maps, 18 W / 9 L, 66.7%
- эгоист: 63 maps, 23 W / 40 L, 36.5%
- пяточки: 59 maps, 22 W / 37 L, 37.3%
- дядя: 28 maps, 7 W / 21 L, 25.0%
- Romanchestr: 25 maps, 8 W / 17 L, 32.0%
- FLAFF1X: 7 maps, 2 W / 5 L, 28.6%

## Data safety
- Player/map/match K/D/A totals were not changed.
- Frozen totals for Romanchestr and FLAFF1X remain unchanged.
- `match_032` remains `nuke-dust2-mirage` with map order Nuke → Dust2 → Mirage.
- Cloud Supabase state advanced from version 35 to 36 only to add map-level team-side metadata; all 66 maps verified.

## QA
- `node --check app_v57.js` — PASS
- `QA_CHECK.py` — PASS
- 14 players / 13 active / 66 maps / 32 matches / 41 aliases — PASS
- All 66 maps have team-side metadata and every stat player belongs to exactly one recorded side — PASS
- Frozen totals preserved — PASS
- Cloud verification — PASS (version 36)
