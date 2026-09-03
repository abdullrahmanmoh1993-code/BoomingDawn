import type { SiteConfig } from "@/lib/types";

export const siteConfig: SiteConfig = {
  name: "The Booming Dawn",
  tagline: "Wear your attitude on your chest.",
  description:
    "Streetwear for the fearless. Soft cotton, loud graphics, statement tees designed in Cairo, Egypt.",
  url: "https://www.theboomingdawn.com",
  ogImage: "/images/editorial/fashion.jpg",
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