$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$readmePath = Join-Path $root 'README.md'
$configPath = Join-Path $root 'app-config.js'
$runtimeConfigPath = Join-Path $root 'api\runtime-config.js'
$configExamplePath = Join-Path $root 'app-config.example.js'
$smokePath = Join-Path $PSScriptRoot 'smoke-check.ps1'
$rolloutChecklistPath = Join-Path $root 'supabase\rollout-checklist.md'
$stagingRunbookPath = Join-Path $root 'supabase\staging-runbook.md'
$vercelEnvMapPath = Join-Path $root 'supabase\vercel-env-map.md'
$capsuleDispatchReadmePath = Join-Path $root 'supabase\functions\capsule-dispatch\README.md'
$voiceUploadReadmePath = Join-Path $root 'supabase\functions\voice-upload\README.md'

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

function Assert-NotContains {
  param(
    [string]$Content,
    [string]$Needle,
    [string]$Message
  )

  if ($Content -match [regex]::Escape($Needle)) {
    throw $Message
  }
}

& powershell -ExecutionPolicy Bypass -File $smokePath

$index = Get-Content -Raw $indexPath
$readme = Get-Content -Raw $readmePath
$config = Get-Content -Raw $configPath
$runtimeConfig = Get-Content -Raw $runtimeConfigPath
$configExample = Get-Content -Raw $configExamplePath
$rolloutChecklist = Get-Content -Raw $rolloutChecklistPath
$stagingRunbook = Get-Content -Raw $stagingRunbookPath
$vercelEnvMap = Get-Content -Raw $vercelEnvMapPath
$capsuleDispatchReadme = Get-Content -Raw $capsuleDispatchReadmePath
$voiceUploadReadme = Get-Content -Raw $voiceUploadReadmePath

Assert-Contains $index '<script src="/api/runtime-config.js"></script>' 'index.html must load the runtime config endpoint.'
Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $index '<script src="app-ui.js"></script>' 'index.html must load app-ui.js.'
Assert-Contains $index '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>' 'index.html must load Supabase SDK.'
Assert-NotContains $index 'function resetForm()' 'UI helpers should not remain inline in index.html.'
Assert-NotContains $index 'function openAuth(tab)' 'Auth helpers should not remain inline in index.html.'
Assert-NotContains $index 'function showToast(msg, tone)' 'Toast helper should not remain inline in index.html.'
Assert-Contains $readme 'Production rollout artifacts for Supabase now live in `supabase/`.' 'README.md must mention Supabase rollout artifacts.'
Assert-Contains $readme 'Use `supabase/staging-runbook.md` before applying anything to production.' 'README.md must point to the staging runbook.'
Assert-Contains $readme 'Runtime frontend config now lives in `app-config.js`.' 'README.md must mention runtime config.'
Assert-Contains $readme '/api/runtime-config.js' 'README.md must mention the runtime config endpoint.'
Assert-Contains $readme 'Use `app-config.example.js` and `supabase/vercel-env-map.md` when wiring staging or production envs.' 'README.md must mention env wiring docs.'
Assert-Contains $config 'ENABLE_VOICE_UPLOAD' 'app-config.js must expose the voice upload flag.'
Assert-Contains $runtimeConfig 'ENABLE_VOICE_UPLOAD' 'api/runtime-config.js must expose the voice upload flag.'
Assert-Contains $configExample 'window.IWH_CONFIG' 'app-config.example.js must define example config.'
Assert-Contains $rolloutChecklist 'RLS Validation' 'Supabase rollout checklist must contain RLS validation.'
Assert-Contains $stagingRunbook 'Exit Criteria' 'staging runbook must define exit criteria.'
Assert-Contains $vercelEnvMap 'Safe Rollout Rule' 'vercel env map must define a safe rollout rule.'
Assert-Contains $capsuleDispatchReadme 'Required Secrets' 'capsule-dispatch README must document required secrets.'
Assert-Contains $voiceUploadReadme 'Expected Request' 'voice-upload README must document expected request.'

Write-Output 'Release check passed.'
