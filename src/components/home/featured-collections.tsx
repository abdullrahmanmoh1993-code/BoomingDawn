"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { collections } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export function FeaturedCollections() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
              Explore
            </p>
            <h2 className="font-display text-booming-red text-3xl sm:text-4xl lg:text-5xl">
              Featured Collections
            </h2>
          </div>
          <Link
            href="/collections"
            className="hidden sm:flex items-center gap-2 text-sm hover:text-accent transition-colors group"
          >
            View all
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, i) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden"
            >
              <Link href={`/collections/${collection.slug}`} className="block">
                <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden">
                  <Image
                    src={collection.image.src}
                    alt={collection.image.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-end p-6 lg:p-8">
                    <div>
                      <h3 className="text-white font-display text-2xl lg:text-3xl font-medium mb-2">
                        {collection.name}
                      </h3>
                      <p className="text-white/70 text-sm max-w-xs leading-relaxed line-clamp-2">
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
  );
}
