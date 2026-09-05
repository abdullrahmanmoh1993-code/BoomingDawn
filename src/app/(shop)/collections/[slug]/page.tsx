import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getCollectionBySlug,
  getProductsByCollection,
  collections,
} from "@/lib/data";
import { siteConfig } from "@/lib/constants";
import { ProductGrid } from "@/components/product/product-grid";

export const dynamic = "force-static";

export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

function abs(url: string) {
  return `${siteConfig.url}${url}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return { title: "Collection" };
  }

  return {
    title: collection.name,
    description: collection.description?.slice(0, 155),
    alternates: {
      canonical: `/collections/${collection.slug}`,
    },
    openGraph: {
      type: "website",
      title: collection.name,
      description: collection.description?.slice(0, 155),
      images: collection.image
        ? [{ url: abs(collection.image.src), alt: collection.image.alt }]
        : undefined,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = getProductsByCollection(slug);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: collection.name,
    itemListElement: products.map((product, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: product.name,
      url: abs(`/products/${product.slug}`),
    })),
  };

  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Collection Hero */}
      <section className="relative py-24 lg:py-32 border-b border-border overflow-hidden">
        <Image
          src={collection.image.src}
          alt={collection.image.alt}
          fill
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-page text-white">
          <p className="text-accent text-xs uppercase tracking-[0.3em] mb-4">
            Collection
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium">
            {collection.name}
          </h1>
          <p className="mt-6 max-w-xl text-white/80 leading-relaxed">
            {collection.description}
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-page">
          <div className="flex items-center justify-between mb-12">
            <p className="text-sm text-muted">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} columns={3} />
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-xl">
                This collection is being curated.
              </p>
              <p className="text-muted text-sm mt-2">
                Check back soon for new pieces.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
