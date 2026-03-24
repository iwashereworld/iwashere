import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service role configuration.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const allowedMimeTypes = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
]);

function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case "audio/webm":
      return "webm";
    case "audio/mp4":
      return "m4a";
    case "audio/mpeg":
      return "mp3";
    case "audio/wav":
      return "wav";
    case "audio/ogg":
      return "ogg";
    default:
      return "bin";
  }
}

Deno.serve(async (request) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization header." }), { status: 401 });
  }

  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), { status: 401 });
  }

  const body = await request.json();
  const mimeType = String(body.mimeType ?? "");
  const bytes = Number(body.bytes ?? 0);
  const durationSeconds = body.durationSeconds == null ? null : Number(body.durationSeconds);

  if (!allowedMimeTypes.has(mimeType)) {
    return new Response(JSON.stringify({ error: "Unsupported mime type." }), { status: 400 });
  }

  if (!Number.isFinite(bytes) || bytes <= 0 || bytes > 10 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "Invalid file size." }), { status: 400 });
  }

  if (durationSeconds != null && (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > 600)) {
    return new Response(JSON.stringify({ error: "Invalid duration." }), { status: 400 });
  }

  const voiceMessageId = crypto.randomUUID();
  const path = `${user.id}/${voiceMessageId}.${extensionForMimeType(mimeType)}`;

  const { error: insertError } = await supabase.from("voice_messages").insert({
    id: voiceMessageId,
    user_id: user.id,
    storage_path: path,
    mime_type: mimeType,
    bytes,
    duration_seconds: durationSeconds,
  });

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ voiceMessageId, path }), {
    headers: { "Content-Type": "application/json" },
  });
});
