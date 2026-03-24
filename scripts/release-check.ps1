$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$readmePath = Join-Path $root 'README.md'
$smokePath = Join-Path $PSScriptRoot 'smoke-check.ps1'
$rolloutChecklistPath = Join-Path $root 'supabase\rollout-checklist.md'
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
$rolloutChecklist = Get-Content -Raw $rolloutChecklistPath
$capsuleDispatchReadme = Get-Content -Raw $capsuleDispatchReadmePath
$voiceUploadReadme = Get-Content -Raw $voiceUploadReadmePath

Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $index '<script src="app-ui.js"></script>' 'index.html must load app-ui.js.'
Assert-Contains $index '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>' 'index.html must load Supabase SDK.'
Assert-NotContains $index 'function resetForm()' 'UI helpers should not remain inline in index.html.'
Assert-NotContains $index 'function openAuth(tab)' 'Auth helpers should not remain inline in index.html.'
Assert-NotContains $index 'function showToast(msg, tone)' 'Toast helper should not remain inline in index.html.'
Assert-Contains $readme 'Production rollout artifacts for Supabase now live in `supabase/`.' 'README.md must mention Supabase rollout artifacts.'
Assert-Contains $rolloutChecklist 'RLS Validation' 'Supabase rollout checklist must contain RLS validation.'
Assert-Contains $capsuleDispatchReadme 'Required Secrets' 'capsule-dispatch README must document required secrets.'
Assert-Contains $voiceUploadReadme 'Expected Request' 'voice-upload README must document expected request.'

Write-Output 'Release check passed.'
