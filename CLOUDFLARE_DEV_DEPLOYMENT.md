# Cloudflare DEV deployment

This file exists to record the isolated DEV deployment setup and to trigger a new Git-based deployment from the `faceit-dev` branch.

- Cloudflare Worker/service: `cs2-analytics-dev`
- GitHub repository: `nonspam/cs2-5x5`
- Intended production branch for this DEV-only Cloudflare service: `faceit-dev`
- DEV frontend config: `supabase-config.js` must point only to Supabase project `nwujudniysolpevbtggd`.
- Never change the production GitHub Pages source (`main`) or production Supabase project (`agetaoekkbhbmfmhxseu`) as part of DEV deployment.

## Deployment verification checklist

- Confirm the latest Cloudflare Git deployment references branch `faceit-dev`.
- Confirm the deployed commit SHA matches the latest commit on `faceit-dev`.
- Open the `workers.dev` URL and verify the DEV branding.
- Inspect the loaded runtime config and verify requests target only `nwujudniysolpevbtggd.supabase.co`.
- Do not use the DEV site for data-entry tests until its database snapshot has been synchronized and validated.
