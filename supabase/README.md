# Supabase Hardening

This folder contains the baseline database and policy artifacts needed to move
the current frontend toward a production-ready Supabase setup.

## Files

- `schema.sql`: recommended `marks` table shape and constraints
- `policies.sql`: row-level security policies for read/write boundaries
- `capsule-delivery.sql`: queue table and trigger for future capsule delivery jobs
- `rollout-checklist.md`: safe rollout order for production
- `functions/capsule-dispatch/`: Edge Function scaffold for due capsule sends

## Intent

The frontend already minimizes selected fields and normalizes records, but that
is not a security boundary. The database must enforce:

- authenticated writes only
- public reads only for non-sensitive fields
- owner-only access for private records
- no accidental exposure of `recipient_email`

## Apply Order

1. Review `schema.sql`
2. Create a staging Supabase project or staging branch
3. Apply `schema.sql`
4. Apply `policies.sql`
5. Verify with the checklist in `rollout-checklist.md`
6. Update the frontend to target any new public/private split if needed

## Important

These SQL files are intentionally conservative and designed around the current
frontend behavior. If you later introduce real delivery flows, notifications, or
storage buckets for voice/media, extend the schema instead of overloading the
current table.
