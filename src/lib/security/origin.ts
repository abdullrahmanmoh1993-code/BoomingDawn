const DEV_ORIGINS = new Set([
  "http://localhost",
  "http://127.0.0.1",
  "http://0.0.0.0",
  "http://::1",
  "https://localhost",
]);

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  if (DEV_ORIGINS.has(origin)) return true;

  const url = new URL(request.url);
  return new URL(origin).hostname === url.hostname;
}