"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { products } from "@/lib/data";
import type { CheckoutLineItem } from "@/lib/types";
import type { Totals } from "@/lib/checkout/orders";

interface OrderSummaryProps {
  items: CheckoutLineItem[];
  totals: Totals;
  promoLabel?: string;
  className?: string;
}

function resolveItem(
  item: CheckoutLineItem
):
  | { name: string; image: string; unitPrice: number; size?: string; color?: string }
  | null {
  const product = products.find((p) => p.id === item.productId);
  if (!product) return null;
  const variant = product.variants.find((v) => v.id === item.variantId);
  return {
    name: product.name,
    image: product.images[0]?.src ?? "",
    unitPrice: product.price,
    size: variant?.size,
    color: variant?.color,
  };
}

export function OrderSummary({
  items,
  totals,
  promoLabel,
  className,
}: OrderSummaryProps) {
  const [open, setOpen] = useState(false);

  const content = (
    <div className="border border-border p-6">
      <h2 className="font-display text-lg mb-5">Order Summary</h2>

      <ul className="space-y-4 max-h-[40dvh] overflow-y-auto pr-1 -mr-1">
        {items.map((item) => {
          const resolved = resolveItem(item);
          if (!resolved) return null;
          return (
            <li key={`${item.productId}-${item.variantId}`} className="flex gap-3">
              <div className="relative shrink-0 w-14 h-[70px] bg-muted/10 overflow-hidden">
                <Image
                  src={resolved.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{resolved.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {resolved.color && <span>{resolved.color} · </span>}
                  {resolved.size && <span>Size {resolved.size}</span>}
                </p>
                <p className="text-xs text-muted mt-0.5">Qty {item.quantity}</p>
              </div>
              <span className="shrink-0 text-sm">
                {formatPrice(resolved.unitPrice * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-border mt-6 pt-5 space-y-3 text-sm">
        <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
        <Row
          label="Delivery"
          value={
            totals.deliveryFee === 0
              ? "Free"
              : formatPrice(totals.deliveryFee)
          }
        />
        {totals.codFee > 0 && (
          <Row label="COD Fee" value={formatPrice(totals.codFee)} />
        )}
        {totals.discount > 0 && (
          <Row
            label={promoLabel ? `Discount (${promoLabel})` : "Discount"}
            value={`-${formatPrice(totals.discount)}`}
            className="text-accent"
          />
        )}
        {totals.tax > 0 && <Row label="Tax" value={formatPrice(totals.tax)} />}
      </div>

      <div className="border-t border-border mt-5 pt-4 flex justify-between items-center">
        <span className="font-display text-lg">Total</span>
        <span className="font-display text-lg text-booming-orange">
          {formatPrice(totals.total)}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full border border-border p-4 flex items-center justify-between"
          aria-expanded={open}
        >
          <span className="font-medium">Order Summary</span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className="text-booming-orange font-display">
              {formatPrice(totals.total)}
            </span>
            <ChevronDown
              size={16}
              className={cn("transition-transform", open && "rotate-180")}
            />
          </span>
        </button>
        {open && <div className="mt-3">{content}</div>}
      </div>

      {/* Desktop: static + sticky */}
      <div className={cn("hidden lg:block", className)}>{content}</div>
    </>
  );
}

function Row({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={className}>{value}</span>
    </div>
  );
}