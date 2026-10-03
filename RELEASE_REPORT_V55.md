# CS2 Analytics V55

## Player profile
- Form windows use lowercase `avg` and color-coded `K/D`: green > 1, white = 1, red < 1.
- Era cards use the same `avg` + color-coded `K/D` treatment.
- Recent detailed maps stay on one line: white map name, color-coded K/D/A by K/D, blue MVP. No map score.

## Matches / map history
- Active map numbers follow the persistent map id suffix (`map_061` → #61), so new `map_062` becomes #62.
- Newest-first ordering remains #61 → #1; after a new map it becomes #62 → #1.
- All-map history window remains the latest 11 maps (currently #61–#51).
- History rows show blue map number + white map name; MVP was removed from this history block.
- Match score coloring remains green for positive, red for negative, white for 1:1/tie.

## Team Builder
- Removed the top quick-player selector experiment.
- Restored the bottom draggable roster workflow; drag-and-drop to empty slots and player swaps remain available.

## Home
- Hero explicitly uses local `assets/maps/nuke.svg` artwork instead of relying on a CSS variable fallback.
- CS2 ANALYTICS promo remains restored and compact.

## Validation
- Core QA: PASS.
- Team Probability QA: PASS.
- Legacy Cleanup QA: PASS.
- V55 UX QA: PASS.
- Full dataset QA: PASS.
- JavaScript syntax: PASS.
- Chromium visual capture is not claimed as PASS because the current execution environment does not complete headless capture reliably.
