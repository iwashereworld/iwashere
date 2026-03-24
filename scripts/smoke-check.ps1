$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$privacyPath = Join-Path $root 'privacy-policy.html'
$termsPath = Join-Path $root 'terms.html'
$helpersPath = Join-Path $root 'app-helpers.js'
$uiPath = Join-Path $root 'app-ui.js'
$supabaseReadmePath = Join-Path $root 'supabase\README.md'
$supabaseSchemaPath = Join-Path $root 'supabase\schema.sql'
$supabasePoliciesPath = Join-Path $root 'supabase\policies.sql'

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

$index = Get-Content -Raw $indexPath
$privacy = Get-Content -Raw $privacyPath
$terms = Get-Content -Raw $termsPath
$helpers = Get-Content -Raw $helpersPath
$ui = Get-Content -Raw $uiPath
$supabaseReadme = Get-Content -Raw $supabaseReadmePath
$supabaseSchema = Get-Content -Raw $supabaseSchemaPath
$supabasePolicies = Get-Content -Raw $supabasePoliciesPath

Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $index '<script src="app-ui.js"></script>' 'index.html must load app-ui.js.'
Assert-Contains $helpers 'function renderLists()' 'app-helpers.js must contain renderLists().'
Assert-Contains $helpers 'function showMarks()' 'app-helpers.js must contain showMarks().'
Assert-Contains $helpers 'function showShareCard(pin)' 'app-helpers.js must contain showShareCard().'
Assert-Contains $helpers 'var MAX_NAME_LENGTH = 80;' 'app-helpers.js must define MAX_NAME_LENGTH.'
Assert-Contains $helpers 'var MAX_MESSAGE_LENGTH = 500;' 'app-helpers.js must define MAX_MESSAGE_LENGTH.'
Assert-Contains $ui 'function resetForm()' 'app-ui.js must contain resetForm().'
Assert-Contains $ui 'function openAuth(tab)' 'app-ui.js must contain openAuth(tab).'
Assert-Contains $ui 'function showToast(msg, tone)' 'app-ui.js must contain showToast(msg, tone).'
Assert-NotContains $index "select('*')" "index.html must not use select('*') for marks."
Assert-NotContains $index 'Confirm & Pay' 'Legacy misleading review copy is still present.'
Assert-NotContains $privacy 'Ã¢' 'privacy-policy.html still contains mojibake.'
Assert-NotContains $terms 'Ã¢' 'terms.html still contains mojibake.'
Assert-Contains $supabaseReadme 'Supabase Hardening' 'supabase/README.md must exist.'
Assert-Contains $supabaseSchema 'create table if not exists public.marks' 'supabase/schema.sql must define marks table.'
Assert-Contains $supabasePolicies 'enable row level security' 'supabase/policies.sql must enable RLS.'

Write-Output 'Smoke check passed.'
