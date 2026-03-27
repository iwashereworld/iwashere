param(
  [string]$RuntimeConfigUrl = $env:STAGING_RUNTIME_CONFIG_URL,
  [string]$ExpectedSupabaseUrl = $env:STAGING_SUPABASE_URL,
  [string]$ExpectedFunctionsBaseUrl = $env:STAGING_FUNCTIONS_BASE_URL,
  [string]$DispatchUrl = $env:CAPSULE_DISPATCH_URL,
  [string]$AnonKey = $env:SUPABASE_ANON_KEY
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

foreach ($path in $requiredPaths) {
  if (-not (Test-Path $path)) {
    throw "Missing required staging asset: $path"
  }
}

if (-not $RuntimeConfigUrl) { throw 'STAGING_RUNTIME_CONFIG_URL is required.' }
if (-not $ExpectedSupabaseUrl) { throw 'STAGING_SUPABASE_URL is required.' }
if (-not $ExpectedFunctionsBaseUrl) { throw 'STAGING_FUNCTIONS_BASE_URL is required.' }
if (-not $DispatchUrl) { throw 'CAPSULE_DISPATCH_URL is required.' }
if (-not $AnonKey) { throw 'SUPABASE_ANON_KEY is required.' }

$runtimeScript = Invoke-RestMethod -Method Get -Uri $RuntimeConfigUrl
$runtimeMatch = [regex]::Match([string]$runtimeScript, 'Object\.assign\(\{\}, window\.IWH_CONFIG \|\| \{\}, (?<json>\{.*\})\);')
if (-not $runtimeMatch.Success) {
  throw 'Runtime config response could not be parsed.'
}

$runtimeConfig = $runtimeMatch.Groups['json'].Value | ConvertFrom-Json
if ($runtimeConfig.SUPABASE_URL -ne $ExpectedSupabaseUrl) {
  throw "Staging runtime config returned unexpected SUPABASE_URL: $($runtimeConfig.SUPABASE_URL)"
}
if ($runtimeConfig.FUNCTIONS_BASE_URL -ne $ExpectedFunctionsBaseUrl) {
  throw "Staging runtime config returned unexpected FUNCTIONS_BASE_URL: $($runtimeConfig.FUNCTIONS_BASE_URL)"
}

$dispatchHeaders = @{
  apikey = $AnonKey
  Authorization = "Bearer $AnonKey"
}
$dispatchResponse = Invoke-RestMethod -Method Post -Uri $DispatchUrl -Headers $dispatchHeaders
if ($null -eq $dispatchResponse.processed) {
  throw 'Dispatch endpoint did not return a valid readiness payload.'
}

Write-Output ("Staging readiness check passed. Runtime={0} Functions={1} DispatchProcessed={2}" -f $runtimeConfig.SUPABASE_URL, $runtimeConfig.FUNCTIONS_BASE_URL, $dispatchResponse.processed)
