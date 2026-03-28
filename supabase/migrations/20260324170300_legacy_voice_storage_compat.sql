-- Compatibility migration for production history.
-- Production still records 20260324170300 in schema_migrations from an older rollout.
-- The voice storage feature has been removed from the repo, so this migration is a no-op
-- and exists only to let later capsule migrations apply cleanly.

select 1;
