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
