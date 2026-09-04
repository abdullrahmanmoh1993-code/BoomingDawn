"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { useWishlistStore } from "@/stores/wishlist-store";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isInWishlist(product.id));
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted/10">
          <Image
            src={product.images[0]?.src}
            alt={product.images[0]?.alt}
            fill
            quality={90}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.images[1] && (
            <Image
              src={product.images[1].src}
              alt={product.images[1].alt}
              fill
              quality={90}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="bg-foreground text-background text-[10px] uppercase tracking-widest px-2.5 py-1">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="bg-accent-secondary text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
                Sale
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-booming-red text-sm group-hover:text-accent transition-colors">
                {product.name}
              </h3>
              {product.arabicName && (
                <p
                  className="text-booming-orange text-xs mt-0.5"
                  dir="rtl"
                  lang="ar"
                  style={{ fontFamily: "'beirut', 'Cairo', sans-serif", fontWeight: 700 }}
                >
                  {product.arabicName}
                </p>
              )}
              {product.subtitle && (
                <p className="text-xs text-muted mt-0.5 tracking-wide uppercase">
                  {product.subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-medium">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist heart — a sibling of the product link so the card never
          nests a button inside an anchor (invalid interactive markup). */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className={cn(
          "absolute top-3 right-3 z-10 p-1.5 min-w-11 min-h-11 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center transition-colors",
          isWishlisted
            ? "text-accent-secondary"
            : "text-foreground hover:text-accent"
        )}
        aria-label={
          isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
        }
      >
        <Heart
          size={17}
          fill={isWishlisted ? "currentColor" : "none"}
        />
      </button>
    </motion.article>
  );
}
