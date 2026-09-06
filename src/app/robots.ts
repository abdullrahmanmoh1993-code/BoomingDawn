import { siteConfig } from "@/lib/constants";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/wishlist", "/checkout", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
