# CS2 Analytics — isolated DEV copy

This branch is a separate development copy. Production is the `main` branch and must not be changed during DEV work.

## Isolation
- Git branch: `faceit-dev`
- Production branch: `main` (GitHub Pages; do not change)
- DEV frontend: Cloudflare Worker/service `cs2-analytics-dev`
- DEV URL: https://cs2-analytics-dev.z2z2djt852.workers.dev/
- Supabase DEV project: `cs2-faceit-dev`
- DEV project ref: `nwujudniysolpevbtggd`
- DEV URL: `https://nwujudniysolpevbtggd.supabase.co`
- `supabase-config.js` on this branch points only to the DEV project.
- The production project ref `agetaoekkbhbmfmhxseu` must never be placed in this branch's runtime config.
- No production tables, users, credentials, or data are modified by DEV work.

## Current copy status (2026-11-10)
- Frontend source copied from the existing project branch; DEV branding is enabled in `index.html`.
- User confirmed the DEV site loads successfully after the missing SELECT grant was fixed.
- Cloudflare Worker is connected to GitHub branch `faceit-dev`; Git-based deployment was verified successful.
- `cs2-admin` Edge Function is active in the DEV project. It validates its own bearer token and checks the admin allow-list even though platform JWT verification is disabled to permit the public sign-in endpoint.
- DEV schema includes `cs2_app_state`, `app_admins`, `app_login_aliases`, `cs2_audit_log`, and `cs2_operations`.
- `public.cs2_app_state` has RLS enabled and one SELECT policy for `anon` and `authenticated`. Direct INSERT/UPDATE is not granted to either role; writes go through the guarded admin RPC.
- Fixed missing Data API SELECT grants on `public.cs2_app_state` for `anon` and `authenticated`. Migration: `supabase/migrations/20261110_dev_cs2_state_read_grants.sql`.
- Added indexes for foreign-key lookup paths. Migration: `supabase/migrations/20261110_dev_foreign_key_indexes.sql`.
- Copied the latest read-only production state snapshot into DEV. DEV contains 14 players, 42 matches, 93 maps, 41 aliases, 137 audit entries, version 155 (snapshot timestamp: 2026-11-09 15:43:04 UTC).
- Snapshot passed the frontend's shared base validation before import; all 93 maps link to a match, match/map order is consistent, and aliases reference known players.
- Live DEV state integrity recheck (after repair): state version 156; 14 players, 42 matches, 93 maps, 41 aliases; zero orphan/unlisted maps, invalid IDs, broken aliases, invalid map order, invalid K/D/A, invalid team references, duplicate stat rows, malformed scores, or format/map-count mismatches.
- Three legacy player records had `is_active=false` but stale `status=active`. Their `status` values were synchronized to `archived` without changing `is_active`, player IDs, aliases, frozen totals, match history, maps, or stats. The repair was recorded in the embedded audit, `cs2_operations`, and `cs2_audit_log`; state version advanced from 155 to 156.
- Additional DEV data-contract checks against the stricter Edge Function validator now return zero violations, including player lifecycle fields, match source/provenance, map score/team shape, guest stat names, and series aggregate shape.
- GitHub quality gate on the current DEV source passed: 67/67 Node regression tests, including new DEV isolation, admin authorization, versioned commit, and browser/Edge archive-parity contract checks. Latest run: https://github.com/nonspam/cs2-5x5/actions/runs/42865265193.
- Existing offline Chromium smoke report: 16/16 checks passed across desktop and mobile. This is bundled-data/offline UI only; it does not test Supabase network, current cloud data, or admin writes.
- The `commit_cs2_state` RPC was tested in a rollback-only DEV transaction: admin authorization accepted, stale expected version correctly raised a version conflict, current expected version returned a successful row, and both probes were rolled back with no persisted probe operations or audit entries.
- Hardened player archival: historical map/series K/D/A rows are retained as unlinked guest rows; legacy match records that reference a player without a recoverable team assignment are rejected before any mutation.
- DEV `cs2-admin` Edge Function redeployed successfully as version 2 with the same `verify_jwt=false` setting; explicit bearer-token and email allow-list checks remain in the function.
- The allow-list entry is DEV-only. Production `main` and production Supabase were not written to.
- Verified the DEV row is readable under the `anon` database role and returns the same counts above.
- The historical audit array was copied inside `cs2_app_state`; separate operational tables `cs2_audit_log` and `cs2_operations` start empty and will record new DEV operations.
- DEV Auth has one confirmed user. Exactly one matching email is allow-listed in DEV `app_admins`; the email itself is kept out of this public repository. `app_login_aliases` remains empty because direct email login is supported. The user's password was not changed or copied from production.
- Supabase security advisor reports RLS enabled with no policies on the four admin/operational tables. This is intentional deny-by-default isolation; no public access is granted. It also flags the two SECURITY DEFINER RPCs as callable by authenticated users; both functions contain their own admin authorization check.
- The DEV database is separate. Do not apply migrations or data changes to production.

## Important migration warning
The legacy root file `supabase_schema.sql` contains an old embedded data snapshot. Do not execute the entire file against a new project. Apply schema migrations only, and seed from a deliberate snapshot.

## Remaining verification
1. Verify a fresh Cloudflare deployment after the latest DEV migration commit.
2. Complete one authenticated end-to-end UI write test using a disposable DEV-only test record. The database RPC authorization, optimistic version conflict, rollback, and audit behavior have been checked separately; the Edge Function/browser round-trip itself has not yet been exercised by automation.
3. If a UI defect appears, fix it on `faceit-dev` and rerun the quality gate. Do not use production data for test writes.
4. Continue FACEIT-style development only on `faceit-dev`.
