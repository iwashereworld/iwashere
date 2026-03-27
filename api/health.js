module.exports = (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const origin = host ? `${protocol}://${host}` : "";

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).json({
    ok: true,
    service: "iwashere",
    timestamp: new Date().toISOString(),
    runtime: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
      hasFunctionsBaseUrl: !!process.env.FUNCTIONS_BASE_URL,
      publicAppUrl: process.env.PUBLIC_APP_URL || origin,
    },
  });
};
