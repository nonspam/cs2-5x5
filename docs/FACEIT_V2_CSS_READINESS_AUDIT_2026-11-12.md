# FACEIT V2 — CSS readiness and cascade audit

Date: 2026-11-12  
Branch: `faceit-dev`  
Scope: static review of the current stylesheet, shared shell selectors, responsive rules and reference-material availability. No runtime CSS was changed.

## Readiness estimate

These are planning estimates, not code-coverage measurements:

- Technical preparation before starting the owner-directed visual CSS pass: **about 80% complete**.
- Shared application shell wiring: **about 55–60% complete**.
- Final approved FACEIT-style visual implementation: **about 5–10% complete**. Existing rules are a prototype and must not be mistaken for an approved final design.
- Overall FACEIT V2 product: **about 30–35% complete**, based on the roadmap stages (runtime recovery, data/security audits and shell integration are substantially complete; browser validation, final UI, Track/seasons and product decisions remain).

## Measured stylesheet facts

Static scan of `style_v57.css` at this branch head:

- 3,514 lines.
- 92 custom-property declarations.
- 125 media-query occurrences.
- Approximately 2,906 simple CSS rule blocks parsed by a brace-based scan; the stylesheet contains complex/legacy formatting, so this is a structural estimate rather than a full CSS AST.
- Approximately 1,901 distinct selector strings in that scan.
- At least 50 selector strings occur more than once; frequent examples include `.topbar nav` (20), `.topbar` (16), `.nav-btn` (15), and `main` (9).
- The scan reports many `!important` declarations across the legacy stylesheet. The shared shell section itself is much smaller: about 14.7k characters, 128 lines, 153 parsed selector blocks, 122 distinct selector strings, 18 `!important` declarations and 6 media queries.
- The shell section repeats key layout selectors across desktop/tablet/mobile overrides. This is not automatically wrong, but changes must account for cascade order.

## Current shell structure

The shared shell is scoped primarily through:
- `.faceit-exact-shell`
- `.faceit-exact-global-rail`
- `.faceit-exact-player-column`
- `.faceit-exact-content`
- `.faceit-route-shell`
- `.faceit-route-content`

The shell-specific CSS begins near the end of `style_v57.css`, after earlier legacy/reference profile styles. The latest shared-shell block overrides the earlier reference profile layout and adds a common three-column route layout. Responsive overrides exist at approximately 1500px, 1050px and 700px.

## Main risks before visual CSS work

1. **Legacy cascade density.** Repeated global selectors and broad `!important` rules make it easy for a local visual adjustment to affect old pages or modals.
2. **Global shell side effects.** Rules using `body:has(.faceit-exact-shell)` hide the old topbar and reset `main` globally whenever the shell exists. Keep the shell root stable and test every route.
3. **Mixed generations of reference CSS.** The stylesheet contains earlier profile-sidebar/profile-v2 rules plus a later exact-reference shell and route-shell overrides. Do not layer another broad global redesign on top.
4. **Responsive layout unverified.** Breakpoints are present in source, but actual rendered overflow, navigation usability and player-column behavior have not been checked in a browser at fixed viewports.
5. **Original reference source files are not in the repository.** The previous chat had uploaded FACEIT HTML/CSS extracts, but they are not confirmed in GitHub. The original materials must be reattached before a faithful reference-driven visual pass; screenshots alone are not enough.

## Recommended implementation sequence

1. Confirm the exact DEV site URL and deployed commit SHA; open the actual app in a browser.
2. Reattach/reference the original FACEIT HTML and CSS extracts and map the actual DOM regions, typography, spacing and assets.
3. Capture a stable desktop baseline for the current profile and route shell, then tablet/mobile baselines.
4. Define a small set of shell design tokens and scoped components; do not rewrite the legacy stylesheet wholesale.
5. Migrate one approved section at a time, preserving data, handlers, permissions and persistence.
6. After each section, compare screenshots at identical viewports and run interaction/overflow/focus checks.
7. Only then remove obsolete CSS after proving no route or modal depends on it.

## What is not claimed

- No browser rendering or pixel-diff QA has been performed.
- No exact deployed Cloudflare URL or deployed SHA has been verified. The configured DEV service name is `cs2-analytics-dev`; the actual `workers.dev` hostname is not present in tracked documentation.
- The current prototype shell is not the final design.
- No CSS changes, production deployment, database mutation or migration were made in this audit.

## Route-specific content roots

The current route renderers already expose several useful CSS scoping roots:

| Route | Current main content root | CSS implication |
|---|---|---|
| Home | `.home-shell` / `.home-rebuild` | Can be scoped without changing global `main` styles |
| Players / analytics | generic `.section` with `.players-table` | A future dedicated page root may be useful before a major visual pass |
| Matches / base | `.base-page` | Existing page-specific root |
| Maps | `.maps-page` | Existing page-specific root and map-card family |
| Teams | `.teams-page` | Existing page-specific root |
| Records | `.records-page` | Existing page-specific root |
| Seasons | `.season-page` | Existing page-specific root |
| Profile | `.faceit-*` component family | Existing profile-specific component scope |

This map is based on the current render templates and CSS selector presence, not a browser-computed-style inspection. Keep these roots as the starting points for section-level CSS work; do not introduce new global selectors just to restyle one route.

## Quality gate for this audit commit

GitHub Actions quality gate passed on `96623ce00e2b11fd7c9f3eb17c1e7d8701eddd7e`: 100 tests passed, 0 failed. [Run 43101582571](https://github.com/nonspam/cs2-5x5/actions/runs/43101582571).
