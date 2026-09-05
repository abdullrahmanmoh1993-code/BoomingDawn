import type { SiteConfig } from "@/lib/types";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://booming-dawn.abdullrahman-moh1993.workers.dev";

export const siteConfig: SiteConfig = {
  name: "The Booming Dawn",
  tagline: "Wear your attitude on your chest.",
  description:
    "Streetwear for the fearless. Soft cotton, loud graphics, statement tees designed in Cairo, Egypt.",
  url: siteUrl,
  ogImage: "/images/brand/og-image.png",
  navigation: [
    { label: "The Collection", href: "/collections/the-3-stages-of-dawn" },
    { label: "Shop", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footer: [
    {
      title: "Shop",
      links: [
        { label: "The 3 Stages of Dawn", href: "/collections/the-3-stages-of-dawn" },
        { label: "All Tees", href: "/products" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Size Guide", href: "/size-guide" },
        { label: "Shipping & Returns", href: "/shipping" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Instagram", href: "https://www.instagram.com/theboomingdawn" },
        { label: "TikTok", href: "https://www.tiktok.com/@theboomingdawn" },
      ],
    },
  ],
};