"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { collections } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export default function CollectionsPage() {
  return (
    <div className="pt-16 lg:pt-20">
      {/* Header */}
      <section className="py-16 lg:py-24 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
            The World of
          </p>
          <h1 className="font-display text-booming-red text-4xl sm:text-5xl lg:text-6xl">
            Collections
          </h1>
          <p className="mt-6 text-muted max-w-xl leading-relaxed">
            Curated groupings of our boldest work. Each collection tells a
            distinct story, explore them all.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden"
              >
                <Link href={`/collections/${collection.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={collection.image.src}
                      alt={collection.image.alt}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-end p-6">
                      <div>
                        <h2 className="text-white font-display text-2xl lg:text-3xl font-medium mb-2">
                          {collection.name}
                        </h2>
                        <p className="text-white/70 text-sm max-w-xs line-clamp-2">
                          {collection.description}
                        </p>
                        <span className="inline-flex items-center gap-2 text-white text-sm mt-4 border-b border-white/40 pb-1 group-hover:border-white transition-colors">
                          Discover
                          <ArrowRight
                            size={15}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
