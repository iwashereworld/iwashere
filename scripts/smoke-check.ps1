$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$privacyPath = Join-Path $root 'privacy-policy.html'
$termsPath = Join-Path $root 'terms.html'
$configPath = Join-Path $root 'app-config.js'
$runtimeConfigPath = Join-Path $root 'api\runtime-config.js'
$helpersPath = Join-Path $root 'app-helpers.js'
$uiPath = Join-Path $root 'app-ui.js'
$i18nPath = Join-Path $root 'app-i18n.js'
$supabaseReadmePath = Join-Path $root 'supabase\README.md'
$supabaseSchemaPath = Join-Path $root 'supabase\schema.sql'
$supabasePoliciesPath = Join-Path $root 'supabase\policies.sql'
$supabaseEnvExamplePath = Join-Path $root 'supabase\env.example.md'
$supabaseStagingRunbookPath = Join-Path $root 'supabase\staging-runbook.md'
$supabaseProductionRunbookPath = Join-Path $root 'supabase\production-runbook.md'
$supabaseVercelEnvMapPath = Join-Path $root 'supabase\vercel-env-map.md'
$capsuleDeliveryPath = Join-Path $root 'supabase\capsule-delivery.sql'
$capsuleDispatchReadmePath = Join-Path $root 'supabase\functions\capsule-dispatch\README.md'
$capsuleDispatchIndexPath = Join-Path $root 'supabase\functions\capsule-dispatch\index.ts'
$capsuleReadinessPath = Join-Path $root 'scripts\capsule-readiness.ps1'

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
$config = Get-Content -Raw $configPath
$runtimeConfig = Get-Content -Raw $runtimeConfigPath
$helpers = Get-Content -Raw $helpersPath
$ui = Get-Content -Raw $uiPath
$i18n = Get-Content -Raw $i18nPath
$supabaseReadme = Get-Content -Raw $supabaseReadmePath
$supabaseSchema = Get-Content -Raw $supabaseSchemaPath
$supabasePolicies = Get-Content -Raw $supabasePoliciesPath
$supabaseEnvExample = Get-Content -Raw $supabaseEnvExamplePath
$supabaseStagingRunbook = Get-Content -Raw $supabaseStagingRunbookPath
$supabaseProductionRunbook = Get-Content -Raw $supabaseProductionRunbookPath
$supabaseVercelEnvMap = Get-Content -Raw $supabaseVercelEnvMapPath
$capsuleDelivery = Get-Content -Raw $capsuleDeliveryPath
$capsuleDispatchReadme = Get-Content -Raw $capsuleDispatchReadmePath
$capsuleDispatchIndex = Get-Content -Raw $capsuleDispatchIndexPath
$capsuleReadiness = Get-Content -Raw $capsuleReadinessPath

Assert-Contains $index '<script src="/api/runtime-config.js"></script>' 'index.html must load the runtime config endpoint.'
Assert-Contains $index '<script src="app-config.js"></script>' 'index.html must load app-config.js.'
Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $index '<script src="app-ui.js"></script>' 'index.html must load app-ui.js.'
Assert-Contains $index 'Message for This Memory' 'index.html must keep the text-based memory step.'
Assert-Contains $config 'window.IWH_CONFIG' 'app-config.js must define IWH_CONFIG.'
Assert-Contains $config "SUPABASE_URL: ''" 'app-config.js must keep SUPABASE_URL empty by default.'
Assert-Contains $config "SUPABASE_ANON_KEY: ''" 'app-config.js must keep SUPABASE_ANON_KEY empty by default.'
Assert-Contains $config "FUNCTIONS_BASE_URL: ''" 'app-config.js must keep FUNCTIONS_BASE_URL empty by default.'
Assert-Contains $config 'PUBLIC_APP_URL' 'app-config.js must define PUBLIC_APP_URL fallback.'
Assert-Contains $runtimeConfig 'process.env.SUPABASE_URL' 'api/runtime-config.js must read SUPABASE_URL from env.'
Assert-Contains $runtimeConfig 'process.env.PUBLIC_APP_URL' 'api/runtime-config.js must read PUBLIC_APP_URL from env.'
Assert-Contains $runtimeConfig 'window.IWH_CONFIG = Object.assign' 'api/runtime-config.js must emit browser config.'
Assert-Contains $index 'function getRuntimeConfigErrors()' 'index.html must guard against missing runtime config.'
Assert-Contains $helpers 'function renderLists()' 'app-helpers.js must contain renderLists().'
Assert-Contains $helpers 'function showMarks()' 'app-helpers.js must contain showMarks().'
Assert-Contains $helpers 'function showShareCard(pin)' 'app-helpers.js must contain showShareCard().'
Assert-Contains $helpers 'var MAX_NAME_LENGTH = 80;' 'app-helpers.js must define MAX_NAME_LENGTH.'
Assert-Contains $helpers 'var MAX_MESSAGE_LENGTH = 500;' 'app-helpers.js must define MAX_MESSAGE_LENGTH.'
Assert-Contains $ui 'function resetForm()' 'app-ui.js must contain resetForm().'
Assert-Contains $ui 'function openAuth(tab)' 'app-ui.js must contain openAuth(tab).'
Assert-Contains $ui 'function showToast(msg, tone)' 'app-ui.js must contain showToast(msg, tone).'
Assert-Contains $i18n 'message_for_memory' 'app-i18n.js must localize the text-only message step.'
Assert-NotContains $index 'voice-area' 'index.html must not render the voice area.'
Assert-NotContains $index 'prepareVoiceUpload' 'index.html must not contain prepareVoiceUpload().'
Assert-NotContains $index 'attachVoiceToMark' 'index.html must not contain attachVoiceToMark().'
Assert-NotContains $index 'toggleRecord()' 'index.html must not contain recording controls.'
Assert-NotContains $index 'voice-upload-status' 'index.html must not contain voice upload status UI.'
Assert-NotContains $index "select('*')" "index.html must not use select('*') for marks."
Assert-NotContains $config 'ENABLE_VOICE_UPLOAD' 'app-config.js must not expose voice upload config.'
Assert-NotContains $config 'ctjgxonismqdxprlohcz.supabase.co' 'app-config.js must not hardcode production Supabase.'
Assert-NotContains $runtimeConfig 'ENABLE_VOICE_UPLOAD' 'api/runtime-config.js must not expose voice upload config.'
Assert-NotContains $i18n 'voice_note' 'app-i18n.js must not expose voice copy.'
Assert-NotContains $privacy 'ÃƒÂ¢' 'privacy-policy.html still contains mojibake.'
Assert-NotContains $terms 'ÃƒÂ¢' 'terms.html still contains mojibake.'
Assert-Contains $supabaseReadme 'Supabase Hardening' 'supabase/README.md must exist.'
Assert-Contains $supabaseSchema 'create table if not exists public.marks' 'supabase/schema.sql must define marks table.'
Assert-Contains $supabasePolicies 'enable row level security' 'supabase/policies.sql must enable RLS.'
Assert-Contains $supabaseEnvExample 'SUPABASE_SERVICE_ROLE_KEY' 'supabase/env.example.md must mention service role key.'
Assert-Contains $supabaseStagingRunbook 'Staging Runbook' 'supabase/staging-runbook.md must exist.'
Assert-Contains $supabaseProductionRunbook 'Production Runbook' 'supabase/production-runbook.md must exist.'
Assert-Contains $supabaseVercelEnvMap 'Vercel / Supabase Env Map' 'supabase/vercel-env-map.md must exist.'
Assert-Contains $capsuleDelivery 'create table if not exists public.capsule_deliveries' 'supabase/capsule-delivery.sql must define capsule_deliveries.'
Assert-Contains $capsuleDispatchReadme 'Capsule Dispatch Function' 'capsule-dispatch README must exist.'
Assert-Contains $capsuleDispatchIndex 'Deno.serve' 'capsule-dispatch function must define a handler.'
Assert-Contains $capsuleDispatchIndex 'Email delivery configuration is incomplete.' 'capsule-dispatch must guard against missing email configuration.'
Assert-Contains $capsuleReadiness 'Capsule readiness incomplete.' 'scripts/capsule-readiness.ps1 must validate delivery secrets.'

Write-Output 'Smoke check passed.'
