# Demo Analytics — Product and Technical Plan

> Status: PLANNED — documentation only. No demo parser, upload flow, schema, database, or match UI implementation is included in this decision.

## Product decision

Finish and stabilize the existing CS2 Analytics product first. Build the match pages, statistics views, Track, profile, and supporting systems around agreed data contracts. Add automatic demo processing only after the current product structure is ready.

Do not pause current product work to build the parser prematurely. At the same time, design new match/statistics features so they can later consume automatically calculated data instead of depending on manual entry.

## Goal

An administrator creates a match and uploads its CS2 `.dem` file. A separate processing service parses the demo, calculates match and player statistics, and prepares a draft. The administrator reviews the result, fixes any detected mapping or parsing issue, and publishes it.

After publication, the same canonical match data feeds:
- Match History / Match Room.
- Match Overview, MVP and player highlights.
- Detailed match statistics.
- Player profiles and Track aggregates.
- Future comparison, records and rating systems.

A single parsed match must not be manually re-entered into separate sections. All views read from the same published match data.

## Match page: planned presentation

### Compact overview table

Per player:
- Player identity (nickname/avatar) and FACEIT level/Elo.
- Custom Impact Rating.
- K / D / A.
- ADR.
- KD ratio.
- Kills per round.
- Headshot kills and headshot percentage.
- 5K, 4K, 3K and 2K counts.
- MVP-round count.

MVP card:
- Player identity.
- Custom Impact Rating.
- K/D/A, ADR and headshot percentage.

Four match highlights:
- Most kills.
- Highest damage.
- Best KAST.
- Most entry kills.

One player may win multiple highlights. MVP is selected by a separately defined Impact Rating, not by kills alone.

### Detailed statistics navigation

Planned tabs/sections, based on the owner's FACEIT reference screenshots:

1. **General / Overview** — KAST, accuracy, accuracy by target, shots, hits, multi-kills, rounds played/participation and survival.
2. **Entry** — entry attempts, entry kills, entry deaths, entry difference, attempt rate and success rate.
3. **Trades** — trade kills/deaths and trade-related player/team breakdowns.
4. **Clutches** — clutch attempts/rounds, wins, success rate and wins by 1v1 through 1v5.
5. **Duels** — player-versus-player kill/death and damage comparisons; filters for kills, entry kills, trade kills and damage where the source events support them.
6. **Equipment / Utility** — general, damage and support views; grenade counts by type, unused/used grenades, grenade damage, enemy/team damage, flash throws, flash assists, enemies blinded, blind duration, teammate flashes and self-flashes.

Statistics should support team/player sorting and CT/T side filters wherever the underlying round-side data makes that meaningful.

Some labels in the reference screenshots are abbreviated or ambiguous (for example RP/RS and some grenade totals). Do not assign meanings until they are confirmed. The exact metric definitions and denominator rules must be documented before implementation.

## Demo processing architecture

1. **Upload** — accept a demo file on a draft match.
2. **Parse** — a separate background service reads the demo and extracts source events: players/SteamIDs, rounds, sides, kills, deaths, assists, damage, shots, hits, weapons, grenade events, flashes, positions and round outcomes where available.
3. **Normalize** — map demo identities to the site's player records using stable identifiers such as SteamID, not nickname alone; preserve unknown/unmatched players for review.
4. **Calculate** — a versioned analytics layer derives agreed metrics from normalized events.
5. **Validate** — compare event totals and score with demo round results; flag missing players, incomplete demos, unsupported events and suspicious inconsistencies.
6. **Review draft** — show roster, score, sides and calculated stats to an administrator before publication.
7. **Publish** — save one canonical match dataset. Only published matches contribute to public profiles, Track, records and aggregates.

The parser should run outside the browser and outside the normal request lifecycle (for example, a Python worker/service). The frontend should submit the file and display processing/review status; it should not parse large demos itself.

## Data and calculation principles

- Preserve raw/source events separately from derived statistics.
- Store round-level and player-level results, including CT/T side context.
- Version calculation rules so old matches can be recalculated when formulas improve.
- Keep the original demo or a controlled reference to it according to an explicit storage/retention policy.
- Make processing idempotent: retrying a job must not create duplicate matches or double-count Track statistics.
- Do not publish partially processed results as final.
- A correction/re-import must update the canonical match and rebuild affected player aggregates safely.

## Planned metrics and confidence boundaries

### Directly event-derived or conventionally calculated
- K/D/A, KD, ADR, headshot kills/percentage, multi-kills, MVP-round counts.
- Round score, rounds played, first kills/deaths, weapon kill/damage breakdowns.
- Shots/hits and accuracy, subject to a documented definition.
- Damage by weapon/grenade, grenade usage and many flash/blind metrics.
- CT/T splits, provided round-side and player participation data are present.

### Requires explicit project definitions and event logic
- KAST (exact assist/trade/survival rules).
- Entry attempts/success and opening duels.
- Trade kills/deaths and trade windows.
- Clutch attempts/wins and 1vX classification.
- Flash assists and attribution of blinded opponents.
- Utility effectiveness and team-flash penalties.
- Impact Rating and MVP selection.
- RWS or any FACEIT-like proprietary metric.

Do not claim exact FACEIT parity. Build and document CS2 Analytics definitions, then validate them against known demos and manually checked examples.

### Not supplied by a match demo alone
- FACEIT Elo/level and account profile data: use the site's records or an external integration.
- Crosshair code: separate player/profile source.
- Any metric whose required event is absent from the demo format must be marked unavailable, not fabricated.

## Impact Rating direction

Create a CS2 Analytics-specific Impact Rating. Candidate inputs include opening impact, trade impact, damage, multi-kills, clutch outcomes, utility support and round outcomes. Avoid naïve addition and double-counting. A later version may estimate round win-probability change before/after a player's action, but this is a research/validation task, not an already-defined formula.

## Track integration

Track is an aggregate view across published matches. It must be calculated from the canonical match/player/round data, not independently entered. Keep per-match source data so filters by date, map, side, mode and opponent can be added later without losing detail.

## Delivery order

### Phase 0 — Current product first
- Finish and stabilize existing routes and systems.
- Agree on match data contracts and the exact Match Room sections/fields.
- Keep current manual workflows usable until demo import is ready.
- No demo parser implementation in this phase.

### Phase 1 — Demo feasibility spike
- Collect several real, complete CS2 demos from the team's matches.
- Parse them offline with a candidate parser (Awpy and/or demoparser2).
- Produce a raw event report and compare score, player totals, K/D/A, damage, shots/hits, grenades and round splits with trusted reference data.
- Record unsupported fields and edge cases before choosing the parser.

### Phase 2 — Canonical data model and calculations
- Define match, round, player participation, event and derived-stat structures.
- Specify formulas and tests for every metric.
- Implement versioned calculations and CT/T splits.

### Phase 3 — Upload, processing and review
- Add demo upload, background jobs, progress/error reporting, identity mapping and admin review.
- Keep drafts private until explicitly published.

### Phase 4 — Match Room and Track integration
- Populate Overview, MVP/highlights, detailed stats, Duels and Equipment/Utility from the same canonical dataset.
- Update Track and player aggregates exactly once per published match.

## Acceptance criteria

- A real demo produces the correct map, score, rounds, teams and player identities.
- K/D/A and other manually verifiable metrics match a checked reference.
- Every derived metric has a documented formula and automated tests.
- CT/T splits reconcile with round participation.
- Reprocessing is safe and does not double-count.
- Admin can inspect and correct a draft before publication.
- Published data appears consistently in Match Room, profiles and Track.
- Unsupported or uncertain metrics are visibly flagged rather than guessed.

## Current status and restrictions

- This document records the owner's product direction and proposed architecture only.
- No parser was selected or integrated by this decision.
- No demo upload, database schema, SQL/migration, RLS, storage policy, deployment or production change was made.
- Before implementation, inspect the live `faceit-dev` code and current database contracts. Work on `faceit-dev` only unless the owner explicitly authorizes another branch.
