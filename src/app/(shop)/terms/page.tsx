export const dynamic = "force-static";

export const metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your purchase from The Booming Dawn, including ordering, payment, and delivery.",
};

export default function TermsPage() {
  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <section className="py-20 lg:py-28 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
            Legal
          </p>
          <h1 className="font-display text-booming-red text-4xl sm:text-5xl">
            Terms &amp; Conditions
          </h1>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8 text-muted leading-relaxed">
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              Orders
            </h2>
            <p>
              By placing an order, you agree to purchase the selected items at the
              prices shown at checkout, in Egyptian Pounds (EGP). We reserve the
              right to refuse or cancel an order where payment cannot be
              verified or where an item is out of stock.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              Payment
            </h2>
            <p>
              We accept Cash on Delivery and InstaPay. Online card payment is
              currently unavailable. Orders placed via InstaPay remain pending
              until your payment screenshot is verified.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              Delivery
            </h2>
            <p>
              Delivery across Egypt is arranged through our courier partners.
              Estimated delivery windows and fees are shown at checkout and may
              vary by governorate. We are not responsible for delays outside of
              our control once the order has been handed to the courier.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              Exchanges &amp; Returns
            </h2>
            <p>
              Unworn items in their original condition may be exchanged for a
              different size. Please contact us within the return window to
              arrange an exchange. We are not able to accept returns on items that
              have been worn or washed.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-3">
              Contact
            </h2>
            <p>
              For any questions regarding these terms, please reach out through the
              contact page and we will be happy to help.
            </p>
          </div>
          <p className="text-xs text-muted pt-4 border-t border-border">
            Last updated: {new Date().getFullYear()}.
          </p>
        </div>
      </section>
    </div>
  );
}
