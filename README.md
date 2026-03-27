# I Was Here

Static frontend for a globe-based memory capsule product.

## Current Stack

- Static HTML/CSS/JS
- Supabase Auth + database
- CesiumJS globe rendering
- Vercel deployment via GitHub

## Current State

The project is a working globe-based memory product surface backed by Supabase.
The launch-critical frontend, auth, permalink, and capsule groundwork live in this repo.

### Implemented

- Landing page and globe entry flow
- Supabase authentication
- Mark creation with text, photo, coordinates, and capsule metadata
- Mark loading from Supabase
- Share card modal
- Privacy Policy and Terms pages

### Operational Notes

- Staging and production environment wiring is documented in `supabase/vercel-env-map.md`
- Capsule rollout and rollout checks live under `supabase/` and `scripts/`
- Delivery secrets are still required outside the repo for recipient email sends

## Deployment

The project is deployed from GitHub to Vercel.

Typical workflow:

```powershell
git add .
git commit -m "your change"
git push origin main
```

Vercel should deploy automatically after push.

## Smoke Check

Run the lightweight repository check with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-check.ps1
```

For a stricter release-oriented pass, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\release-check.ps1
```

For staging readiness, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\staging-readiness.ps1
```

GitHub Actions now runs both checks on pushes to `main` and on pull requests.

## Important Notes

- Frontend depends on Supabase configuration and policies outside this repo.
- Cesium token is fetched from a Supabase Edge Function.
- Data access rules must be enforced in Supabase, not only in the frontend.
- Production rollout artifacts for Supabase now live in `supabase/`.
- Use `supabase/staging-runbook.md` before applying anything to production.
- Runtime frontend config now lives in `app-config.js`.
- Vercel overrides are served from `/api/runtime-config.js`.
- Use `app-config.example.js` and `supabase/vercel-env-map.md` when wiring staging or production envs.

## Priority Areas

1. Apply and verify the Supabase schema/RLS package in staging, then production
2. Reduce remaining frontend coupling in `index.html`
3. Add stronger automated checks beyond the current smoke test
4. Build real backend delivery flows for capsules, notifications, and richer media
