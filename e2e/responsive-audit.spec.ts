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
  { name: "402", width: 402, height: 874 },
  { name: "412", width: 412, height: 915 },
  { name: "430", width: 430, height: 932 },
  { name: "480", width: 480, height: 853 },
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
            // Global overflow-x clipping is intentionally NOT used (any real
            // overflow must surface here rather than being masked); the only
            // local containment is the editorial slide-in section itself.
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
  const headerRow = (page: Page) =>
    page.locator("header div.flex.items-center.justify-between").first();

  test("header horizontal padding resolves at mobile width", async ({ page }) => {
    await setViewport(page, { width: 320, height: 568 });
    await page.goto("/");
    const pad = await headerRow(page).evaluate((el) => ({
      left: parseFloat(getComputedStyle(el).paddingLeft),
      right: parseFloat(getComputedStyle(el).paddingRight),
    }));
    // max(1rem, env(inset)) — env()=0 headless => 16px(1rem), never less.
    expect(pad.left, `header paddingLeft was ${pad.left}px`).toBeGreaterThanOrEqual(15);
    expect(pad.right, `header paddingRight was ${pad.right}px`).toBeGreaterThanOrEqual(15);
  });

  test("header horizontal padding grows at ≥sm (landscape) and stays finite", async ({
    page,
  }) => {
    await setViewport(page, { width: 844, height: 390 });
    await page.goto("/");
    const pad = await headerRow(page).evaluate((el) => ({
      left: parseFloat(getComputedStyle(el).paddingLeft),
      right: parseFloat(getComputedStyle(el).paddingRight),
    }));
    // sm breakpoint = 1.5rem = 24px
    expect(pad.left).toBeGreaterThanOrEqual(23);
    expect(pad.right).toBeGreaterThanOrEqual(23);
  });

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

test.describe("sticky behavior (no overflow containment needed)", () => {
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

test.describe("mobile header icons never overflow (320/375/380/414)", () => {
  const ICON_VPS = [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 380, height: 840 }, // phone-mockup screen width
    { width: 414, height: 896 },
  ];

  for (const vp of ICON_VPS) {
    test(`${vp.width}px: actions cluster + cart badge stay inside viewport, row fits its own box`, async ({
      page,
    }) => {
      // Seed the persisted cart store BEFORE hydration so the badge renders.
      await page.addInitScript(() => {
        localStorage.setItem(
          "tbd-cart",
          JSON.stringify({
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
          })
        );
      });

      await setViewport(page, vp);
      await page.goto("/");

      const header = page.locator("header");
      const row = header.locator("div.flex.items-center.justify-between").first();
      const search = page.getByRole("button", { name: "Search" });
      const wishlist = page.locator('header a[href="/wishlist"]');
      const cart = page.getByRole("button", { name: /Shopping bag/i });
      const badge = page.locator('header button[aria-label^="Shopping bag"] span');

      // The badge must actually render (the whole point of the regression).
      await expect(badge).toBeVisible();
      await expect(search).toBeVisible();

      // #1: header row has explicit 1rem safe-area padding (never < 16px).
      const pads = await row.evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          paddingLeft: parseFloat(s.paddingLeft),
          paddingRight: parseFloat(s.paddingRight),
        };
      });
      expect(pads.paddingLeft, "row left padding must be >= 16px").toBeGreaterThanOrEqual(15.9);
      expect(pads.paddingRight, "row right padding must be >= 16px").toBeGreaterThanOrEqual(15.9);

      // #4: the row itself must never overflow its box (icons cannot spill out).
      const metrics = await row.evaluate((el) => ({
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        overflowX: getComputedStyle(el).overflowX,
      }));
      expect(
        metrics.scrollWidth,
        `header row overflows its own box: scrollWidth ${metrics.scrollWidth} > clientWidth ${metrics.clientWidth}`
      ).toBeLessThanOrEqual(metrics.clientWidth);
      expect(metrics.overflowX, "header row must not clip its own children").not.toMatch(/hidden|clip/i);

      // #2/#3: every control AND the absolutely-offset badge fits the viewport.
      const controls = [search, wishlist, cart, badge];
      for (const c of controls) {
        await expect(c).toBeVisible();
        const box = (await c.boundingBox())!;
        expect(box.x, `${vp.width}px: left edge of control is cut off`).toBeGreaterThanOrEqual(0);
        expect(
          box.x + box.width,
          `${vp.width}px: right edge of control is cut off by the screen/notch edge`
        ).toBeLessThanOrEqual(vp.width);
        expect(box.y + box.height, `${vp.width}px: control clipped above`).toBeGreaterThan(0);
      }

      // Header/ancestors must never reintroduce overflow clipping as a mask.
      const headerOverflow = await header.evaluate(
        (el) => `${getComputedStyle(el).overflowX} ${getComputedStyle(el).overflowY}`
      );
      expect(headerOverflow).not.toMatch(/hidden|clip/i);
    });
  }
});

test.describe("phone mockup: badges never clipped by the screen corner", () => {
  test("cart + wishlist badges render fully inside the rounded phone screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/phone-mockup.html", { waitUntil: "load" });

    // The mockup auto-seeds the cart + wishlist stores on load.
    const frame = page.frameLocator("#frame");
    const cartBadge = frame.locator('header button[aria-label^="Shopping bag"] span');
    const wishBadge = frame.locator('header a[href="/wishlist"] span');
    await expect(cartBadge).toBeVisible();
    await expect(wishBadge).toBeVisible();

    // Model the phone screen exactly as phone-mockup.html does: the screen box
    // (.screen) is 48px-corner rounded with overflow:hidden and the iframe is
    // inset 47px from its top. Work in iframe-internal CSS coordinates: the
    // screen box spans y:[-47, iframeHeight], x:[0, iframeWidth]. A badge is
    // "out of frame" only if any of its 4 corners falls inside the corner mask
    // or outside the screen box.
    const result = await page.evaluate(() => {
      const f = document.getElementById("frame") as HTMLIFrameElement;
      const dw = f.contentWindow!.document;
      const W = dw.documentElement.clientWidth;
      const H = dw.documentElement.clientHeight;
      const TOP_INSET = 47; // .screen iframe { margin-top: 47px }
      const R = 48; // .screen { border-radius: 48px }
      // Screen box in iframe-internal coords:
      const box = { left: 0, top: -TOP_INSET, right: W, bottom: H };
      const insideRoundedRect = (x: number, y: number) => {
        const cx = Math.min(Math.max(x, box.left + R), box.right - R);
        const cy = Math.min(Math.max(y, box.top + R), box.bottom - R);
        const dx = x - cx;
        const dy = y - cy;
        return dx * dx + dy * dy <= R * R;
      };
      const screenFits = (el: Element) => {
        const b = el.getBoundingClientRect();
        const corners: Array<[number, number]> = [
          [b.left, b.top],
          [b.right, b.top],
          [b.left, b.bottom],
          [b.right, b.bottom],
        ];
        const inBounds = corners.every(
          ([x, y]) =>
            x >= box.left && y >= box.top && x <= box.right && y <= box.bottom
        );
        const inCorners = corners.every(([x, y]) => insideRoundedRect(x, y));
        return {
          box: {
            left: b.left,
            top: b.top,
            right: b.right,
            bottom: b.bottom,
            width: b.width,
            height: b.height,
          },
          inBounds,
          inCorners,
        };
      };
      const q = (sel: string) => dw.querySelector(sel)!;
      return {
        screen: { width: W, height: H },
        cart: screenFits(q('header button[aria-label^="Shopping bag"] span')),
        wishlist: screenFits(q('header a[href="/wishlist"] span')),
      };
    });

    expect(
      result.cart.inBounds && result.cart.inCorners,
      `cart badge clipped by phone screen: ${JSON.stringify(result.cart)}`
    ).toBe(true);
    expect(
      result.wishlist.inBounds && result.wishlist.inCorners,
      `wishlist badge clipped by phone screen: ${JSON.stringify(result.wishlist)}`
    ).toBe(true);
  });
});