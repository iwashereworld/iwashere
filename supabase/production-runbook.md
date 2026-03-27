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

## 3. Apply Database Rollout Carefully

Apply the migration bundle instead of ad hoc SQL:

```bash
supabase db push --include-all --yes --workdir <repo>
```

Validate that remote migration `20260327183000_capsule_hardening.sql` is present before moving on.

## 4. Set Production Secrets

Load the values listed in `env.example.md` for production.

## 5. Deploy Functions

```bash
supabase functions deploy capsule-dispatch
```

## 6. Configure Scheduled Dispatch

- add GitHub Actions secrets:
  - `CAPSULE_DISPATCH_URL`
  - `SUPABASE_ANON_KEY`
- point `CAPSULE_DISPATCH_URL` to the production function endpoint
- enable `.github/workflows/capsule-dispatch.yml`

## 7. Functional Verification

- create one public mark
- create one capsule mark for `myself`
- create one capsule mark for `other`
- verify the queue row is created

## 8. Monitor

- watch Supabase database logs
- watch Edge Function logs
- watch Vercel runtime behavior
- confirm public mark loading and authenticated mark creation still work

## 9. Rollback Trigger

Rollback immediately if any of these happen:

- public marks stop loading
- authenticated users cannot create marks
- RLS blocks legitimate owner reads/writes
- function deployment breaks auth or storage access

## 10. Rollback Steps

If production needs to be rolled back:

- disable the scheduled `capsule-dispatch` workflow before retrying anything
- restore the previous known-good app deployment
- redeploy the previous known-good `capsule-dispatch` function if the issue is isolated to dispatch
- if the database rollout caused the incident, stop writes, restore from the pre-rollout backup, and re-run smoke checks against the restored state
- confirm `/api/runtime-config.js` still returns the production values after rollback
