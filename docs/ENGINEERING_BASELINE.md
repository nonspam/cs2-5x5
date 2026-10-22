# Engineering baseline — CS2 5x5

Status date: 2026-10-22  
Production repository: `nonspam/cs2-5x5`, branch `main`  
Production entrypoint: `index.html`  
Runtime files currently loaded by the entrypoint: `style_v57.css`, `validation.js`, `supabase_adapter.js`, `data_embedded.js`, `app_v57.js`.

## Why this document exists

The site has working match history, player/map statistics, administration, cloud persistence and a sizeable historical QA collection. Changes must preserve those working paths. The goal is to reduce regression risk, not to redesign or rebuild the project from zero.

## Architecture as it exists today

- `index.html` is the runtime entrypoint and establishes script/style load order.
- `app_v57.js` is the main browser application and remains a large monolithic file.
- `style_v57.css` contains the active stylesheet and remains large.
- `data_embedded.js` is an embedded fallback/snapshot. It must not be treated as permission to overwrite newer cloud state.
- `supabase_adapter.js` owns cloud loading, admin checks, realtime subscription and transactional state commits.
- `validation.js` is shared browser/CommonJS state validation.
- `supabase/ ` contains SQL and database setup artifacts; changes to live schema/policies require separate review.
- `tests/*.test.cjs` contains focused Node regression tests.
- `.github/workflows/quality-gate.yml` runs syntax and regression checks.
- `app.js`, `style.css`, historical backups, and older QA/release files exist in the repository. Do not assume they are active or delete them until references and historical purpose have been checked.

## Non-negotiable change rules

1. Work only in `nonspam/cs2-5x5`; never patch the old `nonspam/cs2-analytic` project.
2. Inspect the current `main` source before editing. Do not patch from remembered snippets or stale handoff files.
3. Keep a narrow scope per commit. Avoid mixing data migrations, metric changes, CSS redesign and architecture moves in one change.
4. Never edit production match/player statistics as a side effect of frontend refactoring.
5. Never replace Supabase state with `data_embedded.js` or an old JSON snapshot without explicit reconciliation and backup.
6. Archive and permanent delete are different lifecycle actions. Related maps must follow the match lifecycle, and failed cloud writes must not be presented as successful.
7. Keep incomplete lobbies valid where supported. Do not fabricate missing players or 0/0/0 statistics.
8. Keep compact series aggregate-only where per-map split is not known; never invent per-map K/D/A.
9. Do not change Player Index, win probability or other metrics without tests and documentation of the actual implemented formula.
10. Never claim browser/production verification from source inspection alone. State which checks ran and which remain unverified.
11. Any change to runtime filenames, script order or CSS cache-busting must update the entrypoint regression tests.
12. Do not remove old QA/backups until active references are checked and a preserved archive/rollback path exists.

## Quality gate

Run locally with Node.js 20+:

```sh
npm run check
```

This runs syntax checks for the runtime scripts and all tests in `tests/*.test.cjs`. GitHub Actions runs the same command on pushes and pull requests.

A passing gate establishes syntax and covered regression checks only. It does not prove visual correctness, live Supabase permissions, deployment completion, or every browser interaction.

## Roadmap

### Stage A — Guard rails (in progress)
- One repeatable syntax + regression command.
- Test production entrypoint and dependency load order.
- Establish documented data lifecycle and release safety rules.
- Confirm GitHub Actions is green after the new gate.

### Stage B — Baseline and data integrity
- Capture a read-only production state summary: active/archived matches, maps, player catalog, map-to-match links, stats coverage and cloud version.
- Compare embedded data with cloud state without writing either.
- Add fixtures/tests for match creation, partial rosters, edit, archive, restore, permanent delete, map reindexing, duplicate stats and alias integrity.
- Treat real production counts as observations, never hardcoded permanent QA expectations.

### Stage C — Separate responsibilities without changing behavior
- Extract pure helpers first (ordering, aggregation, formatting, validation) into independently testable modules.
- Keep a compatibility facade and preserve the current public browser entrypoint while migration is in progress.
- Move one responsibility at a time; add regression coverage before moving the next one.
- Split CSS by component only after checking cascade/order dependencies.

### Stage D — Canonical documentation
- Maintain the data model and metric definitions beside the code.
- Document each metric with its source function, formula, missing-data behavior and test.
- Record data provenance for imported/manual historical rosters.

### Stage E — Release hygiene
- One current release/version marker and a reproducible release checklist.
- Keep historical artifacts as history, not as ambiguous production entrypoints.
- Only delete/move files after references, runtime URLs and rollback needs are verified.

### Stage F — Analytics improvements
- Begin only after data integrity and core regression gates are reliable.
- Treat UI changes and metric changes as separate reviewable units.
