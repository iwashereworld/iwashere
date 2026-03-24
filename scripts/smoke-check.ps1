$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$privacyPath = Join-Path $root 'privacy-policy.html'
$termsPath = Join-Path $root 'terms.html'
$helpersPath = Join-Path $root 'app-helpers.js'

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

Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $helpers 'function renderLists()' 'app-helpers.js must contain renderLists().'
Assert-Contains $helpers 'function showMarks()' 'app-helpers.js must contain showMarks().'
Assert-Contains $helpers 'function showShareCard(pin)' 'app-helpers.js must contain showShareCard().'
Assert-NotContains $index "select('*')" "index.html must not use select('*') for marks."
Assert-NotContains $index 'Confirm & Pay' 'Legacy misleading review copy is still present.'
Assert-NotContains $privacy 'â' 'privacy-policy.html still contains mojibake.'
Assert-NotContains $terms 'â' 'terms.html still contains mojibake.'

Write-Output 'Smoke check passed.'
