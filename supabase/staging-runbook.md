# Staging Runbook

This runbook is the practical sequence for bringing the Supabase backend package
online in a staging environment before touching production.

## 1. Prepare Environment

- create or select a staging Supabase project
- connect Supabase CLI to the staging project
- set staging secrets from `env.example.md`

## 2. Apply SQL

Apply in this order:

1. `schema.sql`
2. `policies.sql`
3. `capsule-delivery.sql`
4. `voice-storage.sql`

## 3. Deploy Functions

```bash
supabase functions deploy capsule-dispatch
supabase functions deploy voice-upload
```

## 4. Verify Core Product

- open the Vercel preview or staging site
- sign in
- create a public mark
- create a capsule mark for yourself
- create a capsule mark for another recipient

## 5. Verify Capsule Delivery Queue

- inspect `public.capsule_deliveries`
- confirm a row exists for the recipient-targeted capsule
- set `scheduled_for` to the current time in staging
- invoke the `capsule-dispatch` function
- confirm the row becomes `sent` or `failed`

## 6. Verify Voice Upload Prep

- invoke `voice-upload` with an authenticated user
- confirm a `voice_messages` row is created
- upload a file to the returned storage path
- confirm the row and object are readable only by the owner

## 7. Exit Criteria

- smoke check passes locally
- release check passes locally
- GitHub Actions quality workflow passes
- rollout checklist items are completed
