import { env } from "cloudflare:workers";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isLoopback(request: Request): boolean {
  try {
    return LOOPBACK_HOSTS.has(new URL(request.url).hostname);
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function rateLimited(
  limiterName: "ORDER_LIMITER" | "SUBSCRIBE_LIMITER",
  key: string,
  request: Request
): Promise<boolean> {
  const limiter = (
    env as unknown as Record<string, RateLimit | undefined>
  )[limiterName];
  if (!limiter) return false;

  // Local preview (wrangler dev/CI) serves loopback hosts — don't throttle QA.
  if (isLoopback(request)) return false;

  const result = await limiter.limit({ key: `${clientIp(request)}|${key}` });
  return !result.success;
}