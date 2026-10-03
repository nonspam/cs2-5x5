# V31 — Mobile Hardening

Base: V30 MOBILE PREP / V29 final visual branch.

## Scope
- iPhone/Android safe-area support.
- iOS/Android touch-target hardening.
- iOS form focus zoom prevention (16px controls).
- Dynamic viewport (`dvh`) support for modals/app shell.
- Mobile admin Players / Create Match layout hardening.
- Profile/detail grid hardening.
- Horizontal data-table scrolling preserved.
- Chart/SVG overflow protection.
- Mobile/PWA metadata and cache-busting.
- PWA theme colors aligned with black/lime UI.

## Data / runtime protection
- No database changes.
- No JS logic changes.
- `app_v57.js` unchanged from V30.
- Embedded player/match data unchanged from V30.
- Supabase adapter/config unchanged.

## Checks
- `node --check app_v57.js`: PASS
- `QA_CHECK.py`: PASS
- CSS braces balanced: PASS (1997/1997)
- Required mobile viewport/meta/cache markers: PASS
- Runtime/data hashes compared with V30 base: unchanged.

## Browser note
A Chromium headless visual render was attempted during mobile prep, but the environment timed out; no browser-render claim is made here.
