import { DELIVERY_OPTIONS, FREE_DELIVERY_THRESHOLD } from "@/lib/data/checkout";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Shipping & Delivery",
  description:
    "Delivery options, fees, and estimated timelines for The Booming Dawn, delivering across Egypt.",
};

export default function ShippingPage() {
  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <section className="relative py-24 lg:py-32 border-b border-border overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/editorial/road.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <p className="text-accent text-xs uppercase tracking-[0.3em] mb-4">
            Deliveries Across Egypt
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium max-w-3xl">
            Shipping &amp; Delivery
          </h1>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          {/* Delivery options */}
          <div>
            <h2 className="font-display text-2xl mb-6">Delivery Options</h2>
            <div className="space-y-4">
              {DELIVERY_OPTIONS.filter((d) => d.available).map((d) => (
                <div
                  key={d.id}
                  className="border border-border p-6 flex justify-between items-start gap-4"
                >
                  <div>
                    <h3 className="font-medium mb-1">{d.name}</h3>
                    <p className="text-sm text-muted">
                      Estimated delivery in {d.businessDays[0]}–{d.businessDays[1]}{" "}
                      business days.
                    </p>
                  </div>
                  <span className="text-booming-orange font-medium shrink-0">
                    {d.fee === 0 ? "Free" : formatPrice(d.fee)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted leading-relaxed">
              Delivery fees are calculated at checkout based on your governorate.
              Orders over {formatPrice(FREE_DELIVERY_THRESHOLD)} qualify for free
              delivery.
            </p>
          </div>

          {/* Processing */}
          <div className="space-y-8">
            <div className="border border-border p-8">
              <h2 className="font-display text-2xl mb-3">Processing Time</h2>
              <p className="text-muted leading-relaxed">
                We process and prepare every order within 1–2 business days before
                handing it to the courier.
              </p>
            </div>
            <div className="border border-border p-8">
              <h2 className="font-display text-2xl mb-3">Exchanges</h2>
              <p className="text-muted leading-relaxed">
                Unworn items can be exchanged for a different size. Contact us and
                we&apos;ll guide you through the process.
              </p>
            </div>
            <div className="border border-border p-8">
              <h2 className="font-display text-2xl mb-3">Cash on Delivery</h2>
              <p className="text-muted leading-relaxed">
                Pay in cash when your order arrives. No additional fee for cash on
                delivery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
