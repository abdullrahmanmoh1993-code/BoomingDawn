"use client";

import { cn } from "@/lib/utils";

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  error?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  error,
  className,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none text-sm",
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 shrink-0 h-4 w-4 accent-booming-orange cursor-pointer"
      />
      <span className={cn("leading-relaxed", error ? "text-accent-secondary" : "text-foreground/90")}>
        {label}
      </span>
    </label>
  );
}