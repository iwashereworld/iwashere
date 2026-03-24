import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const fromEmail = Deno.env.get("DELIVERY_FROM_EMAIL") ?? "";
const publicAppUrl = Deno.env.get("PUBLIC_APP_URL") ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service role configuration.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function sendEmail(job: Record<string, unknown>) {
  const recipient = String(job.recipient_email ?? "");
  const payload = (job.payload ?? {}) as Record<string, unknown>;
  const countryName = String(payload.country_name ?? "Unknown location");
  const message = String(payload.message ?? "");
  const markId = String(payload.mark_id ?? "");
  const revealUrl = `${publicAppUrl.replace(/\/$/, "")}/?mark=${markId}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipient,
      subject: "A time capsule from I Was Here is ready",
      html: `
        <h1>Your capsule is ready</h1>
        <p>A saved capsule from <strong>${countryName}</strong> has reached its delivery date.</p>
        <p>${message}</p>
        <p><a href="${revealUrl}">Open the mark</a></p>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider error: ${response.status} ${body}`);
  }
}

Deno.serve(async () => {
  if (!resendApiKey || !fromEmail || !publicAppUrl) {
    return new Response(JSON.stringify({
      error: "Email delivery configuration is incomplete.",
      missing: {
        RESEND_API_KEY: !resendApiKey,
        DELIVERY_FROM_EMAIL: !fromEmail,
        PUBLIC_APP_URL: !publicAppUrl,
      },
    }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = new Date().toISOString();

  const { data: jobs, error } = await supabase
    .from("capsule_deliveries")
    .select("id, recipient_email, payload")
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .order("scheduled_for", { ascending: true })
    .limit(20);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results = [];

  for (const job of jobs ?? []) {
    try {
      await sendEmail(job);

      await supabase
        .from("capsule_deliveries")
        .update({
          status: "sent",
          sent_at: now,
          attempts: 1,
          last_error: null,
        })
        .eq("id", job.id);

      results.push({ id: job.id, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown dispatch error";

      await supabase
        .from("capsule_deliveries")
        .update({
          status: "failed",
          attempts: 1,
          last_error: message,
        })
        .eq("id", job.id);

      results.push({ id: job.id, status: "failed", error: message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
