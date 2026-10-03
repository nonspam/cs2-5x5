# V58 MAP IMAGE FINAL — targeted fix

Base: CS2_ANALYTICS_V58_V46_IMAGE_REBUILD

Important runtime fact:
- index.html loads `style_v57.css` and `app_v57.js`.
- Therefore the map fix is applied to `app_v57.js`, the actual active runtime, not only to the inactive `app.js`.

Map card behavior:
- Keeps the proven V46/V58 map-photo background chain (`mapBg`: remote PNG with local SVG fallback).
- Adds local map emblems under `assets/maps/logos/`.
- Removes the map-name text rendered inside the image area.
- Does not alter the working Recent Games map thumbnails.
- Does not alter the unresolved Home Hero image.

Validation:
- app_v57.js syntax: PASS
- app.js syntax: PASS
- 10/10 local logo PNGs decode: PASS
- 10/10 local map SVGs parse: PASS
- active index runtime points to app_v57.js/style_v57.css: PASS
- active app_v57.js has no `mapIconRemoteAsset`: PASS


## V58 MAP CLEAN FINAL
- Removed the duplicated large map-name label from inside the photo.
- Kept the normal map name only in the card body below the image.
- Matched the reference logo treatment with a compact 54px card emblem and simple shadow.
- Added the same local map emblem to home-page map thumbnails (`mapThumb`).
- Active runtime remains `app_v57.js` + `style_v57.css`.
