# Production Runbook

Use this only after staging has passed.

## 1. Freeze the Release

- ensure `main` is green in GitHub Actions
- confirm the exact commit hash to release
- avoid making schema changes directly in the dashboard without recording them here

## 2. Back Up Current State

- export the current `marks` table
- snapshot or export any existing storage bucket configuration
- note the currently deployed function versions

## 3. Apply SQL Carefully

Apply in this order:

1. `schema.sql`
2. `policies.sql`
3. `capsule-delivery.sql`

Validate each step before moving to the next.

## 4. Set Production Secrets

Load the values listed in `env.example.md` for production.

## 5. Deploy Functions

```bash
supabase functions deploy capsule-dispatch
```

## 6. Functional Verification

- create one public mark
- create one capsule mark for `myself`
- create one capsule mark for `other`
- verify the queue row is created

## 7. Monitor

- watch Supabase database logs
- watch Edge Function logs
- watch Vercel runtime behavior
- confirm public mark loading and authenticated mark creation still work

## 8. Rollback Trigger

Rollback immediately if any of these happen:

- public marks stop loading
- authenticated users cannot create marks
- RLS blocks legitimate owner reads/writes
- function deployment breaks auth or storage access
