import { env } from "cloudflare:workers";
import { isAllowedOrigin } from "@/lib/security/origin";
import { clientIp, rateLimited } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { securityHeaders } from "@/lib/http/security-headers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY_BYTES = 8_192;

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isAllowedOrigin(request)) {
    return Response.json(
      { ok: false, error: "Blocked cross-origin request." },
      { status: 401, headers: securityHeaders(origin) }
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return Response.json(
      { ok: false, error: "Unsupported content type." },
      { status: 415, headers: securityHeaders(origin) }
    );
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request" },
      { status: 400, headers: securityHeaders(origin) }
    );
  }
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json(
      { ok: false, error: "Request body too large." },
      { status: 413, headers: securityHeaders(origin) }
    );
  }

  let email: string;
  let turnstileToken: string;
  try {
    const body = JSON.parse(raw) as { email?: unknown; turnstileToken?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    turnstileToken =
      typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request" },
      { status: 400, headers: securityHeaders(origin) }
    );
  }

  if (await rateLimited("SUBSCRIBE_LIMITER", email || "unknown", request)) {
    return Response.json(
      { ok: false, error: "Too many attempts. Please try again in a moment." },
      { status: 429, headers: securityHeaders(origin) }
    );
  }

  if (!(await verifyTurnstile(turnstileToken, clientIp(request)))) {
    return Response.json(
      { ok: false, error: "Security check failed. Please try again." },
      { status: 400, headers: securityHeaders(origin) }
    );
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { ok: false, error: "Invalid email" },
      { status: 400, headers: securityHeaders(origin) }
    );
  }

  try {
    await env.DB.prepare(
      "INSERT INTO subscribers (email, created_at) VALUES (?1, ?2) ON CONFLICT(email) DO NOTHING"
    )
      .bind(email, new Date().toISOString())
      .run();
  } catch (error) {
    console.error("Failed to subscribe", error);
    return Response.json(
      { ok: false, error: "We couldn't subscribe you right now." },
      { status: 500, headers: securityHeaders(origin) }
    );
  }

  return Response.json({ ok: true }, { headers: securityHeaders(origin) });
}