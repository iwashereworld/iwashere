# Capsule Dispatch Function

This Supabase Edge Function is the backend delivery entry point for future
capsules addressed to another recipient.

## Purpose

- find due `pending` rows from `public.capsule_deliveries`
- send an email through a provider such as Resend
- mark the job as `sent` or `failed`

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

Recommended options:

- Supabase scheduled invocation
- external cron calling the function endpoint

## Important

Use service role credentials only inside the function runtime. Never expose them
to the frontend.

If email delivery secrets are missing, the function should return `503` without
mutating queued jobs.
