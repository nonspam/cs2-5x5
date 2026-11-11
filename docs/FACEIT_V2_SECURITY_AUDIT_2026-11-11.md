# FACEIT V2 — DEV Supabase security and performance audit

Date: 2026-11-11  
Project: `nwujudniysolpevbtggd` (DEV only)  
Method: Supabase Security/Performance Advisors, read-only catalog inspection, source/migration inspection.  
No database writes, DDL, grants, policies, Auth settings, or production resources were changed.

## Executive summary

The current DEV project has several advisor findings. Most are either intentionally restrictive RLS configurations or guarded admin RPCs. No direct unauthenticated route to private account data was identified during this pass. There are still two low-risk least-privilege/performance improvements to schedule, plus one Auth dashboard hardening setting.

## Security advisor findings

### RLS enabled without policies — INFO (5 tables)

Tables:
- `private.player_account_invites`
- `public.app_admins`
- `public.app_login_aliases`
- `public.cs2_audit_log`
- `public.cs2_operations`

Catalog inspection showed these tables have RLS enabled and no client policies. Their direct grants are limited to `service_role` and/or `postgres`; there are no direct `anon` or `authenticated` table grants. This is a deliberate deny-by-default pattern:
- invite tokens and admin login aliases are accessed by trusted Edge/backend code;
- audit/operation journals are not exposed for direct client reads/writes;
- admin email allow-list is queried through trusted server code or the guarded admin predicate.

**Disposition:** no policy should be added merely to silence the advisor. Doing so could expose sensitive records.

### SECURITY DEFINER functions callable by authenticated — WARN (2 functions)

Advisor findings:
- `public.commit_cs2_state(...)`
- `public.is_cs2_admin()`

Reviewed definitions:
- Both use an empty `search_path` and schema-qualified object references.
- `is_cs2_admin()` returns only whether the current JWT email matches an entry in `public.app_admins`.
- `commit_cs2_state()` checks `auth.role() = 'service_role'` or `public.is_cs2_admin()` before writing state. The authenticated grant is intentional: `supabase_adapter.js` invokes this RPC after checking the current session with `isAdmin()`.
- The Edge Function independently verifies the bearer token with Supabase Auth and checks the email against `app_admins` before using its service-role client.
- The admin table itself has no client policy and no anon/authenticated table grants.

**Disposition:** the advisor warning is generic for this guarded RPC design. Do not revoke authenticated execution without first replacing the client commit path; that would break match/player saves. Keep the authorization predicate and regression-test it. A future hardening pass may move the RPC to a non-exposed schema or route all commits through the Edge Function, but that is an architecture change, not a quick lint fix.

### Leaked password protection disabled — WARN

Supabase Auth's compromised-password protection is disabled in DEV. This is an Auth project setting, not a database policy. It was not changed during this audit.

**Recommended follow-up:** enable leaked-password protection in the DEV Auth settings, then verify sign-up/password-change flows and any current password policy. Apply separately to production only with explicit approval.

## Additional least-privilege review

### `public.my_player_account` view

Observed definition:

```sql
SELECT player_id
FROM private.player_account_links
WHERE auth_user_id = (SELECT auth.uid());
```

The view has `security_invoker=true`, and its underlying `private.player_account_links` table has RLS restricting SELECT to `auth_user_id = auth.uid()`. Therefore the view does not bypass RLS, and anonymous requests have no matching user identity.

However, the view currently has grants for `anon` and broad DML privileges for both `anon` and `authenticated`. Underlying table RLS currently blocks unauthorized DML, but these grants are broader than needed.

**Recommended follow-up migration (not applied):** revoke all view privileges from `anon`; revoke INSERT/UPDATE/DELETE from `authenticated`; grant only SELECT to `authenticated`. Keep `security_invoker=true` and the underlying own-row RLS policy. Validate account linking and profile loading after applying.

### Public state and profile data

- `public.cs2_app_state` is intentionally readable by `anon` and `authenticated` because match/player statistics are public application data.
- A read-only scan of the current DEV JSON state found top-level keys `aliases`, `audit`, `maps`, `matches`, `players`; no email-like values, password/token keys, or auth/user ID keys were found.
- `public.player_profiles` is intentionally publicly readable; its update policy is limited to the linked player and constrains avatar/cover paths to the current user's storage folder.
- Storage bucket `cs2-player-media` is public for image reads. Upload/update/delete policies require the first object path segment to equal `auth.uid()`.
- The private account-link table grants authenticated SELECT but its RLS policy returns only the current user's link.

**Ongoing rule:** never add private account emails, invitation tokens, auth IDs, password material, or other private identity data to the public JSON state.

## Performance advisor findings

### Missing indexes on invite foreign keys — INFO (2)

`private.player_account_invites` has foreign keys `created_by` and `claimed_by` without covering indexes. These can slow deletes/updates on referenced Auth users and maintenance operations.

**Recommended follow-up migration (not applied):**
- index `created_by`;
- index `claimed_by` (or use a partial index where `claimed_by IS NOT NULL`, after checking expected query patterns).

The table is currently small; this is preventive rather than an observed latency issue.

### Unused indexes — INFO (3)

Advisor reports unused indexes:
- `public.app_login_aliases.idx_app_login_aliases_email`
- `public.cs2_app_state.idx_cs2_app_state_updated_by`
- `private.player_account_invites.player_account_invites_expires_at_idx`

Do not drop these based on a single usage snapshot. Some support FK maintenance, infrequent admin paths, or future queries. Re-evaluate after a representative workload window.

## Runtime and logs

- DEV Edge Function `cs2-admin` remains active at version 3.
- No rows were returned by the available `function_edge_logs` query for the inspected window. This is not proof that the function has never errored; it only means no matching rows were available in that source/window.
- No schema/data/Auth/Storage changes were made in this audit.

## Recommended next work

1. Add a migration to narrow grants on `public.my_player_account` (after migration creation workflow is available).
2. Add indexes for `player_account_invites.created_by` and `claimed_by`.
3. Enable leaked-password protection in DEV Auth settings and test registration/password change.
4. Add regression checks for admin RPC denial to non-admin authenticated users and acceptance for the configured admin.
5. Keep intentional no-policy RLS findings documented; do not add blanket policies.
6. Re-run advisors after the eventual migration and Auth setting change.

## Sources within the project

- `supabase_adapter.js`: admin check, direct guarded commit RPC, account-link view usage.
- `supabase/functions/cs2-admin/index.ts`: bearer-token validation, admin allow-list check, Edge commit path.
- `supabase/migrations/20261002_admin_commit_rpc.sql`: intentional authenticated grant on guarded commit RPC.
- `supabase/migrations/20261110204350_player_account_invites_and_self_service_linking.sql`: invite table RLS/grants and account-link policies.
- `supabase/migrations/20261110211414_move_player_account_helpers_to_private_schema.sql`: private helper functions and invoker wrappers.
