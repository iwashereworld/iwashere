# Staging Runbook

This runbook is the practical sequence for bringing the Supabase backend package
online in a staging environment before touching production.

## 1. Prepare Environment

- create or select a staging Supabase project
- connect Supabase CLI to the staging project
- set staging secrets from `env.example.md`
- if Supabase branching is unavailable on the current plan, use a dedicated
  staging project instead of a branch

## 2. Apply Database Rollout

Apply the staged migration bundle:

```bash
supabase db push --include-all --yes --workdir <repo>
```

Expected remote migration:

- `20260327183000_capsule_hardening.sql`

## 3. Deploy Functions

```bash
supabase functions deploy capsule-dispatch
```

## 4. Configure Scheduled Dispatch

- add GitHub Actions secrets:
  - `CAPSULE_DISPATCH_URL`
  - `SUPABASE_ANON_KEY`
- point `CAPSULE_DISPATCH_URL` to the staging function endpoint
- enable `.github/workflows/capsule-dispatch.yml`

## 5. Verify Core Product

- open the Vercel preview or staging site
- confirm `/api/runtime-config.js` returns the staging values
- sign in
- create a public mark
- create a capsule mark for yourself
- create a capsule mark for another recipient

## 6. Verify Capsule Delivery Queue

- inspect `public.capsule_deliveries`
- confirm a row exists for the self capsule
- confirm a row exists for the recipient-targeted capsule
- set `scheduled_for` to the current time in staging
- invoke the `capsule-dispatch` function
- trigger the `capsule-dispatch` GitHub Actions workflow manually
- if email secrets are configured, confirm the row becomes `sent` or `failed`
- if email secrets are not configured yet, confirm self capsules still reveal
  and gift jobs return to `pending`

## 7. Exit Criteria

- smoke check passes locally
- release check passes locally
- GitHub Actions quality workflow passes
- rollout checklist items are completed
