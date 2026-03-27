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
$capsuleReadinessPath = Join-Path $root 'scripts\capsule-readiness.ps1'
$privacyPath = Join-Path $root 'privacy-policy.html'
$termsPath = Join-Path $root 'terms.html'
$robotsPath = Join-Path $root 'robots.txt'
$sitemapPath = Join-Path $root 'sitemap.xml'

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
$capsuleReadiness = Get-Content -Raw $capsuleReadinessPath
$privacy = Get-Content -Raw $privacyPath
$terms = Get-Content -Raw $termsPath
$robots = Get-Content -Raw $robotsPath
$sitemap = Get-Content -Raw $sitemapPath

Assert-Contains $index '<script src="/api/runtime-config.js"></script>' 'index.html must load the runtime config endpoint.'
Assert-Contains $index '<meta name="description"' 'index.html must include a description meta tag.'
Assert-Contains $index '<link rel="canonical"' 'index.html must include a canonical URL.'
Assert-Contains $index 'application/ld+json' 'index.html must include structured data.'
Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $index '<script src="app-ui.js"></script>' 'index.html must load app-ui.js.'
Assert-Contains $index '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>' 'index.html must load Supabase SDK.'
Assert-NotContains $index 'function resetForm()' 'UI helpers should not remain inline in index.html.'
Assert-NotContains $index 'function openAuth(tab)' 'Auth helpers should not remain inline in index.html.'
Assert-NotContains $index 'function showToast(msg, tone)' 'Toast helper should not remain inline in index.html.'
Assert-NotContains $index 'voice-area' 'index.html must not retain voice-specific markup.'
Assert-Contains $readme 'Production rollout artifacts for Supabase now live in `supabase/`.' 'README.md must mention Supabase rollout artifacts.'
Assert-Contains $readme 'Use `supabase/staging-runbook.md` before applying anything to production.' 'README.md must point to the staging runbook.'
Assert-Contains $readme 'Runtime frontend config now lives in `app-config.js`.' 'README.md must mention runtime config.'
Assert-Contains $readme '/api/runtime-config.js' 'README.md must mention the runtime config endpoint.'
Assert-Contains $readme 'Use `app-config.example.js` and `supabase/vercel-env-map.md` when wiring staging or production envs.' 'README.md must mention env wiring docs.'
Assert-NotContains $readme 'Voice recording is currently local preview only' 'README.md must not mention deprecated voice preview.'
Assert-NotContains $config 'ENABLE_VOICE_UPLOAD' 'app-config.js must not expose voice upload flag.'
Assert-NotContains $runtimeConfig 'ENABLE_VOICE_UPLOAD' 'api/runtime-config.js must not expose voice upload flag.'
Assert-Contains $configExample 'window.IWH_CONFIG' 'app-config.example.js must define example config.'
Assert-NotContains $configExample 'ENABLE_VOICE_UPLOAD' 'app-config.example.js must not expose voice upload flag.'
Assert-Contains $rolloutChecklist 'RLS Validation' 'Supabase rollout checklist must contain RLS validation.'
Assert-NotContains $rolloutChecklist 'Voice Validation' 'Supabase rollout checklist must not contain voice validation.'
Assert-Contains $stagingRunbook 'Exit Criteria' 'staging runbook must define exit criteria.'
Assert-NotContains $stagingRunbook 'voice-upload' 'staging runbook must not reference voice-upload.'
Assert-Contains $vercelEnvMap 'Safe Rollout Rule' 'vercel env map must define a safe rollout rule.'
Assert-NotContains $vercelEnvMap 'ENABLE_VOICE_UPLOAD' 'vercel env map must not mention deprecated voice flag.'
Assert-Contains $capsuleDispatchReadme 'Required Secrets' 'capsule-dispatch README must document required secrets.'
Assert-Contains $capsuleReadiness 'Missing secrets' 'capsule readiness script must report missing secrets clearly.'
Assert-Contains $privacy '<meta name="description"' 'privacy-policy.html must include SEO description metadata.'
Assert-Contains $terms '<meta name="description"' 'terms.html must include SEO description metadata.'
Assert-Contains $robots 'Sitemap: https://iwashere-seven.vercel.app/sitemap.xml' 'robots.txt must reference the sitemap.'
Assert-Contains $sitemap '<loc>https://iwashere-seven.vercel.app/</loc>' 'sitemap.xml must include the home page.'

Write-Output 'Release check passed.'
