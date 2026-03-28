import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service role configuration.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const [{ count: legacyCapsuleCount, error: legacyError }, { count: splitCapsuleCount, error: splitError }] = await Promise.all([
    supabase
      .from("marks")
      .select("id", { count: "exact", head: true })
      .or("capsule_days.gt.0,capsule_date.not.is.null,capsule_release_at.not.is.null"),
    supabase
      .from("capsules")
      .select("id", { count: "exact", head: true })
      .in("status", ["scheduled", "opened"]),
  ]);

  if (legacyError) {
    return new Response(JSON.stringify({ error: legacyError.message || "Legacy capsule count failed." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (splitError) {
    return new Response(JSON.stringify({ error: splitError.message || "Split capsule count failed." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    capsules: (legacyCapsuleCount || 0) + (splitCapsuleCount || 0),
    legacyCapsules: legacyCapsuleCount || 0,
    splitCapsules: splitCapsuleCount || 0,
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store, max-age=0" },
  });
});
