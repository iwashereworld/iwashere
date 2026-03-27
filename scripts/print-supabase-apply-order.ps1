$steps = @(
  '1. Apply supabase/schema.sql',
  '2. Apply supabase/policies.sql',
  '3. Apply supabase/capsule-delivery.sql',
  '4. Deploy function supabase/functions/capsule-dispatch',
  '5. Run scripts/smoke-check.ps1',
  '6. Run scripts/release-check.ps1',
  '7. Follow supabase/staging-runbook.md'
)

$steps | ForEach-Object { Write-Output $_ }
