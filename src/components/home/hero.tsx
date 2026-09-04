"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const DESKTOP_VIDEO = "/images/brand/hero-video.mp4";
const MOBILE_VIDEO = "/images/brand/hero-video-mobile.mp4";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Resolve the correct video file only after hydration so mobile never
  // downloads the heavy desktop file (and SSR never ships a <source> at all).
  useEffect(() => {
    if (prefersReducedMotion) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const pick = (matches: boolean) => setVideoSrc(matches ? MOBILE_VIDEO : DESKTOP_VIDEO);
    pick(mq.matches);
    const onChange = (e: MediaQueryListEvent) => pick(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [prefersReducedMotion]);

  // Play once the source is resolved (replaces autoPlay so the browser never
  // starts two downloads).
  useEffect(() => {
    if (prefersReducedMotion || !videoSrc) return;
    const video = videoRef.current;
    if (!video) return;
    video.src = videoSrc;
    video.load();
    video.play().catch(() => {});
  }, [videoSrc, prefersReducedMotion]);

  return (
    <section className="video-hero relative w-full flex items-center justify-center overflow-hidden bg-background">
      {/* CSS-only dawn surface: the site's real first-paint background. Painted
          from markup with zero network/hydration dependency so the header never
          floats over a blank surface while the video is still loading. The
          <video>'s poster and frames cover it once they arrive. */}
      <div className="dawn-surface absolute inset-0" aria-hidden="true" />
      {/* Full-screen background video with poster fallback */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/brand/hero-poster.png"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.5rem))]">
        <motion.h1
          initial={{ y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-booming-red font-display text-4xl sm:text-6xl lg:text-7xl font-medium leading-tight tracking-tight"
        >
          A New Dawn,
          <br />
          A New Beginning
        </motion.h1>

        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button variant="primary" size="lg" href="/products" className="w-full sm:w-auto">
            Shop the Collection
          </Button>
          <Button variant="outline" size="lg" href="/about" className="w-full sm:w-auto">
            View the Story
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-[max(2rem,calc(env(safe-area-inset-bottom,0px)_+_1rem))] left-1/2 -translate-x-1/2"
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