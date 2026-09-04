"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchProducts } from "@/lib/data";
import { ProductGrid } from "@/components/product/product-grid";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-muted border-t-accent rounded-full animate-spin" />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const results = query.length >= 2 ? searchProducts(query) : [];

  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
            Search Results
          </p>
          <h1 className="font-display text-booming-red text-3xl sm:text-4xl">
            {query ? (
              <>
                Results for <span className="italic">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Start Searching"
            )}
          </h1>
          {query.length >= 2 && (
            <p className="text-muted mt-3 text-sm">
              {results.length}{" "}
              {results.length === 1 ? "result" : "results"} found
            </p>
          )}
        </div>

        {query.length < 2 ? (
          <div className="text-center py-16 text-muted">
            <p className="font-display text-xl mb-2">Search our collection</p>
            <p className="text-sm">
              Type at least 2 characters to find what you&apos;re looking for.
            </p>
          </div>
        ) : results.length > 0 ? (
          <ProductGrid products={results} columns={3} />
        ) : (
          <div className="text-center py-16">
            <p className="font-display text-xl mb-2">
              No results for &ldquo;{query}&rdquo;
            </p>
            <p className="text-muted text-sm">
              Try a different keyword or{" "}
              <Link href="/products" className="underline hover:text-accent">
                browse all products
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
