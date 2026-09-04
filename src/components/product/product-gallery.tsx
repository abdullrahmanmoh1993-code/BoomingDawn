"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductGalleryProps {
  images: Product["images"];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-3 w-16 sm:w-20">
        {images.map((image, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative aspect-[4/5] overflow-hidden border transition-colors",
              activeIndex === i
                ? "border-foreground"
                : "border-transparent hover:border-border"
            )}
            aria-label={`View image ${i + 1} of ${productName}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={90}
              sizes="80px"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "aspect-[4/5] overflow-hidden bg-muted/10 relative",
              isZoomed && "cursor-zoom-out"
            )}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <Image
              src={images[activeIndex]?.src}
              alt={images[activeIndex]?.alt}
              fill
              quality={100}
              sizes="(max-width: 768px) 100vw, 60vw"
              className={cn(
                "w-full h-full object-cover transition-transform duration-500",
                isZoomed && "scale-125 cursor-zoom-out"
              )}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
