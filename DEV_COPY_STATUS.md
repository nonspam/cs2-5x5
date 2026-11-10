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
- Verified the DEV row is readable under the `anon` database role and returns the same counts above.
- The historical audit array was copied inside `cs2_app_state`; separate operational tables `cs2_audit_log` and `cs2_operations` start empty and will record new DEV operations.
- DEV Auth currently has 0 users, `app_admins` has 0 entries, and `app_login_aliases` has 0 entries. Public site viewing works; admin login/actions cannot be smoke-tested until a separate DEV admin is created. Do not copy production credentials.
- Supabase security advisor reports RLS enabled with no policies on the four admin/operational tables. This is intentional deny-by-default isolation; no public access is granted. It also flags the two SECURITY DEFINER RPCs as callable by authenticated users; both functions contain their own admin authorization check.
- The DEV database is separate. Do not apply migrations or data changes to production.

## Important migration warning
The legacy root file `supabase_schema.sql` contains an old embedded data snapshot. Do not execute the entire file against a new project. Apply schema migrations only, and seed from a deliberate snapshot.

## Remaining verification
1. Verify a fresh Cloudflare deployment after the latest DEV migration commit.
2. Run browser smoke checks on home, analytics, players, matches, maps, teams, and records. User has confirmed the site opens; interactive section-by-section checks remain.
3. Create a separate DEV Auth user and add only that email to DEV `app_admins`; then test admin login and write flows using a disposable test record. Never copy production passwords or service-role secrets.
4. Test add/edit/archive/restore/delete flows on DEV only, checking version conflicts and audit logging.
5. Continue FACEIT-style development only on `faceit-dev`.
