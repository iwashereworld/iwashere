# Staging Runbook

This runbook is the practical sequence for bringing the Supabase backend package
online in a staging environment before touching production.

## 1. Prepare Environment

- create or select a staging Supabase project
- connect Supabase CLI to the staging project
- set staging secrets from `env.example.md`
- if Supabase branching is unavailable on the current plan, use a dedicated
  staging project instead of a branch

## 2. Apply SQL

Apply in this order:

1. `schema.sql`
2. `policies.sql`
3. `capsule-delivery.sql`

## 3. Deploy Functions

```bash
supabase functions deploy capsule-dispatch
```

## 4. Verify Core Product

- open the Vercel preview or staging site
- confirm `/api/runtime-config.js` returns the staging values
- sign in
- create a public mark
- create a capsule mark for yourself
- create a capsule mark for another recipient

## 5. Verify Capsule Delivery Queue

- inspect `public.capsule_deliveries`
- confirm a row exists for the recipient-targeted capsule
- set `scheduled_for` to the current time in staging
- invoke the `capsule-dispatch` function
- if email secrets are configured, confirm the row becomes `sent` or `failed`
- if email secrets are not configured yet, confirm the function returns `503`
  without mutating queued jobs

## 6. Exit Criteria

- smoke check passes locally
- release check passes locally
- GitHub Actions quality workflow passes
- rollout checklist items are completed
