import { test, expect, type Page } from "@playwright/test";

/**
 * Full mobile responsiveness audit.
 * - No horizontal overflow across a wide matrix of viewports + routes
 * - Header structure: [hamburger → logo] on mobile, centered logo on desktop
 * - Logo carries correct intrinsic dimensions in the SSR markup (no giant flash)
 */

const ROUTES = [
  "/",
  "/products",
  "/products/the-nautical-tee",
  "/collections/the-3-stages-of-dawn",
  "/about",
  "/cart",
  "/shipping",
];

const VIEWPORTS = [
  { name: "320", width: 320, height: 568 },
  { name: "360", width: 360, height: 800 },
  { name: "375", width: 375, height: 667 },
  { name: "390", width: 390, height: 844 },
  { name: "393", width: 393, height: 852 },
  { name: "412", width: 412, height: 915 },
  { name: "430", width: 430, height: 932 },
  { name: "landscape-844", width: 844, height: 390 },
  { name: "768-tab", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 768 },
];

function setViewport(page: Page, v: { width: number; height: number }) {
  return page.setViewportSize({ width: v.width, height: v.height });
}

test.describe("horizontal overflow", () => {
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${vp.name} x ${route}`, async ({ page }) => {
        await setViewport(page, vp);
        await page.goto(route, { waitUntil: "load" });
        // Let sticky/initial effects settle.
        await page.waitForTimeout(300);
        const overflow = await page.evaluate(() => {
          const se = document.scrollingElement || document.documentElement;
          return {
            scrollWidth: se.scrollWidth,
            clientWidth: se.clientWidth,
            // html/body overflow-x clip is intentional containment for
            // slide-in motion; scrollability is what we must never see.
            htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
            hasOverflow: se.scrollWidth > se.clientWidth + 1,
          };
        });
        expect(
          overflow,
          `horizontal overflow on ${route} at ${vp.width}x${vp.height} (scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth})`
        ).toHaveProperty("hasOverflow", false);
      });
    }
  }
});

test.describe("header mobile layout", () => {
  test("320px: hamburger then logo on the left, everything inside viewport", async ({
    page,
  }) => {
    await setViewport(page, { width: 320, height: 568 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /Open menu|Close menu/i });
    const logoLink = page.getByRole("link", { name: /Booming Dawn - home/i });
    const search = page.getByRole("button", { name: "Search" });
    const cart = page.getByRole("button", { name: /Shopping bag/i });
    const wishlist = page.locator('header a[href="/wishlist"]');

    await expect(hamburger).toBeVisible();
    await expect(logoLink).toBeVisible();

    const hb = (await hamburger.boundingBox())!;
    const lg = (await logoLink.boundingBox())!;

    // Logo is immediately to the RIGHT of the hamburger
    expect(lg.x, "logo must start after the hamburger").toBeGreaterThanOrEqual(hb.x + hb.width);
    // Logo sits in the LEFT half of the bar (not centered, not right)
    expect(lg.x + lg.width / 2, "mobile logo must be on the left half").toBeLessThan(160);
    // Aligned vertically: same baseline center
    expect(Math.abs(lg.y + lg.height / 2 - (hb.y + hb.height / 2))).toBeLessThan(10);

    // Logo height is modest on mobile (max touches ~44px), never oversized
    const logoHeight = await page
      .locator('header svg[aria-label="The Booming Dawn logo"]')
      .first()
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(logoHeight).toBeLessThanOrEqual(48);

    // All controls visibly inside the viewport
    for (const c of [hamburger, logoLink, search, wishlist, cart]) {
      const box = (await c.boundingBox())!;
      expect(box.x, `left edge clipped`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `right edge clipped`).toBeLessThanOrEqual(320);
    }
  });

  test("390px (iPhone-like): hamburger → logo left, actions right", async ({
    page,
  }) => {
    await setViewport(page, { width: 390, height: 844 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /Open menu|Close menu/i });
    const logoLink = page.getByRole("link", { name: /Booming Dawn - home/i });
    const cart = page.getByRole("button", { name: /Shopping bag/i });
    const search = page.getByRole("button", { name: "Search" });

    const hb = (await hamburger.boundingBox())!;
    const lg = (await logoLink.boundingBox())!;
    const cartBox = (await cart.boundingBox())!;
    const searchBox = (await search.boundingBox())!;

    expect(lg.x).toBeGreaterThanOrEqual(hb.x + hb.width);
    expect(lg.x + lg.width / 2).toBeLessThan(195);
    expect(searchBox.x).toBeGreaterThan(lg.x + lg.width);
    expect(cartBox.x).toBeGreaterThan(searchBox.x);
  });

  test("desktop 1280px: hamburger hidden, logo centered", async ({ page }) => {
    await setViewport(page, { width: 1280, height: 800 });
    await page.goto("/");
    const hamburger = page.getByRole("button", { name: /Open menu|Close menu/i });
    const logoLink = page.getByRole("link", { name: /Booming Dawn - home/i });
    const nav = page.getByRole("navigation", { name: "Main navigation" });

    await expect(hamburger).toBeHidden();
    await expect(nav).toBeVisible();
    await expect(logoLink).toBeVisible();

    const lg = (await logoLink.boundingBox())!;
    expect(lg.x + lg.width / 2, "desktop logo should be centered").toBeGreaterThan(600);
    expect(lg.x + lg.width / 2).toBeLessThan(680);
  });
});

test.describe("safe-area padding renders (calc guards)", () => {
  test("mobile menu panel gets safe-area-aware top padding", async ({ page }) => {
    await setViewport(page, { width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Open menu/i }).click();
    const panel = page.getByRole("navigation", { name: "Mobile navigation" });
    await expect(panel).toBeVisible();
    const pt = await panel.evaluate((el) =>
      parseFloat(getComputedStyle(el).paddingTop)
    );
    // In headless env() = 0, so padding must still resolve to 5rem = 80px.
    expect(pt, `menu panel paddingTop was ${pt}px`).toBeGreaterThanOrEqual(79);
  });

  test("checkout mobile place-order bar clears the home indicator", async ({
    page,
  }) => {
    await setViewport(page, { width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem(
        "tbd-cart",
        JSON.stringify({
          state: {
            items: [
              { productId: "the-nautical-tee", variantId: "nautical-tee-black-m", quantity: 1 },
            ],
          },
          version: 0,
        })
      );
    });
    await page.goto("/checkout");
    const bar = page
      .locator("div.fixed.bottom-0")
      .filter({
        has: page.getByRole("button", { name: /Place order|Pay|Order/i }),
      })
      .first();
    const pb = await bar.evaluate((el) =>
      parseFloat(getComputedStyle(el).paddingBottom)
    );
    // calc(1rem + env(…)) with env() = 0 must resolve to 16px (1rem).
    expect(pb, `place-order bar paddingBottom was ${pb}px`).toBeGreaterThanOrEqual(
      15
    );
  });
});

test.describe("sticky behavior survives overflow-x clip", () => {
  test("dawn-stages sticky column still sticks to viewport top", async ({
    page,
  }) => {
    await setViewport(page, { width: 390, height: 844 });
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(600);

    const track = await page.evaluate(() => {
      const sticky = [...document.querySelectorAll("*")].find((el) => {
        const s = getComputedStyle(el);
        return s.position === "sticky" && el.getBoundingClientRect().height > 200;
      });
      if (!sticky) return null;
      const before = sticky.getBoundingClientRect().top;
      window.scrollTo(0, 1400);
      return { before, id: sticky.id || sticky.className, elTag: sticky.tagName };
    });

    expect(track, "expected a sticky dawn-stage element to exist").not.toBeNull();

    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const sticky = [...document.querySelectorAll("*")].find((el) => {
        const s = getComputedStyle(el);
        return s.position === "sticky" && el.getBoundingClientRect().height > 200;
      });
      return sticky ? sticky.getBoundingClientRect().top : null;
    });

    // Stuck at the top once its parent scrolls it up.
    expect(track!.before).toBeGreaterThan(200);
    expect(after!, "sticky element did not stick to the viewport top").toBeLessThan(
      5
    );
  });
});

test.describe("logo first-paint (no flash)", () => {
  test("SSR markup carries small intrinsic dimensions, not 200x200", async ({
    page,
  }) => {
    await setViewport(page, { width: 390, height: 844 });
    await page.goto("/");
    const attrs = await page
      .locator('header svg[aria-label="The Booming Dawn logo"]')
      .first()
      .evaluate((el) => ({
        width: el.getAttribute("width"),
        height: el.getAttribute("height"),
      }));
    expect(Number(attrs.width), "logo SSR width must match design (≈53)").toBeLessThanOrEqual(60);
    expect(Number(attrs.height), "logo SSR height must match design (≈40)").toBeLessThanOrEqual(48);
    expect(attrs.width).not.toBe("200");
    expect(attrs.height).not.toBe("200");
  });

  test("checkout header logo also carries small intrinsic dimensions", async ({
    page,
  }) => {
    await setViewport(page, { width: 390, height: 844 });
    await page.goto("/checkout");
    const svg = page.locator("header svg[aria-label='The Booming Dawn logo']").last();
    await expect(svg).toBeVisible();
    const attrs = await svg.evaluate((el) => ({
      width: el.getAttribute("width"),
      height: el.getAttribute("height"),
    }));
    expect(Number(attrs.height)).toBeLessThanOrEqual(48);
    expect(attrs.height).not.toBe("200");
  });
});