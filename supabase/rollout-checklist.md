# Rollout Checklist

## Before Applying

- confirm the current production table shape
- back up the existing `marks` table
- test in staging first

## Schema Validation

- insert a valid public mark
- insert a valid capsule mark for `myself`
- insert a valid capsule mark for `other`
- verify invalid rows fail:
  - name longer than 80 chars
  - message longer than 500 chars
  - `recipient_email` present when `capsule_days = 0`
  - `capsule_for = 'other'` without `recipient_email`

## RLS Validation

- anonymous user can read only public rows
- anonymous user cannot insert
- authenticated user can insert only with their own `user_id`
- authenticated user cannot update or delete another user's row
- authenticated user can read their own rows

## Frontend Validation

- public marks still load in the globe view
- signed-in user can create a public mark
- signed-in user can create a capsule mark
- `No Capsule` does not send `recipient_email`
- `My Marks` still shows only the current user's marks

## Delivery Validation

- create a capsule mark for `other`
- confirm a `capsule_deliveries` row is created
- move `scheduled_for` to the current time in staging
- invoke the `capsule-dispatch` function
- confirm the row becomes `sent` or `failed` with an error recorded

## After Release

- monitor Supabase logs for policy denials
- verify Vercel production still reads public marks correctly
- document any schema drift in this folder
