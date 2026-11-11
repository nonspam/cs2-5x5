# FACEIT V2 — route and interaction inventory

Date: 2026-11-11  
Source: `faceit-dev`, current restored runtime  
Scope: static source inspection. No browser interaction test was performed.

## Status legend

- **Implemented in source** — route or workflow has a renderer and related handlers in the current runtime.
- **Placeholder / absent** — known incomplete or not implemented.
- **Not browser-verified** — every item below still needs real browser QA for success/error states, permissions, responsive layout, keyboard and touch behavior.

This document maps what exists. It does not approve the current visual design. The shared shell is a technical prototype; section styling and product content remain owner-directed.

## Application shell and navigation

- Single-page application with common shell rendered through `renderRouteShell(v,page)`.
- Navigation uses the common `navigateApp(tab)` path, writes a route hash (`#/home`, `#/base`, etc.) to browser history, and restores the route on browser back/forward. Direct hash entry is read before the first data load; a `hashchange` listener also restores state when the hash is changed outside the app. These behaviors are source-tested; real browser validation is still pending.
- The profile page uses the same shell; account/profile is not a separate frontend.
- Rail routes: Home, Analytics, Base, Maps, Teams, Records, Seasons, Profile. Settings is opened by its shortcut.
- `analytics` delegates to the Players view.
- `compare` exists in the page map but is not a permanent rail item; it is opened from player comparison actions.
- Match, player and map details are modal/drilldown flows, not independent routes.
- Browser history and direct route hashes are now wired in source. Back/forward, reload-on-route and mobile browser behavior still require a real browser smoke test.
- Keyboard focus, escape handling, tab order and mobile rail behavior require browser QA.

## Route inventory

| Route / view | Existing purpose and source-level functionality | Status |
|---|---|---|
| `home` | Dashboard summary, recent series, player highlights and shortcuts into match history/details | Implemented in source; not browser-verified |
| `analytics` / `players` | Player table and analytics; ELO, K/D, impact, form, stability and Player Index; player drilldown and public profile entry | Implemented in source; not browser-verified |
| `compare` | Compare selected players using their rating and performance metrics | Implemented in source; reachable from comparison actions; not browser-verified |
| `base` | Match/series history, match detail, map detail, add/edit, archive/trash and restore flows | Implemented in source; not browser-verified |
| `maps` | Map overview and selected-map analytics/drilldown | Implemented in source; not browser-verified |
| `teams` | Temporary roster builder, drag/drop player assignment, random team creation and balancing helpers | Implemented in source; not browser-verified |
| `records` | Career and format-specific record views, filters and player/map/match drilldowns | Implemented in source; not browser-verified |
| `seasons` | All Time view and a Season 1 placeholder screen | Partial; season lifecycle is not implemented |
| `profile` | Player overview and match history, profile metadata, avatar/cover editing and ELO history display | Implemented in source; not browser-verified |
| `settings` | Admin login and data-management tools | Implemented in source; not browser-verified |
| `track` | Track / seasonal progression | Absent; not a working route |

## Modal and workflow inventory

### Match and map operations

- Open match detail and inspect its maps/player statistics.
- Open map detail and map-level player statistics.
- Add a series through a multi-step wizard: choose format/maps, assemble teams, enter map scores and stats, review and commit.
- Edit series score, played date, duration, team assignments and map/series statistics.
- Archive a match into trash and restore it with a new active series/map position.
- Review and manage archived matches through the trash view.

### Player and team operations

- Open player drilldown and public player profile.
- Compare players.
- Build temporary teams, drag/drop players, randomize and balance rosters.
- Admin player list, create player, edit display name, add aliases, archive, restore and permanently purge an archived player.
- Player identity is keyed by stable `player_id`; display names and aliases are separate.

### Account and profile operations

- Account module is loaded into the same application.
- Sign-up, sign-in, sign-out and password recovery/change flows exist in source.
- Player account linking uses invite/self-service linking paths and shared profile APIs.
- Own profile supports avatar/cover editing; public profile data is separated from private account state.
- Profile image storage uses the `cs2-player-media` bucket.

### Settings and data management

- Admin sign-in through the `cs2-admin` Edge Function.
- Add/edit matches and players.
- Manage aliases and archived records.
- Backup export/import.
- Review audit history.

## Route-to-code map

This is the practical source map for preserving old behavior while sections are restyled. Names are the current runtime entry points; helpers are listed where they materially feed the section.

| Section / workflow | Render entry | Existing behavior and core functions |
|---|---|---|
| Shared shell / history | `render`, `renderRouteShell`, `profilePage` | `APP_ROUTE_IDS`, `appRouteFromLocation`, `navigateApp`, `restoreAppRouteFromHistory`, `faceitAppRailMarkup`, `faceitAppPlayerColumnMarkup`, `bindAppShell`; profile is the special-case renderer inside the same rail shell |
| Home | `home` | Dashboard summaries and highlights; `lastMatchSummary`, `openMatchDetail`, `openPlayerDetail` |
| Players / analytics | `analytics` → `players` | Player table and comparison selection; `aggregate`, `stability`, `form`, `impact`, `index`, `indexBreakdown`, `toggleCompare`, `compare`, `openPlayerDetail`, `openPlayerDrilldown`, `openPublicPlayerProfile` |
| Matches / series | `base` | History, detail, create/edit/archive/trash/restore; `openMatchDetail`, `openMapDetail`, `openAddGame`, `continueNewGame`, `renderNewSetupStep`, `renderNewMaps`, `renderNewTeams`, `renderNewStatsStep`, `collectNewMapStats`, `reviewNewGame`, `commitNewGame`, `openEditMatch`, `saveMatchEdit`, `saveMatchTiming`, `deleteMatch`, `openTrash`, `restoreMatch` |
| Maps | `maps` | Map summaries and player rows; `mapStats`, `mapPlayerStats`, `openMapDetail`, `renderMapStatEditor` |
| Teams | `teams` | Temporary roster builder and balancing; `teamRoster`, `teamAverage`, `teamImpactAvg`, `teamStabilityAvg`, `addToTeam`, `removeFromTeam`, `dragTeam`, `dropTeamPlayer`, `randomTeams`, `balanceTeams` |
| Records | `records` | Career and format-specific record filters; `recordRows`, `careerRecordRows`, `bo3RecordRows`, `bo5RecordRows`, `openPlayerDrilldown` |
| Seasons | `seasons` | Current All Time history plus Season 1 preparation placeholder; no live season/rollover system |
| Profile | `profilePage` | Profile metrics and recent series; `profileRecord`, `profileSummary`, `profileMatchesForPlayer`, `handleProfileImage`; account/auth actions also live in `account_module.js` |
| Settings / administration | `settings` | Admin login, player/alias management, backup and audit; `login`, `openPlayerAdmin`, `savePlayerAdmin`, `editPlayer`, `savePlayerEdit`, `archivePlayer`, `restorePlayer`, `purgeArchivedPlayer`, `exportBackup`, `importBackup`, `auditLog` |

### Navigation integrity finding

The audit found two legacy cross-section controls that assigned `state.tab` directly instead of using `navigateApp`: the account-menu “Мой профиль” link and the Season history “Все матчи” link. They are now routed through `navigateApp('profile')` and `navigateApp('base')`, respectively, so the URL hash and browser history are updated consistently. A regression test prohibits reintroducing literal route assignments in controls.

## Handler and code footprint

Static scan of `app_v57.js`:
- 1,292 lines; 224 function declarations.
- 126 inline `onclick` attributes and 9 inline `onchange` attributes.
- 23 `addEventListener` calls.
- 53 distinct simple inline handler names; a source-level regression test now asserts that every inline click/change handler resolves to a declared runtime function or variable.

These are source counts, not proof that every button works. Some controls are wired dynamically or through delegated handlers. The static handler-resolution test prevents missing function names, but cannot prove that a handler's runtime behavior succeeds. A complete control-by-control browser pass is still required.

## Known functional gaps and risks

1. **Track is absent.** Do not expose it as a finished section.
2. **Seasons are a placeholder.** No full season standings, lock/close/archive, rollover or calibration lifecycle.
3. **Navigation is state-based.** Hash/history synchronization is wired and source-tested, including `popstate` and `hashchange`; direct route reload, actual back/forward behavior and mobile browser behavior still need browser QA.
4. **Compare is not a rail route.** Confirm intended navigation with the owner before redesigning it.
5. **Monolithic runtime.** Most renderers, data logic, modals and handlers live in `app_v57.js`; any future extraction should preserve behavior through regression tests.
6. **No real browser QA.** Source existence and green Node tests do not prove interaction correctness.
7. **No Cloudflare deployed SHA confirmed.** Do not claim the currently served DEV frontend matches this branch until verified.

## Recommended browser QA order

1. Login/logout, session refresh, invite linking, password recovery and permission-denied states.
2. Navigation across all rail routes, compare entry/exit, direct links, browser back/forward.
3. Home → match detail → map detail → player profile drilldowns.
4. Add a BO1, BO3 and BO5; validate map score/stat entry, review and commit.
5. Edit a historical match's teams and stats; edit a local series; verify server validation.
6. Archive/restore match; create/archive/restore player; verify active roster and profile history.
7. Backup export/import, trash, audit history and conflict/version errors.
8. Profile avatar/cover upload, public/private access, responsive breakpoints, keyboard and touch behavior.

No UI redesign is authorized by this inventory. Use owner-provided HTML/CSS/references when the relevant section reaches visual implementation.
