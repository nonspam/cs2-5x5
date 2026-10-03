# CS2 Analytics V23 — Final Micro Fix

Base: V58.3 / Radical UI V22 Release Candidate.

## Data correction
- Match `match_032` kept intact; no delete/recreate.
- Map order changed from `mirage-dust2-nuke` to `nuke-dust2-mirage`.
- `map_066` Nuke -> index 1.
- `map_065` Dust2 -> index 2.
- `map_064` Mirage -> index 3.
- All three maps' scores and player K/D/A rows were preserved byte-for-byte in the local data snapshot.
- Supabase production state updated through the existing guarded commit RPC, version 34 -> 35.
- Production verification confirms the last series order is Nuke -> Dust2 -> Mirage.

## UI changes
- Removed selected-map photo atmosphere from Map Lab / selected-map statistics area.
- Redesigned Teams player picker: player pool is now above the squads, with A/B target buttons and click-to-add behavior matching the match creation workflow. Drag-and-drop remains supported.
- Records row hover changed from legacy blue aura to lime.
- Added small breathing room before Player Profile section headings.

## QA
- `RELEASE_GATE_V22.py`: 43/43 PASS.
- `node --check app_v57.js`: PASS.
- Data invariants: 14 players / 66 maps / 32 matches preserved.
- Player stat rows for match_032 preserved.
- No map/player IDs changed.
- ZIP integrity verified after packaging.
