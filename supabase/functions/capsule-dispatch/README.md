# Capsule Dispatch Function

This Supabase Edge Function is the backend delivery entry point for all due
capsules.

## Purpose

- atomically claim due `pending` rows from `public.capsule_deliveries`
- reveal self capsules when their release time arrives
- send recipient email for gift capsules through a provider such as Resend
- mark jobs as `revealed`, `sent`, `failed`, or return them to `pending`

## Required Secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `DELIVERY_FROM_EMAIL`
- `PUBLIC_APP_URL`

## Deploy

```bash
supabase functions deploy capsule-dispatch
```

## Trigger Strategy

Recommended option for this repo:

- GitHub Actions schedule hitting the function endpoint directly

The scheduled job should:

- call the Supabase function endpoint with the anon key
- fail loudly when the function returns a non-2xx status
- keep the schedule outside the frontend deployment target

## Important

Use service role credentials only inside the function runtime. Never expose them
to the frontend.

If email delivery secrets are missing, gift jobs should be returned to
`pending`, while normal self-reveal capsules can still be opened safely.
