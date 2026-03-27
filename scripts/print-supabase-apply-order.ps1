$steps = @(
  '1. Run supabase db push --include-all --yes',
  '2. Verify migration 20260327183000_capsule_hardening.sql on remote',
  '3. Deploy function supabase/functions/capsule-dispatch',
  '4. Configure .github/workflows/capsule-dispatch.yml secrets',
  '5. Run scripts/smoke-check.ps1',
  '6. Run scripts/release-check.ps1',
  '7. Run scripts/staging-e2e.ps1',
  '8. Follow supabase/staging-runbook.md'
)

$steps | ForEach-Object { Write-Output $_ }
