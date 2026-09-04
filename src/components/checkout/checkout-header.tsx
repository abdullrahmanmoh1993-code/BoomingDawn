import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ShieldCheck } from "lucide-react";

/** Minimal, distraction-free checkout header — no full site navigation. */
export function CheckoutHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Return to home"
          >
            <Logo className="h-11 w-auto" width={59} height={44} />
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted">
              <ShieldCheck size={14} aria-hidden="true" />
              Secure Checkout
            </span>
            <span className="text-border">|</span>
            <Link
              href="/contact"
              className="hover:text-accent transition-colors text-muted"
            >
              Need help? Contact us
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}