# CS2 Analytics V35 — FINAL FIX

Date: 2026-10-03

## User fixes

- Fixed the Home → «Динамика показателей» metric selector (`K/D`, `K-D`, `K`, `D`, `A`, `AVG`, `Импакт`, `Индекс`, `Форма`, `Стабильность`).
- Fixed the page jump caused by the custom select + smooth scrolling + transformed panels.
- Fixed dropdown viewport placement on desktop/mobile so the menu stays inside the visible screen.
- Metric changes now preserve the user's exact scroll position and update the chart without a full Home rerender.

## Performance pass

- Added per-render memoization for repeated `detailRows()` calculations.
- Removed the old `translateZ(0)` transform from panels/cards that forced fixed dropdowns into transformed containing blocks and added unnecessary compositing.
- Kept the existing visual design and data model unchanged.

## QA

- FINAL_QA_V34: PASS
- RELEASE_GATE_V57: PASS
- V58_3_HOME_STABILITY_QA: PASS
- TEAM_PROBABILITY_QA: PASS
- Runtime syntax: PASS
- Chromium offline smoke: **16/16 PASS** on desktop 1365x900 and mobile 390x844.
- Home metric selector: real mouse click changes `K/D → K-D` with scroll position preserved.
- Tab render timing smoke: all primary tabs under 250 ms in the test environment; observed roughly 40–90 ms.

## Scope note

Supabase cloud connectivity/auth is not exercised by the offline Chromium smoke test. The application data, aliases, historical team sides and schema were not changed.
