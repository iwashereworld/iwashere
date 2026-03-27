$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$requiredPaths = @(
  (Join-Path $root 'supabase\schema.sql'),
  (Join-Path $root 'supabase\policies.sql'),
  (Join-Path $root 'supabase\capsule-delivery.sql'),
  (Join-Path $root 'supabase\staging-runbook.md'),
  (Join-Path $root 'supabase\env.example.md'),
  (Join-Path $root 'supabase\vercel-env-map.md'),
  (Join-Path $root 'supabase\functions\capsule-dispatch\index.ts')
)

foreach ($path in $requiredPaths) {
  if (-not (Test-Path $path)) {
    throw "Missing required staging asset: $path"
  }
}

Write-Output 'Staging readiness check passed.'
