import { test, expect, type Page } from "@playwright/test";

/**
 * A11y + interactive-DOM regression guards.
 *
 * 1. NESTED-INTERACTIVE INVARIANT: no <button> may contain an <a>, and no
 *    <a> may contain a <button> (invalid HTML — breaks activation semantics,
 *    accessibility trees, and event routing). Verified across every route in
 *    both empty (unseeded) and content (seeded) states.
 *
 * 2. Button-as-link: <Button href>, the shared primitive used by CTAs, must
 *    render real anchors with an href (preserving SPA navigation).
 *
 * 3. Cart drawer checkouts are anchors, not nested buttons.
 *
 * 4. Checkout InstaPay: exactly ONE payment-confirmation checkbox may exist,
 *    rendered inside the InstaPay details only, and with the current empty
 *    store config it must be absent (the "not configured" path). The WhatsApp
 *    number shown must be the STORE number, gated on WhatsApp config.
 */

const ALL_ROUTES = [
  "/",
  "/products",
  "/products/the-nautical-tee",
  "/products/the-astronomical-tee",
  "/products/the-civil-workshirt",
  "/collections",
  "/collections/the-3-stages-of-dawn",
  "/about",
  "/contact",
  "/cart",
  "/wishlist",
  "/checkout",
  "/search",
  "/shipping",
  "/privacy",
  "/terms",
  "/some-page-that-does-not-exist",
];

const SEEDED_ROUTES = ["/", "/products", "/cart", "/checkout", "/wishlist"];

const VIEWPORT = { width: 390, height: 844 };

function seedStores(page: Page) {
  return page.addInitScript(() => {
    const cartSeed = {
      state: {
        items: [
          {
            productId: "nautical-tee",
            variantId: "nautical-tee-black-m",
            quantity: 1,
          },
        ],
        isOpen: false,
      },
      version: 0,
    };
    const wishlistSeed = {
      state: { productIds: ["nautical-tee"] },
      version: 0,
    };
    localStorage.setItem("tbd-cart", JSON.stringify(cartSeed));
    localStorage.setItem("tbd-wishlist", JSON.stringify(wishlistSeed));
  });
}

/** Returns a list of nested-interactive findings on the current DOM. */
async function findNestedInteractive(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const findings: string[] = [];
    document.querySelectorAll("button").forEach((btn) => {
      btn.querySelectorAll("a").forEach((a) => {
        findings.push(
          `<button> contains <a href="${a.getAttribute("href")}"> (${
            btn.className?.toString().slice(0, 60) || btn.tagName
          })`
        );
      });
    });
    document.querySelectorAll("a").forEach((a) => {
      a.querySelectorAll("button").forEach((btn) => {
        findings.push(
          `<a href="${a.getAttribute("href")}"> contains <button>${
            btn.textContent?.trim().slice(0, 30) ?? ""
          }`
        );
      });
    });
    return findings;
  });
}

test.describe("nested interactive elements (a11y DOM invariant)", () => {
  for (const route of ALL_ROUTES) {
    test(`${route} (unseeded) has no button>a or a>button nesting`, async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORT);
      await page.goto(route, { waitUntil: "load" });
      await page.waitForTimeout(300);
      const findings = await findNestedInteractive(page);
      expect(
        findings,
        `nested interactive elements on ${route}:\n${findings.join("\n")}`
      ).toEqual([]);
    });
  }

  for (const route of SEEDED_ROUTES) {
    test(`${route} (seeded cart/wishlist) has no nesting`, async ({ page }) => {
      await seedStores(page);
      await page.setViewportSize(VIEWPORT);
      await page.goto(route, { waitUntil: "load" });
      await page.waitForTimeout(300);
      const findings = await findNestedInteractive(page);
      expect(
        findings,
        `nested interactive elements on ${route}:\n${findings.join("\n")}`
      ).toEqual([]);
    });
  }
});

test.describe("Button-as-link renders real anchors", () => {
  test("hero CTAs are links with hrefs that survive SPA navigation", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORT);
    await page.goto("/", { waitUntil: "load" });

    const shopLink = page.getByRole("link", { name: "Shop the Collection" });
    await expect(shopLink).toBeVisible();
    await expect(shopLink).toHaveAttribute("href", "/products");

    // Client-side navigation still works through the anchor.
    await shopLink.click();
    await page.waitForURL("**/products");
    await expect(page).toHaveURL(/\/products$/);
  });

  test("start-shopping empty states are anchors (cart + checkout + wishlist + 404)", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORT);
    for (const route of ["/cart", "/checkout", "/wishlist"]) {
      await page.goto(route, { waitUntil: "load" });
      const link = page.getByRole("link", { name: /start shopping|explore products/i });
      await expect(link, `${route} empty-state CTA must render`).toBeVisible();
      await expect(link).toHaveAttribute("href", "/products");
    }
    await page.goto("/some-page-that-does-not-exist", { waitUntil: "load" });
    const home = page.getByRole("link", { name: "Back to Home" });
    await expect(home).toBeVisible();
    await expect(home).toHaveAttribute("href", "/");
  });
});

test.describe("cart drawer", () => {
  test("empty drawer: Start Shopping is a link", async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: /Shopping bag/i }).click();
    const link = page.getByRole("link", { name: "Start Shopping" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/products");
  });

  test("seeded drawer: Proceed to Checkout is a link and checkout route works", async ({
    page,
  }) => {
    await seedStores(page);
    await page.setViewportSize(VIEWPORT);
    await page.goto("/", { waitUntil: "load" });
    await page.getByRole("button", { name: /Shopping bag \(1/ }).click();
    const checkout = page.getByRole("link", { name: "Proceed to Checkout" });
    await expect(checkout).toBeVisible();
    await expect(checkout).toHaveAttribute("href", "/checkout");
  });
});

test.describe("checkout InstaPay payment confirmation (single checkbox rule)", () => {
  test("unconfigured InstaPay: no confirmation checkbox, no WhatsApp button, honest message", async ({
    page,
  }) => {
    await seedStores(page);
    await page.setViewportSize(VIEWPORT);
    await page.goto("/checkout", { waitUntil: "load" });

    await page.getByRole("radio", { name: /InstaPay/i }).check();

    await expect(
      page.getByText("InstaPay is not configured yet", { exact: false })
    ).toBeVisible();

    // Confirmation lives ONLY in InstaPayDetails, which needs a configured
    // InstaPay number. With none configured there must be exactly 0 — a
    // Terms-section duplicate would surface here.
    const confirmationBoxes = page.locator("label", {
      hasText: "completed the InstaPay transfer",
    });
    expect(await confirmationBoxes.count(), "duplicate InstaPay confirmation checkbox").toBe(0);

    // WhatsApp screenshot flow is gated on the STORE WhatsApp number.
    const whatsappNumber = page.getByText("WhatsApp Payment Confirmation", {
      exact: false,
    });
    expect(await whatsappNumber.count(), "WHATSAPP must be hidden when unconfigured").toBe(0);
    const sendScreenshot = page.getByRole("button", {
      name: /Send Payment Screenshot on WhatsApp/,
    });
    expect(await sendScreenshot.count()).toBe(0);
  });

  test("page still clears silly text when InstaPay selected then switch to COD", async ({
    page,
  }) => {
    await seedStores(page);
    await page.setViewportSize(VIEWPORT);
    await page.goto("/checkout", { waitUntil: "load" });

    await page.getByRole("radio", { name: /InstaPay/i }).check();
    await page.getByRole("radio", { name: /Cash on Delivery/i }).check();

    // Unconfigured warning disappears once a different method is selected.
    await expect(
      page.getByText("InstaPay is not configured yet", { exact: false })
    ).toHaveCount(0);
  });
});