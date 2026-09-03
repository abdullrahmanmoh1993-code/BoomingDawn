"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full h-11 px-4 bg-surface border border-border rounded-none text-sm placeholder:text-muted focus:outline-none focus:border-foreground transition-colors appearance-none",
            error && "border-accent-secondary",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-accent-secondary">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
export type { SelectProps };