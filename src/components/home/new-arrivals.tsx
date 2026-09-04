import Link from "next/link";
import { getNewProducts } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";
import { ArrowRight } from "lucide-react";

export function NewArrivals() {
  const newProducts = getNewProducts();

  if (newProducts.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-[1440px] mx-auto px-page">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
              Just Arrived
            </p>
            <h2 className="font-display text-booming-red text-3xl sm:text-4xl lg:text-5xl">
              New Season
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-sm hover:text-accent transition-colors group"
          >
            View all
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={newProducts} />
      </div>
    </section>
  );
}
