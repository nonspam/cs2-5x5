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

The exact helper functions remain the implementation source of truth. The public `index()` now delegates to `indexBreakdown(...).total`, removing the duplicated formula. Regression tests cover aggregate behavior, form windows, current weights and that single-source delegation. Before extracting calculation code from the monolith, add golden fixtures for compact BO3 coverage, zero-death rows, and players with no detailed map history.


## Read-only live-state integrity snapshot

Audited the single `public.cs2_app_state` row (`id = 1`) on 2026-10-22. The audit was read-only and did not modify production data.

- State version: 106.
- Catalog: 14 players, 37 matches/series, 80 maps; all 37 matches and 80 maps are active in this snapshot.
- All 80 map IDs are linked exactly once from match `map_ids`; no missing map references, orphan maps, or map/match ID mismatches were found.
- 800 map-stat rows were present. No duplicate non-empty `player_id` values within a map and no missing K/D/A numeric fields were found.
- 95 stat rows have no `player_id` and 95 roster names do not resolve directly to catalog IDs. The rows are preserved as unresolved/guest identities; this audit intentionally did not create profiles or guess identity mappings.

This is a point-in-time snapshot, not a permanent guarantee. Re-run the same checks after any import, bulk repair, player merge, or match edit. The catalog-ID check on roster names is a warning signal rather than proof of corruption: historical display names and guest names may legitimately differ from canonical IDs.


## Player Index regression fixtures (2026-10-22)

Added `tests/player-index-golden.test.cjs` against the production `indexBreakdown()` implementation. The golden fixture locks the current result at 89.0625 for a two-map sample with K/D 1.50, +10 K-D difference, 83.75 Impact, 65 Stability, 50 volume score, and 100 form score. Additional cases protect the empty-history state, chronological last-ten form window, and Stability's explicit exclusion of zero-death rows from K/D threshold evidence. These tests preserve current semantics; they do not authorize changing weights or claim that compact aggregate coverage has been fully tested.
