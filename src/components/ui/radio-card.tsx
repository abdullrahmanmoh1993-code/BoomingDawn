"use client";

import { cn } from "@/lib/utils";

interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  sublabel?: React.ReactNode;
  error?: boolean;
}

export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  sublabel,
  error,
}: RadioCardProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-4 border p-5 cursor-pointer transition-colors",
        checked
          ? "border-booming-orange bg-booming-orange/5"
          : "border-border hover:border-foreground/40",
        error && "border-accent-secondary"
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 shrink-0 h-4 w-4 accent-booming-orange cursor-pointer"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-medium">{title}</span>
          {sublabel && <span className="font-display shrink-0">{sublabel}</span>}
        </div>
        {description && (
          <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </label>
  );
}