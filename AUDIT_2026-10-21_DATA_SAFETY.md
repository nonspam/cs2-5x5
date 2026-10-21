# Data safety audit — 2026-10-21

Baseline: `9ca06ae19071564a1e6c6f14e4cce4c27e54b1bb`. Work is isolated on `audit/2026-10-21-data-safety`; no production database writes.

## Confirmed findings

1. **Backup export used BASE instead of DB** in `app_v57.js`. In cloud mode, `BASE` is updated during remote load but is not updated by subsequent successful local edits. Export could therefore omit recent matches until another remote refresh. Local mode could similarly export a stale base plus operations. Fixed in this branch by exporting the validated current `DB` snapshot, with no operation replay.
2. **Two distinct bundled datasets**: `data/*.json` has 14 players, 32 series and 66 maps; `data_embedded.js` has 14 players, 37 series and 80 maps. The startup code prefers embedded data. The older JSON dataset should not be treated as a current backup or used to overwrite production.
3. **Validation and persistence are split across browser, Edge Function and SQL**. `supabase_schema.sql` grants `commit_cs2_state` only to `service_role`, while the browser adapter calls an RPC. Verify the deployed migrations and the exact RPC/Edge Function path before any security changes. Do not expose a service role key in browser code.
4. **Test coverage is largely release-shape and fixture-specific**: `DATA_RECONCILIATION_QA_V58_5.js` asserts fixed 32/66 counts and cannot verify a changing live cloud database.
5. **Main app is monolithic**: `app_v57.js` has roughly 929 lines with extensive inline handlers and HTML string rendering. Prefer incremental extraction and behavioral tests, not a full rewrite.

## Changes made

- Backup export now validates and serializes the effective in-memory `DB` state, marks the snapshot source, and does not include operations to replay. This is a code-level fix; browser end-to-end testing remains required.

## Before production deployment

- Connect Supabase read-only; compare live version, table contents, roles, grants, policies and actual RPC implementation.
- Confirm that admin writes are authenticated, authorized and transactional.
- Test backup roundtrip on a copy of the dataset, not live state.
- Test concurrent admin edits, offline failures, archive/restore, guest rosters, and stat reconciliation.
- Verify new match creation on staging, including a full reload and an independent browser session.
- Never automatically overwrite or reconstruct historical records without an authoritative source.
