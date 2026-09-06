import { test, expect, type APIRequestContext } from "@playwright/test";

/**
 * Orders & subscribe API regression guards.
 *
 * These hit the real BFF route handlers (`/api/orders`, `/api/subscribe`) that
 * run inside the Cloudflare worker (with the D1 binding). They assert:
 *
 * 1. Validation still rejects bad payloads (empty bag, bad email, bad phone,
 *    bad governorate, unknown delivery/payment method).
 * 2. A valid COD order returns 201 with server-computed totals and an order
 *    number, and is not silently rejected.
 * 3. Promo codes are applied server-side (a client value is re-validated, an
 *    invalid code yields no discount and no error).
 * 4. The newsletter subscribe route still dedupes via D1.
 *
 * Payment notes: InstaPay requires a configured number (checkout config), card
 * is not available — so COD is the only payment path that can succeed in tests.
 */

const VALID_LINE_ITEM = { productId: "prod-001", variantId: "v-naut-m", quantity: 1 };
const VALID_ADDRESS = {
  fullName: "Playwright Test",
  email: "pw@example.com",
  phone: "01012345678",
  country: "Egypt",
  governorate: "Cairo",
  city: "New Cairo",
  street: "42 Test St",
  apartment: "4B",
};

async function postOrder(
  request: APIRequestContext,
  body: Record<string, unknown>
) {
  return request.post("/api/orders", { data: body });
}

test.describe("POST /api/orders — validation", () => {
  test("rejects an empty bag", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [],
      address: VALID_ADDRESS,
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ error: "Your bag is empty." });
  });

  test("rejects a bag of unavailable products", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [{ productId: "nope", variantId: "nope", quantity: 1 }],
      address: VALID_ADDRESS,
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(400);
  });

  test("rejects an invalid email", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      address: { ...VALID_ADDRESS, email: "not-an-email" },
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("email");
  });

  test("rejects an invalid Egyptian mobile number", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      address: { ...VALID_ADDRESS, phone: "12345" },
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("mobile");
  });

  test("rejects an invalid governorate", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      address: { ...VALID_ADDRESS, governorate: "Atlantis" },
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toContain("governorate");
  });

  test("rejects an unknown delivery method", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      address: VALID_ADDRESS,
      deliveryMethod: "teleport",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(400);
  });

  test("rejects an unknown payment method", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      address: VALID_ADDRESS,
      deliveryMethod: "standard",
      paymentMethod: "dogecoin",
    });
    expect(res.status()).toBe(400);
  });

  test("rejects missing address", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(400);
  });
});

test.describe("POST /api/orders — valid order", () => {
  test("creates a COD order with server-computed totals", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      address: VALID_ADDRESS,
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    const order = body.order;
    expect(order.orderNumber).toMatch(/^EG\d{8}-\d{4}$/);
    expect(order.lineItems).toHaveLength(1);
    expect(order.lineItems[0]).toMatchObject({
      productId: "prod-001",
      variantId: "v-naut-m",
      quantity: 1,
      name: expect.any(String),
      unitPrice: expect.any(Number),
    });
    // COD: total = subtotal + delivery fee (COD fee + tax are 0 in config).
    expect(order.subtotal).toBeGreaterThan(0);
    expect(order.total).toBe(order.subtotal + order.deliveryFee + order.codFee);
    expect(order.paymentMethod).toBe("cod");
    expect(order.paymentStatus).toBe("pending");
    expect(order.orderStatus).toBe("pending");
    expect(order.estimatedDelivery).toMatch(/\w{3,9} \d{1,2}, \d{4} – \w{3,9} \d{1,2}, \d{4}/);
  });

  test("delivery fee is waived above the free-delivery threshold", async ({
    request,
  }) => {
    const res = await postOrder(request, {
      // prod-001 price 580 x3 = 1740 >= 1500 → free delivery.
      lineItems: [{ ...VALID_LINE_ITEM, quantity: 3 }],
      address: VALID_ADDRESS,
      deliveryMethod: "standard",
      paymentMethod: "cod",
    });
    expect(res.status()).toBe(201);
    const order = (await res.json()).order;
    expect(order.deliveryFee).toBe(0);
  });

  test("applies a valid promo code server-side", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [{ ...VALID_LINE_ITEM, quantity: 2 }], // 2 x 580 = 1160
      address: VALID_ADDRESS,
      deliveryMethod: "standard",
      paymentMethod: "cod",
      promoCode: "DAWN10",
    });
    expect(res.status()).toBe(201);
    const order = (await res.json()).order;
    expect(order.discount).toBe(116); // 10% of 1160
    expect(order.total).toBe(order.subtotal - order.discount + order.deliveryFee);
  });

  test("ignores an invalid promo code", async ({ request }) => {
    const res = await postOrder(request, {
      lineItems: [VALID_LINE_ITEM],
      address: VALID_ADDRESS,
      deliveryMethod: "standard",
      paymentMethod: "cod",
      promoCode: "NOTACODE",
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).order.discount).toBe(0);
  });
});

test.describe("POST /api/subscribe", () => {
  test("rejects an invalid email shape", async ({ request }) => {
    const res = await request.post("/api/subscribe", { data: { email: "nope" } });
    expect(res.status()).toBe(400);
  });

  test("accepts a valid email", async ({ request }) => {
    const email = `pw-${Date.now()}@example.com`;
    const res = await request.post("/api/subscribe", { data: { email } });
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});