export const API_CSP =
  "default-src 'none'; sandbox; base-uri 'none'; frame-ancestors 'none'; report-uri /api/csp-report; report-to csp";

export function securityHeaders(origin: string): Headers {
  const headers = new Headers();
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Security-Policy", API_CSP);
  headers.set(
    "Reporting-Endpoints",
    `csp="${new URL("/api/csp-report", origin).toString()}"`
  );
  return headers;
}