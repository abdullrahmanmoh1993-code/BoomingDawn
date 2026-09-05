import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/lib/data";
import { siteConfig } from "@/lib/constants";
import { ProductDetailView } from "@/components/product/product-detail-view";

export const dynamic = "force-static";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
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
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product" };
  }

  const firstImage = product.images?.[0];

  return {
    title: product.name,
    description: product.description?.slice(0, 155),
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description?.slice(0, 155),
      images: firstImage
        ? [{ url: abs(firstImage.src), alt: firstImage.alt || product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description?.slice(0, 155),
      images: firstImage ? [abs(firstImage.src)] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const firstImage = product.images?.[0];
  const anyInStock = product.variants.some((v) => v.inStock);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: firstImage ? abs(firstImage.src) : undefined,
    brand: {
      "@type": "Brand",
      name: "The Booming Dawn",
    },
    offers: {
      "@type": "Offer",
      url: abs(`/products/${product.slug}`),
      priceCurrency: product.currency,
      price: product.price,
      availability: anyInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Shop",
        item: abs("/products"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.name,
        item: abs(`/products/${product.slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
