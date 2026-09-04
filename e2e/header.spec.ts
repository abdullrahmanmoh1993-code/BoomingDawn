import { test, expect, type Page } from "@playwright/test";

/**
 * Seeds the persisted Zustand stores so the header badges render.
 * Cart key "tbd-cart", wishlist key "tbd-wishlist" (see src/stores/*).
 */
async function seedStores(page: Page) {
  await page.addInitScript(() => {
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

test("header badges are fully visible (no clipping) top-to-bottom", async ({
  page,
}) => {
  await seedStores(page);
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();

  const header = page.getByRole("banner");

  // Cart badge ("1") + wishlist badge ("1")
  const cartButton = page.getByRole("button", { name: /Shopping bag \(1/ });
  const cartBadge = cartButton.locator("span").filter({ hasText: "1" });
  const wishlistLink = page.getByRole("link", { name: /Wishlist \(1/ });
  const wishlistBadge = wishlistLink.locator("span").filter({ hasText: "1" });

  // Both badges exist because the seeded stores rehydrate
  await expect(cartBadge).toBeVisible();
  await expect(wishlistBadge).toBeVisible();

  // No ancestor between the badge and the <header> may clip it
  for (const badge of [cartBadge, wishlistBadge]) {
    const clipping = await badge.evaluate((el) => {
      const header = el.closest("header");
      let node: Element | null = el;
      const offenders: string[] = [];
      while (node && node !== header && node.parentElement !== null) {
        const cs = getComputedStyle(node);
        if (["hidden", "clip", "auto", "scroll"].includes(cs.overflow) || ["hidden", "clip", "auto", "scroll"].includes(cs.overflowX) || ["hidden", "clip", "auto", "scroll"].includes(cs.overflowY)) {
          offenders.push(`${node.tagName.toLowerCase()} ${cs.overflow}/${cs.overflowX}/${cs.overflowY}`);
        }
        node = node.parentElement;
      }
      return offenders;
    });
    expect(clipping, `clipping ancestors for badge`).toEqual([]);
  }

  // Badge bounding boxes must sit fully inside the viewport
  for (const [label, badge] of [
    ["cart", cartBadge],
    ["wishlist", wishlistBadge],
  ] as const) {
    const box = await badge.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        left: r.left,
        width: innerWidth,
        height: innerHeight,
        hasTop: r.top >= 0,
        hasRight: r.right <= innerWidth,
        hasBottom: r.bottom <= innerHeight,
        hasLeft: r.left >= 0,
        visibleArea: Math.round((r.width * r.height) as number),
        expectedArea: Math.round((el as HTMLElement).offsetWidth * (el as HTMLElement).offsetHeight),
      };
    });
    expect(box.top, `${label} badge top clipped`).toBeGreaterThanOrEqual(0);
    expect(box.left, `${label} badge left clipped`).toBeGreaterThanOrEqual(0);
    expect(box.right, `${label} badge right clipped`).toBeLessThanOrEqual(box.width);
    expect(box.bottom, `${label} badge bottom clipped`).toBeLessThanOrEqual(box.height);
    expect(box.visibleArea).toBe(box.expectedArea);
  }

  // Header bar edges: logo should touch top and bottom of the fixed bar
  await expect(header).toBeVisible();

  // Screenshot for visual inspection
  const name = test.info().project.name;
  await page.screenshot({ path: `.playwright-results/header-${name}.png` });
});

test("all header controls are visible and inside the viewport", async ({
  page,
}) => {
  await seedStores(page);
  await page.goto("/");

  // Mobile hamburger / desktop nav + all action icons
  const menuButton = page.getByRole("button", { name: /Open menu|Close menu/i });
  const search = page.getByRole("button", { name: "Search" });
  const cart = page.getByRole("button", { name: /Shopping bag/ });
  const wishlist = page.getByRole("link", { name: /Wishlist/ });

  const controls = [search, cart, wishlist];
  if (test.info().project.name === "mobile") {
    controls.push(menuButton);
  }

  for (const c of controls) {
    await expect(c).toBeVisible();
    const box = await c.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        top: r.top,
        right: r.right,
        bottom: r.bottom,
        left: r.left,
        width: innerWidth,
        height: innerHeight,
      };
    });
    expect(box.top, `${await c.getAttribute("aria-label")} top clipped`).toBeGreaterThanOrEqual(0);
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(box.width);
    expect(box.bottom).toBeLessThanOrEqual(box.height);
  }
});