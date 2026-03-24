$steps = @(
  '1. Apply supabase/schema.sql',
  '2. Apply supabase/policies.sql',
  '3. Apply supabase/capsule-delivery.sql',
  '4. Apply supabase/voice-storage.sql',
  '5. Deploy function supabase/functions/capsule-dispatch',
  '6. Deploy function supabase/functions/voice-upload',
  '7. Run scripts/smoke-check.ps1',
  '8. Run scripts/release-check.ps1',
  '9. Follow supabase/staging-runbook.md'
)

$steps | ForEach-Object { Write-Output $_ }
