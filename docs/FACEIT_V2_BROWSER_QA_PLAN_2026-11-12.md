# FACEIT V2 — browser QA execution plan

Date: 2026-11-12  
Branch: `faceit-dev`  
Scope: execution checklist for the restored runtime and shared-shell prototype. This plan does not approve visual styling.

## Safety boundaries

- Use only the DEV frontend and the isolated DEV Supabase project.
- Do not test against production or merge to `main`.
- Current project constraint: no database row writes. Match/player create, edit, archive, restore, purge, profile upload, backup import and other mutating flows must use a local fixture, mocked API, or a disposable test harness until explicit write approval is given.
- Read-only account/profile access is allowed only with the test account and existing test data.
- Record browser, viewport, route/hash, console errors, network errors and observed result for each check.
- A green source test is not a browser pass. Mark a case PASS only after actual browser interaction.

## Test matrix

| ID | Priority | Area | Steps | Expected result |
|---|---|---|---|---|
| NAV-01 | P0 | Initial load | Open DEV root in a fresh session | DEV branding is visible; app loads without runtime errors; no production Supabase request |
| NAV-02 | P0 | Direct route | Open each supported hash: home, analytics, base, maps, teams, records, seasons, profile, settings | Correct route renders in the shared shell; invalid hash safely falls back to home |
| NAV-03 | P0 | Internal navigation | Click every rail item and the settings shortcut | Correct page renders once; active route state matches the URL hash |
| NAV-04 | P0 | Browser history | Navigate across at least three routes, then Back and Forward | Route content and hash stay synchronized; no duplicate history entries from render |
| NAV-05 | P1 | Reload | Reload on each supported route hash | Route is restored after data load; no blank or mismatched page |
| NAV-06 | P1 | Compare | Open compare from player comparison actions, then return to another section | Compare is reachable without being exposed as a permanent rail route; return navigation remains usable |
| NAV-07 | P1 | Account menu | Open/close account menu; test auth entry point | Menu opens once, closes predictably, and auth entry is reachable |
| PROF-01 | P0 | Public profile | Open a player profile from player list/drilldown | Correct player identity and stats render; no private account details leak |
| PROF-02 | P1 | Own profile | Sign in with the designated DEV test account | Linked player/profile context resolves; account state is consistent after refresh |
| PROF-03 | P1 | Profile media | Exercise avatar/cover selection only in a mocked/local fixture | Upload, save, rollback and old-media cleanup paths report success/failure correctly; do not write to live storage under current constraints |
| DRILL-01 | P1 | Home → match | Open recent match detail from home | Correct match, maps, score and roster are shown |
| DRILL-02 | P1 | Match → map | Open each map detail from match detail | Correct map stats and player rows are shown |
| DRILL-03 | P1 | Player drilldown | Open player detail from analytics, records and map views | Player identity and derived metrics agree across entry points |
| DATA-01 | P0 | Read-only consistency | Compare the same player's ELO, K/D, win rate and match count on analytics/profile/records | Values use the same source/rules and reconcile; differences are explained, not silently rounded inconsistently |
| DATA-02 | P1 | Archive visibility | Inspect existing archived match/player records and trash view | Archived entities are excluded from active views and remain recoverable in the archive view |
| FORM-01 | P1 | Add series wizard | Run BO1/BO3/BO5 steps using a local fixture or mocked API | Format/map limits, team assignment, stats entry, review and validation behave correctly |
| FORM-02 | P1 | Edit match | Exercise date, duration, score, roster and stats validation in a local fixture | Invalid input is blocked; valid edits update all dependent views consistently |
| FORM-03 | P1 | Archive/restore | Exercise match/player archive and restore in a local fixture | Status and active flags stay synchronized; restored ordering is deterministic |
| FORM-04 | P2 | Purge | Exercise permanent player purge only in a disposable fixture | Confirmation is explicit; references/aliases are handled safely |
| ADMIN-01 | P0 | Permission boundary | Open admin tools signed out and with a non-admin DEV account | Mutating/admin actions are unavailable or rejected server-side |
| ADMIN-02 | P1 | Backup | Exercise export/import with a local fixture | Export is readable; invalid import is rejected without changing the current fixture |
| ADMIN-03 | P1 | Audit | Inspect audit history and validation errors | Events are readable; rejected actions do not appear as successful changes |
| UI-01 | P0 | Desktop | Check 1440×900 and 1280×800 | No overlapping rail/player column/content; content remains scrollable |
| UI-02 | P1 | Tablet | Check 1024×768 and 768×1024 | Navigation and content remain reachable; no horizontal overflow |
| UI-03 | P0 | Mobile | Check 390×844 and 360×800 | No clipped controls; rail/player column behavior is usable; dialogs fit viewport |
| UI-04 | P1 | Keyboard | Tab through navigation, dialogs and forms; test Escape where applicable | Focus is visible and ordered; modal focus/close behavior is predictable |
| UI-05 | P1 | Touch | Tap rail, tabs, menus and modal controls on mobile emulation/device | Targets respond reliably; no hover-only essential action |

## Execution order and release gates

1. Run P0 read-only checks first: NAV-01..04, PROF-01, DATA-01, ADMIN-01, UI-01 and UI-03.
2. Run P1 read-only/drilldown checks next.
3. Run mutation workflows only against local fixtures/mocks until explicit permission for DEV database writes and storage uploads is granted.
4. Capture screenshots for layout defects, but do not make visual redesign decisions from the QA plan alone.
5. Fix blockers on `faceit-dev`, add regression tests where a defect can be represented statically or in Node tests, and rerun the quality gate.
6. Re-run the full matrix after the Cloudflare DEV deployed SHA is confirmed to match the tested branch commit.

## Result template

For each ID record: `PASS / FAIL / BLOCKED / NOT RUN`, browser/version, viewport, tested commit SHA, evidence link or screenshot, concise observation, and linked defect/commit.

Current status: **NOT RUN**. No browser session, Cloudflare deployed SHA, or live DEV frontend URL has been verified in this audit.
