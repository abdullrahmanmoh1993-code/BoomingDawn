// Public by design — Cloudflare Turnstile sitekeys ship in client bundles.
// Local/CI e2e overrides this with the Cloudflare test key via
// NEXT_PUBLIC_TURNSTILE_SITE_KEY (see .env.local / .env.example).
export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAAEqhXWBVAWEpYoX2";
export const TURNSTILE_ACTION = "booming-dawn";