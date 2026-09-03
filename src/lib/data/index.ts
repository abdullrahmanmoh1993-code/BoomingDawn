import { products } from "./products";
import { collections } from "./collections";

export { products, collections };

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCollectionBySlug(slug: string) {
  return collections.find((c) => c.slug === slug);
}

export function getProductsByCollection(collectionSlug: string) {
  const collection = getCollectionBySlug(collectionSlug);
  if (!collection) return [];
  return products.filter((p) => collection.productIds.includes(p.id));
}

export function getFeaturedProducts() {
  return products.filter((p) => p.isFeatured);
}

export function getNewProducts() {
  return products.filter((p) => p.isNew);
}

export function searchProducts(query: string) {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
}

export function getRelatedProducts(product: { id: string; tags: string[] }) {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.tags.some((t) => product.tags.includes(t))
    )
    .slice(0, 3);
}

export function getAllSizes() {
  const sizes = new Set<string>();
  products.forEach((p) =>
    p.variants.forEach((v) => {
      if (v.size) sizes.add(v.size);
    })
  );
  return Array.from(sizes).sort();
}

export function getAllColors() {
  const colors = new Map<string, string>();
  products.forEach((p) =>
    p.variants.forEach((v) => {
      if (v.color && v.colorHex) colors.set(v.color, v.colorHex);
    })
  );
  return Array.from(colors.entries()).map(([name, hex]) => ({ name, hex }));
}
