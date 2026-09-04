"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="video-hero relative w-full h-screen flex items-center justify-center overflow-hidden bg-foreground">
      {/* Full-screen background video with poster fallback */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay={!prefersReducedMotion}
        muted
        loop
        playsInline
        poster="/images/brand/hero-poster.png"
        aria-hidden="true"
      >
        <source src="/images/brand/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto pt-16">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-booming-red font-display text-4xl sm:text-6xl lg:text-7xl font-medium leading-tight tracking-tight"
        >
          A New Dawn,
          <br />
          A New Beginning
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="primary" size="lg" className="w-full sm:w-auto">
            <Link href="/products">Shop the Collection</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/about">View the Story</Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Subtle bottom border above the transition fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-white/20"
        style={{ zIndex: 5 }}
      />
      {/* Fade into the first dawn stage */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
        style={{
          zIndex: 4,
          background:
            "linear-gradient(to bottom, transparent, #0a0f1a)",
        }}
      />
    </section>
  );
}