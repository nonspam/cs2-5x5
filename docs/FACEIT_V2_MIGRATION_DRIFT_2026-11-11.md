# FACEIT V2 — DEV migration history and schema drift

Date: 2026-11-11  
Scope: compare Supabase DEV migration history, tracked SQL files on `faceit-dev`, and live catalog objects. Read-only investigation.

## Executive finding

The DEV database migration ledger and repository migration directory are not reproducible from one another yet. Do not run a new migration, reset the DEV database, or provision another environment from the current repository until this is reconciled.

No migrations, DDL, grants, policies, or database rows were changed during this investigation.

## Migration ledger in DEV

Supabase reports these 10 applied migration records:

| Version | Name |
|---|---|
| `20261110162956` | `clone_base_schema_20261110` |
| `20261110163244` | `enable_http_for_dev_snapshot_copy` |
| `20261110163447` | `remove_unused_http_extension` |
| `20261110163516` | `align_admin_rpc_with_production_20261110` |
| `20261110170727` | `dev_cs2_state_read_grants` |
| `20261110171519` | `dev_foreign_key_indexes` |
| `20261110174308` | `player_profiles_and_shared_media` |
| `20261110204350` | `player_account_invites_and_self_service_linking` |
| `20261110204818` | `validate_active_player_on_account_claim` |
| `20261110211414` | `move_player_account_helpers_to_private_schema` |

## SQL files currently tracked on `faceit-dev`

- `supabase/migrations/20261002_admin_commit_rpc.sql`
- `supabase/migrations/20261110_dev_clone_schema_alignment.sql`
- `supabase/migrations/20261110_dev_cs2_state_read_grants.sql`
- `supabase/migrations/20261110_dev_foreign_key_indexes.sql`
- `supabase/migrations/20261110204350_player_account_invites_and_self_service_linking.sql`
- `supabase/migrations/20261110204818_validate_active_player_on_account_claim.sql`
- `supabase/migrations/20261110211414_move_player_account_helpers_to_private_schema.sql`
- `supabase_schema.sql`

The first three DEV helper filenames use an 8-digit date prefix and do not match the 14-digit versions recorded in the database. There are no tracked SQL files for these four ledger entries:
- `20261110163244_enable_http_for_dev_snapshot_copy`
- `20261110163447_remove_unused_http_extension`
- `20261110174308_player_profiles_and_shared_media`
- `20261110162956_clone_base_schema_20261110` (the similarly named `20261110_dev_clone_schema_alignment.sql` is not an exact versioned match; its contents include table/function alignment SQL, but it is not a substitute for the original migration record).

The `20261110163516_align_admin_rpc_with_production_20261110` ledger entry also has no exact matching filename; some related RPC definitions are present in the 8-digit clone-alignment file, but equivalence of the complete applied migration has not been established.

The two exact later account-linking migrations are present and match their recorded version/name prefixes.

GitHub path history checks for the four absent 14-digit filenames returned no commits. They are not recoverable from the current branch's tracked path history.

## Live catalog object not represented in tracked SQL

The live DEV database contains `public.my_player_account`, but a scan of all eight tracked SQL files found no reference to this view or a CREATE VIEW statement.

Live definition:
```sql
SELECT player_id
FROM private.player_account_links
WHERE auth_user_id = (SELECT auth.uid());
```

Live properties:
- `security_invoker=true`;
- underlying `private.player_account_links` has RLS restricting SELECT to the current `auth.uid()`;
- view currently has broad `anon` and DML grants, already recorded in the [security audit](FACEIT_V2_SECURITY_AUDIT_2026-11-11.md).

The view is therefore a live schema object whose creation is not currently reproducible from the tracked migrations.

## Why this matters

1. A new DEV/staging environment cannot be reliably provisioned from the repository's migrations alone.
2. A future schema migration could conflict with untracked live objects or silently omit important Auth/profile functionality.
3. Migration version collisions or mismatched version prefixes can confuse Supabase migration history.
4. `supabase_schema.sql` contains an old embedded seed snapshot and is explicitly marked in its companion SQL comments as unsafe to run wholesale on DEV. Do not use it as a substitute for the missing migration history.

## Reconciliation plan

1. Preserve the current DEV database and its migration ledger.
2. Recover the original SQL for missing applied migrations from an authoritative backup/export or the operator who applied them. Do not fabricate migration SQL from names alone.
3. Determine whether the three 8-digit helper SQL files are intended historical migrations, one-off notes, or duplicates of already applied 14-digit migrations. Rename/recreate only after exact equivalence is proven and after checking migration ledger behavior.
4. Add a proper migration for `public.my_player_account` that captures the exact live definition, `security_invoker=true`, grants, and dependencies. Keep this separate from the recommended privilege tightening so behavior can be reviewed.
5. Add the proposed narrow view grants and invite FK indexes only after migration history is reconciled.
6. Compare a fresh schema created from the reconciled migrations against the live DEV catalog, including RLS, grants, functions, views, storage policies and extensions.
7. Only then resume schema changes. Production remains out of scope without explicit approval.

## Verification performed

- Read-only `list_migrations` against DEV.
- Read-only Git tree scan of every tracked `.sql` file on `faceit-dev`.
- GitHub path-history checks for absent migration filenames: no matching commits returned.
- Read-only catalog inspection of the live `my_player_account` view.
- No database changes were performed.
