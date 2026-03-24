[CmdletBinding()]
param(
  [string]$BaseUrl = $env:SUPABASE_BASE_URL,
  [string]$AnonKey = $env:SUPABASE_ANON_KEY,
  [string]$ServiceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
)

$ErrorActionPreference = 'Stop'

if (-not $BaseUrl -or -not $AnonKey -or -not $ServiceRoleKey) {
  throw 'SUPABASE_BASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required.'
}

$email = 'staging-rollout-' + [Guid]::NewGuid().ToString('N').Substring(0, 12) + '@example.com'
$password = 'TempIWH!2026#Pass9'
$userId = $null
$markId = $null
$voiceId = $null

function JsonHeaders($apikey, $token) {
  return @{
    apikey = $apikey
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
  }
}

try {
  $adminHeaders = JsonHeaders $ServiceRoleKey $ServiceRoleKey
  $createUserBody = @{ email = $email; password = $password; email_confirm = $true } | ConvertTo-Json
  $createdUser = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/v1/admin/users" -Headers $adminHeaders -Body $createUserBody
  $userId = $createdUser.id

  $signinHeaders = @{ apikey = $AnonKey; 'Content-Type' = 'application/json' }
  $signinBody = @{ email = $email; password = $password } | ConvertTo-Json
  $session = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/v1/token?grant_type=password" -Headers $signinHeaders -Body $signinBody
  $accessToken = $session.access_token
  $userHeaders = @{ apikey = $AnonKey; Authorization = "Bearer $accessToken" }
  $authUser = Invoke-RestMethod -Method Get -Uri "$BaseUrl/auth/v1/user" -Headers $userHeaders

  $voiceHeaders = @{
    apikey = $AnonKey
    Authorization = "Bearer $accessToken"
    'Content-Type' = 'application/json'
  }
  $voiceBody = @{ mimeType = 'audio/webm'; bytes = 2048; durationSeconds = 3 } | ConvertTo-Json
  try {
    $voiceResponse = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/voice-upload" -Headers $voiceHeaders -Body $voiceBody
  } catch {
    $response = $_.Exception.Response
    if ($response) {
      $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
      $body = $reader.ReadToEnd()
      throw "voice-upload failed after auth user $($authUser.id): $body"
    }
    throw
  }
  $voiceId = $voiceResponse.voiceMessageId
  $voicePath = $voiceResponse.path

  $audioBytes = [byte[]](1..32)
  $tempVoiceFile = Join-Path $env:TEMP ('iwh-voice-' + [Guid]::NewGuid().ToString('N') + '.webm')
  [System.IO.File]::WriteAllBytes($tempVoiceFile, $audioBytes)
  & curl.exe --silent --show-error --fail `
    -X POST `
    -H "apikey: $AnonKey" `
    -H "Authorization: Bearer $accessToken" `
    -H "Content-Type: audio/webm" `
    -H "x-upsert: false" `
    --data-binary "@$tempVoiceFile" `
    "$BaseUrl/storage/v1/object/voice-messages/$voicePath" | Out-Null
  Remove-Item $tempVoiceFile -Force

  $markHeaders = @{
    apikey = $AnonKey
    Authorization = "Bearer $accessToken"
    Prefer = 'return=representation'
    'Content-Type' = 'application/json'
  }
  $markBody = @{
    user_id = $userId
    name = 'Staging Rollout Test'
    country_code = 'IE'
    country_name = 'Ireland'
    lat = 53.3498
    lon = -6.2603
    message = 'Capsule delivery smoke test.'
    photo = $null
    capsule_days = 1
    capsule_date = (Get-Date).ToUniversalTime().AddDays(1).ToString('yyyy-MM-dd')
    capsule_for = 'other'
    recipient_email = 'recipient@example.com'
    is_public = $false
  } | ConvertTo-Json
  $markInsert = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rest/v1/marks?select=id,user_id,capsule_for,recipient_email" -Headers $markHeaders -Body $markBody
  $markId = $markInsert[0].id

  $attachBody = @{ mark_id = $markId } | ConvertTo-Json
  Invoke-RestMethod -Method Patch -Uri "$BaseUrl/rest/v1/voice_messages?id=eq.$voiceId" -Headers $markHeaders -Body $attachBody | Out-Null

  Start-Sleep -Seconds 2

  $serviceJsonHeaders = JsonHeaders $ServiceRoleKey $ServiceRoleKey
  $encodedMarkId = [System.Uri]::EscapeDataString([string]$markId)
  $queue = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_deliveries?mark_id=eq.$encodedMarkId&select=id,mark_id,status,scheduled_for,last_error" -Headers $serviceJsonHeaders
  if (-not $queue -or $queue.Count -lt 1) {
    throw 'Capsule delivery row was not created.'
  }
  $queueId = $queue[0].id

  $now = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  $patchBody = @{ scheduled_for = $now; status = 'pending'; last_error = $null } | ConvertTo-Json
  Invoke-RestMethod -Method Patch -Uri "$BaseUrl/rest/v1/capsule_deliveries?id=eq.$queueId" -Headers $serviceJsonHeaders -Body $patchBody | Out-Null

  $dispatchHeaders = @{ apikey = $AnonKey; Authorization = "Bearer $AnonKey" }
  $dispatch = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders

  Start-Sleep -Seconds 1
  $queueAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_deliveries?id=eq.$queueId&select=id,status,last_error,attempts" -Headers $serviceJsonHeaders

  $summary = [ordered]@{
    email = $email
    user_id = $userId
    voice_message_id = $voiceId
    voice_storage_path = $voicePath
    mark_id = $markId
    queue_id = $queueId
    dispatch_processed = $dispatch.processed
    queue_status_after_dispatch = $queueAfter[0].status
    queue_error_after_dispatch = $queueAfter[0].last_error
    queue_attempts = $queueAfter[0].attempts
  }

  Write-Output ($summary | ConvertTo-Json -Depth 5)
}
finally {
  $cleanupHeaders = JsonHeaders $ServiceRoleKey $ServiceRoleKey
  if ($voiceId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/voice_messages?id=eq.$voiceId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
  if ($markId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/capsule_deliveries?mark_id=eq.$markId" -Headers $cleanupHeaders | Out-Null } catch {}
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/marks?id=eq.$markId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
  if ($userId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/auth/v1/admin/users/$userId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
}
