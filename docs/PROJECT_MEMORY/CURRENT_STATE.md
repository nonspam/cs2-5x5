## 2026-11-14 — Profile and Match Room contained-window prototype
- Latest verified code commit: `71dca4dcee8b0dca0092b3565735c54cb0011634` (before this documentation-only update).
- Player profile links open a contained window reusing the existing profile renderer; the underlying route remains in place.
- Profile window has compact vertical navigation: Overview, Match History, Track, Close. Overview/History/Track rerender the modal mount; profile-local `render()` calls also refresh the mounted window instead of leaving stale content.
- Match Room desktop view is constrained to the workspace and leaves the global left rail visible. Its existing Overview / Statistics / TOP tabs and content are preserved.
- At widths up to 700px both windows fall back to full-screen.
- Source files: `app_v57.js`, `style_v57.css`; regression contracts in `tests/faceit-v2-shell.test.cjs`.
- Quality Gate: run [43631637819](https://github.com/nonspam/cs2-5x5/actions/runs/43631637819), 236 passed / 0 failed / 0 skipped.
- Browser visual/interaction QA and deployment verification remain unperformed. Do not call this visually accepted or deployed until checked in DEV at desktop and mobile viewports.

# CS2 Analytics — Current State

> Краткая рабочая сводка. Подробная история хранится в DEVELOPMENT_LOG.md и TECHNICAL_STATE.md.
> Этот файл обновляется после каждой законченной задачи. Всегда сверяй его с живым репозиторием.

## Snapshot metadata

- Snapshot refreshed: 2026-11-14
- Repository: `nonspam/cs2-5x5`
- Required branch: `faceit-dev`
- Live branch HEAD checked immediately before this snapshot update: `e25065ac65712bd6f89bb7195bd2bf8dd9c92d5d`
- Latest inspected application-code commit: `4a325be037ec2d3d6abf9d494207d76c953a0496` — Match Room rank dividers and site-wide helper hint cleanup; follow-up Team A divider fix pending CI.
- Latest verified quality gate for the finalized Project Memory snapshot: [run 43616036526](https://github.com/nonspam/cs2-5x5/actions/runs/43616036526), tested commit `1390c1ebbad62b857dcac4f20d2b038a88e3dbfe`, **226 passed / 0 failed / 0 skipped** (verified from job log).
- The run covers the finalized memory snapshot before the subsequent quality-history-only update. Check newer runs before relying on it.
- This is a repository-source and CI review. It is not browser QA or deployment confirmation.
- Before acting, fetch the current branch HEAD again. This snapshot SHA is not a permanent pointer.

## Product direction

CS2 Analytics is one integrated FACEIT-inspired application for the team's CS2 5×5 history, players, matches, maps, analytics, records, profiles and future competition systems. The shared shell is the product UI; do not create a second parallel app.

FACEIT is a visual/UX reference, not a source of player data or CS2 business rules. Preserve real project data and existing functions.

## Current development focus — Match Room

The latest inspected application-code history on 2026-11-14 confirms active work on the full-page Match Room. This is newer than the original 2026-11-12 Match Overview handoff.

Confirmed from recent commits and source diffs:
- Full-page Match Room with Overview, Statistics and TOP tabs.
- Team rosters, match hero/score, map list and VETO area.
- Statistics summary with MVP and leaders, plus player scoreboard.
- TOP list for match/series players sorted by aggregate K/D; format-specific guards are covered by tests where implemented.
- Scoreboard was simplified to rank, K/D/A and K/D columns, with CS2 ELO level.
- Match Room avatar renderer now reuses the linked profile avatar renderer.
- Recent CSS/JS work includes compact roster cards, score alignment, map tile layering and responsive layout contracts.

Do not assume every element is visually accepted or browser-verified. Check the latest source and user screenshots before further UI changes.

## Application and architecture

- Runtime is a vanilla JavaScript SPA.
- Main runtime: `app_v57.js`.
- Main styles: `style_v57.css`.
- Account/profile module: `account_module.js`.
- ELO implementation: `elo_v3.js`.
- Automated tests: `tests/*.test.cjs`.
- Quality gate: `npm run check` via GitHub Actions.
- The main app remains a large monolith; do not rewrite it wholesale. Make scoped changes and protect behavior with regression tests.

## Section status — based on latest inspected documentation/source

| Area | Status |
|---|---|
| Shared FACEIT-inspired shell | Implemented in source; browser verification remains separate |
| Profile / account linking | Implemented in source; preserve security boundaries |
| Match Room Overview | Implemented and under active refinement |
| Match Room Statistics | Implemented in source |
| Match Room TOP | Implemented in source; verify format guards/current behavior |
| Players / player profiles | Existing routes and renderers present |
| Matches / maps / teams / records | Existing functionality present; individual flows still require browser QA where not evidenced |
| Seasons | Partial; full season lifecycle/rollover not implemented |
| Track | Do not assume complete; earlier route inventory marks it absent as a working route |
| ELO V3 | Implemented; unresolved business semantics remain documented |
| CS2 demo importer | Research/future work; not a completed feature |

This is a compact status summary, not a substitute for route inventory and direct source inspection.

## Important unresolved decisions / risks

- BO3 series with 1:1 score: outcome semantics remain unresolved; do not silently reinterpret as draw or incomplete.
- Some series have incomplete rosters; do not invent or merge map rosters without an approved rule.
- ELO historical ordering has known date/ID ambiguity; do not change chronology without owner approval.
- DEV migration ledger drift is documented. Do not run new schema migrations or reset environments until reconciled.
- Do not change Supabase schema, data, RLS, grants or Edge Functions during frontend tasks without explicit permission.
- Browser QA and deployment must be treated as unverified unless fresh evidence is collected and owner authorization exists.

## Latest verified quality evidence

- GitHub Actions run [43616036526](https://github.com/nonspam/cs2-5x5/actions/runs/43616036526)
- Tested commit: `1390c1ebbad62b857dcac4f20d2b038a88e3dbfe`
- Result: **226 passed / 0 failed / 0 skipped**, confirmed in the `validate` job log.
- The job ran repository syntax and Node regression/static contract checks.
- This does not mean 226 browser tests or a visual pixel comparison. It does not prove browser QA, live DEV data correctness or deployment.

## Immediate continuation protocol

1. Check `faceit-dev` HEAD and recent commits.
2. Read the latest relevant source and current docs.
3. Ask for/inspect the newest screenshot or reference if visual intent is ambiguous.
4. Continue the active owner-approved task; do not assume old handoff priorities remain current.
5. After completing a logical task, update this file and the memory records listed in [README.md](README.md).


## 2026-11-14 — Team A rank divider follow-up
- The top/Team A rank-column right divider had retained a blue override. It is now neutral grey `#424242`, matching the bottom/Team B divider.
- Regression assertion covers both teams. CI pending; browser screenshot verification not performed.
