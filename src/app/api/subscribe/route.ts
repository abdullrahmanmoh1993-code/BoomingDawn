import { env } from "cloudflare:workers";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: string;
  try {
    const body = (await request.json()) as { email?: unknown };
    email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  await env.DB.prepare(
    "INSERT INTO subscribers (email, created_at) VALUES (?1, ?2) ON CONFLICT(email) DO NOTHING"
  )
    .bind(email, new Date().toISOString())
    .run();

  return Response.json({ ok: true });
}