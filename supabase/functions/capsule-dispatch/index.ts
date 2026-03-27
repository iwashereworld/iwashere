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

type CapsuleRow = {
  id: string;
  user_id: string;
  name: string;
  owner_email: string;
  message: string;
  occasion: string;
  recipient_type: "self" | "other";
  recipient_email: string | null;
  visibility: "private" | "public" | "email";
  open_at: string;
  has_location: boolean;
  country_code: string | null;
  country_name: string | null;
  lat: number | null;
  lon: number | null;
  status: "scheduled" | "opened" | "cancelled";
  delivery_status: "pending" | "recipient_sent" | "owner_sent" | "completed" | "failed";
  published_mark_id: string | null;
};

function hasEmailConfig() {
  return !!(resendApiKey && fromEmail && publicAppUrl);
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildOccasionLabel(occasion: string) {
  switch (occasion) {
    case "birthday":
      return "birthday capsule";
    case "anniversary":
      return "anniversary capsule";
    case "gift":
      return "gift capsule";
    case "custom":
      return "capsule";
    default:
      return "future-self capsule";
  }
}

function buildSubject(capsule: CapsuleRow, target: "owner" | "recipient") {
  const label = buildOccasionLabel(capsule.occasion);
  if (capsule.recipient_type === "other" && target === "recipient") {
    return `${capsule.name} sent you a ${label}`;
  }
  if (capsule.recipient_type === "other" && target === "owner") {
    return `Your ${label} was delivered`;
  }
  return `Your ${label} is now open`;
}

function buildLocationLine(capsule: CapsuleRow) {
  if (!capsule.has_location || !capsule.country_name) return "";
  return `<p><strong>Place:</strong> ${escapeHtml(capsule.country_name)}</p>`;
}

function buildOpenHtml(capsule: CapsuleRow, target: "owner" | "recipient") {
  const intro = target === "recipient"
    ? `<p><strong>${escapeHtml(capsule.name)}</strong> planned this capsule for you.</p>`
    : (capsule.recipient_type === "other"
      ? `<p>Your capsule for <strong>${escapeHtml(capsule.recipient_email ?? "")}</strong> has been delivered.</p>`
      : `<p>Your capsule is now open.</p>`);

  const publicLink = capsule.visibility === "public" && capsule.published_mark_id
    ? `<p><a href="${publicAppUrl.replace(/\/$/, "")}/#/m/${encodeURIComponent(capsule.published_mark_id)}">View the public mark</a></p>`
    : "";

  return `
    <h1>${escapeHtml(buildSubject(capsule, target))}</h1>
    ${intro}
    <p>${escapeHtml(capsule.message)}</p>
    ${buildLocationLine(capsule)}
    ${publicLink}
  `;
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email provider error: ${response.status} ${body}`);
  }
}

async function createPublishedMarkIfNeeded(capsule: CapsuleRow, now: string) {
  if (capsule.visibility !== "public" || !capsule.has_location) {
    return capsule.published_mark_id;
  }
  if (capsule.published_mark_id) return capsule.published_mark_id;

  const { data, error } = await supabase
    .from("marks")
    .insert({
      user_id: capsule.user_id,
      name: capsule.name,
      country_code: capsule.country_code ?? "",
      country_name: capsule.country_name ?? "",
      lat: capsule.lat,
      lon: capsule.lon,
      message: capsule.message,
      photo: null,
      capsule_days: 0,
      capsule_date: null,
      capsule_for: "myself",
      recipient_email: null,
      is_public: true,
      capsule_status: "public",
      capsule_release_at: null,
      capsule_opened_at: now,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Published mark creation failed: ${error.message}`);
  }

  return String(data.id);
}

async function loadCapsule(capsuleId: string): Promise<CapsuleRow> {
  const { data, error } = await supabase
    .from("capsules")
    .select("*")
    .eq("id", capsuleId)
    .single();

  if (error || !data) {
    throw new Error(`Capsule lookup failed: ${error?.message ?? "Missing capsule"}`);
  }

  return data as CapsuleRow;
}

async function finalizeQueue(queueId: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from("capsule_dispatch_queue")
    .update(patch)
    .eq("id", queueId)
    .eq("status", "processing");

  if (error) {
    throw new Error(`Queue update failed: ${error.message}`);
  }
}

async function finalizeCapsule(capsuleId: string, patch: Record<string, unknown>) {
  const { error } = await supabase
    .from("capsules")
    .update(patch)
    .eq("id", capsuleId);

  if (error) {
    throw new Error(`Capsule update failed: ${error.message}`);
  }
}

Deno.serve(async () => {
  const now = new Date().toISOString();

  const { data: jobs, error } = await supabase.rpc("claim_due_capsule_dispatches", {
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
    const queueId = String(job.id);
    const capsuleId = String(job.capsule_id);
    const attempts = Number(job.attempts ?? 0) + 1;

    try {
      const capsule = await loadCapsule(capsuleId);
      let publishedMarkId = await createPublishedMarkIfNeeded(capsule, now);

      if (!hasEmailConfig()) {
        throw new Error("Email delivery configuration is incomplete.");
      }

      if (capsule.recipient_type === "other") {
        if (!capsule.recipient_email) {
          throw new Error("Recipient email is required for gift capsules.");
        }
        await sendEmail(
          capsule.recipient_email,
          buildSubject(capsule, "recipient"),
          buildOpenHtml({ ...capsule, published_mark_id: publishedMarkId }, "recipient"),
        );
        await sendEmail(
          capsule.owner_email,
          buildSubject(capsule, "owner"),
          buildOpenHtml({ ...capsule, published_mark_id: publishedMarkId }, "owner"),
        );
        await finalizeCapsule(capsuleId, {
          status: "opened",
          opened_at: now,
          published_mark_id: publishedMarkId,
          recipient_notified_at: now,
          owner_notified_at: now,
          delivery_status: "completed",
        });
      } else {
        await sendEmail(
          capsule.owner_email,
          buildSubject(capsule, "owner"),
          buildOpenHtml({ ...capsule, published_mark_id: publishedMarkId }, "owner"),
        );
        await finalizeCapsule(capsuleId, {
          status: "opened",
          opened_at: now,
          published_mark_id: publishedMarkId,
          owner_notified_at: now,
          delivery_status: "completed",
        });
      }

      await finalizeQueue(queueId, {
        status: "completed",
        processed_at: now,
        attempts,
        last_error: null,
      });
      results.push({ id: queueId, status: "completed", capsuleId, publishedMarkId });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown dispatch error";
      await finalizeQueue(queueId, {
        status: "failed",
        attempts,
        last_error: message,
      });
      await finalizeCapsule(capsuleId, {
        delivery_status: "failed",
      }).catch(() => {});
      results.push({ id: queueId, status: "failed", capsuleId, error: message });
    }
  }

  return new Response(JSON.stringify({
    processed: results.length,
    emailConfigured: hasEmailConfig(),
    results,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
