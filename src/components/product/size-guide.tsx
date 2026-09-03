"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface SizeRow {
  size: string;
  chest: number;
  length: number;
  shoulder: number;
}

/* Add S, XXL, etc. here to grow the chart (all values in CM). */
const sizes: SizeRow[] = [
  { size: "M", chest: 58, length: 70, shoulder: 42 },
  { size: "L", chest: 62, length: 70, shoulder: 44 },
  { size: "XL", chest: 66, length: 70, shoulder: 46 },
];

const headers: { label: string; ar: string }[] = [
  { label: "SIZE", ar: "" },
  { label: "CHEST", ar: "الصدر" },
  { label: "LENGTH", ar: "الطول" },
  { label: "SHOULDER", ar: "الكتف" },
];

export function TheBoomingChart({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ??
          "text-sm underline underline-offset-4 hover:text-accent transition-colors"
        }
      >
        Size Guide
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="text-center">
          {/* Oval title badge */}
          <div className="inline-flex flex-col items-center justify-center rounded-full border-2 border-foreground/80 px-8 py-3 mb-6">
            <span className="font-display text-booming-red text-sm sm:text-base tracking-wide">
              THE BOOMING CHART
            </span>
            <span className="text-booming-orange text-xs mt-1">جدول المقاسات</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers.map((h) => (
                  <th key={h.label} className="text-center py-3 px-2 font-medium uppercase">
                    {h.label}
                    {h.ar && (
                      <span className="block text-xs normal-case text-muted mt-0.5" dir="rtl">
                        {h.ar}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((row) => (
                <tr key={row.size} className="border-b border-border/50">
                  <td className="py-3 px-2 text-center font-display text-base">{row.size}</td>
                  <td className="py-3 px-2 text-center">{row.chest}</td>
                  <td className="py-3 px-2 text-center">{row.length}</td>
                  <td className="py-3 px-2 text-center">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-[13px] font-bold uppercase italic tracking-wide">
            2-3 CM SHRINKING AFTER FIRST WASH
          </p>
          <p className="text-[13px] font-bold mt-1" dir="rtl">
            ٢-٣ سم انكماش بعد أول غسلة
          </p>
        </div>

        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={() => setIsOpen(false)}
        >
          Close
        </Button>
      </Modal>
    </>
  );
}

/* Backwards-compatible alias so existing product-page integration keeps working. */
export const SizeGuide = TheBoomingChart;