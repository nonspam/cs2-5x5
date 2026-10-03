# V28 Release Report — Visual Polish / Series Winrate / AVG

Base: V27 MICRO FIXES.

## Implemented

- Player Profile win/loss/winrate is now calculated per **series**. A BO3 contributes one result using its series score; when a series score is unavailable, the implementation falls back to the player's map results for that series.
- Profile section headers are smaller, uppercase, and padded from the rounded section edge. Helper text can wrap instead of being forced onto one line; mobile uses a stacked layout.
- Records AVG is fixed. The previous career AVG block was empty because its career rows did not expose the `maps` field used by the block filter. Career AVG is now total kills divided by total played maps and sorted descending.
- Matches tab rendering now precomputes match/series and map ranks instead of repeatedly sorting/searching the full dataset for every row.

## Exact career AVG from the current 66-map active dataset

| Rank | Player | Kills | Maps | AVG K/map |
|---:|---|---:|---:|---:|
| 1 | gletcher | 1253 | 66 | 18.98 |
| 2 | Romanchestr | 452 | 25 | 18.08 |
| 3 | DaDa_VoVa | 428 | 24 | 17.83 |
| 4 | donater | 1143 | 66 | 17.32 |
| 5 | vorenxy | 747 | 47 | 15.89 |
| 6 | подушка пердушка | 771 | 50 | 15.42 |
| 7 | FLAFF1X | 104 | 7 | 14.86 |
| 8 | bigchungus | 470 | 32 | 14.69 |
| 9 | эгоист | 905 | 63 | 14.37 |
| 10 | Patr1k | 946 | 66 | 14.33 |
| 11 | пяточки | 812 | 59 | 13.76 |
| 12 | дядя | 378 | 28 | 13.50 |
| 13 | gamiersanek | 358 | 27 | 13.26 |

## QA

- `node --check app_v57.js`: PASS
- `QA_CHECK.py`: PASS
- Base runtime files remain `app_v57.js`, `style_v57.css`, `index.html`.
- No Supabase data mutation was made by this V28 UI patch.
- Current live Supabase state remains version 36 from the prior map-team reconciliation.
