# Supabase Function Env Example

Set these secrets in Supabase before deploying the backend functions.

## Shared

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_APP_URL`

## `capsule-dispatch`

- `RESEND_API_KEY`
- `DELIVERY_FROM_EMAIL`

## Notes

- keep service role keys only in Supabase secrets, never in frontend code
- set `PUBLIC_APP_URL` to the deployed Vercel URL for the target environment
- use different values for staging and production
