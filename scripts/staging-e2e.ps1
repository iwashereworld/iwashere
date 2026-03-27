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

$email = 'staging-capsule-' + [Guid]::NewGuid().ToString('N').Substring(0, 12) + '@example.com'
$password = 'TempIWH!2026#Pass9'
$userId = $null
$selfCapsuleId = $null
$giftCapsuleId = $null
$giftPublishedMarkId = $null
$selfQueueId = $null
$giftQueueId = $null

function Format-WebException($err) {
  if ($err.Exception.Response) {
    try {
      $reader = New-Object System.IO.StreamReader($err.Exception.Response.GetResponseStream())
      return $reader.ReadToEnd()
    } catch {
      return ($err | Out-String)
    }
  }

  return ($err | Out-String)
}

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
  try {
    $createdUser = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/v1/admin/users" -Headers $adminHeaders -Body $createUserBody
  } catch {
    throw ('Auth admin user creation failed: ' + (Format-WebException $_))
  }
  $userId = $createdUser.id

  $signinHeaders = @{ apikey = $AnonKey; 'Content-Type' = 'application/json' }
  $signinBody = @{ email = $email; password = $password } | ConvertTo-Json
  try {
    $session = Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/v1/token?grant_type=password" -Headers $signinHeaders -Body $signinBody
  } catch {
    throw ('Auth password sign-in failed: ' + (Format-WebException $_))
  }

  $accessToken = $session.access_token
  $authUser = Invoke-RestMethod -Method Get -Uri "$BaseUrl/auth/v1/user" -Headers @{ apikey = $AnonKey; Authorization = "Bearer $accessToken" }

  $capsuleHeaders = @{
    apikey = $AnonKey
    Authorization = "Bearer $accessToken"
    Prefer = 'return=representation'
    'Content-Type' = 'application/json'
  }

  $futureSelfAt = (Get-Date).ToUniversalTime().AddSeconds(20)
  $futureGiftAt = (Get-Date).ToUniversalTime().AddSeconds(25)
  $futureSelf = $futureSelfAt.ToString('yyyy-MM-ddTHH:mm:ssZ')
  $futureGift = $futureGiftAt.ToString('yyyy-MM-ddTHH:mm:ssZ')

  $selfBody = @{
    user_id = $userId
    name = 'Staging Future Self'
    owner_email = $email
    message = 'Self capsule open reminder test.'
    occasion = 'future_self'
    recipient_type = 'self'
    recipient_email = $null
    visibility = 'private'
    open_at = $futureSelf
    has_location = $false
    country_code = $null
    country_name = $null
    lat = $null
    lon = $null
    photo = $null
  } | ConvertTo-Json
  try {
    $selfInsert = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rest/v1/capsules?select=id,status,delivery_status,visibility,recipient_type,open_at,owner_email" -Headers $capsuleHeaders -Body $selfBody
  } catch {
    throw ('Self capsule insert failed: ' + (Format-WebException $_))
  }
  $selfCapsuleId = $selfInsert[0].id

  $giftBody = @{
    user_id = $userId
    name = 'Staging Birthday Capsule'
    owner_email = $email
    message = 'Gift capsule delivery smoke test.'
    occasion = 'birthday'
    recipient_type = 'other'
    recipient_email = 'recipient@example.com'
    visibility = 'public'
    open_at = $futureGift
    has_location = $true
    country_code = 'IE'
    country_name = 'Ireland'
    lat = 53.3498
    lon = -6.2603
    photo = $null
  } | ConvertTo-Json
  try {
    $giftInsert = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rest/v1/capsules?select=id,status,delivery_status,visibility,recipient_type,open_at,recipient_email" -Headers $capsuleHeaders -Body $giftBody
  } catch {
    throw ('Gift capsule insert failed: ' + (Format-WebException $_))
  }
  $giftCapsuleId = $giftInsert[0].id

  Start-Sleep -Seconds 2

  $serviceHeaders = JsonHeaders $ServiceRoleKey $ServiceRoleKey
  $selfQueue = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_dispatch_queue?capsule_id=eq.$selfCapsuleId&select=id,capsule_id,status,scheduled_for,last_error,attempts" -Headers $serviceHeaders
  $giftQueue = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_dispatch_queue?capsule_id=eq.$giftCapsuleId&select=id,capsule_id,status,scheduled_for,last_error,attempts" -Headers $serviceHeaders
  if (-not $selfQueue -or $selfQueue.Count -lt 1) {
    throw 'Self capsule dispatch queue row was not created.'
  }
  if (-not $giftQueue -or $giftQueue.Count -lt 1) {
    throw 'Gift capsule dispatch queue row was not created.'
  }

  $selfQueueId = $selfQueue[0].id
  $giftQueueId = $giftQueue[0].id

  $dispatchHeaders = @{ apikey = $AnonKey; Authorization = "Bearer $AnonKey" }
  $preDispatch = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders
  $selfBeforeDue = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsules?id=eq.$selfCapsuleId&select=id,status,delivery_status,opened_at,owner_notified_at,published_mark_id" -Headers $serviceHeaders
  if ($selfBeforeDue[0].status -ne 'scheduled') {
    throw 'Self capsule should remain scheduled before due time.'
  }

  $selfWaitSeconds = [Math]::Max(1, [int][Math]::Ceiling(($futureSelfAt - (Get-Date).ToUniversalTime()).TotalSeconds) + 1)
  Start-Sleep -Seconds $selfWaitSeconds

  $selfDispatch = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders
  $emailConfigured = [bool]$selfDispatch.emailConfigured

  Start-Sleep -Seconds 1
  $selfQueueAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_dispatch_queue?id=eq.$selfQueueId&select=id,status,last_error,attempts,processed_at" -Headers $serviceHeaders
  $selfCapsuleAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsules?id=eq.$selfCapsuleId&select=id,status,delivery_status,opened_at,owner_notified_at,published_mark_id" -Headers $serviceHeaders

  if ($emailConfigured) {
    if ($selfQueueAfter[0].status -ne 'completed') {
      throw 'Self capsule queue should complete after dispatch when email config exists.'
    }
    if ($selfCapsuleAfter[0].status -ne 'opened' -or -not $selfCapsuleAfter[0].owner_notified_at) {
      throw 'Self capsule should open and notify the owner when email config exists.'
    }
  } else {
    if ($selfQueueAfter[0].status -ne 'failed') {
      throw 'Self capsule queue should fail clearly when email config is missing.'
    }
    if ($selfCapsuleAfter[0].status -ne 'scheduled' -or $selfCapsuleAfter[0].published_mark_id) {
      throw 'Self capsule should stay scheduled and unpublished when email config is missing.'
    }
  }

  $giftWaitSeconds = [Math]::Max(1, [int][Math]::Ceiling(($futureGiftAt - (Get-Date).ToUniversalTime()).TotalSeconds) + 1)
  Start-Sleep -Seconds $giftWaitSeconds

  $giftDispatch = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders
  Start-Sleep -Seconds 1
  $giftQueueAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_dispatch_queue?id=eq.$giftQueueId&select=id,status,last_error,attempts,processed_at" -Headers $serviceHeaders
  $giftCapsuleAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsules?id=eq.$giftCapsuleId&select=id,status,delivery_status,opened_at,recipient_notified_at,owner_notified_at,published_mark_id" -Headers $serviceHeaders
  $giftDispatchRepeat = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders
  $giftQueueAfterRepeat = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_dispatch_queue?id=eq.$giftQueueId&select=id,status,last_error,attempts,processed_at" -Headers $serviceHeaders

  if ($emailConfigured) {
    if ($giftQueueAfter[0].status -ne 'completed') {
      throw 'Gift capsule queue should complete after dispatch when email config exists.'
    }
    if ($giftCapsuleAfter[0].status -ne 'opened' -or -not $giftCapsuleAfter[0].recipient_notified_at -or -not $giftCapsuleAfter[0].owner_notified_at) {
      throw 'Gift capsule should notify recipient and owner when email config exists.'
    }
    if (-not $giftCapsuleAfter[0].published_mark_id) {
      throw 'Public gift capsule should create a published mark when email config exists.'
    }
  } else {
    if ($giftQueueAfter[0].status -ne 'failed') {
      throw 'Gift capsule queue should fail clearly when email config is missing.'
    }
    if ($giftCapsuleAfter[0].status -ne 'scheduled' -or $giftCapsuleAfter[0].published_mark_id) {
      throw 'Gift capsule should stay scheduled and unpublished when email config is missing.'
    }
  }

  if ($giftDispatchRepeat.processed -ne 0) {
    throw 'Repeat dispatch should not process the same gift capsule twice.'
  }

  $giftPublishedMarkId = $giftCapsuleAfter[0].published_mark_id
  $summary = [ordered]@{
    email = $email
    user_id = $userId
    email_configured = $emailConfigured
    self_capsule_id = $selfCapsuleId
    gift_capsule_id = $giftCapsuleId
    self_queue_id = $selfQueueId
    gift_queue_id = $giftQueueId
    pre_dispatch_processed = $preDispatch.processed
    self_dispatch_processed = $selfDispatch.processed
    self_queue_status_after_dispatch = $selfQueueAfter[0].status
    self_capsule_status_after_dispatch = $selfCapsuleAfter[0].status
    self_capsule_delivery_status = $selfCapsuleAfter[0].delivery_status
    gift_dispatch_processed = $giftDispatch.processed
    gift_queue_status_after_dispatch = $giftQueueAfter[0].status
    gift_capsule_status_after_dispatch = $giftCapsuleAfter[0].status
    gift_capsule_delivery_status = $giftCapsuleAfter[0].delivery_status
    gift_published_mark_id = $giftPublishedMarkId
    gift_queue_attempts = $giftQueueAfter[0].attempts
    gift_dispatch_repeat_processed = $giftDispatchRepeat.processed
    gift_queue_status_after_repeat = $giftQueueAfterRepeat[0].status
    gift_queue_attempts_after_repeat = $giftQueueAfterRepeat[0].attempts
  }

  Write-Output ($summary | ConvertTo-Json -Depth 5)
}
finally {
  $cleanupHeaders = JsonHeaders $ServiceRoleKey $ServiceRoleKey
  if ($giftPublishedMarkId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/marks?id=eq.$giftPublishedMarkId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
  if ($selfCapsuleId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/capsule_dispatch_queue?capsule_id=eq.$selfCapsuleId" -Headers $cleanupHeaders | Out-Null } catch {}
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/capsules?id=eq.$selfCapsuleId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
  if ($giftCapsuleId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/capsule_dispatch_queue?capsule_id=eq.$giftCapsuleId" -Headers $cleanupHeaders | Out-Null } catch {}
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/capsules?id=eq.$giftCapsuleId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
  if ($userId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/auth/v1/admin/users/$userId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
}
