# FACEIT V2 — inventory of the reference archive

Date: 2026-11-12  
Branch: `faceit-dev`  
Source supplied by the owner: `WinRAR archive (2).rar`

## Archive contents

The RAR5 archive was readable and contains four UTF-8 text snapshots. These are page captures with HTML structure and embedded/appended CSS material, not four standalone `.css` files.

| File | Extracted size | Primary reference |
|---|---:|---|
| `история матчей (списком) и внутрянка.txt` | 2,865,807 bytes | FACEIT player profile — History page |
| `матч внутри,обозр и стата.txt` | 1,834,950 bytes | Match room — Overview and Statistics |
| `сезоны.txt` | 1,269,338 bytes | Player Seasons page, including Season 9 statistics |
| `css track.txt` | 1,340,762 bytes | Track Stats page |

## Screen-to-source map

### 1. Player history — first implementation target

Source: `история матчей (списком) и внутрянка.txt`

The active player sub-navigation link is `/ru/players/obasral/cs2/history`. The visible table hierarchy includes date, result, average ELO, rating, K/A/D, and map. Match rows expand into team/player score data with K, A, D, K/D, K/R, ADR, FCR and ELO.

This file is the starting reference for the common profile frame and the history list. Use the structural hierarchy and visual rhythm; do not copy the reference player's personal data into the product.

### 2. Seasons

Source: `сезоны.txt`

The page includes the profile navigation, an all-seasons summary, season cards and a detailed Season 9 view. The captured content includes season dates, skill/rank indicators, season overview metrics, full and advanced statistics, and map-level breakdowns.

This source shares the same visible profile-page CSS map reference as the player-history capture, so profile shell components should be treated as a shared family rather than implemented as unrelated page designs.

### 3. Match room

Source: `матч внутри,обозр и стата.txt`

The page is a distinct match route under `/ru/cs2/room/<match-id>`. It includes Overview and Statistics navigation, map and match metadata, team score/ELO, player cards, MVP/highlight blocks, per-player metrics and the detailed scoreboard.

Implement this as a separate page family after the shared profile/history frame. Preserve the product's existing data and match actions; the capture is a visual reference only.

### 4. Track Stats

Source: `css track.txt`

Canonical page captured in the document: `https://www.faceit.com/ru/track/stats?gameModes=5v5`.

The file is a full HTML document with 32 stylesheet preload/link references and 12 inline style blocks. It also contains appended browser measurement output. Several appended rules are injected by non-FACEIT extensions/widgets (for example `.fcb`, `.ext-*`, `.zsiq-*` families); these must not be copied into the application's FACEIT visual layer.

Track is last in the initial implementation sequence because it is a distinct statistics page and this capture mixes the site's CSS asset references with extension-injected styles.

## CSS evidence and limitations

- The player-history and seasons captures both end with the source-map marker `1i3yocrujp9ox.css.map`.
- The match-room capture ends with `1syxawe1nzmd-.css.map`.
- Track contains FACEIT stylesheet preload URLs and also includes the `1syxawe1nzmd-.css.map` marker among the appended style material.
- A source-map marker is evidence of a referenced stylesheet build artifact, not the source-map file itself.
- The captures expose useful HTML hierarchy, labels, component families and portions of CSS, but they are not a clean export of every stylesheet in the original application. Do not infer missing declarations or exact computed geometry from hashed class names alone.
- The raw archive is not copied into the repository. This report records the inventory and implementation mapping; the uploaded archive remains the reference source in this conversation.

## Implementation sequence

1. Shared profile shell and player-history screen, using the first file and shared profile structure from the seasons capture.
2. Seasons, reusing the shared shell and adding season-specific components.
3. Match room, as its own overview/statistics page family.
4. Track Stats, separating native page styles from injected extension styles.

## Verification boundaries

This inventory is a source-level review. It does not claim pixel-perfect implementation, browser rendering, interaction QA, or Cloudflare deployment. Those checks remain separate acceptance steps after each page section is implemented.
