import { CheckoutHeader } from "@/components/checkout/checkout-header";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <CheckoutHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-muted">
          The Booming Dawn, Cairo, Egypt · Secure checkout · EGP
        </div>
      </footer>
    </div>
  );
}