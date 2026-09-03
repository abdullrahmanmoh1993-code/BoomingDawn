"use client";

import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The Booming Dawn is dark-mode only (pure black background), so the theme
 * toggle is a static dark indicator rather than a light/dark switch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      disabled
      className={cn("p-2 rounded-full cursor-default", className)}
      aria-label="Dark mode only"
      title="Dark mode"
    >
      <Moon size={18} />
    </button>
  );
}