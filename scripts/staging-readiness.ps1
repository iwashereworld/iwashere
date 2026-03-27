[CmdletBinding()]
param(
  [string]$RuntimeConfigUrl = $env:STAGING_RUNTIME_CONFIG_URL,
  [string]$ExpectedSupabaseUrl = $env:STAGING_SUPABASE_URL,
  [string]$ExpectedFunctionsBaseUrl = $env:STAGING_FUNCTIONS_BASE_URL
)

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

function Assert-Contains {
  param(
    [string]$Content,
    [string]$Needle,
    [string]$Message
  )

  if ($Content -notmatch [regex]::Escape($Needle)) {
    throw $Message
  }
}

function Get-VercelCommand {
  $commonPaths = @(
    (Join-Path $env:APPDATA 'npm\vercel.cmd'),
    (Join-Path $env:APPDATA 'npm\vercel'),
    'C:\Users\samet\AppData\Roaming\npm\vercel.cmd'
  )
  foreach ($candidate in $commonPaths) {
    if ($candidate -and (Test-Path $candidate)) {
      return [pscustomobject]@{
        Binary = $candidate
        Args = @()
      }
    }
  }

  $vercel = Get-Command vercel -ErrorAction SilentlyContinue
  if ($vercel) {
    return [pscustomobject]@{
      Binary = $vercel.Source
      Args = @()
    }
  }

  $npx = Get-Command npx -ErrorAction SilentlyContinue
  if ($npx) {
    return [pscustomobject]@{
      Binary = $npx.Source
      Args = @('vercel')
    }
  }

  throw 'Vercel CLI was not found. Install it or make it available on PATH before running staging-readiness.'
}

function Get-RuntimeConfigText {
  param(
    [string]$TargetUrl
  )

  $uri = [System.Uri]$TargetUrl
  if ($uri.Host -like '*.vercel.app') {
    $deployment = $uri.GetLeftPart([System.UriPartial]::Authority)
    $path = $uri.PathAndQuery
    $vercelCommand = Get-VercelCommand
    return (& $vercelCommand.Binary @($vercelCommand.Args) curl $path --deployment $deployment)
  }

  return Invoke-RestMethod -Method Get -Uri $TargetUrl
}

foreach ($path in $requiredPaths) {
  if (-not (Test-Path $path)) {
    throw "Missing required staging asset: $path"
  }
}

if (-not $RuntimeConfigUrl) {
  throw 'STAGING_RUNTIME_CONFIG_URL is required.'
}

if (-not $ExpectedSupabaseUrl) {
  throw 'STAGING_SUPABASE_URL is required.'
}

if (-not $ExpectedFunctionsBaseUrl) {
  throw 'STAGING_FUNCTIONS_BASE_URL is required.'
}

$runtimeConfig = Get-RuntimeConfigText $RuntimeConfigUrl
$runtimeConfigText = $runtimeConfig | Out-String

Assert-Contains $runtimeConfigText $ExpectedSupabaseUrl 'Staging runtime config does not point to the expected Supabase URL.'
Assert-Contains $runtimeConfigText $ExpectedFunctionsBaseUrl 'Staging runtime config does not point to the expected functions base URL.'
Assert-Contains $runtimeConfigText 'SUPABASE_ANON_KEY' 'Staging runtime config must expose SUPABASE_ANON_KEY.'

Write-Output 'Staging readiness check passed.'
