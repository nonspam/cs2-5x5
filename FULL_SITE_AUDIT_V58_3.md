# CS2 Analytics V58.3 — Full Site Audit

Дата: 2026-10-02
База аудита: `CS2_ANALYTICS_V58_3_HOME_HERO_REAL_REMOTE_NUKE_CLEAN_V3`

## Runtime
- `index.html` → `style_v57.css` + `app_v57.js`.
- Supabase client/config, validation, embedded data and JSON data are wired.
- `app_v57.js` syntax: PASS.
- All production JS/Python files syntax-check: PASS.
- `FULL_FUNCTION_AUDIT.py`: PASS.
- `QA_CHECK.py`: PASS.
- `RELEASE_GATE_V57.py`: PASS.
- `V58_3_HOME_STABILITY_QA.js`: PASS.
- `DATA_RECONCILIATION_QA_V58_5.js`: PASS.
- `LEGACY_CLEANUP_QA_20260930.js`: PASS.
- `REWORK_QA_20260930.js`: PASS.

## Data integrity
- 14 active players.
- 66 active maps.
- 32 active matches.
- 10 map types.
- 41 aliases; all aliases resolve to valid player IDs.
- `data/*.json` and `data_embedded.js` contain identical datasets.
- No orphan maps, duplicate IDs, invalid match/map relations, invalid formats, or invalid K/D/A rows detected by `validateBase`.
- Active player display names are unique.
- Archived `player_new` remains archived and has no statistics; it was not removed because this audit does not invent or rewrite historical data.

## Home / Hero
- Hero uses the proven DOM `<img>` chain with the working remote Nuke artwork.
- Final Hero CSS disables competing background images and keeps the image full-bleed.
- Hero height is locked to the working 290px layout.
- `.hero-note` is hidden.
- Counters are anchored to the bottom of the Hero.
- Existing map sorting/data logic was not changed.

## Maps
- Current map ordering is count-descending.
- Ties use latest played map recency, then match/map identifiers as deterministic tie-breakers.
- Current counts: Mirage 19, Dust2 12, Nuke 12, Anubis 10, Inferno 5, Ancient 2, Cache 2, Overpass 2, Train 1, Vertigo 1.
- Existing map asset chain remains untouched in this audit fix.

## CRUD / admin hardening
A real async-save defect was found and fixed in four player operations:
- create player;
- edit player;
- restore player;
- archive player.

Previously these operations called the cloud save asynchronously without awaiting it, then immediately changed the UI state and showed success. A cloud failure could therefore produce a false success state. They now await `persistChangeAwait()` and only mutate the local UI state after successful persistence.

Match create/edit/archive/restore/delete already used the awaited persistence path and were left unchanged.

## Release hygiene
- `manifest.json` version synchronized to `58.3.0`.
- No hard-coded offline admin password found.
- No missing required runtime files.

## Historical QA files
Several old QA scripts intentionally target older frozen snapshots (for example 61 maps or legacy storage names) and therefore fail against the current 66-map build. They are historical tests, not runtime failures. The current release gate, current data QA, full-function audit and Home stability QA pass.
