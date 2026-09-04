"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/lib/types";

interface VariantSelectorProps {
  variants: ProductVariant[];
  defaultVariantId?: string;
  onChange?: (variantId: string) => void;
}

export function VariantSelector({
  variants,
  defaultVariantId,
  onChange,
}: VariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariantId || variants.find((v) => v.inStock)?.id || variants[0]?.id || ""
  );

  const selectVariant = (id: string) => {
    setSelectedVariantId(id);
    onChange?.(id);
  };

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const [activeColor, setActiveColor] = useState(selectedVariant?.color || "");

  const colors = Array.from(
    new Map(
      variants
        .filter((v) => v.color)
        .map((v) => [v.color, { name: v.color as string, hex: v.colorHex }])
    ).values()
  );

  const sizes = Array.from(
    new Set(
      variants
        .filter((v) => !activeColor || v.color === activeColor)
        .map((v) => v.size)
        .filter(Boolean)
    )
  );

  const handleColorChange = (color: string) => {
    setActiveColor(color);
    const matching = variants.find(
      (v) =>
        v.color === color &&
        (!selectedVariant?.size || v.size === selectedVariant.size) &&
        v.inStock
    );
    if (matching) selectVariant(matching.id);
  };

  const handleSizeChange = (size: string) => {
    const matching = variants.find(
      (v) =>
        v.size === size &&
        (!activeColor || v.color === activeColor) &&
        v.inStock
    );
    if (matching) selectVariant(matching.id);
  };

  return (
    <div className="space-y-6">
      {colors.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted">Color</span>
            <span className="text-xs font-medium">
              {activeColor || "Select"}
            </span>
          </div>
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color.name)}
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center transition-colors",
                  activeColor === color.name
                    ? "scale-100"
                    : "hover:bg-foreground/5"
                )}
                aria-label={`Color: ${color.name}`}
                aria-pressed={activeColor === color.name}
              >
                <span
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-transform",
                    activeColor === color.name
                      ? "border-foreground scale-110"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-widest text-muted">Size</span>
            <span className="text-xs font-medium">
              {selectedVariant?.size || "Select"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.length > 1
              ? sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size!)}
                    className={cn(
                      "h-11 px-4 text-sm border transition-all",
                      selectedVariant?.size === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/60"
                    )}
                    aria-pressed={selectedVariant?.size === size}
                  >
                    {size}
                  </button>
                ))
              : sizes.map((size) => {
                  const hasStock = variants.some(
                    (v) => v.size === size && v.inStock
                  );
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size!)}
                      disabled={!hasStock}
                      className={cn(
                        "h-11 px-4 text-sm border transition-all",
                        selectedVariant?.size === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/60",
                        !hasStock && "opacity-40 line-through cursor-not-allowed"
                      )}
                      aria-pressed={selectedVariant?.size === size}
                    >
                      {size}
                    </button>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}
