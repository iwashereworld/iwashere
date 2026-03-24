# Voice Upload Function

This Supabase Edge Function issues a controlled signed upload path for private
voice files stored in the `voice-messages` bucket.

## Purpose

- authenticate the current user
- validate expected mime type and file size
- reserve a storage path
- write a metadata row to `public.voice_messages`
- return a signed upload target for the client

## Required Secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Expected Request

```json
{
  "mimeType": "audio/webm",
  "bytes": 120340,
  "durationSeconds": 18
}
```

## Response Shape

```json
{
  "voiceMessageId": "...",
  "path": "user-id/voice-id.webm"
}
```

Use the returned `path` with the authenticated storage client upload call.

## Auth Note

The function performs user validation internally with `auth.getUser()`, so it
should be deployed with JWT verification disabled at the gateway layer.
