# New Chat — CS2 Analytics

## How to start

The owner may provide this single link:

`https://github.com/nonspam/cs2-5x5/blob/faceit-dev/docs/PROJECT_MEMORY/README.md`

Treat it as the entry point, not as proof that the documents or branch are current. Read the memory index and its required files, then inspect GitHub live.

## Required first actions

1. Confirm repository `nonspam/cs2-5x5`.
2. Confirm current branch is `faceit-dev`; fetch its live HEAD SHA and recent commits.
3. Read [CURRENT_STATE.md](CURRENT_STATE.md), [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md), [QUALITY_HISTORY.md](QUALITY_HISTORY.md), [PROJECT_MASTER.md](../../PROJECT_MASTER.md), [TECHNICAL_STATE.md](../../TECHNICAL_STATE.md), [ARCHITECTURE.md](../../ARCHITECTURE.md), [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md), [DECISIONS.md](../../DECISIONS.md), [ROADMAP.md](../../ROADMAP.md), and relevant feature-specific docs.
4. Compare the latest code commits with the memory snapshot. If there are commits newer than the snapshot, inspect their diffs and update your understanding before proposing code changes.
5. Check current workflow runs and logs for the latest relevant code commit. Do not reuse a stale test count.
6. State the current branch, HEAD, active work area, latest confirmed quality evidence, and what remains unverified.
7. Do not edit code until this recovery pass is complete.

## Non-negotiable project constraints

- Work only on `faceit-dev`.
- Recheck HEAD immediately before each set of changes.
- Do not touch `main` or production.
- No database writes, SQL, migrations, RLS, grants, schema or Edge Function changes without separate explicit approval.
- No deployment without separate explicit approval.
- No browser QA without separate explicit approval.
- Do not invent game data, metrics, player identities, ELO, test results, visual verification or deployment status.
- Preserve existing working behavior and add regression coverage for code changes.
- Do not start another product area based on an outdated handoff if newer branch history shows the work has moved on.

## Work style

- Speak Russian, simply and directly.
- Be proactive: inspect source, find the implementation path and do the work rather than asking the owner to repeat known project facts.
- Ask only for essential missing references or a product decision.
- For visual work, use the actual supplied reference and current screenshot. Do not guess a detailed design from memory.
- Batch work into meaningful units; do not interrupt the owner for every trivial substep.
- Be explicit about files changed, tests run, evidence and remaining unknowns.

## Definition of Done — every logical task

Before calling a task complete:
- [ ] Code/docs changes are on `faceit-dev` only.
- [ ] Current HEAD and final commit SHA are known.
- [ ] Relevant automated tests have actually run; failures are disclosed.
- [ ] No unapproved browser QA, deployment or DB operations occurred.
- [ ] DEVELOPMENT_LOG.md contains a semantic task entry.
- [ ] CURRENT_STATE.md reflects the new actual state.
- [ ] QUALITY_HISTORY.md records real test/CI/QA/deployment evidence.
- [ ] DECISIONS.md and relevant technical/design/roadmap docs are updated if needed.
- [ ] Root CHANGELOG.md automatic metadata has had time to record the commits; verify rather than assume.
- [ ] Final user report lists exact changed files, test result, commit SHA and what was not checked.

A task can be marked **IN PROGRESS** when interrupted. Never mark incomplete work as done.

## Important truth about automation

GitHub Actions can record Git metadata and run checks. It cannot see the private ChatGPT conversation unless a separate, explicitly authorized integration is built. Do not claim that semantic conversation memory is automatically captured. The assistant must write the meaning of the work into the repository as part of task completion.
