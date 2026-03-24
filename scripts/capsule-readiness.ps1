param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRef
)

$ErrorActionPreference = 'Stop'

$secretsOutput = supabase secrets list --project-ref $ProjectRef -o json | ConvertFrom-Json
$required = @(
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLIC_APP_URL',
  'RESEND_API_KEY',
  'DELIVERY_FROM_EMAIL'
)

$missing = @()
foreach ($name in $required) {
  $hasSecret = $secretsOutput | Where-Object { $_.name -eq $name }
  if (-not $hasSecret) {
    $missing += $name
  }
}

if ($missing.Count -gt 0) {
  Write-Output ('Capsule readiness incomplete. Missing secrets: ' + ($missing -join ', '))
  exit 1
}

Write-Output 'Capsule readiness check passed.'
