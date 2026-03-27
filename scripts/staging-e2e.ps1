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
$selfMarkId = $null
$giftMarkId = $null
$selfQueueId = $null
$giftQueueId = $null

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

  $markHeaders = @{
    apikey = $AnonKey
    Authorization = "Bearer $accessToken"
    Prefer = 'return=representation'
    'Content-Type' = 'application/json'
  }
  $futureSelf = (Get-Date).ToUniversalTime().AddMinutes(5).ToString('yyyy-MM-ddTHH:mm:ssZ')
  $futureGift = (Get-Date).ToUniversalTime().AddDays(1).ToString('yyyy-MM-ddTHH:mm:ssZ')

  $selfBody = @{
    user_id = $userId
    name = 'Staging Self Capsule'
    country_code = 'IE'
    country_name = 'Ireland'
    lat = 53.3498
    lon = -6.2603
    message = 'Self capsule reveal test.'
    photo = $null
    capsule_days = 1
    capsule_date = $futureSelf
    capsule_for = 'myself'
    recipient_email = $null
    is_public = $false
  } | ConvertTo-Json
  $selfMarkInsert = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rest/v1/marks?select=id,user_id,capsule_for,recipient_email,capsule_status,capsule_release_at,is_public" -Headers $markHeaders -Body $selfBody
  $selfMarkId = $selfMarkInsert[0].id

  $giftBody = @{
    user_id = $userId
    name = 'Staging Gift Capsule'
    country_code = 'IE'
    country_name = 'Ireland'
    lat = 53.35
    lon = -6.26
    message = 'Gift capsule delivery smoke test.'
    photo = $null
    capsule_days = 1
    capsule_date = $futureGift
    capsule_for = 'other'
    recipient_email = 'recipient@example.com'
    is_public = $false
  } | ConvertTo-Json
  $giftMarkInsert = Invoke-RestMethod -Method Post -Uri "$BaseUrl/rest/v1/marks?select=id,user_id,capsule_for,recipient_email,capsule_status,capsule_release_at,is_public" -Headers $markHeaders -Body $giftBody
  $giftMarkId = $giftMarkInsert[0].id

  Start-Sleep -Seconds 2

  $serviceJsonHeaders = JsonHeaders $ServiceRoleKey $ServiceRoleKey
  $encodedSelfMarkId = [System.Uri]::EscapeDataString([string]$selfMarkId)
  $encodedGiftMarkId = [System.Uri]::EscapeDataString([string]$giftMarkId)
  $selfQueue = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_deliveries?mark_id=eq.$encodedSelfMarkId&select=id,mark_id,delivery_kind,status,scheduled_for,last_error" -Headers $serviceJsonHeaders
  $giftQueue = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_deliveries?mark_id=eq.$encodedGiftMarkId&select=id,mark_id,delivery_kind,status,scheduled_for,last_error" -Headers $serviceJsonHeaders
  if (-not $selfQueue -or $selfQueue.Count -lt 1) {
    throw 'Self capsule delivery row was not created.'
  }
  if (-not $giftQueue -or $giftQueue.Count -lt 1) {
    throw 'Gift capsule delivery row was not created.'
  }
  $selfQueueId = $selfQueue[0].id
  $giftQueueId = $giftQueue[0].id

  $dispatchHeaders = @{ apikey = $AnonKey; Authorization = "Bearer $AnonKey" }
  $preDispatch = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders
  $selfBeforeDue = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/marks?id=eq.$encodedSelfMarkId&select=id,is_public,capsule_status,capsule_opened_at" -Headers $serviceJsonHeaders
  if ($selfBeforeDue[0].capsule_status -ne 'locked') {
    throw 'Self capsule should remain locked before due time.'
  }

  $now = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
  $selfPatchBody = @{ scheduled_for = $now; status = 'pending'; last_error = $null } | ConvertTo-Json
  Invoke-RestMethod -Method Patch -Uri "$BaseUrl/rest/v1/capsule_deliveries?id=eq.$selfQueueId" -Headers $serviceJsonHeaders -Body $selfPatchBody | Out-Null

  $dispatch = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders

  Start-Sleep -Seconds 1
  $selfQueueAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_deliveries?id=eq.$selfQueueId&select=id,status,last_error,attempts" -Headers $serviceJsonHeaders
  $selfMarkAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/marks?id=eq.$encodedSelfMarkId&select=id,is_public,capsule_status,capsule_opened_at" -Headers $serviceJsonHeaders
  if ($selfQueueAfter[0].status -ne 'revealed') {
    throw 'Self capsule queue should move to revealed after dispatch.'
  }
  if (-not $selfMarkAfter[0].is_public -or $selfMarkAfter[0].capsule_status -ne 'opened') {
    throw 'Self capsule mark should become public and opened after dispatch.'
  }

  $giftPatchBody = @{ scheduled_for = $now; status = 'pending'; last_error = $null } | ConvertTo-Json
  Invoke-RestMethod -Method Patch -Uri "$BaseUrl/rest/v1/capsule_deliveries?id=eq.$giftQueueId" -Headers $serviceJsonHeaders -Body $giftPatchBody | Out-Null

  $giftDispatch = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders
  Start-Sleep -Seconds 1
  $giftQueueAfter = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_deliveries?id=eq.$giftQueueId&select=id,delivery_kind,status,last_error,attempts" -Headers $serviceJsonHeaders
  $giftDispatchRepeat = Invoke-RestMethod -Method Post -Uri "$BaseUrl/functions/v1/capsule-dispatch" -Headers $dispatchHeaders
  $giftQueueAfterRepeat = Invoke-RestMethod -Method Get -Uri "$BaseUrl/rest/v1/capsule_deliveries?id=eq.$giftQueueId&select=id,status,last_error,attempts" -Headers $serviceJsonHeaders

  $summary = [ordered]@{
    email = $email
    user_id = $userId
    self_mark_id = $selfMarkId
    gift_mark_id = $giftMarkId
    self_queue_id = $selfQueueId
    gift_queue_id = $giftQueueId
    pre_dispatch_processed = $preDispatch.processed
    dispatch_processed = $dispatch.processed
    self_queue_status_after_dispatch = $selfQueueAfter[0].status
    self_mark_status_after_dispatch = $selfMarkAfter[0].capsule_status
    self_mark_public_after_dispatch = $selfMarkAfter[0].is_public
    gift_dispatch_processed = $giftDispatch.processed
    gift_queue_status_after_dispatch = $giftQueueAfter[0].status
    gift_queue_error_after_dispatch = $giftQueueAfter[0].last_error
    gift_queue_attempts = $giftQueueAfter[0].attempts
    gift_dispatch_repeat_processed = $giftDispatchRepeat.processed
    gift_queue_status_after_repeat = $giftQueueAfterRepeat[0].status
    gift_queue_attempts_after_repeat = $giftQueueAfterRepeat[0].attempts
  }

  Write-Output ($summary | ConvertTo-Json -Depth 5)
}
finally {
  $cleanupHeaders = JsonHeaders $ServiceRoleKey $ServiceRoleKey
  if ($selfMarkId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/capsule_deliveries?mark_id=eq.$selfMarkId" -Headers $cleanupHeaders | Out-Null } catch {}
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/marks?id=eq.$selfMarkId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
  if ($giftMarkId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/capsule_deliveries?mark_id=eq.$giftMarkId" -Headers $cleanupHeaders | Out-Null } catch {}
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/rest/v1/marks?id=eq.$giftMarkId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
  if ($userId) {
    try { Invoke-RestMethod -Method Delete -Uri "$BaseUrl/auth/v1/admin/users/$userId" -Headers $cleanupHeaders | Out-Null } catch {}
  }
}
