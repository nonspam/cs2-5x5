# FACEIT V2 — account, invitation and profile security audit

Date: 2026-11-11  
Scope: source review of account UI/adapter/migrations plus read-only DEV catalog and role-context checks. DEV project only.

## Verified live state

- DEV currently has one confirmed Auth account and one player-account link.
- The link is unique in both directions: `auth_user_id` is the primary key and `player_id` has a unique constraint.
- There are no current invitation rows.
- The invitation table stores a 64-character SHA-256 hash, not the raw invitation token.
- `public.my_player_account` is an invoker-security view filtering on `auth.uid()`.
- A read-only transaction under the `authenticated` database role with the current user's JWT claims returned exactly one linked player row, reported the account as admin, and could read the public player profile set. The transaction was rolled back.
- The private link and invite tables have RLS enabled. The invite table has no direct anon/authenticated table grants; access is through guarded RPCs.
- Profile updates are restricted by RLS to the linked player and enforce that avatar/cover paths begin with the current user's UUID.
- Storage object insert/update/delete policies similarly constrain the first path segment to `auth.uid()`; public reads are limited to the `cs2-player-media` bucket.

## Invitation workflow review

The tracked migrations implement:
- 144-bit random invitation codes (18 random bytes);
- SHA-256 token hashing before storage;
- seven-day expiration;
- admin-only invite creation;
- active-player and profile-row checks at invite creation;
- one open invite per player;
- explicit revocation of a previous open invite when issuing a replacement;
- authenticated claim, token hash lookup, expiry/revocation/claimed checks, and `FOR UPDATE` row locking;
- a unique user/player link and a second active-player/profile check at redemption;
- claim timestamp/user recording and single-use behavior.

The later migration moves SECURITY DEFINER implementations into `private`, gives them an empty `search_path`, and exposes SQL invoker wrappers in `public`. The implementation checks authorization itself; it does not rely solely on the UI.

## Account and profile UI review

- Registration requires email, password (minimum 8 chars), confirmation, and an invitation code.
- If email confirmation is required, the invitation code is held in page memory and the UI asks the user to confirm email and then sign in. A full page reload before the claim can discard that pending code; the user can still enter it again manually.
- Password recovery uses a generic success message, avoiding account-existence disclosure in the UI.
- Password changes verify the current password before updating it.
- Avatar/cover uploads are limited client-side to JPEG/PNG/WebP/GIF and 5 MiB, use a per-user storage path, and profile rows are protected by RLS.
- These browser-side MIME/size checks improve UX but are not a substitute for server-side storage bucket limits. Verify the live bucket's file-size and MIME configuration separately before treating them as hard security controls.
- Public profile rows are intentionally readable; profile editing does not allow changing player identity/name through this flow.

## Findings / follow-up

1. **No confirmed privilege escalation in account-link RPCs.** The guarded private implementations and live RLS/grants are consistent with the intended model.
2. **Pending invitation can be lost on reload before claim.** Low severity/UX issue: the code is still available from the administrator and can be re-entered. A future improvement could retain the pending code in a short-lived session-scoped flow, but avoid persisting raw invite codes long-term.
3. **Storage bucket server-side restrictions need explicit confirmation.** The app enforces 5 MiB and image MIME types in JavaScript; inspect `storage.buckets.file_size_limit` and `allowed_mime_types` to ensure the server enforces the same constraints.
4. **Migration reproducibility remains a blocker.** The account-link base table and `my_player_account` view originate from migration history not fully represented by tracked SQL. Do not alter grants or add account schema migrations until the drift report is reconciled.

## Test coverage added

Added source-contract tests for token generation/hashing, admin and active-player gates, single-use claim behavior, private SECURITY DEFINER hardening, invoker wrappers, profile media constraints, and generic password-reset messaging. These are static contract tests; they do not replace live browser/Auth integration testing.

## Scope

No Auth settings, users, invitation rows, account links, storage objects, database rows, schema, policies, grants, or production resources were changed.
