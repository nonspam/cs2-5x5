# FACEIT V2 — guest-series aggregate and stat-identity validation

Date: 2026-11-12  
Branch: `faceit-dev`  
Environment: DEV Supabase `nwujudniysolpevbtggd`  
Scope: frontend/Edge validation and read-only DEV data verification.

## Confirmed defect: a guest without stats could block a match save

The new-series wizard intentionally collects map K/D/A only for non-guest participants. When one of ten roster slots is a guest with no stats, `commitNewGame()` builds `series_aggregate_stats` from the nine registered players who have rows.

The three validation layers were inconsistent:

- `app_v57.js` allowed partial `local_series` aggregates and still requires ten rows for legacy `compact_bo3`.
- Supabase Edge validation allowed aggregate arrays of up to ten rows.
- Shared/browser `validation.js` incorrectly required every non-empty series aggregate to contain exactly ten rows.

The cloud adapter calls the shared validator before it sends a commit. As a result, a legitimate 9-row local series could fail client-side before reaching the Edge Function.

## New canonical contract

Both the shared/browser validator and the Edge Function now enforce the same rules:

1. `series_aggregate_stats` may contain 0–10 rows for ordinary series. This supports guests who have no K/D/A row.
2. `compact_bo3` still requires exactly ten aggregate rows.
3. More than ten aggregate rows are rejected.
4. When an aggregate is present and every child map is marked `stats_available=true`, each player's/guest's aggregate K/D/A must equal the sum of that identity's rows across the maps.
5. If one or more maps lack detailed stats, aggregate parity is not inferred. The validator does not fabricate missing map data.
6. Player identity is canonicalized through `player_id`, normalized display name, player aliases, and the global alias map. If a raw name maps uniquely to a registered player, it resolves to the same identity key.
7. Duplicate rows are rejected even if one row uses the player's ID and another uses that player's raw nickname/alias. Ambiguous names remain raw guest identities rather than being guessed.

The runtime's own `validateBase()` keeps the compact-BO3 ten-row requirement; the cloud adapter's shared validator performs the full guest-row, alias-identity and aggregate-parity checks before a commit.

## Regression coverage

Added tests for:

- 9 registered players plus one guest without a stats row;
- rejection of >10 aggregate rows;
- compact BO3 still requiring ten rows;
- aggregate K/D/A mismatch against fully detailed map rows;
- partially detailed series skipping parity enforcement;
- resolving a raw series aggregate name to a unique player alias;
- duplicate map rows with the same player represented by ID and raw alias;
- duplicate series aggregate rows with the same player represented by ID and raw alias.

GitHub Actions quality gate: [run 43112544019](https://github.com/nonspam/cs2-5x5/actions/runs/43112544019) — **130 passed / 0 failed**.

## Read-only check of the current DEV dataset

DEV `cs2_app_state` was read at version **156** (`2026-11-10 17:31:13 UTC`). No rows were written.

Current snapshot:
- 14 players;
- 42 series;
- 93 maps;
- 11 series contain `series_aggregate_stats`.

All 11 aggregate-bearing series were compared against their fully detailed map rows:
- 11/11 series reconciled;
- 0 mismatched player rows;
- 10/10 identities reconciled per series.

A separate identity-aware duplicate scan across map and series statistics returned no duplicate player identities. The dataset currently contains no `compact_bo3` source rows; the compact rule remains covered by automated tests.

## DEV Edge Function deployment

Updated the DEV `cs2-admin` Edge Function to version **4**. The deployed `validation.js` was fetched back and compared with the exact file on `faceit-dev`; the contents match.

- Function: `cs2-admin`
- Project: `nwujudniysolpevbtggd` (DEV only)
- Version: **4 ACTIVE**
- `verify_jwt=false` preserved; the function continues to validate the bearer token and admin allow-list itself.
- No SQL, table/schema, row, migration, policy or grant changes were performed.
- Production was not touched.

## Still open

- Browser QA for the add-series wizard and guest stats scenarios.
- End-to-end save through the deployed DEV Edge Function using the designated DEV admin test account. The function source and automated validators are verified, but no live data write was attempted.
- The approved visual implementation remains owner-directed; no visual CSS changes were part of this batch.
