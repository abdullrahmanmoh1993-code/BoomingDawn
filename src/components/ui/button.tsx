import { forwardRef, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  /** When set, renders as a next/link anchor with the same visual styles. */
  href?: string;
  className?: string;
  children: React.ReactNode;
}

/* Mirrors the exact visual styling of the default <button> render. */
function buttonClasses(
  variant: NonNullable<ButtonProps["variant"]>,
  size: NonNullable<ButtonProps["size"]>,
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
      "border border-booming-orange text-booming-orange bg-transparent hover:bg-booming-orange/10":
        variant === "secondary" || variant === "outline",
      "bg-booming-red text-black hover:bg-booming-orange": variant === "primary",
      "text-booming-orange hover:bg-booming-orange/10": variant === "ghost",
    },
    {
      "h-9 px-4 text-sm": size === "sm",
      "h-11 px-6 text-sm": size === "md",
      "h-13 px-8 text-base": size === "lg",
    },
    className
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, children, ...props }, ref) => {
    if (href) {
      // Render as a next/link anchor with identical styling. Only common
      // attributes (aria-, data-, onClick, etc.) are ever forwarded by call
      // sites, so the narrowed cast is safe and keeps <a> semantics valid.
      return (
        <Link
          href={href}
          className={buttonClasses(variant, size, className)}
          {...(props as unknown as Omit<
            React.ComponentPropsWithoutRef<typeof Link>,
            "href" | "children"
          >)}
        >
          {children}
        </Link>
      );
    }
    return (
      <button ref={ref} className={buttonClasses(variant, size, className)} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
