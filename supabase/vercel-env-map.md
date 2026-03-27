# Vercel / Supabase Env Map

Use this map when wiring the frontend deployment to the Supabase environments.

## Vercel Preview / Staging

- `SUPABASE_URL` -> staging Supabase project URL
- `SUPABASE_ANON_KEY` -> staging Supabase anon key
- `FUNCTIONS_BASE_URL` -> `https://<staging-project-ref>.supabase.co/functions/v1`

## Vercel Production

- `SUPABASE_URL` -> production Supabase project URL
- `SUPABASE_ANON_KEY` -> production Supabase anon key
- `FUNCTIONS_BASE_URL` -> `https://<production-project-ref>.supabase.co/functions/v1`

## Frontend Wiring

This project currently reads runtime config from `/api/runtime-config.js`, with
`app-config.js` acting as the local fallback. If you switch to a build step
later, keep the same key names so the rest of the frontend does not need to
change.

## Safe Rollout Rule

- never point Vercel production at staging Supabase
- verify preview deployments against staging before copying values into production
