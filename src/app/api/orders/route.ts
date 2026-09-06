import { NextResponse } from "next/server";
import { products } from "@/lib/data";
import { DELIVERY_OPTIONS } from "@/lib/data/checkout";
import {
  buildOrderLineItems,
  computeTotals,
  estimatedDeliveryFor,
  generateOrderNumber,
  initialPaymentStatus,
} from "@/lib/checkout/orders";
import {
  isEgyptianMobile,
  isValidEmail,
  isValidGovernorate,
  normalizeMobile,
} from "@/lib/checkout/validation";
import { isCardPaymentAvailable } from "@/lib/checkout/payment";
import { persistOrder } from "@/lib/db/orders";
import type {
  CheckoutLineItem,
  DeliveryAddress,
  Order,
  PaymentMethod,
} from "@/lib/types";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: {
    lineItems?: CheckoutLineItem[];
    address?: DeliveryAddress;
    deliveryMethod?: string;
    paymentMethod?: PaymentMethod;
    promoCode?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  /* ---------- Line items ---------- */
  if (!Array.isArray(body.lineItems) || body.lineItems.length === 0) {
    return jsonError("Your bag is empty.", 400);
  }
  const lineItems = buildOrderLineItems(body.lineItems);
  if (lineItems.length === 0) {
    return jsonError("Some items in your bag are no longer available.", 400);
  }

  /* ---------- Stock check ---------- */
  for (const item of body.lineItems) {
    const product = products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (!product || !variant) {
      return jsonError(
        "One or more products are no longer available. Please review your bag.",
        409
      );
    }
    if (!variant.inStock) {
      return jsonError(
        `${product.name} (${variant.size ?? ""}) is currently out of stock. Please adjust your bag.`,
        409
      );
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return jsonError("Invalid item quantity.", 400);
    }
  }

  /* ---------- Address ---------- */
  const address = body.address;
  if (!address) return jsonError("Delivery address is required.", 400);
  if (!address.fullName || !address.fullName.trim()) {
    return jsonError("Please enter your full name.", 400);
  }
  if (!isValidEmail(address.email)) {
    return jsonError("Please enter a valid email address.", 400);
  }
  if (!isEgyptianMobile(address.phone)) {
    return jsonError("Please enter a valid Egyptian mobile number.", 400);
  }
  if (!isValidGovernorate(address.governorate)) {
    return jsonError("Please select a valid governorate.", 400);
  }
  if (!address.city || !address.city.trim()) {
    return jsonError("Please enter your city or area.", 400);
  }
  if (!address.street || !address.street.trim()) {
    return jsonError("Please enter your delivery address.", 400);
  }

  /* ---------- Delivery ---------- */
  const deliveryOption = DELIVERY_OPTIONS.find(
    (d) => d.id === body.deliveryMethod && d.available
  );
  if (!deliveryOption) {
    return jsonError("Please select a delivery method.", 400);
  }

  /* ---------- Payment method ---------- */
  const requestedMethod = body.paymentMethod;
  const method: PaymentMethod | null =
    requestedMethod === "card" ||
    requestedMethod === "cod" ||
    requestedMethod === "instapay"
      ? requestedMethod
      : null;
  if (!method) {
    return jsonError("Please select a payment method.", 400);
  }
  if (method === "card" && !isCardPaymentAvailable()) {
    return jsonError(
      "Online card payment is not available yet. Please use Cash on Delivery or InstaPay.",
      400
    );
  }
  if (method === "instapay") {
    const { INSTAPAY_PHONE_NUMBER } = await import("@/lib/data/checkout");
    if (!INSTAPAY_PHONE_NUMBER.trim()) {
      return jsonError("InstaPay is not configured yet. Please choose another payment method.", 400);
    }
  }

  /* ---------- Totals (server-computed — never trusted from client) ---------- */
  const normalizedAddress: DeliveryAddress = {
    ...address,
    email: address.email.trim().toLowerCase(),
    phone: normalizeMobile(address.phone),
    country: "Egypt",
    fullName: address.fullName.trim(),
    governorate: address.governorate.trim(),
    city: address.city.trim(),
    street: address.street.trim(),
    apartment: address.apartment?.trim(),
    landmark: address.landmark?.trim(),
    postalCode: address.postalCode?.trim(),
    instructions: address.instructions?.trim(),
  };

  const totals = computeTotals(
    lineItems,
    normalizedAddress,
    deliveryOption,
    method,
    body.promoCode
  );

  const order: Order = {
    orderNumber: generateOrderNumber(),
    lineItems,
    subtotal: totals.subtotal,
    discount: totals.discount,
    deliveryFee: totals.deliveryFee,
    deliveryMethod: deliveryOption.name,
    codFee: totals.codFee,
    tax: totals.tax,
    total: totals.total,
    paymentMethod: method,
    paymentStatus: initialPaymentStatus(method),
    orderStatus: "pending",
    address: normalizedAddress,
    estimatedDelivery: estimatedDeliveryFor(normalizedAddress.governorate),
    createdAt: new Date().toISOString(),
  };

  try {
    await persistOrder(order);
  } catch (error) {
    console.error("Failed to persist order", error);
    return jsonError(
      "We couldn't place your order right now. Please try again in a moment.",
      500
    );
  }

  return NextResponse.json({ order }, { status: 201 });
}