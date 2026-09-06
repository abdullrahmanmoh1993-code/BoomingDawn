import { env } from "cloudflare:workers";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 10_000;
const EXPECTED_ACTION = "booming-dawn";

function expectedHostnames(): Set<string> {
  const value = (
    env as unknown as Record<string, string | undefined>
  ).TURNSTILE_HOSTNAMES;
  return new Set(
    (value ?? "")
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean)
  );
}

export async function verifyTurnstile(
  token: string,
  remoteIp: string | null
): Promise<boolean> {
  const secret = env.TURNSTILE_SECRET;

  // Without a secret configured (local dev, some CI runs) the gate is open.
  if (!secret) return true;

  // A configured secret but a missing hostname allowlist is misconfiguration.
  const hostnames = expectedHostnames();
  if (hostnames.size === 0) return false;

  if (token.length === 0 || token.length > 2048) return false;

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteIp ? { remoteip: remoteIp } : {}),
      }),
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
      "error-codes"?: string[];
    };

    return (
      result.success === true &&
      result.action === EXPECTED_ACTION &&
      !!result.hostname &&
      hostnames.has(result.hostname)
    );
  } catch {
    // Network/parse failure: fail closed under a configured secret.
    return false;
  }
}