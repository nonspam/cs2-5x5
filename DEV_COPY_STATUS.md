# CS2 Analytics — isolated DEV copy

This branch is a separate development copy. Production is the `main` branch and must not be changed during DEV work.

## Isolation
- Git branch: `faceit-dev`
- Supabase DEV project: `cs2-faceit-dev`
- DEV project ref: `nwujudniysolpevbtggd`
- DEV URL: `https://nwujudniysolpevbtggd.supabase.co`
- `supabase-config.js` on this branch points only to the DEV project.
- The production project ref `agetaoekkbhbmfmhxseu` must never be placed in this branch's runtime config.
- No production tables, users, credentials, or data are modified by DEV work.

## Current copy status (2026-11-10)
- Frontend source copied from the existing project branch.
- DEV branding added in `index.html`.
- Separate DEV Supabase schema created.
- `cs2-admin` Edge Function deployed to the DEV project.
- RPC functions aligned with the live production authorization logic.
- DEV database seeded from the repository's embedded snapshot: 14 players, 37 matches, 80 maps, 41 aliases.
- Production was checked read-only and currently contains 14 players, 42 matches, 93 maps, version 155. The embedded snapshot is older; the final 5 matches and 13 maps, plus the latest edits to existing data, have NOT yet been synchronized into DEV.
- DEV `app_admins` is intentionally empty. Create a separate DEV Auth admin before testing administrative writes. Never copy production passwords or service-role secrets.
- No hosted preview URL has been configured yet. GitHub Pages currently serves production from `main`; do not switch its source to this branch.

## Important migration warning
The legacy root file `supabase_schema.sql` contains an old embedded data snapshot. Do not execute the entire file against a new project. Apply schema migrations only, and seed from a deliberate snapshot.

## Next steps
1. Finish copying and validating the latest production state into DEV without writing to production.
2. Configure a free, separate static preview host for this branch (for example Cloudflare Pages). Do not change the existing GitHub Pages deployment.
3. Create a separate DEV Auth admin account.
4. Run browser smoke tests on DEV and compare key pages against production.
5. Only after the copy is verified, begin FACEIT-style redesign work on this branch.
