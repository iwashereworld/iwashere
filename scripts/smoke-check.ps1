$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$indexPath = Join-Path $root 'index.html'
$privacyPath = Join-Path $root 'privacy-policy.html'
$termsPath = Join-Path $root 'terms.html'
$configPath = Join-Path $root 'app-config.js'
$helpersPath = Join-Path $root 'app-helpers.js'
$uiPath = Join-Path $root 'app-ui.js'
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
$voiceStoragePath = Join-Path $root 'supabase\voice-storage.sql'
$voiceUploadReadmePath = Join-Path $root 'supabase\functions\voice-upload\README.md'
$voiceUploadIndexPath = Join-Path $root 'supabase\functions\voice-upload\index.ts'

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
$helpers = Get-Content -Raw $helpersPath
$ui = Get-Content -Raw $uiPath
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
$voiceStorage = Get-Content -Raw $voiceStoragePath
$voiceUploadReadme = Get-Content -Raw $voiceUploadReadmePath
$voiceUploadIndex = Get-Content -Raw $voiceUploadIndexPath

Assert-Contains $index '<script src="app-config.js"></script>' 'index.html must load app-config.js.'
Assert-Contains $index '<script src="app-helpers.js"></script>' 'index.html must load app-helpers.js.'
Assert-Contains $index '<script src="app-ui.js"></script>' 'index.html must load app-ui.js.'
Assert-Contains $index 'id="voice-upload-status"' 'index.html must include voice upload status UI.'
Assert-Contains $index 'var ENABLE_VOICE_UPLOAD = !!IWH_CONFIG.ENABLE_VOICE_UPLOAD;' 'index.html must derive the voice upload feature flag from config.'
Assert-Contains $config 'window.IWH_CONFIG' 'app-config.js must define IWH_CONFIG.'
Assert-Contains $helpers 'function renderLists()' 'app-helpers.js must contain renderLists().'
Assert-Contains $helpers 'function showMarks()' 'app-helpers.js must contain showMarks().'
Assert-Contains $helpers 'function showShareCard(pin)' 'app-helpers.js must contain showShareCard().'
Assert-Contains $helpers 'var MAX_NAME_LENGTH = 80;' 'app-helpers.js must define MAX_NAME_LENGTH.'
Assert-Contains $helpers 'var MAX_MESSAGE_LENGTH = 500;' 'app-helpers.js must define MAX_MESSAGE_LENGTH.'
Assert-Contains $ui 'function resetForm()' 'app-ui.js must contain resetForm().'
Assert-Contains $ui 'function openAuth(tab)' 'app-ui.js must contain openAuth(tab).'
Assert-Contains $ui 'function showToast(msg, tone)' 'app-ui.js must contain showToast(msg, tone).'
Assert-Contains $index 'function setVoiceState(blob, options)' 'index.html must normalize voice state.'
Assert-Contains $index 'async function prepareVoiceUpload()' 'index.html must contain prepareVoiceUpload().'
Assert-Contains $index 'async function attachVoiceToMark(markId)' 'index.html must contain attachVoiceToMark(markId).'
Assert-NotContains $index "select('*')" "index.html must not use select('*') for marks."
Assert-NotContains $index 'Confirm & Pay' 'Legacy misleading review copy is still present.'
Assert-NotContains $privacy 'Ã¢' 'privacy-policy.html still contains mojibake.'
Assert-NotContains $terms 'Ã¢' 'terms.html still contains mojibake.'
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
Assert-Contains $voiceStorage 'create table if not exists public.voice_messages' 'supabase/voice-storage.sql must define voice_messages.'
Assert-Contains $voiceStorage 'create policy "voice_messages_owner_update"' 'supabase/voice-storage.sql must allow owner update.'
Assert-Contains $voiceUploadReadme 'Voice Upload Function' 'voice-upload README must exist.'
Assert-Contains $voiceUploadIndex 'Deno.serve' 'voice-upload function must define a handler.'

Write-Output 'Smoke check passed.'
