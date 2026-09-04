import { test, expect, type Page } from "@playwright/test";

/**
 * Full-sweep mobile QA: EVERY route (all public + info + checkout + 404) at
 * mobile widths AND desktop, asserting:
 * - No page runtime errors (caught JS exceptions / unhandled rejections)
 * - No console errors (hydtation mismatches, 404 fetches, failed resources)
 * - No horizontal overflow (scrollingElement must not scroll horizontally)
 * - Header and footer both render (shell integrity)
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

const MOBILE_WIDTHS = [
  { name: "320", width: 320, height: 568 },
  { name: "390", width: 390, height: 844 },
  { name: "412", width: 412, height: 915 },
  { name: "430", width: 430, height: 932 },
];

const DESKTOP = { name: "desktop-1280", width: 1280, height: 800 };

function collectErrors(
  page: Page,
  bucket: { messages: string[] }
): () => void {
  const onError = (err: Error) => bucket.messages.push(`pageerror: ${err.message}`);
  const onConsole = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") bucket.messages.push(`console: ${msg.text()}`);
  };
  page.on("pageerror", onError);
  page.on("console", onConsole);
  return () => {
    page.off("pageerror", onError);
    page.off("console", onConsole);
  };
}

test.describe("full sweep — all routes, all widths (page errors, overflow, shell)", () => {
  for (const vp of [...MOBILE_WIDTHS, DESKTOP]) {
    for (const route of ALL_ROUTES) {
      test(`${vp.name} x ${route}`, async ({ page }) => {
        const errors: { messages: string[] } = { messages: [] };
        const off = collectErrors(page, errors);
        try {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          const resp = await page.goto(route, { waitUntil: "load" });
          // Allow network-idle-ish settling for client effects.
          await page.waitForTimeout(400);

          // The 404 route legitimately returns 404 — everything else must not.
          const is404 = route === "/some-page-that-does-not-exist";
          if (!is404) {
            expect(resp?.status(), `${route} returned ${resp?.status()}`).toBeLessThan(400);
          }

          if (is404) {
            // Console will legitimately log the 404 resource response; only
            // uncaught exceptions are a regression on the not-found UI.
            const runtimeErrors = errors.messages.filter((m) => m.startsWith("pageerror"));
            expect(
              runtimeErrors,
              `page errors on ${route} at ${vp.name}:\n${runtimeErrors.join("\n")}`
            ).toEqual([]);
          } else {
            expect(
              errors.messages,
              `runtime/console errors on ${route} at ${vp.name}:\n${errors.messages.join("\n")}`
            ).toEqual([]);
          }

          const overflow = await page.evaluate(() => {
            const se = document.scrollingElement || document.documentElement;
            return { sw: se.scrollWidth, cw: se.clientWidth };
          });
          expect(
            overflow,
            `horizontal overflow on ${route} at ${vp.name} (${overflow.sw} > ${overflow.cw})`
          ).toHaveProperty("sw", overflow.cw);

          // Shell integrity: header + footer present on normal pages.
          if (route !== "/some-page-that-does-not-exist") {
            await expect(page.locator("header")).toBeVisible();
            await expect(page.locator("footer")).toBeVisible();
          }
        } finally {
          off();
        }
      });
    }
  }
});