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

Validate that remote migrations are present before moving on:

- `20260327183000_capsule_hardening.sql`
- `20260327194500_fix_capsule_delivery_function.sql`
- `20260327211000_capsules_split_model.sql`

If `supabase db push` still fails with `cli_login_postgres` authentication,
stop the rollout and keep production on `CAPSULE_BACKEND_MODE=legacy`.

## 4. Set Production Secrets

Load the values listed in `env.example.md` for production.

Set frontend runtime env explicitly before deploying:

- `CAPSULE_BACKEND_MODE=legacy` until `capsules` and `capsule_dispatch_queue` are migrated in production
- switch to `CAPSULE_BACKEND_MODE=split` only after the production DB push and function deploy succeed

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
- create one legacy capsule mark for `myself`
- create one legacy capsule mark for `other`
- after the split rollout succeeds, create one split capsule for `myself`
- create one split capsule for `other`
- verify the queue row is created in `public.capsule_dispatch_queue`

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
