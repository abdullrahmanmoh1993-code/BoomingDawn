import { env } from "cloudflare:workers";
import type { Order } from "@/lib/types";

const WEBHOOK_TIMEOUT_MS = 10_000;

export async function notifyNewOrder(order: Order): Promise<void> {
  const webhookUrl = env.ORDER_WEBHOOK_URL;
  const token = env.ORDER_WEBHOOK_TOKEN;
  if (!webhookUrl || !token) return;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, order }),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    if (!response.ok) {
      console.error(
        `Order webhook failed: ${response.status} ${await response.text()}`
      );
    }
  } catch (error) {
    console.error("Order webhook error", error);
  }
}