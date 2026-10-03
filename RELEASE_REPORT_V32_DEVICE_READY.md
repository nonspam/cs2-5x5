# V32 DEVICE READY — MOBILE / DESKTOP PRE-FINAL

Base: V31 MOBILE HARDENED.

## Scope
- Cross-device preparation for desktop, iPhone/iPad Safari and Android Chrome-class browsers.
- No Supabase/database changes.
- No player, match, map or statistical data changes.
- Runtime remains `app_v57.js` + `style_v57.css`.

## Device hardening
- `viewport-fit=cover` for iOS safe areas.
- `interactive-widget=resizes-content` for virtual keyboard viewport behavior where supported.
- Dark color-scheme metadata.
- Safe-area handling for top bar, page padding and toast area.
- Dynamic viewport units (`dvh`) for mobile modals, with `vh` fallback.
- Touch targets kept at approximately 44px for primary controls.
- iOS input zoom protection via 16px mobile form controls.
- Horizontal data tables remain intentionally scrollable.
- Long player/map/match labels wrap instead of forcing page width.
- Mobile admin/player/match grids collapse to phone-safe layouts.
- Landscape modal handling included.
- PWA manifest includes scope and orientation `any`.

## Verification
- JavaScript syntax: PASS (`node --check app_v57.js`).
- Existing project QA: PASS (`QA_CHECK.py`).
- Local asset reference audit: PASS.
- CSS brace balance: PASS (1997 / 1997).
- viewport-fit: PASS.
- PWA scope: PASS.
- Database/data mutation: NONE.

## Browser test limitation
A local Chromium headless run was attempted, but the environment's Chromium process timed out before producing DOM/screenshot output. Therefore no browser-rendering test is claimed as passed here.

## Final QA handoff
This build is intended to be the final functional-QA candidate. Next pass should verify every tab and interaction on desktop plus 360/390/430px phone widths and at least one tablet width, including navigation, maps, player profiles, charts, matches, teams, records, admin flows, modals, forms and Supabase sync.
