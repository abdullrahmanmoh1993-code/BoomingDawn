import { NextResponse } from "next/server";
import { securityHeaders } from "@/lib/http/security-headers";

const MAX_BODY_BYTES = 64_000;
const FALLBACK_ORIGIN = "https://booming-dawn.abdullrahman-moh1993.workers.dev";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return new NextResponse(null, { status: 400, headers: securityHeaders(origin) });
  }
  if (raw.length > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413, headers: securityHeaders(origin) });
  }

  console.warn(
    `CSP report: ${raw.slice(0, 2000)}${raw.length > 2000 ? "… (truncated)" : ""}`
  );

  return new NextResponse(null, { status: 204, headers: securityHeaders(origin) });
}

export async function GET() {
  return new NextResponse(null, { status: 405, headers: securityHeaders(FALLBACK_ORIGIN) });
}