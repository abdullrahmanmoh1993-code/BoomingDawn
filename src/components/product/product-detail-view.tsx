"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Heart } from "lucide-react";
import { getRelatedProducts } from "@/lib/data";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { SizeGuide } from "@/components/product/size-guide";
import { Button } from "@/components/ui/button";
import { TrustSignals } from "@/components/product/trust-signals";
import { ProductGrid } from "@/components/product/product-grid";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { DawnBackground } from "@/components/product/dawn-background";
import { getDawnStage } from "@/lib/data/dawn-stages";
import type { Product } from "@/lib/types";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((v) => v.inStock)?.id || product.variants[0]?.id || ""
  );

  const selectedVariant = product.variants.find(
    (v) => v.id === selectedVariantId
  );

  const wishlisted = wishlistIds.includes(product.id);
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const relatedProducts = getRelatedProducts(product);

  const dawn = getDawnStage(product.dawnStage);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product.id, selectedVariant.id);
      openCart();
    }
  };

  return (
    <div className="relative pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      {/* Dawn stage atmosphere */}
      <DawnBackground stage={product.dawnStage} />
      <div className="max-w-[1440px] mx-auto px-page">
        {/* Breadcrumbs */}
        <nav
          className="py-6 flex items-center gap-1.5 text-xs text-muted"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 pb-20">
          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Details */}
          <div className="lg:pt-2">
            <div>
              {/* Dawn stage accent */}
              <motion.p
                initial={{ y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-booming-orange text-xs uppercase tracking-[0.3em] mb-3"
              >
                {dawn.label}
                <span className="text-muted ml-2 normal-case tracking-normal">
                  · {dawn.mood}
                </span>
              </motion.p>
              {product.isNew && (
                <span className="inline-block bg-foreground text-background text-[10px] uppercase tracking-widest px-2.5 py-1 mb-4">
                  New Arrival
                </span>
              )}
              <h1 className="font-display text-booming-red text-3xl sm:text-4xl">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="text-sm text-muted mt-2 uppercase tracking-wider">
                  {product.subtitle}
                </p>
              )}
              <p
                className="text-booming-orange mt-1"
                dir="rtl"
                lang="ar"
                style={{ fontFamily: "'beirut', 'Cairo', sans-serif", fontWeight: 700 }}
              >
                {product.arabicName}
              </p>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-center gap-3">
              <span className="font-display text-2xl">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-muted line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                  <span className="bg-accent-secondary text-white text-xs px-2 py-0.5">
                    Save {formatPrice(product.compareAtPrice! - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="mt-6 text-muted leading-relaxed">
              {product.description}
            </p>

            {/* Variants */}
            <div className="mt-8">
              <VariantSelector
                variants={product.variants}
                defaultVariantId={selectedVariantId}
                onChange={setSelectedVariantId}
              />
            </div>

            {/* Size guide */}
            <div className="mt-6">
              <SizeGuide />
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <div className="flex gap-3">
                <Button
                  className="flex-1 h-13"
                  size="lg"
                  onClick={handleAddToCart}
                >
                  Add to Bag
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={
                    wishlisted
                      ? `Remove ${product.name} from wishlist`
                      : `Add ${product.name} to wishlist`
                  }
                >
                  <Heart
                    size={18}
                    className={cn(wishlisted && "text-accent-secondary")}
                    fill={wishlisted ? "currentColor" : "none"}
                  />
                </Button>
              </div>
              <Button variant="ghost" className="w-full" size="lg" href="/cart">
                Buy Now
              </Button>
            </div>

            {/* Trust signals */}
            <div className="mt-10 pt-8 border-t border-border">
              <TrustSignals />
            </div>
          </div>
        </div>

        {/* Details section */}
        <section className="py-16 border-t border-border">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h2 className="font-display text-lg mb-4">Details</h2>
              <ul className="space-y-2">
                {product.details.map((detail, i) => (
                  <li key={i} className="text-sm text-muted flex gap-2">
                    <span className="text-foreground">·</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-lg mb-4">Materials</h2>
              <p className="text-sm text-muted leading-relaxed">
                {product.materials}
              </p>
            </div>
            <div>
              <h2 className="font-display text-lg mb-4">Care</h2>
              <ul className="space-y-2">
                {product.care.map((item, i) => (
                  <li key={i} className="text-sm text-muted flex gap-2">
                    <span className="text-foreground">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="py-16 border-t border-border">
            <h2 className="font-display text-2xl sm:text-3xl font-medium mb-10 text-center">
              Complete the Look
            </h2>
            <ProductGrid products={relatedProducts} columns={3} />
          </section>
        )}
      </div>
    </div>
  );
}
