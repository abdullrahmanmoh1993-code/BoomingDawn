import { siteConfig } from "@/lib/constants";
import { products, collections } from "@/lib/data";

export default function sitemap() {
  const baseUrl = siteConfig.url;
  const now = new Date();

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const collectionRoutes = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: now.toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now.toISOString(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: now.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...collectionRoutes,
    ...productRoutes,
    {
      url: `${baseUrl}/about`,
      lastModified: now.toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now.toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];
}
