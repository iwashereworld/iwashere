# Supabase Hardening

This folder contains the baseline database and policy artifacts needed to move
the current frontend toward a production-ready Supabase setup.

## Files

- `schema.sql`: recommended `marks` table shape and constraints
- `policies.sql`: row-level security policies for read/write boundaries
- `capsule-delivery.sql`: queue table and trigger for future capsule delivery jobs
- `rollout-checklist.md`: safe rollout order for production
- `env.example.md`: required secret inventory for functions
- `staging-runbook.md`: end-to-end staging rollout sequence
- `production-runbook.md`: guarded production rollout sequence
- `functions/capsule-dispatch/`: Edge Function for due self-reveal and gift delivery jobs
- `../.github/workflows/capsule-dispatch.yml`: scheduled trigger for capsule dispatch

## Intent

The frontend already minimizes selected fields and normalizes records, but that
is not a security boundary. The database must enforce:

- authenticated writes only
- public reads only for non-sensitive fields
- owner-only access for private records
- no accidental exposure of `recipient_email`

## Apply Order

1. Review `schema.sql`, `policies.sql`, and `capsule-delivery.sql`
2. Create or link the staging Supabase project
3. Run `supabase db push --include-all --yes --workdir <repo>`
4. Confirm migration `20260327183000_capsule_hardening.sql` is present remotely
5. Deploy `functions/capsule-dispatch`
6. Configure the GitHub Actions schedule
7. Verify with `rollout-checklist.md` and `staging-runbook.md`
8. Update the frontend to target any new public/private split if needed

## Important

These SQL files are intentionally conservative and designed around the current
frontend behavior. If you later introduce real delivery flows, notifications, or
additional media storage, extend the schema instead of overloading the current
table.
