import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export function TrustSignals() {
  const signals = [
    {
      icon: Truck,
      title: "Free Shipping",
      subtitle: "Complimentary on all orders over $150.",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      subtitle: "30-day hassle-free returns on unworn items.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Checkout",
      subtitle: "All transactions encrypted and secure.",
    },
  ];

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <div key={signal.title} className="flex items-start gap-3">
          <signal.icon size={18} className="text-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">{signal.title}</p>
            <p className="text-xs text-muted mt-0.5">{signal.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
