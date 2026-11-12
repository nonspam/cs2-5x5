# Reference image inbox

Drop screenshots and visual references here. This folder is the shared inbox for owner-provided design feedback.

## How to upload

1. Open this folder on the **faceit-dev** branch:
   https://github.com/nonspam/cs2-5x5/tree/faceit-dev/design-references/inbox
2. Choose **Add file → Upload files**.
3. Drag PNG, JPG/JPEG, or WEBP screenshots into the upload area.
4. Use a descriptive filename, then commit directly to **faceit-dev**.

If GitHub does not show the upload action inside the folder, open the folder link above and use **Add file → Upload files** from the repository toolbar.

## Naming

Use a short area + sequence + optional note, for example:

- `match-center-01-overview.png`
- `match-center-02-player-cards.png`
- `profile-01-header.jpg`

For multiple states, keep the same prefix and increment the number. If a screenshot shows a specific problem, add a short note in the commit message.

## Working rules

- Upload screenshots/reference images only; do not put passwords, access tokens, private account details, or other secrets here.
- Prefer cropped screenshots at readable resolution. Avoid huge originals when a compressed screenshot is sufficient.
- Keep the original reference intact; add a new numbered file rather than overwriting an earlier image.
- The assistant will inspect files from this folder on `faceit-dev` and compare them against the current source before proposing edits.
- Uploading an image does not itself authorize a redesign. The owner's written instructions determine what should change.
