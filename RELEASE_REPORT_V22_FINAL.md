# CS2 Analytics V22 — Release Candidate Final Check

Дата: 2026-10-03

## Статус

**RELEASE CANDIDATE — READY FOR PUBLICATION**

Runtime/data were not changed during this final audit. The V22 runtime snapshot remains intact; the gate, report and checksum files are audit artifacts.

## Runtime checks

- Node syntax: `app_v57.js`, `supabase_adapter.js`, `validation.js`, `data_embedded.js` — PASS.
- 181 function declarations; inline handlers resolve — PASS.
- Runtime wiring is exactly `app_v57.js` + `style_v57.css`; stale `app.js` / `style.css` are not loaded — PASS.
- Home Train Hero, performance wiring, legacy-storage migration — PASS.
- Admin player archive/permanent-delete guard — PASS.
- New match wizard: BO1/BO3/BO5, 5v5, duplicate-player protection, map count/series-score validation, three-step review/commit — PASS by source/core checks.
- V22 empty team slot action label `Добавить игрока` is present.
- Player profile, chart deselect/reset, map repeat-toggle, backup export/import — PASS by source/core checks.

## Local data checks

- 14 players total, 13 active, 1 archived.
- 66 active maps.
- 32 active matches.
- 10 map types.
- Unique player/map/match IDs.
- All map→match links valid.
- All stat rows point to known players.
- 66 active maps contain detailed stats.
- 41 aliases point to known players.
- Romanchestr frozen totals: 25 maps / 452 K / 421 D / 141 A.
- FLAFF1X frozen totals: 7 maps / 104 K / 93 D / 26 A.
- Player Center K/D order matches the frozen expected order.

## Live Supabase checks

Read-only production checks were performed against project `agetaoekkbhbmfmhxseu`:

- `cs2_app_state` row 1: version 34.
- Cloud state: 13 active players / 66 maps / 32 matches / 41 aliases.
- 13 unique player IDs, 66 unique map IDs, 32 unique match IDs.
- 66/66 map→match links valid.
- 573 stat rows; all 573 have numeric K/D/A; no stat row references a missing player.
- Romanchestr: 25 / 452 / 421 / 141.
- FLAFF1X: 7 / 104 / 93 / 26.
- Production security/performance advisors were reviewed.

The cloud count is 13 players because the archived `player_new` record is not present in the active cloud state; the local release dataset intentionally retains the archived record for historical/archive behavior.

## Server smoke test

The bundled shared server was started on an isolated test port and returned:

- `/api/health` → HTTP 200 / `ok:true`.
- `/api/state` → 14 players / 66 maps / 32 matches.
- `/` → HTTP 200.

## Findings that are NOT runtime defects

Several older QA scripts in the repository are historical and intentionally target older snapshots (for example V57 expects 61 maps/Nuke, while V22 has 66 maps/Train). Those old scripts were not used as the V22 release gate. `RELEASE_GATE_V22.py` is the authoritative final gate for this snapshot.

Two older team QA scripts also encode historical expectations for partial rosters. The project intentionally preserves incomplete historical rosters; current runtime validation accepts partial historical team data and requires exact 5v5 only where the team-probability calculation is used.

## Supabase advisor notes

Supabase currently reports WARN/INFO items around SECURITY DEFINER RPC execution, RLS-enabled internal tables without policies, leaked-password protection being disabled, and one unindexed foreign key. These are database/security-hardening observations, not evidence of a runtime failure. The current auth design intentionally uses protected SECURITY DEFINER RPCs for admin checks/commits and a public username-resolution RPC for the login flow. No database mutation was made during this release check.

## Final integrity lock

See `RELEASE_LOCK_SHA256_V22.txt` for hashes of the release-critical runtime/data files.
