/**
 * Payment abstraction for the checkout.
 *
 * A real card gateway (Stripe/Paymob/etc.) can be wired in here later by
 * implementing the `CardPaymentProvider` interface and returning its result.
 *
 * IMPORTANT: There is currently NO card gateway configured. We therefore do
 * NOT fake card success — `processCardPayment` returns `{ status: "unavailable" }`
 * and the checkout surfaces an honest message instructing customers to use
 * Cash on Delivery or InstaPay. Nothing is charged and no fake transaction ID
 * is generated.
 */

export interface CardPaymentDetails {
  name: string;
  number: string;
  expiry: string;
  cvv: string;
}

export interface CardPaymentResult {
  status: "succeeded" | "failed" | "unavailable";
  message: string;
}

/** Where a real gateway credentials/processing would be invoked. Server-side only. */
export async function processCardPayment(): Promise<CardPaymentResult> {
  // No gateway configured → block card processing rather than fake a success.
  return {
    status: "unavailable",
    message:
      "Online card payment is not available yet. Please choose Cash on Delivery or InstaPay, or contact us for assistance.",
  };
}

/** Whether the store can accept online card payments right now. */
export function isCardPaymentAvailable(): boolean {
  return false;
}