import { Truck, RotateCcw, ShieldCheck } from "lucide-react";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/data/checkout";
import { formatPrice } from "@/lib/utils";

export function TrustSignals() {
  const signals = [
    {
      icon: Truck,
      title: "Free Delivery",
      subtitle: `Complimentary on all orders over ${formatPrice(
        FREE_DELIVERY_THRESHOLD
      )}.`,
    },
    {
      icon: RotateCcw,
      title: "Easy Exchanges",
      subtitle: "Flexible size exchanges on unworn items — get in touch.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Checkout",
      subtitle: "Pay on delivery or securely via InstaPay. No hidden fees.",
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
