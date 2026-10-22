# Data model and metric contract

This document records invariants enforced by the current source. It intentionally does not invent undocumented Player Index or team-probability formulas; those must be extracted from the current implementation in a later metrics-audit stage.

## Canonical entities

### Player
- Identified by unique `player_id`.
- Display names and aliases resolve a raw name to a catalog player where a mapping exists.
- A historical stat row may contain a `raw_name` without `player_id`; that row is a guest/unresolved identity, not a reason to fabricate a catalog player.
- A player referenced by match teams, map stats, legacy `player_ids`, or series aggregate stats must not be deleted as if unreferenced.

### Match / series
- Identified by unique `match_id`.
- Has a supported format: `BO1`, `BO3` or `BO5`.
- Has an ordered `map_ids` array. Every listed map must belong to that match, each map can belong to only one match, and the corresponding `map_index` is 1-based and contiguous.
- Incomplete team rosters are valid. The validator permits up to five players per side and prevents duplicate player assignment; it does not require a complete 5v5 roster.
- `archived: true` means excluded from active derived statistics. Archiving is not permanent deletion.
- Series aggregate stats, when present, must contain ten rows under the current validator. Compact aggregate series must not be represented as invented per-map stats.

### Map
- Identified by unique `map_id` and references exactly one existing `match_id`.
- Has a positive integer `map_index`, aligned to the parent match's ordered `map_ids`.
- A detailed map has `stats_available: true` and player-stat rows.
- A compact map has `stats_available: false` and no player-stat rows.
- Map player-stat rows must have finite, non-negative K/D/A values; duplicate identities on one map are rejected.
- Map deletion must update the parent `map_ids` and reindex remaining maps, while respecting the minimum map count for the series format.

## Lifecycle expectations

| Operation | Expected behavior |
|---|---|
| Create match + maps | Validate and persist as one coherent state change |
| Edit match/map | Preserve all unrelated rows and valid relationships |
| Archive match | Exclude it and its maps from active-derived statistics; preserve data for restore |
| Restore match | Return the match and its maps to active state consistently |
| Permanently delete match | Remove the match and its associated maps only; unrelated matches remain untouched |
| Delete map | Refuse if the format minimum would be violated; otherwise update parent ordering |
| Delete referenced player | Refuse rather than break historical identities |
| Cloud commit failure | Do not report success; preserve or restore local state according to the existing transaction path |

## Metrics contract

- **K, D, A:** totals derived from available stat rows; missing values must not be silently replaced with fabricated rows.
- **K/D:** kills divided by deaths, with explicit handling for zero deaths. The exact current helper is the source of truth and must be tested before it is refactored.
- **Series result:** derives from the series outcome/score fields; do not infer a win solely from a player's positive K/D.
- **Player Index, Impact, Stability, Form, map win rate and team probability:** the exact production formula must be read from the current implementation before changing it. Each future definition should document the source function, inputs, weights, sample-size handling, and missing-data behavior.

## Current validator

`validation.js` is the shared state validator used by the browser and Node tests. Existing tests in `tests/validation.test.cjs` cover supported formats, incomplete rosters, guest rows, duplicate stat rows, orphan maps, aliases, invalid K/D/A, map ordering, cross-match map reuse, duplicate players and malformed aggregate rows.

These are source-level invariants, not a guarantee that every live cloud state or UI flow has been tested. Production reconciliation must remain read-only until discrepancies are understood and a backup/rollback plan exists.

## Player Index — current implementation (source: `app_v57.js`)

The current implementation combines six normalized components:

- 35% — K/D score: `clamp((K/D - 0.5) × 100, 0, 100)`
- 25% — kill/death difference score per counted map: `clamp(((K-D)/max(1,maps) + 5) / 10 × 100, 0, 100)`
- 15% — Impact, currently derived from K-D difference per map and assists per map
- 10% — Stability, based on the share of detailed maps crossing K/D thresholds 1.0, 1.5, 2.0 and 3.0 with weights 40%, 30%, 20% and 10%
- 10% — volume, derived from kills per counted map
- 5% — current form, derived from K-D difference in the recent detailed-map window

These weights total 100%. Important limitations: the aggregate can include compact BO3 series totals, while stability/form use detailed map rows; therefore the components do not all have identical evidence coverage. Zero deaths are represented as K/D 0 in aggregate helpers, while stability threshold checks explicitly require deaths > 0. Do not alter these semantics during refactoring without an intentional metric-version change and comparison of historical player rankings.

The exact helper functions remain the implementation source of truth. The metric regression tests check aggregate behavior, form windows and the presence of the current weights. Future work should add golden fixtures for several real-world edge cases and verify indexBreakdown parity with index before extracting these functions from the monolith.
