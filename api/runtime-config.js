module.exports = (req, res) => {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  const derivedPublicAppUrl = host ? `${protocol}://${host}` : "";
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const derivedCapsuleBackendMode = /https:\/\/qejlooembmhiidlumrma\.supabase\.co/i.test(supabaseUrl)
    ? "split"
    : "legacy";
  const config = {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    FUNCTIONS_BASE_URL: process.env.FUNCTIONS_BASE_URL || "",
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || derivedPublicAppUrl,
    CAPSULE_BACKEND_MODE: process.env.CAPSULE_BACKEND_MODE || derivedCapsuleBackendMode,
  };

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).send(`window.IWH_CONFIG = Object.assign({}, window.IWH_CONFIG || {}, ${JSON.stringify(config)});`);
};
