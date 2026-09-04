"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/data/checkout";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const getProduct = (id: string) => products.find((p) => p.id === id);
  const getVariant = (productId: string, variantId: string) =>
    getProduct(productId)?.variants.find((v) => v.id === variantId);

  const subtotal = items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  const qualifiesForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;

  if (items.length === 0) {
    return (
      <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
        <div className="max-w-2xl mx-auto px-4 py-24 lg:py-32 text-center">
          <h1 className="font-display text-booming-red text-3xl sm:text-4xl mb-4">
            Your Bag is Empty
          </h1>
          <p className="text-muted mb-8">
            Looks like you haven&apos;t added anything yet. Let&apos;s change that.
          </p>
          <Button size="lg" href="/products">
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <div className="max-w-[1200px] mx-auto px-page py-12 lg:py-16">
        <h1 className="font-display text-booming-red text-3xl sm:text-4xl mb-10">
          Shopping Bag
        </h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const product = getProduct(item.productId);
              const variant = getVariant(item.productId, item.variantId);
              if (!product) return null;

              return (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="flex gap-4 pb-6 border-b border-border"
                >
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative shrink-0 w-24 h-32 bg-muted/10 overflow-hidden"
                  >
                    <Image
                      src={product.images[0]?.src}
                      alt={product.images[0]?.alt}
                      fill
                      sizes="96px"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between gap-3">
                      <div>
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-medium hover:text-accent transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-muted mt-1">
                          {variant?.color && <span>{variant.color} · </span>}
                          {variant?.size && <span>Size {variant.size}</span>}
                        </p>
                        <p className="text-sm mt-2 font-medium">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        className="text-muted hover:text-accent-secondary transition-colors min-w-11 min-h-11 flex items-center justify-center p-1 h-fit"
                        aria-label={`Remove ${product.name} from bag`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-auto pt-3">
                      <div className="flex items-center border border-border w-fit">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1
                            )
                          }
                          className="min-w-11 min-h-11 flex items-center justify-center p-2 hover:bg-foreground/5 transition-colors"
                          aria-label={`Decrease quantity of ${product.name}`}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1
                            )
                          }
                          className="min-w-11 min-h-11 flex items-center justify-center p-2 hover:bg-foreground/5 transition-colors"
                          aria-label={`Increase quantity of ${product.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-lg font-medium mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery</span>
                  <span className="text-muted">Calculated at checkout</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="font-display text-base">Total</span>
                  <span className="font-display text-base">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {qualifiesForFreeDelivery && (
                  <p className="text-xs text-accent">
                    Your subtotal qualifies for free delivery.
                  </p>
                )}
              </div>

              <Button href="/checkout" className="w-full mt-6" size="lg">
                Proceed to Checkout
              </Button>
              <p className="text-xs text-muted text-center mt-3">
                Delivery fee and any promo code are applied at checkout. Cash on
                Delivery and InstaPay available.
              </p>

              <Link
                href="/products"
                className="block text-center text-sm underline underline-offset-4 hover:text-accent transition-colors mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
