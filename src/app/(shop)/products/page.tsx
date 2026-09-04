import Image from "next/image";
import { products } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata = {
  title: "All Products",
  description:
    "Browse the complete The Booming Dawn collection, bold fashion for bold souls.",
};

export default function ProductsPage() {
  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      {/* Header image */}
      <section className="relative py-24 lg:py-32 border-b border-border overflow-hidden">
        <Image
          src="/images/editorial/pre-dawn-sky-panorama.jpg"
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
            The Complete
          </p>
          <h1 className="font-display text-booming-red text-4xl sm:text-5xl lg:text-6xl">
            Product Line
          </h1>
          <p className="mt-6 text-muted max-w-xl leading-relaxed">
            Every piece, all in one place. Bold silhouettes and refined
            finishes, made to stand out.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <p className="text-sm text-muted">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
          <ProductGrid products={products} columns={3} />
        </div>
      </section>
    </div>
  );
}
