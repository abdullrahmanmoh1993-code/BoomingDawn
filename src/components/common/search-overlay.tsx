"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { searchProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/98 backdrop-blur-sm"
        >
          <SearchContent onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchContent({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    return searchProducts(query).slice(0, 5);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-[max(5rem,calc(env(safe-area-inset-top,0px)_+_2.5rem))]">
      {/* Search Input */}
      <div className="relative">
        <Search size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products..."
          className="w-full pl-8 pr-12 py-4 bg-transparent border-b-2 border-border focus:border-foreground outline-none text-lg font-display transition-colors"
          aria-label="Search products"
        />
        <button
          onClick={onClose}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 min-w-11 min-h-11 flex items-center justify-center hover:bg-foreground/5 transition-colors"
          aria-label="Close search"
        >
          <X size={20} />
        </button>
      </div>

      {/* Results */}
      {query.length >= 2 && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-6"
        >
          {results.length > 0 ? (
            <ul className="space-y-4">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 -mx-3 hover:bg-foreground/5 transition-colors group"
                  >
                    <div className="relative w-16 h-20 bg-muted/20 flex-shrink-0 overflow-hidden">
                      <Image
                        src={product.images[0]?.src}
                        alt={product.images[0]?.alt}
                        fill
                        sizes="64px"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                        {product.name}
                      </p>
                      <p className="text-sm text-muted mt-0.5">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-muted group-hover:text-accent transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted py-8">
              No products found for &ldquo;{query}&rdquo;
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
