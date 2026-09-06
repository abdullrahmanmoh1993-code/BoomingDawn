import { products } from "@/lib/data";
import {
  FREE_DELIVERY_THRESHOLD,
  COD_FEE,
  baseDeliveryFee,
  deliveryDaysFor,
  lookupDiscount,
} from "@/lib/data/checkout";
import type {
  CheckoutLineItem,
  DeliveryAddress,
  DeliveryOption,
  Order,
  OrderLineItem,
  PaymentMethod,
} from "@/lib/types";

export interface Totals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  codFee: number;
  tax: number;
  total: number;
}

export interface OrderInput {
  lineItems: CheckoutLineItem[];
  address: DeliveryAddress;
  deliveryOption: DeliveryOption;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  estimatedDeliveryDate: string;
}

/** Resolve cart line items against live product data into priced order lines. */
export function buildOrderLineItems(items: CheckoutLineItem[]): OrderLineItem[] {
  const lines: OrderLineItem[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;
    const variant = product.variants.find((v) => v.id === item.variantId);
    lines.push({
      productId: product.id,
      variantId: item.variantId,
      quantity: item.quantity,
      name: product.name,
      size: variant?.size,
      color: variant?.color,
      unitPrice: product.price,
      image: product.images[0]?.src ?? "",
    });
  }
  return lines;
}

/** Subtotal from the resolved line items. */
export function lineSubtotal(lines: OrderLineItem[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

/** Delivery fee applying the free-delivery-over-subtotal waiver. */
export function computeDeliveryFee(governorate: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  return baseDeliveryFee(governorate);
}

/** Full totals for a checkout, using the configured rules. */
export function computeTotals(
  lines: OrderLineItem[],
  address: DeliveryAddress,
  deliveryOption: DeliveryOption,
  paymentMethod: PaymentMethod,
  promoCode?: string
): Totals {
  const subtotal = lineSubtotal(lines);
  const discount = promoCode ? lookupDiscount(promoCode, subtotal) : 0;
  const deliveryFee = computeDeliveryFee(address.governorate, subtotal);
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const tax = 0; // Product prices already include applicable taxes. Do not double-charge.
  const total = Math.max(0, subtotal - discount + deliveryFee + codFee + tax);
  return { subtotal, discount, deliveryFee, codFee, tax, total };
}

/** Real payment status per method (never auto-marks InstaPay as paid). */
export function initialPaymentStatus(method: PaymentMethod): Order["paymentStatus"] {
  switch (method) {
    case "cod":
      return "pending";
    case "instapay":
      // InstaPay is only verified manually from the WhatsApp screenshot.
      return "pending_verification";
    case "card":
      // Card is only 'paid' after the payment provider confirms — never faked here.
      return "pending";
  }
}

/** Compute an estimated delivery window (inclusive range) as a plain text date. */
export function formatEstimatedDelivery(startDays: number, endDays: number, from = new Date()): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const start = new Date(from);
  const end = new Date(from);
  start.setDate(start.getDate() + startDays);
  end.setDate(end.getDate() + endDays * 1);
  // Business-day approximation over the configured range (weekday + weekend cadence).
  const fmt = new Intl.DateTimeFormat("en-EG", opts).format;
  return `${fmt(start)} – ${fmt(end)}`;
}

/** Predict an estimated delivery window from a governorate's business-day range. */
export function estimatedDeliveryFor(governorate: string, from = new Date()): string {
  const [min, max] = deliveryDaysFor(governorate);
  return formatEstimatedDelivery(min, max, from);
}

/** Generate a real, sequential-looking order number. */
export function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const rand = String(1000 + (bytes[0] % 9000));
  return `EG${datePart}-${rand}`;
}