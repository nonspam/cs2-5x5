# FACEIT V2 — shell routing and DEV isolation contract

Date: 2026-11-12  
Branch: `faceit-dev`  
Scope: source-level verification of application routing and frontend environment isolation. This is not browser QA and does not verify the Cloudflare deployment.

## Work batch: two completed checks

### 1. Shared-shell route contract

Verified in `app_v57.js`:

- The supported route allowlist is explicit: `home`, `analytics`, `base`, `maps`, `teams`, `records`, `seasons`, `settings`, `profile`, and `compare`.
- Unknown route IDs are rejected by `navigateApp`.
- Navigation updates the URL hash and browser history using `pushState` / `replaceState`.
- `appRouteFromLocation` reads the hash and falls back to `home` for unsupported values.
- `popstate` restores the route when browser back/forward is used.
- Initial route state is read on `DOMContentLoaded`.
- Shared shell controls use `data-app-route` and are wired through `bindAppShell`.
- Track is intentionally not in the supported route allowlist. Seasons remains a partial placeholder, not a completed seasonal system.

A new static contract suite guards these source-level behaviors. It does not simulate a real browser, pointer, keyboard, touch, reload or deep-link request.

### 2. DEV frontend isolation

Verified in the tracked frontend files:

- `index.html` labels the application as **CS2 Analytics DEV — тестовая среда**.
- `supabase-config.js` points to `https://nwujudniysolpevbtggd.supabase.co`.
- The production Supabase project ref `agetaoekkbhbmfmhxseu` is absent from the DEV browser config.
- `index.html` loads `supabase-config.js` before `app_v57.js`.
- The deployment note identifies the Cloudflare DEV service as `cs2-analytics-dev` and says its intended Git branch is `faceit-dev`.

A new static contract suite guards the DEV branding, Supabase project ref and script ordering. These checks inspect repository source only; they do not prove what a live browser has downloaded.

## Follow-up source audit — 2026-11-12

A wider route-to-workflow audit added a per-section source map in [the route inventory](FACEIT_V2_ROUTE_INVENTORY_2026-11-11.md) and found two legacy controls that bypassed the central router:

- Account-menu “Мой профиль” changed `state.tab` directly.
- Season history “Все матчи” changed `state.tab` directly.

Both now call `navigateApp('profile')` / `navigateApp('base')`. Regression contracts cover the complete critical workflow function surface, route dispatch, archive/restore of parent series and child maps, and prevent literal route mutations in cross-section controls.

Latest quality gate: [run 43108458146](https://github.com/nonspam/cs2-5x5/actions/runs/43108458146), **122 passed / 0 failed**. Cloudflare Workers Build for `cs2-analytics-dev` succeeded on the same source branch: [build check](https://github.com/nonspam/cs2-5x5/runs/130817869345), version `44499ac1-3acf-460d-9e2b-01a0c35bed93`.

The Cloudflare check confirms a successful Worker build, not that a browser is currently served that exact SHA. No live browser smoke test has been performed.

## Still open — do not mark as complete

1. Obtain the exact Cloudflare `workers.dev` hostname from the Cloudflare deployment metadata. It is not present in the tracked deployment note.
2. Verify the latest Cloudflare deployment branch and deployed commit SHA match `faceit-dev`.
3. Open the live DEV site and inspect the runtime config/network requests to confirm only the DEV Supabase project is contacted.
4. Run browser smoke tests for every route, direct hash entry, reload, back/forward, modals, account flows, desktop/tablet/mobile, keyboard and touch.
5. Do not perform data-entry tests until the live DEV snapshot and access context are confirmed.

## Safety boundary

- No production GitHub branch or production Supabase project was changed.
- No Supabase rows, schema, policies, grants or migrations were changed in this batch.
- GitHub-triggered Cloudflare DEV Worker build ran and succeeded; deployed serving SHA and browser behavior remain unverified.
- No visual CSS or design decisions were changed.
