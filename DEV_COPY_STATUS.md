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
- Cloudflare Worker is connected to GitHub branch `faceit-dev`; Git-based deployment was verified successful.
- `cs2-admin` Edge Function is active in the DEV project.
- DEV schema is present, including `cs2_app_state`, `app_admins`, `app_login_aliases`, `cs2_audit_log`, and `cs2_operations`.
- Fixed missing Data API SELECT grants on `public.cs2_app_state` for `anon` and `authenticated`. RLS remains enabled and the existing public SELECT policy remains active. Migration: `supabase/migrations/20261110_dev_cs2_state_read_grants.sql`.
- Copied the latest read-only production state snapshot into DEV. DEV now contains 14 players, 42 matches, 93 maps, 41 aliases, 137 audit entries, version 155 (snapshot timestamp: 2026-11-09 15:43:04 UTC).
- Snapshot passed the current browser state validation before import.
- Verified the DEV row is readable under the `anon` database role and returns the same counts above.
- DEV `app_admins` remains intentionally separate; create a separate DEV Auth admin before testing administrative writes. Never copy production passwords or service-role secrets.

## Important migration warning
The legacy root file `supabase_schema.sql` contains an old embedded data snapshot. Do not execute the entire file against a new project. Apply schema migrations only, and seed from a deliberate snapshot.

## Remaining verification
1. Confirm the latest Cloudflare deployment from `faceit-dev` includes the read-grant migration commit.
2. Open the DEV URL with a hard refresh and verify the app loads the cloud state.
3. Smoke-test read-only pages (home, players, maps, matches, records).
4. Set up a separate DEV Auth administrator and test admin actions only after sign-in is configured.
5. Continue FACEIT-style development only on `faceit-dev`.
