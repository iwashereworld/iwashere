# Vercel / Supabase Env Map

Use this map when wiring the frontend deployment to the Supabase environments.

## Vercel Preview / Staging

- `SUPABASE_URL` -> staging Supabase project URL
- `SUPABASE_ANON_KEY` -> staging Supabase anon key
- `FUNCTIONS_BASE_URL` -> `https://<staging-project-ref>.supabase.co/functions/v1`
- `CAPSULE_BACKEND_MODE` -> `split`
- current staging project ref: `qejlooembmhiidlumrma`

## Vercel Production

- `SUPABASE_URL` -> production Supabase project URL
- `SUPABASE_ANON_KEY` -> production Supabase anon key
- `FUNCTIONS_BASE_URL` -> `https://<production-project-ref>.supabase.co/functions/v1`
- `CAPSULE_BACKEND_MODE` -> `legacy` until production Supabase rollout is migrated
- current production project ref: `ctjgxonismqdxprlohcz`

## Frontend Wiring

This project reads runtime config from `/api/runtime-config.js`.

- `app-config.js` is now a safe empty fallback and must not contain production keys
- `PUBLIC_APP_URL` is derived from the incoming request host if no explicit env is set
- `CAPSULE_BACKEND_MODE` must be explicit whenever preview and production use different capsule backends
- frontend runtime must never silently fall back from preview to production values

## Safe Rollout Rule

- never point Vercel production at staging Supabase
- verify preview deployments against staging before copying values into production
