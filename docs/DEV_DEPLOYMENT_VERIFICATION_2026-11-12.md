# DEV deployment verification — 2026-11-12

## Confirmed from the repository

- Working branch: `faceit-dev`.
- DEV Cloudflare Worker/service label: `cs2-analytics-dev`.
- DEV Supabase project ref: `nwujudniysolpevbtggd`.
- The GitHub workflow directory contains only:
  - `.github/workflows/quality-gate.yml` — syntax and regression checks.
  - `.github/workflows/project-memory.yml` — append-only commit journal.
- There is no Cloudflare deploy workflow, Wrangler configuration (`wrangler.toml` / `wrangler.jsonc`), or recorded `workers.dev` hostname in the tracked branch.
- The latest branch commit inspected during this audit was `c97078ae19f6d84e1844de40a02cfaff1869c229`; it is an automated documentation-journal commit whose parent is `bb2d27af187a411a8fadf9b438af762955c783d9`.

## Why the public DEV URL is not printed here

Cloudflare's `workers.dev` hostname includes the account's assigned subdomain. The Worker/service name alone is not sufficient to reconstruct that hostname safely. No URL or deployed commit SHA was found in repository files or the GitHub workflow listing. A guessed URL could point nowhere or to the wrong environment, so it is deliberately not presented as the live site.

## Exact values to verify in Cloudflare

In the Cloudflare dashboard, open the `cs2-analytics-dev` Worker and inspect its deployment/source and domain/route details. Record:

1. The complete active `workers.dev` URL.
2. Whether the Git source is `nonspam/cs2-5x5` and the tracked branch is `faceit-dev`.
3. The active deployed commit SHA and deployment timestamp.
4. The public URL's loaded page title should identify `CS2 Analytics DEV`.
5. The loaded `supabase-config.js` must target only `nwujudniysolpevbtggd.supabase.co`.

Do not use the live DEV site for writes until the deployed SHA, URL and DEV Supabase target have all been verified. Never point this Worker at production Supabase or alter the production GitHub Pages source.

## Status

- GitHub branch/source configuration: partially confirmed from repository.
- Cloudflare deployment source, active deployed SHA and actual URL: **not independently verified**.
- Browser rendering, route navigation and visual QA: **not performed**.
- Production deployment or Supabase data/schema writes: **none**.
