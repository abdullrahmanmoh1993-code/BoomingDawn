import { siteConfig } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
  description: "How The Booming Dawn collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-16 lg:pt-20">
      <section className="py-20 lg:py-28 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
            Legal
          </p>
          <h1 className="font-display text-booming-red text-4xl sm:text-5xl">
            Privacy Policy
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 text-muted leading-relaxed">
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              What we collect
            </h2>
            <p>
              We collect the information you provide when placing an order or
              contacting us: your name, email address, phone number, and delivery
              address. This data is used solely to fulfill and deliver your order
              and to respond to your inquiries.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              How we use it
            </h2>
            <p>
              Your details are used to process your purchase, arrange delivery,
              send order confirmations, and provide customer support. We do not sell
              or share your personal information with third parties except as needed
              to deliver your order.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              Payment security
            </h2>
            <p>
              Payment details for cash on delivery are never stored. InstaPay
              transfers are confirmed manually from your submitted payment
              screenshot, which we keep only to verify your order.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              Your rights
            </h2>
            <p>
              You may request access to, correction of, or deletion of your personal
              information at any time by contacting us at {siteConfig.name}. We
              retain order data only as long as needed to provide our services and
              meet legal obligations.
            </p>
          </div>
          <p className="text-xs text-muted pt-4 border-t border-border">
            Last updated: {new Date().getFullYear()}. Questions about this policy?
            Contact us via the contact page.
          </p>
        </div>
      </section>
    </div>
  );
}
