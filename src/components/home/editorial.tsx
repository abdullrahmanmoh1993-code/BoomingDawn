"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Editorial() {
  return (
    <section className="py-20 lg:py-28 overflow-x-clip">
      <div className="max-w-[1440px] mx-auto px-page grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden"
        >
          <div className="relative aspect-[4/5]">
            <Image
              src="/images/editorial/warehouse.jpg"
              alt="The Booming Dawn editorial campaign"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -right-6 -bottom-6 w-48 lg:w-64 overflow-hidden hidden sm:block">
            <div className="relative aspect-square">
              <Image
                src="/images/editorial/brutalist.jpg"
                alt=""
                fill
                sizes="256px"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4">
            Wear Your Attitude
          </p>
          <h2 className="font-display text-booming-red text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            Soft cotton,
            <br />
            <span className="italic text-booming-orange">loud</span> graphics
          </h2>
          <div className="space-y-4 text-muted leading-relaxed max-w-lg">
            <p>
              The Booming Dawn is a Cairo-born streetwear label for the
              fearless. Three stages, the calm, the wonder, the build. Three
              statement tees cut from heavyweight cotton and finished to a
              standard we refuse to compromise on.
            </p>
            <p>
              Every piece is true to size, breathable, and designed to wear
              your attitude on your chest, from the first sketch to the final
              stitch.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 mt-8 text-sm font-medium border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
          >
            Read Our Story
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
