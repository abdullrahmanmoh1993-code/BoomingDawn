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
│   └── api/orders/     # POST /api/orders — validates + totals an order
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
| `CLOUDFLARE_API_TOKEN` (CI only) | Workers Scripts:Edit + Account Settings:Read + D1:Edit. Stored as a GitHub Actions secret. |

Copy `.env.example` to `.env` if you need to override `NEXT_PUBLIC_SITE_URL`
locally. `.env*` is gitignored.

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
  COD (cash on delivery) and InstaPay.
- `POST /api/orders` validates the payload, recomputes totals server-side
  (incl. promo codes via `src/lib/checkout/`), and returns the order summary.
  Orders are **not yet persisted** (no database); confirmation is client-side.
- Phase 4 of the current sweep introduces a D1-backed `orders` store and a
  `/order/[id]` confirmation page; the API token preset above already
  includes D1:Edit so CI can migrate.

## Known vinext Limitations

- `next/image` optimizer: remote-images library via `@unpic`; no build-time
  optimization, images pass through unoptimized.
- `next/font/google`: self-hosted at build by the current workflow (checked
  via response headers on the deployed worker).
- PPR not supported (use `"use cache"`); `runtime`/`preferredRegion` segment
  configs ignored; domain-based i18n unsupported (path-prefix works).
- `next/jest` unsupported → tests use **Vitest**.