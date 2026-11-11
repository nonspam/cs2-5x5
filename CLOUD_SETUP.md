# CS2 Analytics — cloud setup (rework)

## Production Supabase
- Project: `agetaoekkbhbmfmhxseu`
- Region: `eu-west-1`
- State row: `public.cs2_app_state` id `1`
- Current state version after historical-team migration: `14`

## Browser write path
Browser -> JWT session -> `cs2-admin` Edge Function -> server-side `commit_cs2_state` RPC.

The browser does **not** write `cs2_app_state` directly.

The `is_cs2_admin()` SECURITY DEFINER helper is no longer executable by `authenticated`; admin authorization is checked inside the Edge Function against `app_admins`.

## Historical team reconstruction
All 33 matches now carry a deterministic `team_a` / `team_b` reconstruction where known. Historical partial rosters are allowed:
- maximum 5 players per side;
- no duplicate player across sides;
- unknown/missing players are not invented.

7 of 33 historical matches currently resolve to full 5×5; the rest retain partial historical rosters because some players were never present in the curated player database.

## Map win rate / team probability
Each player exposes map-specific:
- maps played;
- wins/losses;
- raw WR;
- smoothed WR `(wins + 1) / (played + 2)`;
- map K/D.

Team probability is shown only after both sides contain exactly five players. Team map power blends map history with Player Index, with confidence increasing with map sample size, then converts the power delta to complementary A/B probabilities with a logistic curve.

## Remaining Supabase dashboard warning
Security advisors currently report only:
- RLS-enabled private tables without policies (INFO; intentionally inaccessible to anon/authenticated);
- leaked-password protection disabled in Auth (WARN; this is a Supabase Auth dashboard setting, not a browser-code issue).
