# CS2 ANALYTICS V57 — RELEASE REPORT

Date: 2026-09-30

## Why V57 exists

V56 was reported by the user as visually unchanged after opening the build: the Home hero still showed the old artwork and the Matches list still appeared in the old order. The audit found that the project had accumulated multiple CSS cascade layers and, more importantly, the entry page still referenced the same `style.css` / `app.js` filenames. V57 removes that ambiguity by using uniquely named `style_v57.css` and `app_v57.js` assets and explicit no-cache metadata.

## Final fixes

- **МАТЧИ → ВСЕ ИГРЫ** is sorted by the permanent numeric map id, descending: `#61 → #1`. A future `map_062` naturally becomes `#62` and appears before `#61` without renumbering old maps.
- **Главная → Hero** is now a single-source local asset: `assets/maps/nuke.svg`.
- Legacy Mirage hero image references were removed from the active V57 stylesheet.
- **Bottom-right `CS2 ANALYTICS` promo** was compacted so the `CS2` mark and `ANALYTICS` label stay inside the card without overflow.
- Entry point now loads **V57-named CSS/JS files**, eliminating stale same-filename browser cache ambiguity.
- Added `no-cache/no-store` metadata to the entry page.
- Added a release gate and full function/asset audit.

## Verification

- Release Gate V57: **PASS**
- V57 UX QA: **PASS**
- Core QA: **PASS**
- Team Probability QA: **PASS**
- Legacy Cleanup QA: **PASS**
- V54 QA: **PASS**
- V55 QA: **PASS**
- Rework QA: **PASS**
- Dataset QA: **PASS**
- JavaScript syntax: **PASS**
- Python server compile: **PASS**
- Inline-handler/function audit: **PASS** (32 inline handlers, 0 missing functions)
- Map asset audit: **PASS** (10/10 map SVGs present)
- Dataset: **14 players / 67 maps / 33 matches / 61 active maps**
- Active map numbering: **61..1**
- History window: **61..51**
- `map_062` numbering behavior: **PASS**
- Hero Nuke asset: **PASS**
- Legacy Mirage hero references in active V57 CSS: **0**

## Server smoke test

The V57 server endpoint smoke test was run separately against a clean V57 server instance:

- `/` → HTTP 200
- `/api/health` → HTTP 200
- `/api/state` → HTTP 200

A Chromium visual capture could not be completed in this execution environment because browser navigation is blocked by the environment. The release therefore does not claim a visual-browser PASS; the exact reported visual issues were instead verified at the source/cascade/asset level, with stale-cache prevention added to the build.
