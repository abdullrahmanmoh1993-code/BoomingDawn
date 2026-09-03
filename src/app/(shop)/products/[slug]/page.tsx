import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import { ProductDetailView } from "@/components/product/product-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return {
    title: product?.name || "Product",
    description: product?.description?.slice(0, 155) || "Premium fashion from The Booming Dawn.",
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

  return <ProductDetailView product={product} />;
}
