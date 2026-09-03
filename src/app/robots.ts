import { siteConfig } from "@/lib/constants";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/wishlist"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
