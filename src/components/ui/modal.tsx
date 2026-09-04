"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={(e) => {
            if (e.target === overlayRef.current) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "relative w-full max-w-lg bg-surface modal-panel overflow-y-auto",
              className
            )}
          >
            <div className="flex items-center justify-between px-6 pt-[max(1.5rem,calc(env(safe-area-inset-top,0px)_+_0.75rem))] pb-6 border-b border-border">
              {title && (
                <h2 className="text-lg font-display font-medium">{title}</h2>
              )}
              <button
                onClick={onClose}
                className="p-2 min-w-11 min-h-11 flex items-center justify-center hover:bg-foreground/5 transition-colors ml-auto"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)_+_1.5rem))]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
