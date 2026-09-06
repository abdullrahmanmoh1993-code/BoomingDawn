# The Booming Dawn

Premium streetwear storefront for The Booming Dawn, designed in Cairo, Egypt.
Built with Next.js (App Router) and deployed to **Cloudflare Workers** via
[vinext](https://vinext.dev) — a Vite-based reimplementation of the Next.js API
surface.

**Live:** https://booming-dawn.abdullrahman-moh1993.workers.dev

## Tech Stack

- **Next.js 16.3.4** (App Router, RSC) — application framework
- **vinext** — Vite-based runtime that ships the app to Workers
- **React 19** / **TypeScript** (strict)
- **Tailwind CSS v4** — CSS-first config in `src/app/globals.css`
- **Framer Motion** — interactions & scroll animations
- **Zustand** (persist) — cart, wishlist, order draft state
- **Lucide React** — icons
- **@cloudflare/vite-plugin** + **wrangler** — local worker preview, deploys

## Project Structure

```
src/
├── app/                # Routes (App Router)
│   ├── (shop)/         # Shop pages (home, collections, products, cart, checkout, …)
│   └── api/           # POST /api/orders, /api/subscribe, POST /api/csp-report
├── components/
│   ├── layout/         # Header, Footer, MobileNav, ThemeToggle, SearchOverlay
│   ├── ui/             # Button, Input, Modal, Drawer, Badge, …
│   ├── product/        # ProductCard, ProductGrid, Gallery, VariantPicker
│   ├── home/           # Hero, FeaturedCollections, Newsletter
│   ├── cart/           # CartDrawer
│   └── checkout/       # CheckoutPage, delivery form, summary
├── lib/
│   ├── data/           # Static product/collection catalog
│   ├── checkout/       # Delivery zones, promo codes, totals math
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Helpers (formatPrice, cn)
│   └── constants/      # siteConfig (name, URL, navigation)
└── stores/             # Zustand stores (cart, wishlist, order)
```

## Two Build Systems (read this first)

The repo deliberately keeps **both** toolchains:

| Toolchain | Purpose | Commands |
|-----------|---------|----------|
| **Next.js dev server** | Fast local editing with full HMR | `npm run dev` (port 3000) |
| **vinext** | Production build + Cloudflare Workers deploy | `dev:vinext` / `build:vinext` / `start:vinext` / `deploy:vinext` |

Source code is shared — `app/`, `components/`, `next.config.ts` are read by
both. Do **not** put webpack/Turbopack-only config in `next.config.ts`;
vinext ignores it in favor of Vite plugins (`vite.config.ts`).

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server (local editing) |
| `npm run lint` | ESLint |
| `npm run build:vinext` | Production build (Vite/Rolldown) |
| `npm run start:vinext` | Local preview of the built worker (port 8787). Don't run this while deploying — it locks `dist/server/.wrangler` |
| `npm run deploy:vinext` | Build + deploy to Cloudflare Workers |

## Deploy Runbook

1. `npm run build:vinext` — check for build errors and prerender warnings.
2. `npm run start:vinext` — smoke test key routes locally: `/`, product,
   collection, `POST /api/orders`.
3. Kill the local worker (`Ctrl+C`).
4. `npm run deploy:vinext` — deploys to the `booming-dawn` worker.
5. Verify live: canonical URL in HTML head, `sitemap.xml`, `robots.txt`,
   the hero video, and a real order POST.

Notes:

- Auth is the machine's wrangler OAuth login (`wrangler login`).
- CI (GitHub Actions) deploys with the `CLOUDFLARE_API_TOKEN` repo secret
  instead of OAuth.
- Worker: `booming-dawn` on the `abdullrahman-moh1993` subdomain.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical/OG/sitemap/JSON-LD base URL. Falls back to the workers.dev URL in `src/lib/constants/index.ts`. Set to your real domain and rebuild when you have one. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client Turnstile sitekey override. Unset in production (defaults to the real key); set to Cloudflare's test key (`1x00000000000000000000AA`) in local `.env.local`. |
| `TURNSTILE_SECRET` (secret) | Turnstile siteverify secret. While unset the API gates are open (local dev / CI previews). |
| `TURNSTILE_HOSTNAMES` (secret) | Comma-separated hostname allowlist enforced by `src/lib/security/turnstile.ts`. Set to your production origin. |
| `ORDER_WEBHOOK_URL` (secret) | Google Apps Script `/exec` URL for the order notification webhook. |
| `ORDER_WEBHOOK_TOKEN` (secret) | Shared token matched by the Apps Script (`orders.gs`) before it appends a row / emails. |
| `CLOUDFLARE_API_TOKEN` (CI only) | Workers Scripts:Edit + Account Settings:Read + D1:Edit. Stored as a GitHub Actions secret. |

Copy `.env.example` to `.env` if you need to override `NEXT_PUBLIC_SITE_URL`
locally. `.dev.vars` (gitignored) holds Worker bindings for local previews, and
`.env*` is gitignored.

## SEO & Content

- Per-page `metadata` + `generateMetadata` (products, collections).
- `sitemap.ts`, `robots.ts`, global `Organization` JSON-LD, Open Graph +
  Twitter cards in `src/app/layout.tsx`.
- Product/collection data lives in `src/lib/data/` — edit there, no component
  changes needed.
- Images are local webp under `public/`; hero is a self-hosted video
  (`public/videos/`) with poster.

## Payments & Orders — Current State

- Card payments are **deliberately disabled** in checkout. Supported methods:
  COD (cash on delivery) and InstaPay (manual verification via WhatsApp
  screenshot). No card data is ever collected or transmitted.
- `POST /api/orders` validates the payload, recomputes totals server-side
  (incl. promo codes via `src/lib/checkout/`), persists to **D1** (`orders` +
  `order_items`), then best-effort posts to the Google Sheets/email webhook.
- `POST /api/subscribe` persists newsletter signups to D1 (deduped).
- The order tracker script lives in `google-apps-script/orders.gs`; its webhook
  URL/token are Worker secrets (`ORDER_WEBHOOK_URL`, `ORDER_WEBHOOK_TOKEN`).
- Order numbers are generated with `crypto.getRandomValues` (see
  `generateOrderNumber` in `src/lib/checkout/orders.ts`).

## Security

- **Turnstile** on `/checkout` and the newsletter form: widget token is
  verified server-side (`src/lib/security/turnstile.ts`) — action + hostname
  checks included. Server-side verification is skipped only while
  `TURNSTILE_SECRET` is unset (local dev / CI previews).
- **Rate limiting** (`wrangler.jsonc` → `ratelimits`): orders 5/min and
  subscribe 3/min per IP + email (`src/lib/security/rate-limit.ts`). Skip is
  automatic on loopback hosts (local previews never throttle QA) and when the
  binding is absent.
- **Origin/CSRF gate** on every API POST (`src/lib/security/origin.ts`) plus
  strict `Content-Type` and request-body size caps.
- **Security headers**: HSTS, nosniff, X-Frame-Options, Referrer-Policy,
  Permissions-Policy, and a strict CSP with **CSP reporting**
  (`/api/csp-report`) for both static assets (`public/_headers`) and API
  responses (`src/lib/http/security-headers.ts`).
- Checkout and API routes are `noindex` (`robots.ts` + `public/_headers`) and
  the server suppresses the `X-Powered-By` header
  (`next.config.ts` → `poweredByHeader: false`).
- **Dependency hygiene**: CI runs `npm audit --omit=dev --audit-level=high` and
  Dependabot tracks npm + GitHub Actions (monthly).
- **Webhook auth**: the Apps Script only acts when the body `token` matches
  `ORDER_WEBHOOK_TOKEN`. Rotate that token (update both the Worker secret and
  `orders.gs`, then redeploy the Apps Script) if it ever leaks.
- Recommended GitHub settings (manual): enable Secret scanning under
  Settings → Code security and analysis. Enable 2FA on the Cloudflare and
  GitHub accounts; keep deploy tokens scoped (<code>Workers Scripts:Edit</code>
  only).

## Known vinext Limitations

- `next/image` optimizer: remote-images library via `@unpic`; no build-time
  optimization, images pass through unoptimized.
- `next/font/google`: self-hosted at build by the current workflow (checked
  via response headers on the deployed worker).
- PPR not supported (use `"use cache"`); `runtime`/`preferredRegion` segment
  configs ignored; domain-based i18n unsupported (path-prefix works).
- `next/jest` unsupported → tests use **Vitest**.