# Semantic Development Log

This is the human/AI-readable history of completed project tasks. It complements, but does not duplicate, the automatic root [CHANGELOG.md](../../CHANGELOG.md).

Each entry records intent, actual behavior, source files, evidence and remaining work. Entries must be based on inspected diffs, source, tests or explicit owner decisions. Never infer details from a commit subject alone.

---

## 2026-11-14 — Match Room Statistics/TOP layout correction (second pass)

**Owner feedback:** The first refinement still left the three leader cards visually cramped, the TOP list left-aligned with excessive internal whitespace, player names wrapping, and team rows lacking individual identity boundaries.

**Implemented in `app_v57.js`:**
- MVP always renders the large player avatar component using the display name as its initials fallback when no profile ID/avatar exists.
- TOP removes the right-side sort hint.
- Each TOP player's name, K/D/A line and K/D value share one result class based on the actual K/D ratio: >1 green, =1 neutral white, <1 red.

**Implemented in `style_v57.css`:**
- Leader cards now have a clear left identity group and a right-aligned value/label group.
- Statistics team tables keep the outer team wrapper removed, but each player row now has its own separated dark row surface. The player + rank cells form a tinted team-color block with a visible right boundary: blue/purple for team A, teal/green for team B.
- TOP list is centered with a 980px desktop maximum width; rows use non-wrapping player names and a more compact content-driven grid.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Commit:** `88d0c7c27e0f9db5d9e5b506994c0d3eaf4f60b5`.

**Verification:** Quality Gate run [43622133983](https://github.com/nonspam/cs2-5x5/actions/runs/43622133983), actual `validate` job log: **228 passed / 0 failed / 0 skipped**.

**Not performed:** browser QA, live screenshot comparison, deployment, database/SQL changes, or changes to `main`. CI covers syntax and Node regression/static contracts only; visual acceptance remains pending.


## 2026-11-14 — Match Room Statistics and TOP visual refinement

**Goal:** Apply the owner's next visual corrections to the Match Room Statistics and TOP views without changing Overview behavior or match data.

**Implemented:**
- Match Room tabs are forced to plain text controls with no pill/oval background, border or shadow; the active tab keeps its orange underline.
- Player initials now use the supplied display name when no linked profile/avatar record exists. Statistics leaders and TOP rows therefore have a stable circular initial fallback instead of a dash/empty identity.
- MVP avatar presentation is enlarged; the Statistics award cards use a tighter identity/value grid to reduce unused space.
- Removed the enclosing card/background/border around each Statistics team table. Team headings distinguish the first roster in blue and the second in yellow; winning score remains green.
- TOP rows are narrower, names can wrap instead of being cut off, and both K/D/A score and K/D use the same result color: above 1.00 green, exactly 1.00 neutral white, below 1.00 red.
- Added focused regression assertions and refreshed app/CSS cache keys.

**Files changed:** `app_v57.js`, `style_v57.css`, `tests/faceit-v2-shell.test.cjs`, `index.html`.

**Commits:**
- UI and regression tests: `fc402e571e117eb4f74d462bddfb274b145f653d`.
- Cache-key refresh: `0a82131ad0788618cad16a9a15c96b13a93b1a4b`.

**Verification:** Quality Gate run [43621076848](https://github.com/nonspam/cs2-5x5/actions/runs/43621076848) on `fc402e571e117eb4f74d462bddfb274b145f653d`: **227 passed / 0 failed / 0 skipped** from the actual `validate` job log. Cache-key commit Quality Gate run [43621142715](https://github.com/nonspam/cs2-5x5/actions/runs/43621142715): **227 passed / 0 failed / 0 skipped** from its actual job log.

**Not performed:** browser QA, screenshot comparison in a live browser, deployment, database/SQL changes, or changes to `main`. CI confirms syntax and Node regression/static contracts only; visual acceptance remains pending.


## 2026-11-14 — Project Memory recovery hardening

**Goal:** Make the single-link handoff more reliable and prevent a new chat from guessing when repository access or required documents are unavailable.

**Changes:**
- README now explicitly treats the single Project Memory URL as the entry point and gives the new assistant a mandatory read order.
- Added a direct GitHub branch metadata endpoint to the recovery procedure so the assistant can resolve the live `faceit-dev` HEAD instead of trusting an old SHA in a snapshot.
- Added a strict failure path: if GitHub or a required file cannot be opened, the assistant must disclose the exact gap, ask for access/the missing file, and must not edit based on assumptions.
- NEW_CHAT now requires checking commits specifically on `faceit-dev`, inspecting diffs newer than the snapshot, and reading actual CI job logs before claiming test results.
- CURRENT_STATE refreshed with the branch HEAD checked during this update and the latest confirmed quality evidence.
- QUALITY_HISTORY records run `43615940711`, tested commit `1644527855ec257b10c7d2999531f6a974e80b66`, and the actual job-log result: **226 passed / 0 failed / 0 skipped**.

**Files changed:** `docs/PROJECT_MEMORY/README.md`, `docs/PROJECT_MEMORY/NEW_CHAT.md`, `docs/PROJECT_MEMORY/CURRENT_STATE.md`, `docs/PROJECT_MEMORY/QUALITY_HISTORY.md`, `docs/PROJECT_MEMORY/DEVELOPMENT_LOG.md`.

**Commits created in this sequence:**
- `a2c61f5aa86eaf8be591bbcae09e597ca07c43c4` — strengthen entry point.
- `0c285116b4fe40ab495412121d4ad9f374128962` — explicit new-chat recovery protocol.
- `d860a99a170b6e8dff7d58a362f325a5f364d8cc` — refresh current snapshot.
- `39168ee0b71adab3a913f326fe5f4a5ecbd728a8` — record prior verified quality evidence.
- `1644527855ec257b10c7d2999531f6a974e80b66` — semantic log and completed recovery-hardening package.

**Verification:** GitHub source files and live branch metadata were read successfully. Quality run `43615940711` completed successfully on the final package commit; its job log reports 226 passed / 0 failed / 0 skipped. No runtime code, database, deployment or browser QA was changed/performed.

**Remaining:** None for this documentation-hardening package. Future tasks must continue the same update/test/evidence cycle.

---

## 2026-11-14 — Match Room refinement sequence (baseline reconstructed from branch history)

**Scope:** Match Room / match detail page. This baseline consolidates the recent sequence; it is not a claim that every intermediate chat message has been recovered.

**Confirmed changes from recent commit subjects, inspected source diffs and TECHNICAL_STATE.md:**
- Match Room layout was refined toward a compact full-page composition.
- Player cards and level rings were reduced and adjusted; level badge progression/palette and ELO rating boundaries received regression coverage.
- Match score alignment and map artwork layering were corrected.
- Match statistics table was simplified to rank, K/D/A and K/D; team score presentation was adjusted.
- MVP and highlight layout was refined.
- A TOP tab was added, showing the top players by aggregate K/D for the match/series. Zero-death positive-kill rows may display infinity; missing source data is not fabricated.
- Match Room tab switching was corrected and tests were added for direct tab actions.
- Profile avatar rendering was reused for Match Room player avatars.

**Files confirmed in the inspected diffs:** `app_v57.js`, `style_v57.css`, Match Room regression tests under `tests/`, `TECHNICAL_STATE.md`, and automatic journal updates in `CHANGELOG.md`.

**Latest relevant code commit inspected:** `bb8c161d9d2d4e66c48a6bf06f1d938286941e62` — `feat: use linked profile avatars in Match Room`.

**Quality evidence:** GitHub Actions run [43614439431](https://github.com/nonspam/cs2-5x5/actions/runs/43614439431), 226 passed / 0 failed on the linked code commit.

**Not confirmed:** browser interaction/visual QA, pixel-perfect comparison, owner acceptance of every latest visual detail, and deployment of this code.

**Next:** continue only from fresh HEAD and latest owner feedback. Do not jump to Statistics as a separate product task or another section unless the owner directs it.

---

## 2026-11-14 — Project Memory system created

**Goal:** Establish one stable GitHub entry point so future chats can restore current project context without asking the owner to repeat the project history.

**System design:**
- Current state snapshot: CURRENT_STATE.md.
- Semantic task history: DEVELOPMENT_LOG.md.
- Test/QA/deployment evidence: QUALITY_HISTORY.md.
- New-chat protocol: NEW_CHAT.md.
- Memory index: README.md.

**Important limitation:** GitHub Actions automatically captures commit metadata and changed paths, but it cannot read private ChatGPT conversations or infer why a change was made. Semantic notes must be written by the assistant as part of task completion.

**Repository changes:** see the memory-system commit and its changed paths in the root CHANGELOG.md.

**Verification:** documentation-only change. No application runtime, database, deployment or browser QA was performed as part of creating these documents.
