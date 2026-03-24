module.exports = (req, res) => {
  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    ENABLE_VOICE_UPLOAD: String(process.env.ENABLE_VOICE_UPLOAD || "").toLowerCase() === "true",
    FUNCTIONS_BASE_URL: process.env.FUNCTIONS_BASE_URL || "",
  };

  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.status(200).send(`window.IWH_CONFIG = Object.assign({}, window.IWH_CONFIG || {}, ${JSON.stringify(config)});`);
};
