import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const fromEmail = Deno.env.get("DELIVERY_FROM_EMAIL") ?? "";
const publicAppUrl = Deno.env.get("PUBLIC_APP_URL") ?? "";
const missingEmailConfigMessage = "Email delivery configuration is incomplete.";

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase service role configuration.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function hasEmailConfig() {
  return !!(resendApiKey && fromEmail && publicAppUrl);
}

function resolveRevealUrl(markId: string) {
  return `${publicAppUrl.replace(/\/$/, "")}/?mark=${encodeURIComponent(markId)}`;
}

async function markAsOpened(markId: string, now: string) {
  const { error } = await supabase
    .from("marks")
    .update({
      is_public: true,
      capsule_status: "opened",
      capsule_opened_at: now,
    })
    .eq("id", markId);

  if (error) {
    throw new Error(`Mark update failed: ${error.message}`);
  }
}

async function moveJobBackToPending(jobId: string) {
  await supabase
    .from("capsule_deliveries")
    .update({ status: "pending" })
    .eq("id", jobId)
    .eq("status", "processing");
}

async function finalizeJob(jobId: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from("capsule_deliveries")
    .update(patch)
    .eq("id", jobId)
    .eq("status", "processing");

  if (error) {
    throw new Error(`Queue update failed: ${error.message}`);
  }
}

async function sendGiftEmail(job: Record<string, unknown>) {
  const recipient = String(job.recipient_email ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error("Recipient email is invalid.");
  }

  const payload = (job.payload ?? {}) as Record<string, unknown>;
  const countryName = String(payload.country_name ?? "Unknown location");
  const message = String(payload.message ?? "");
  const ownerName = String(payload.owner_name ?? "Someone");
  const markId = String(payload.mark_id ?? "");
  const revealUrl = resolveRevealUrl(markId);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipient,
      subject: "Your I Was Here capsule is ready",
      html: `
        <h1>Your capsule is ready</h1>
        <p><strong>${ownerName}</strong> shared a capsule from <strong>${countryName}</strong>.</p>
        <p>${message}</p>
        <p><a href="${revealUrl}">Open the capsule</a></p>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider error: ${response.status} ${body}`);
  }
}

Deno.serve(async () => {
  const now = new Date().toISOString();

  const { data: jobs, error } = await supabase.rpc("claim_due_capsule_deliveries", {
    batch_size: 20,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: Array<Record<string, unknown>> = [];

  for (const job of jobs ?? []) {
    const jobId = String(job.id);
    const markId = String(job.mark_id);
    const deliveryKind = String(job.delivery_kind ?? "gift_delivery");
    const attemptCount = Number(job.attempts ?? 0) + 1;

    try {
      if (deliveryKind === "self_reveal") {
        await markAsOpened(markId, now);
        await finalizeJob(jobId, {
          status: "revealed",
          sent_at: now,
          attempts: attemptCount,
          last_error: null,
        });
        results.push({ id: jobId, status: "revealed" });
        continue;
      }

      if (!hasEmailConfig()) {
        await moveJobBackToPending(jobId);
        results.push({
          id: jobId,
          status: "pending",
          skipped: missingEmailConfigMessage,
        });
        continue;
      }

      await sendGiftEmail(job);
      await markAsOpened(markId, now);
      await finalizeJob(jobId, {
        status: "sent",
        sent_at: now,
        attempts: attemptCount,
        last_error: null,
      });
      results.push({ id: jobId, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown dispatch error";
      await finalizeJob(jobId, {
        status: "failed",
        attempts: attemptCount,
        last_error: message,
      });
      results.push({ id: jobId, status: "failed", error: message });
    }
  }

  return new Response(JSON.stringify({
    processed: results.length,
    emailConfigured: hasEmailConfig(),
    missingEmailConfigMessage,
    results,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
