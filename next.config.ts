import type { NextConfig } from "next";

const PAGE_CSP =
  "default-src 'self'; script-src 'self' https://static.cloudflareinsights.com https://challenges.cloudflare.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests; report-uri /api/csp-report; report-to csp";

const SECURITY_HEADERS = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), usb=(), magnetometer=(), gyroscope=()",
  },
  {
    key: "Content-Security-Policy",
    value: PAGE_CSP,
  },
  {
    key: "Reporting-Endpoints",
    value: `csp="https://booming-dawn.abdullrahman-moh1993.workers.dev/api/csp-report"`,
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
