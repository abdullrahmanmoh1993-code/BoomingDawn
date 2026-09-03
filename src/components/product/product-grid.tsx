import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  return (
    <div
      className={[
        "grid gap-x-6 gap-y-8",
        columns === 2
          ? "grid-cols-2"
          : columns === 4
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : "grid-cols-2 md:grid-cols-3",
      ].join(" ")}
    >
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
