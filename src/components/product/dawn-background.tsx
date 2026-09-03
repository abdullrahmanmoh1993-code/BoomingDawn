"use client";

import { motion } from "framer-motion";
import { getDawnStage } from "@/lib/data/dawn-stages";
import type { DawnStage } from "@/lib/types";

/**
 * Atmospheric dawn background for the product selection experience.
 * Renders the dawn-stage image behind the product with a smooth fade-in
 * and a readability overlay so product info stays legible on top.
 */
export function DawnBackground({ stage }: { stage: DawnStage }) {
  const config = getDawnStage(stage);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.img
        key={stage}
        src={config.background}
        alt=""
        width={config.bgWidth}
        height={config.bgHeight}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Readability overlay */}
      <div className={`absolute inset-0 ${config.overlay}`} />
    </div>
  );
}