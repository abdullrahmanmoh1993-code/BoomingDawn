# The Booming Dawn

Premium fashion e-commerce website built with Next.js + React + TypeScript.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4**
- **Framer Motion** — animations
- **Zustand** — cart & wishlist state
- **Lucide React** — icons

## Project Structure

```
src/
├── app/                # Routes (App Router)
│   └── (shop)/         # Shop pages (home, collections, products, cart, etc.)
├── components/
│   ├── layout/         # Header, Footer, MobileNav, ThemeToggle
│   ├── ui/             # Button, Input, Modal, Drawer
│   ├── product/        # ProductCard, ProductGrid, Gallery, Variants
│   ├── home/           # Hero, FeaturedCollections, Newsletter
│   ├── cart/           # CartDrawer
│   └── common/         # SearchOverlay
├── lib/
│   ├── data/           # Placeholder product & collection data
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Helpers (formatPrice, cn)
│   └── constants/      # Site config, navigation
└── stores/             # Zustand stores (cart, wishlist)
```

## Replacing Placeholder Data

All content lives in one place: **`src/lib/data/`**

| File | Purpose |
|------|---------|
| `products.ts` | Product catalog |
| `collections.ts` | Collection groupings |
| `index.ts` | Data helpers (queries) |
| `constants/index.ts` | Site name, navigation, footer |

Edit these files to swap in your real products, collections, and brand content —
no component changes needed.

### Replacing Images

Images currently use `https://picsum.photos/...` placeholder URLs. To use local
images:

1. Drop your images into `public/images/`
2. Update the `src` in `lib/data/products.ts` (or `collections.ts`) to e.g.
   `/images/my-product-front.jpg`

### Replacing Fonts

Fonts are configured in `src/app/layout.tsx` using `next/font/google`
(Playfair Display + Inter). Swap the imports there.

### Replacing Colors

Brand colors are defined as CSS variables in `src/app/globals.css`
(`--accent: #ef833c`, `--accent-secondary: #bb2329`, etc.).

## Environment / Site URL

Update `url`, `ogImage`, and metadata in:

- `src/lib/constants/index.ts` (site config)
- `src/app/layout.tsx` (metadata)
- `src/app/sitemap.ts` / `src/app/robots.ts` (SEO)

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Todo / Architecture Notes

- Checkout is currently stubbed (button disabled) — ready to connect to a
  payment provider.
- Account/auth is architecture-ready but not implemented.
- Product data is static; swap `lib/data` for an API/client when ready.
