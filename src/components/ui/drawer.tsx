"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: "left" | "right";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  side = "right",
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    if (isOpen) {
      previouslyFocused.current =
        document.activeElement as HTMLElement | null;
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTab);
      document.body.style.overflow = "hidden";
      const focusTarget =
        drawerRef.current?.querySelector<HTMLElement>('[aria-label="Close"]') ||
        drawerRef.current;
      focusTarget?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: side === "right" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 bottom-0 z-50 w-full max-w-md bg-surface flex flex-col",
              side === "right" ? "right-0" : "left-0",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              {title && (
                <h2 className="text-lg font-display font-medium">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-foreground/5 transition-colors ml-auto"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
