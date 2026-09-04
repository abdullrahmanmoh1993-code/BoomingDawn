"use client";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { useCartStore } from "@/stores/cart-store";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const getProduct = (id: string) => products.find((p) => p.id === id);
  const getVariant = (productId: string, variantId: string) =>
    getProduct(productId)?.variants.find((v) => v.id === variantId);

  const subtotal = items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      title="Shopping Bag"
      side="right"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
          <p className="font-display text-xl">Your bag is empty</p>
          <p className="text-sm text-muted max-w-xs">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Button variant="outline" onClick={closeCart}>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const product = getProduct(item.productId);
            const variant = getVariant(item.productId, item.variantId);
            if (!product) return null;

            return (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={closeCart}
                  className="relative shrink-0 w-20 h-24 bg-muted/10 overflow-hidden"
                >
                  <Image
                    src={product.images[0]?.src}
                    alt={product.images[0]?.alt}
                    fill
                    sizes="80px"
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium hover:text-accent transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted mt-1">
                        {variant?.color && <span>{variant.color} · </span>}
                        {variant?.size && <span>Size {variant.size}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-muted hover:text-accent-secondary transition-colors shrink-0 p-1"
                      aria-label={`Remove ${product.name} from bag`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex items-center border border-border">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity - 1)
                        }
                        className="p-1.5 hover:bg-foreground/5 transition-colors"
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity + 1)
                        }
                        className="p-1.5 hover:bg-foreground/5 transition-colors"
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-medium">
                      {formatPrice(product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="border-t border-border pt-6 mt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted">Shipping</span>
              <span className="text-sm">Calculated at checkout</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-border">
              <span className="font-display text-lg">Total</span>
              <span className="font-display text-lg">{formatPrice(subtotal)}</span>
            </div>
            <Button className="w-full" size="lg">
              <Link href="/checkout" onClick={closeCart}>
                Proceed to Checkout
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={closeCart}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
