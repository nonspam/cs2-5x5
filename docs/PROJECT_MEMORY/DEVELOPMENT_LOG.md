# Semantic Development Log

This is the human/AI-readable history of completed project tasks. It complements, but does not duplicate, the automatic root [CHANGELOG.md](../../CHANGELOG.md).

Each entry records intent, actual behavior, source files, evidence and remaining work. Entries must be based on inspected diffs, source, tests or explicit owner decisions. Never infer details from a commit subject alone.

---

## 2026-11-14 — Project Memory recovery hardening

**Goal:** Make the single-link handoff more reliable and prevent a new chat from guessing when repository access or required documents are unavailable.

**Changes:**
- README now explicitly treats the single Project Memory URL as the entry point and gives the new assistant a mandatory read order.
- Added a direct GitHub branch metadata endpoint to the recovery procedure so the assistant can resolve the live `faceit-dev` HEAD instead of trusting an old SHA in a snapshot.
- Added a strict failure path: if GitHub or a required file cannot be opened, the assistant must disclose the exact gap, ask for access/the missing file, and must not edit based on assumptions.
- NEW_CHAT now requires checking commits specifically on `faceit-dev`, inspecting diffs newer than the snapshot, and reading actual CI job logs before claiming test results.
- CURRENT_STATE refreshed with the live branch HEAD checked during this update and the latest verified CI evidence.
- QUALITY_HISTORY now records run `43615568846` with its tested SHA and actual log result: 226 passed / 0 failed. It explicitly states that this run predates the new documentation-hardening commits.

**Files changed:** `docs/PROJECT_MEMORY/README.md`, `docs/PROJECT_MEMORY/NEW_CHAT.md`, `docs/PROJECT_MEMORY/CURRENT_STATE.md`, `docs/PROJECT_MEMORY/QUALITY_HISTORY.md`.

**Commits created in this sequence:**
- `a2c61f5aa86eaf8be591bbcae09e597ca07c43c4` — strengthen entry point.
- `0c285116b4fe40ab495412121d4ad9f374128962` — explicit new-chat recovery protocol.
- `d860a99a170b6e8dff7d58a362f325a5f364d8cc` — refresh current snapshot.
- `39168ee0b71adab3a913f326fe5f4a5ecbd728a8` — record latest verified quality evidence.

**Verification boundary:** GitHub source files and branch metadata were read successfully. The earlier quality run `43615568846` was inspected at job-log level and reported 226 passed / 0 failed on `dbe2e982cf7b712413ace4981f2424012b46450f`. No runtime code, database, deployment or browser QA was changed/performed. CI for the new hardening commits must be checked separately.

**Remaining:** Verify the new commits' own GitHub Actions runs, then update this entry and CURRENT_STATE with the resulting evidence and final branch HEAD.

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
