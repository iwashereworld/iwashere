$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$readmePath = Join-Path $root 'README.md'
$configPath = Join-Path $root 'app-config.js'
$runtimeConfigPath = Join-Path $root 'api\runtime-config.js'
$healthPath = Join-Path $root 'api\health.js'
$configExamplePath = Join-Path $root 'app-config.example.js'
$i18nOverridesPath = Join-Path $root 'app-i18n-overrides.js'
$uiOverridesPath = Join-Path $root 'app-ui-overrides.js'
$smokePath = Join-Path $PSScriptRoot 'smoke-check.ps1'
$rolloutChecklistPath = Join-Path $root 'supabase\rollout-checklist.md'
$stagingRunbookPath = Join-Path $root 'supabase\staging-runbook.md'
$vercelEnvMapPath = Join-Path $root 'supabase\vercel-env-map.md'
$capsuleDispatchReadmePath = Join-Path $root 'supabase\functions\capsule-dispatch\README.md'
$capsuleReadinessPath = Join-Path $root 'scripts\capsule-readiness.ps1'
$stagingReadinessPath = Join-Path $root 'scripts\staging-readiness.ps1'
$privacyPath = Join-Path $root 'privacy-policy.html'
$termsPath = Join-Path $root 'terms.html'
$robotsPath = Join-Path $root 'robots.txt'
$sitemapPath = Join-Path $root 'sitemap.xml'
$packageJsonPath = Join-Path $root 'package.json'
$envExamplePath = Join-Path $root '.env.example'
$voiceMigrationPath = Join-Path $root 'supabase\migrations\20260324170300_voice_storage.sql'

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
$health = Get-Content -Raw $healthPath
$configExample = Get-Content -Raw $configExamplePath
$i18nOverrides = Get-Content -Raw $i18nOverridesPath
$uiOverrides = Get-Content -Raw $uiOverridesPath
$rolloutChecklist = Get-Content -Raw $rolloutChecklistPath
$stagingRunbook = Get-Content -Raw $stagingRunbookPath
$vercelEnvMap = Get-Content -Raw $vercelEnvMapPath
$capsuleDispatchReadme = Get-Content -Raw $capsuleDispatchReadmePath
$capsuleReadiness = Get-Content -Raw $capsuleReadinessPath
$stagingReadiness = Get-Content -Raw $stagingReadinessPath
$privacy = Get-Content -Raw $privacyPath
$terms = Get-Content -Raw $termsPath
$robots = Get-Content -Raw $robotsPath
$sitemap = Get-Content -Raw $sitemapPath
$packageJson = Get-Content -Raw $packageJsonPath
$envExample = Get-Content -Raw $envExamplePath

Assert-Contains $index '<script src="/api/runtime-config.js"></script>' 'index.html must load the runtime config endpoint.'
Assert-Contains $index '<meta name="description"' 'index.html must include a description meta tag.'
Assert-Contains $index '<link rel="canonical"' 'index.html must include a canonical URL.'
Assert-Contains $index 'application/ld+json' 'index.html must include structured data.'
Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $index '<script src="app-ui.js"></script>' 'index.html must load app-ui.js.'
Assert-Contains $index '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>' 'index.html must load Supabase SDK.'
Assert-Contains $index '<script src="app-i18n-overrides.js"></script>' 'index.html must load app-i18n-overrides.js.'
Assert-Contains $index '<script src="app-ui-overrides.js"></script>' 'index.html must load app-ui-overrides.js.'
Assert-Contains $packageJson '"build"' 'package.json must expose a build script.'
Assert-Contains $packageJson '"dev"' 'package.json must expose a dev script.'
Assert-Contains $packageJson '"staging:readiness"' 'package.json must expose a staging readiness script.'
Assert-Contains $packageJson '"staging:e2e"' 'package.json must expose a staging e2e script.'
Assert-Contains $envExample 'STAGING_RUNTIME_CONFIG_URL=' '.env.example must define STAGING_RUNTIME_CONFIG_URL.'
Assert-Contains $envExample 'SUPABASE_SERVICE_ROLE_KEY=' '.env.example must define SUPABASE_SERVICE_ROLE_KEY.'
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
Assert-NotContains $config 'ctjgxonismqdxprlohcz.supabase.co' 'app-config.js must not hardcode production Supabase.'
Assert-NotContains $runtimeConfig 'ENABLE_VOICE_UPLOAD' 'api/runtime-config.js must not expose voice upload flag.'
Assert-Contains $runtimeConfig 'PUBLIC_APP_URL' 'api/runtime-config.js must expose PUBLIC_APP_URL.'
Assert-Contains $health 'publicAppUrl' 'api/health.js must expose runtime health metadata.'
Assert-Contains $i18nOverrides 'hero_eyebrow' 'app-i18n-overrides.js must provide Turkish copy overrides.'
Assert-Contains $uiOverrides 'function getStepCopy()' 'app-ui-overrides.js must override onboarding copy safely.'
if (([regex]::Matches($uiOverrides, 'function getStepCopy\(')).Count -ne 1) {
  throw 'app-ui-overrides.js must keep a single getStepCopy() override.'
}
if (([regex]::Matches($i18nOverrides, 'Object\.assign\(window\.I18N_MESSAGES\.tr')).Count -ne 1) {
  throw 'app-i18n-overrides.js must keep a single Turkish override block.'
}
Assert-Contains $configExample 'window.IWH_CONFIG' 'app-config.example.js must define example config.'
Assert-Contains $configExample 'PUBLIC_APP_URL' 'app-config.example.js must document PUBLIC_APP_URL.'
Assert-NotContains $configExample 'ENABLE_VOICE_UPLOAD' 'app-config.example.js must not expose voice upload flag.'
Assert-Contains $rolloutChecklist 'RLS Validation' 'Supabase rollout checklist must contain RLS validation.'
Assert-NotContains $rolloutChecklist 'Voice Validation' 'Supabase rollout checklist must not contain voice validation.'
Assert-Contains $stagingRunbook 'Exit Criteria' 'staging runbook must define exit criteria.'
Assert-NotContains $stagingRunbook 'voice-upload' 'staging runbook must not reference voice-upload.'
Assert-Contains $vercelEnvMap 'Safe Rollout Rule' 'vercel env map must define a safe rollout rule.'
Assert-NotContains $vercelEnvMap 'ENABLE_VOICE_UPLOAD' 'vercel env map must not mention deprecated voice flag.'
Assert-Contains $capsuleDispatchReadme 'Required Secrets' 'capsule-dispatch README must document required secrets.'
Assert-Contains $capsuleReadiness 'Missing secrets' 'capsule readiness script must report missing secrets clearly.'
Assert-Contains $stagingReadiness 'STAGING_RUNTIME_CONFIG_URL is required.' 'staging-readiness must require a target runtime config URL.'
Assert-Contains $stagingReadiness 'STAGING_SUPABASE_URL is required.' 'staging-readiness must require the expected staging Supabase URL.'
Assert-Contains $stagingReadiness 'STAGING_FUNCTIONS_BASE_URL is required.' 'staging-readiness must require the expected functions base URL.'
Assert-Contains $stagingReadiness 'Invoke-RestMethod' 'staging-readiness must perform a real runtime config request.'
Assert-Contains $index "window.addEventListener('error'" 'index.html must register a global error handler.'
Assert-Contains $index "window.addEventListener('unhandledrejection'" 'index.html must register a global rejection handler.'
Assert-Contains $privacy '<meta name="description"' 'privacy-policy.html must include SEO description metadata.'
Assert-Contains $terms '<meta name="description"' 'terms.html must include SEO description metadata.'
Assert-Contains $robots 'Sitemap: https://iwashere-seven.vercel.app/sitemap.xml' 'robots.txt must reference the sitemap.'
Assert-Contains $sitemap '<loc>https://iwashere-seven.vercel.app/</loc>' 'sitemap.xml must include the home page.'
if (Test-Path $voiceMigrationPath) {
  throw 'Deprecated voice storage migration must not exist.'
}

Write-Output 'Release check passed.'
