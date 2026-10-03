# CS2 Analytics V58 — map screenshot repair

## Fix
Restored the real CS2 map screenshot sources for the active V57 runtime used by `index.html`.

- Map cards use the GhostCap CS2 map PNGs as the primary background.
- Local SVG map art remains as the final fallback.
- Map thumbnails and map cards restore the remote map icon overlays.
- Selected-map and Map Lab atmospheric backgrounds use the same remote PNG + local SVG fallback.
- `loading="lazy"` is used on map logo images.

## Active runtime
`index.html` loads `app_v57.js` and `style_v57.css`.

## Validation
`node --check app_v57.js` passed.

## Scope
This patch is for the V58 ZIP file only. No GitHub Pages / production site changes are part of this patch.
