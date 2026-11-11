# FACEIT V2 — metrics consistency audit

Date: 2026-11-12  
Branch: `faceit-dev`  
Scope: Player Index, career totals, profile results, map results, record leaderboards and ELO event granularity.

## 1. Confirmed runtime regression in Records

The current `records(v)` route referenced four helpers that were absent from the runtime source:

- `bo1RecordRows()`
- `recordAvgRows()`
- `recordWinRate()`
- `recordWinRows()`

The helpers existed in the earlier working implementation (`c5cb7cab14a40e3aeeb6ab74d323a2b2e422cffe`) but were lost in later runtime restoration. This meant the Records screen could fail at render time when it evaluated the BO1, average and win-rate sections.

Restored the missing helpers and added static/regression tests that confirm every helper used by the route exists. BO1 now filters detailed rows to BO1 matches again.

## 2. Corrected the average-per-map denominator for series records

A series leaderboard row represents more than one map. The earlier average helper counted each BO3/BO5 row as one map, which could inflate average kills per map.

The restored helper now weights each row by the number of maps represented:
- a detailed map row represents one map;
- a series row carries the count of maps for which this player has statistics;
- BO3/BO5 K/D/A totals are divided by that per-player map count;
- series with substitutes do not automatically divide a player's stats by maps in which they have no stat row.

This does not change career aggregation, which already uses the detailed/compact map count from the canonical career aggregation helper.

## 3. Winrate denominator: three distinct grains

The current code intentionally calculates different measures at different levels:

| Surface | Unit counted | Result source |
|---|---|---|
| Player profile | Series/matches | `careerSeriesResultsForPlayer()` |
| Records winrate leaderboard | Maps | `careerResultsForPlayer()` |
| Map statistics | Games on one map | `mapPlayerStats()` |
| ELO V3 | Eligible series events | One update per series |

Profile W/L and profile winrate are match/series-level values. The Records page winrate is map-level and displays the number of maps in its sample. ELO uses one event per eligible BO1/BO3/BO5 series. These percentages should not be forcibly equal because their denominators are different.

A regression test explicitly protects the profile summary's series-level denominator and separately checks map-level winrate filters. This prevents a future UI merge from silently changing the metric's meaning.

## 4. Current calculation contracts

- Career K/D is `sum(kills) / sum(deaths)`, not an average of per-map K/D ratios.
- Career +/− is `sum(kills) - sum(deaths)`.
- Career per-map averages divide totals by the count of maps represented.
- Player Index remains one canonical calculation via `indexBreakdown()`; the public `index()` wrapper delegates to it.
- ELO continues to update once per eligible series, not once per map.
- Current ELO roster eligibility, 1:1 BO3 interpretation, and historical ordering are unchanged; these remain owner-decision items.

## 5. Verification

Regression tests cover:
- helper presence for the Records route;
- average-per-map weighting across detailed and series rows;
- map-level winrate denominator and BO1/BO3/BO5/map/latest-match filters;
- profile series-level W/L/D and winrate;
- existing career aggregation and Player Index invariants.

The final GitHub Actions quality gate [run 43115948403](https://github.com/nonspam/cs2-5x5/actions/runs/43115948403) passed: **134 tests passed / 0 failed**, including profile-series winrate granularity.

The DEV Cloudflare Worker build for the Records helper restoration completed successfully:
- service: `cs2-analytics-dev`;
- build: `f7a20c78-347d-4bbc-ab55-dfccb4ea1511`;
- [Build details](https://dash.cloudflare.com/c597460df02e0098fa5cbe1d065127b2/workers/services/view/cs2-analytics-dev/production/builds/f7a20c78-347d-4bbc-ab55-dfccb4ea1511).

No database writes, migrations, schema changes, production deployments, or visual CSS changes were made in this batch. Browser interaction QA is still outstanding.
