# V58.3 — Home data synchronization & Last Game table stability

## Scope

This release is based on the current V58 micro-polish build. No rollback of the V58 map-card work was made.

## Fixed

1. **Last Game K/D cell overflow**
   - The home table now uses a fixed layout with explicit numeric-column widths.
   - K/D is centered, tabular, and constrained to its own cell.
   - Player names use ellipsis instead of pushing numeric columns outside the table.

2. **Home-page stale snapshot flash**
   - Root cause: cloud mode painted the embedded release snapshot first, then asynchronously replaced it with the live server state.
   - The embedded snapshot in this V58 build contains an older active-map count (61), so the home page could visibly render stale scores/statistics before the live state arrived.
   - Cloud mode now waits for the authoritative remote state before the first home render. If remote loading fails, the validated embedded snapshot remains the safe fallback.

3. **Hard-coded home counters**
   - Hero counters are now derived from the currently loaded active database instead of fixed values.
   - Map count excludes archived maps; player count uses active players; map-type count is calculated from active maps.

4. **Out-of-order refresh protection**
   - Server refreshes now carry a monotonically increasing sequence token.
   - A slower older response cannot overwrite a newer refresh result.

## Verification

- `node --check app_v57.js` — PASS
- `node V58_3_HOME_STABILITY_QA.js` — PASS
- ZIP contents checked after packaging.

## Browser note

No real browser E2E runner is installed in this environment, so visual browser verification was not claimed. The changes were verified statically and through JavaScript syntax/consistency checks.
