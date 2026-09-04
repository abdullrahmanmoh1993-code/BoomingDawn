"use client";

import { useWishlistStore } from "@/stores/wishlist-store";
import { products } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";

export default function WishlistPage() {
  const productIds = useWishlistStore((s) => s.productIds);
  const wishlistProducts = products.filter((p) => productIds.includes(p.id));

  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <div className="max-w-[1440px] mx-auto px-page py-12 lg:py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
            Saved For Later
          </p>
          <h1 className="font-display text-booming-red text-3xl sm:text-4xl">
            Your Wishlist
          </h1>
        </div>

        {wishlistProducts.length > 0 ? (
          <ProductGrid products={wishlistProducts} columns={3} />
        ) : (
          <div className="text-center py-16 lg:py-24">
            <p className="font-display text-2xl mb-4">
              Your wishlist is empty
            </p>
            <p className="text-muted mb-8">
              Save pieces you love and come back to them anytime.
            </p>
            <Button size="lg" href="/products">
              Explore Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
