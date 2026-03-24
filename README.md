# I Was Here

Static frontend for a globe-based memory capsule product.

## Current Stack

- Static HTML/CSS/JS
- Supabase Auth + database
- CesiumJS globe rendering
- Vercel deployment via GitHub

## Current State

The project is functional as a frontend prototype and early product surface.
Some product areas are intentionally simplified or not fully implemented yet.

### Implemented

- Landing page and globe entry flow
- Supabase authentication
- Mark creation with text, photo, coordinates, and capsule metadata
- Mark loading from Supabase
- Share card modal
- Privacy Policy and Terms pages

### Partially Implemented / Limited

- Voice recording is currently local preview only
- Capsule recipient and timing UI exist, but downstream delivery flows may be limited
- Pricing and product copy are being aligned with actual behavior

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

GitHub Actions now runs both checks on pushes to `main` and on pull requests.

## Important Notes

- Frontend depends on Supabase configuration and policies outside this repo.
- Cesium token is fetched from a Supabase Edge Function.
- Data access rules must be enforced in Supabase, not only in the frontend.
- Production rollout artifacts for Supabase now live in `supabase/`.
- Use `supabase/staging-runbook.md` before applying anything to production.

## Priority Areas

1. Apply and verify the Supabase schema/RLS package in staging, then production
2. Reduce remaining frontend coupling in `index.html`
3. Add stronger automated checks beyond the current smoke test
4. Build real backend delivery flows for capsules, notifications, and media
