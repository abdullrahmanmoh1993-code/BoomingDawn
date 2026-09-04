"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { Logo } from "@/components/brand/Logo";
import { SearchOverlay } from "@/components/common/search-overlay";

/** True only after the component hydrates on the client (false during SSR). */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const mounted = useHydrated();
  const cartCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const openCart = useCartStore((s) => s.openCart);

  // Only show persisted counts after hydration so SSR and first client
  // render stay identical (avoids a cart/wishlist badge hydration mismatch).
  const badgeCart = mounted ? cartCount : 0;
  const badgeWishlist = mounted ? wishlistCount : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen || searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, searchOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-surface/95 backdrop-blur-md border-b border-border"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[64px] lg:h-[64px] pt-[env(safe-area-inset-top,0px)] overflow-visible">
            {/* Left cluster: hamburger + logo on mobile, centered logo on desktop */}
            <div className="flex items-center gap-2 lg:absolute lg:left-1/2 lg:top-0 lg:-translate-x-1/2 lg:h-full lg:gap-0">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 -ml-2 min-w-11 min-h-11 flex items-center justify-center"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              {/* Logo */}
              <Link
                href="/"
                className="flex items-center"
                aria-label="The Booming Dawn - home"
              >
                <Logo
                  className="h-10 lg:h-full w-auto object-contain shrink-0"
                  width={53}
                  height={40}
                />
              </Link>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Main navigation">
              {siteConfig.navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-booming-orange text-sm tracking-wide hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 min-w-11 min-h-11 flex items-center justify-center hover:bg-foreground/5 transition-colors rounded-full"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <ThemeToggle className="hidden sm:flex min-w-11 min-h-11 items-center justify-center" />
              <Link
                href="/wishlist"
                className="p-2 min-w-11 min-h-11 flex items-center justify-center hover:bg-foreground/5 transition-colors rounded-full relative"
                aria-label={`Wishlist (${badgeWishlist} items)`}
              >
                <Heart size={18} />
                {badgeWishlist > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 bg-accent text-white text-[10px] font-medium flex items-center justify-center rounded-full">
                    {badgeWishlist}
                  </span>
                )}
              </Link>
              <button
                onClick={openCart}
                className="p-2 min-w-11 min-h-11 flex items-center justify-center hover:bg-foreground/5 transition-colors rounded-full relative"
                aria-label={`Shopping bag (${badgeCart} items)`}
              >
                <ShoppingBag size={18} />
                {badgeCart > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 bg-accent text-white text-[10px] font-medium flex items-center justify-center rounded-full">
                    {badgeCart}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
