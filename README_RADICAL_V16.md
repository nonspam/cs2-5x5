# CS2 Analytics — RADICAL UI V16

## NAV ONLY

V15 showed that the visible runtime stylesheet is `style_v57.css`, loaded by `index.html`. This V16 release changes only that runtime stylesheet's top navigation sizing.

### Requested fix
- Main tabs match the Settings button's full top-to-bottom hit area.
- Tabs stretch from the top edge of the 64px topbar to its bottom guide line.
- Pill/rounded shape is preserved.
- Clickable area is full-height and vertically aligned.
- No content, data, JS logic, maps, profile, or other UI sections changed.

### Verified unchanged runtime data/logic
- `app_v57.js` unchanged from V15.
- `shared_state.json` unchanged from V15.
- `data_embedded.js` unchanged from V15.
