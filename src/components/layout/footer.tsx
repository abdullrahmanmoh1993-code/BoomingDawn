import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { SizeGuide } from "@/components/product/size-guide";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-display text-booming-red text-xl tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted max-w-xs leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Footer Links */}
          {siteConfig.footer.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium tracking-wide mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.href === "/size-guide" ? (
                      <SizeGuide className="text-sm text-muted hover:text-foreground transition-colors" />
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)_+_1.5rem))] sm:pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)_+_1rem))] border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-muted hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-muted hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
