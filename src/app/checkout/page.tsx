"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Copy,
  Check,
  Loader2,
  ShieldCheck,
  ChevronDown,
  User,
  MapPin,
  Truck,
  CreditCard as CreditCardIcon,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useOrderStore } from "@/stores/order-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioCard } from "@/components/ui/radio-card";
import { OrderSummary } from "@/components/checkout/order-summary";
import { formatPrice, cn } from "@/lib/utils";
import {
  GOVERNORATES,
  CITIES_BY_GOVERNORATE,
  DELIVERY_OPTIONS,
  INSTAPAY_PHONE_NUMBER,
  whatsappLink,
  displayInstaPayNumber,
  isInstaPayConfigured,
  isCodAvailable,
  isValidPromo,
} from "@/lib/data/checkout";
import {
  buildOrderLineItems,
  computeTotals,
  estimatedDeliveryFor,
} from "@/lib/checkout/orders";
import {
  isEgyptianMobile,
  isValidEmail,
  normalizeMobile,
  isValidCardNumber,
  isValidExpiry,
  isValidCvv,
  detectCardType,
  formatCardNumber,
} from "@/lib/checkout/validation";
import { isCardPaymentAvailable } from "@/lib/checkout/payment";
import type { DeliveryAddress, Order, PaymentMethod } from "@/lib/types";

interface AddressForm {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  governorate: string;
  city: string;
  street: string;
  apartment: string;
  landmark: string;
  postalCode: string;
  instructions: string;
}

const emptyAddress: AddressForm = {
  fullName: "",
  email: "",
  phone: "",
  country: "Egypt",
  governorate: "",
  city: "",
  street: "",
  apartment: "",
  landmark: "",
  postalCode: "",
  instructions: "",
};

type Errors = Partial<Record<string, string>>;

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const addOrder = useOrderStore((s) => s.addOrder);
  const router = useRouter();

  const [addr, setAddr] = useState<AddressForm>(emptyAddress);
  const [deliveryId, setDeliveryId] = useState(DELIVERY_OPTIONS[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [terms, setTerms] = useState(false);
  const [instaConfirmed, setInstaConfirmed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);

  const lineItems = useMemo(() => items.map((i) => ({ ...i })), [items]);
  const resolvedLines = useMemo(() => buildOrderLineItems(lineItems), [lineItems]);

  const deliveryOption = DELIVERY_OPTIONS.find((d) => d.id === deliveryId);

  const totals = useMemo(() => {
    return computeTotals(
      resolvedLines,
      { ...addr, fullName: addr.fullName, governorate: addr.governorate } as DeliveryAddress,
      deliveryOption ?? DELIVERY_OPTIONS[0],
      (paymentMethod || "cod") as PaymentMethod,
      promoApplied ? promo : undefined
    );
  }, [resolvedLines, addr, deliveryOption, paymentMethod, promoApplied, promo]);

  const deliveryEstimate = addr.governorate ? estimatedDeliveryFor(addr.governorate) : "";
  const empty = items.length === 0;

  if (placedOrder) {
    return <Confirmation order={placedOrder} />;
  }

  const set = (field: keyof AddressForm, value: string) => {
    setAddr((a) => ({ ...a, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const applyPromo = () => {
    if (isValidPromo(promo, totals.subtotal)) {
      setPromoApplied(true);
      setErrors((e) => ({ ...e, promo: undefined }));
    } else {
      setErrors((e) => ({ ...e, promo: "Invalid or expired promo code." }));
    }
  };

  /* Single validation pass across all sections. */
  const validateAll = (): boolean => {
    const e: Errors = {};
    if (!addr.fullName.trim()) e.fullName = "Please enter your full name.";
    if (!isValidEmail(addr.email)) e.email = "Please enter a valid email address.";
    if (!isEgyptianMobile(addr.phone)) e.phone = "Please enter a valid Egyptian mobile number.";
    if (!addr.governorate) e.governorate = "Please select your governorate.";
    if (!addr.city.trim()) e.city = "Please enter your city or area.";
    if (!addr.street.trim()) e.street = "Please enter your delivery address.";
    if (!paymentMethod) e.payment = "Please select a payment method.";
    if (paymentMethod === "card") {
      if (!card.name.trim()) e.cardName = "Please enter the name on card.";
      if (!isValidCardNumber(card.number)) e.cardNumber = "Please enter a valid card number.";
      if (!isValidExpiry(card.expiry)) e.cardExpiry = "Please enter a valid expiry (MM / YY).";
      if (!isValidCvv(card.cvv)) e.cardCvv = "Please enter a valid CVV.";
    }
    if (!terms) e.terms = "Please accept the Terms & Conditions.";
    if (paymentMethod === "instapay" && !instaConfirmed)
      e.insta = "Please confirm that you have completed the InstaPay transfer and sent the screenshot via WhatsApp.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- place order ---------- */
  const placeOrder = async () => {
    if (!validateAll()) {
      setSubmitError("Please fix the highlighted fields before placing your order.");
      return;
    }
    if (paymentMethod === "card" && !isCardPaymentAvailable()) {
      setSubmitError("Online card payment is not available yet. Please choose Cash on Delivery or InstaPay.");
      return;
    }
    if (paymentMethod === "instapay" && !isInstaPayConfigured()) {
      setSubmitError("InstaPay is not configured yet. Please choose another payment method.");
      return;
    }

    setPlacing(true);
    setSubmitError(null);
    try {
      const address = { ...addr, country: "Egypt", phone: normalizeMobile(addr.phone) } as DeliveryAddress;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems,
          address,
          deliveryMethod: deliveryId,
          paymentMethod,
          promoCode: promoApplied ? promo : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(typeof data.error === "string" ? data.error : "We couldn't place your order. Please try again.");
        setPlacing(false);
        return;
      }
      const order: Order = data.order;
      addOrder(order);
      setPlacedOrder(order);
      clearCart();
      router.replace("/checkout");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError(
        "We couldn't connect right now. Your order has not been placed. Please check your connection and try again."
      );
      setPlacing(false);
    }
  };

  /* ---------- copy instapay ---------- */
  const copyInstaPay = async () => {
    try {
      await navigator.clipboard.writeText(INSTAPAY_PHONE_NUMBER.trim());
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (empty) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 lg:py-32 text-center">
        <h1 className="font-display text-booming-red text-3xl sm:text-4xl mb-4">Your Bag is Empty</h1>
        <p className="text-muted mb-8">
          Add a piece before checking out. Let&apos;s change that.
        </p>
        <Button size="lg">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-32 lg:pb-10">
      <p className="flex items-center gap-1.5 text-xs text-muted mb-4">
        <ShieldCheck size={13} /> Secure checkout · Review everything below, then place your order in one step.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          placeOrder();
        }}
        noValidate
        className="grid lg:grid-cols-[1fr_360px] gap-10 lg:gap-12 mt-8 items-start"
      >
        {/* -------- Form column: all sections stacked -------- */}
        <div className="min-w-0 space-y-10">
          <CustomerInfoSection addr={addr} set={set} errors={errors} />
          <ShippingAddressSection addr={addr} set={set} errors={errors} />
          <DeliverySection
            deliveryId={deliveryId}
            setDeliveryId={setDeliveryId}
            governorate={addr.governorate}
            estimate={deliveryEstimate}
            addr={addr}
            set={set}
          />
          <PaymentSection
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            card={card}
            setCard={setCard}
            errors={errors}
            instaConfirmed={instaConfirmed}
            setInstaConfirmed={setInstaConfirmed}
            instaNumberConfigured={isInstaPayConfigured()}
            instaNumber={displayInstaPayNumber()}
            onCopy={copyInstaPay}
            copied={copied}
            total={totals.total}
          />

          <TermsSection
            terms={terms}
            setTerms={setTerms}
            instaConfirmed={instaConfirmed}
            setInstaConfirmed={setInstaConfirmed}
            paymentMethod={paymentMethod}
            errors={errors}
          />
        </div>

        {/* -------- Order summary column -------- */}
        <div className="lg:sticky lg:top-24 space-y-4">
          {/* Promo code (desktop) */}
          <div className="border border-border p-4 hidden lg:block">
            <button
              type="button"
              onClick={() => setPromoOpen((o) => !o)}
              className="w-full text-left text-sm font-medium flex items-center justify-between"
              aria-expanded={promoOpen}
            >
              <span>Have a promo code?</span>
              <ChevronDown size={16} className={cn("transition-transform", promoOpen && "rotate-180")} />
            </button>
            {promoOpen && (
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Enter promo code"
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoApplied(false);
                    setErrors((err) => ({ ...err, promo: undefined }));
                  }}
                  disabled={Boolean(promoApplied)}
                />
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={applyPromo}
                  disabled={Boolean(promoApplied) || !promo.trim()}
                >
                  Apply
                </Button>
              </div>
            )}
            {errors.promo && <p className="mt-2 text-xs text-accent-secondary">{errors.promo}</p>}
            {promoApplied && (
              <p className="mt-2 text-xs text-accent flex items-center gap-1">
                <Check size={13} /> Code applied.
              </p>
            )}
          </div>

          <OrderSummary items={lineItems} totals={totals} promoLabel={promoApplied ? promo : undefined} />

          {submitError && (
            <p role="alert" className="text-sm text-accent-secondary border border-accent-secondary/30 p-3">
              {submitError}
            </p>
          )}

          {/* Desktop Place Order button (in-column, auto width) */}
          <div className="hidden lg:block">
            <Button className="w-full" size="lg" type="submit" disabled={placing}>
              {placing ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" /> Processing…
                </>
              ) : (
                paymentLabel(paymentMethod, totals.total)
              )}
            </Button>
            <p className="text-xs text-muted text-center mt-3">
              By placing your order you agree to our Terms &amp; Conditions and Privacy Policy.
            </p>
          </div>
        </div>
      </form>

      {/* Mobile: full-width sticky Place Order bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border p-4 pb-[calc(1rem_+_env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted mb-1">
              <span>Total</span>
              <span className="font-medium text-foreground">{formatPrice(totals.total)}</span>
            </div>
            <Button className="w-full" size="lg" type="submit" onClick={placeOrder} disabled={placing}>
              {placing ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" /> Processing…
                </>
              ) : (
                paymentLabel(paymentMethod, totals.total)
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= single-page sections ================= */

function SectionHeading({
  icon,
  title,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  step: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-border text-booming-orange shrink-0">
        {icon}
      </span>
      <div>
        <p className="text-xs text-muted tracking-wide">{step}</p>
        <h2 className="font-display text-lg">{title}</h2>
      </div>
    </div>
  );
}

function CustomerInfoSection({
  addr,
  set,
  errors,
}: {
  addr: AddressForm;
  set: (f: keyof AddressForm, v: string) => void;
  errors: Errors;
}) {
  return (
    <section>
      <SectionHeading icon={<User size={15} />} step="1" title="Customer Information" />
      <div className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={addr.email}
          onChange={(e) => set("email", e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <div>
          <Input
            label="Mobile Number"
            type="tel"
            placeholder="010XXXXXXXX"
            value={addr.phone}
            onChange={(e) => set("phone", e.target.value)}
            error={errors.phone}
            autoComplete="tel"
          />
          <p className="text-xs text-muted mt-1.5">
            We&apos;ll use your mobile number for delivery updates and order confirmation.
          </p>
        </div>
      </div>
    </section>
  );
}

function ShippingAddressSection({
  addr,
  set,
  errors,
}: {
  addr: AddressForm;
  set: (f: keyof AddressForm, v: string) => void;
  errors: Errors;
}) {
  const govCities = addr.governorate ? CITIES_BY_GOVERNORATE[addr.governorate] ?? [] : [];
  return (
    <section>
      <SectionHeading icon={<MapPin size={15} />} step="2" title="Shipping Address" />
      <div className="space-y-4">
        <Input
          label="Full Name"
          value={addr.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          error={errors.fullName}
          autoComplete="name"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Governorate"
              value={addr.governorate}
              onChange={(e) => {
                set("governorate", e.target.value);
                set("city", "");
              }}
              error={errors.governorate}
            >
              <option value="">Select governorate</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
            {addr.governorate && (
              <p className="text-xs text-muted mt-1.5">Country: Egypt 🇪🇬</p>
            )}
          </div>
          <div>
            <Select
              label="City / Area"
              value={addr.city}
              onChange={(e) => set("city", e.target.value)}
              error={errors.city}
            >
              {govCities.length ? (
                <>
                  <option value="">Select area</option>
                  {govCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="__other__">Other (type it below)</option>
                </>
              ) : (
                <option value="">Type your area below</option>
              )}
            </Select>
          </div>
        </div>
        <Input
          label="Street Address"
          value={addr.street}
          onChange={(e) => set("street", e.target.value)}
          error={errors.street}
          placeholder="Building, street name, apartment"
          autoComplete="street-address"
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Apartment / Floor (optional)"
            value={addr.apartment}
            onChange={(e) => set("apartment", e.target.value)}
            autoComplete="street-address"
          />
          <Input
            label="Landmark (optional)"
            value={addr.landmark}
            onChange={(e) => set("landmark", e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}

function DeliverySection({
  deliveryId,
  setDeliveryId,
  governorate,
  estimate,
  addr,
  set,
}: {
  deliveryId: string;
  setDeliveryId: (id: string) => void;
  governorate: string;
  estimate: string;
  addr: AddressForm;
  set: (f: keyof AddressForm, v: string) => void;
}) {
  const methods = DELIVERY_OPTIONS.filter((d) => d.available);
  return (
    <section>
      <SectionHeading icon={<Truck size={15} />} step="3" title="Delivery Method" />
      {!governorate && (
        <p className="text-sm text-muted border border-border p-4 mb-4">
          Please select a governorate (section 2) to see delivery options.
        </p>
      )}
      <div className="space-y-3">
        {methods.map((m) => (
          <RadioCard
            key={m.id}
            name="delivery"
            value={m.id}
            checked={deliveryId === m.id}
            onChange={setDeliveryId}
            title={m.name}
            description={governorate ? `Estimated: ${estimate}` : `Estimated: ${m.businessDays[0]}-${m.businessDays[1]} business days`}
            sublabel={m.fee === 0 ? "Free" : formatPrice(m.fee)}
          />
        ))}
      </div>
      <div className="mt-4">
        <Textarea
          label="Delivery Instructions (optional)"
          value={addr.instructions}
          onChange={(e) => set("instructions", e.target.value)}
          placeholder="Anything the delivery driver should know? (e.g. call before arriving, leave with reception)"
        />
      </div>
    </section>
  );
}

function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  card,
  setCard,
  errors,
  instaConfirmed,
  setInstaConfirmed,
  instaNumberConfigured,
  instaNumber,
  onCopy,
  copied,
  total,
}: {
  paymentMethod: PaymentMethod | "";
  setPaymentMethod: (m: PaymentMethod) => void;
  card: { name: string; number: string; expiry: string; cvv: string };
  setCard: (c: { name: string; number: string; expiry: string; cvv: string }) => void;
  errors: Errors;
  instaConfirmed: boolean;
  setInstaConfirmed: (v: boolean) => void;
  instaNumberConfigured: boolean;
  instaNumber: string;
  onCopy: () => void;
  copied: boolean;
  total: number;
}) {
  const cardType = detectCardType(card.number);
  return (
    <section>
      <SectionHeading icon={<CreditCardIcon size={15} />} step="4" title="Payment Method" />
      <div className="space-y-3">
        <RadioCard
          name="payment"
          value="card"
          checked={paymentMethod === "card"}
          onChange={(v) => setPaymentMethod(v as PaymentMethod)}
          title={
            <span className="inline-flex items-center gap-2">
              <CreditCard size={16} className="text-muted" /> Credit / Debit Card
            </span>
          }
          description="Pay securely online."
          error={!!errors.payment}
        />
        {paymentMethod === "card" && (
          <div className="border border-border p-5 space-y-4 -mt-1">
            <Input
              label="Name on Card"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              error={errors.cardName}
              autoComplete="cc-name"
            />
            <Input
              label="Card Number"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              error={errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
            />
            {cardType !== "unknown" && (
              <p className="text-xs text-muted -mt-2">
                {cardType === "visa" && "Visa"}
                {cardType === "mastercard" && "Mastercard"}
                {cardType === "amex" && "American Express"}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                error={errors.cardExpiry}
                placeholder="MM / YY"
                inputMode="numeric"
                autoComplete="cc-exp"
              />
              <Input
                label="CVV"
                type="password"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                error={errors.cardCvv}
                placeholder="CVV"
                inputMode="numeric"
                autoComplete="cc-csc"
              />
            </div>
            {!isCardPaymentAvailable() && (
              <p className="text-xs text-accent-secondary border border-accent-secondary/30 p-3">
                Online card payment is not available yet. Please use Cash on Delivery or InstaPay.
              </p>
            )}
          </div>
        )}

        <RadioCard
          name="payment"
          value="cod"
          checked={paymentMethod === "cod"}
          onChange={(v) => setPaymentMethod(v as PaymentMethod)}
          title={
            <span className="inline-flex items-center gap-2">
              <Banknote size={16} className="text-muted" /> Cash on Delivery
            </span>
          }
          description={
            isCodAvailable("")
              ? "Pay when your order is delivered. No additional fee."
              : "Not available for your area yet."
          }
          error={!!errors.payment}
        />

        <RadioCard
          name="payment"
          value="instapay"
          checked={paymentMethod === "instapay"}
          onChange={(v) => setPaymentMethod(v as PaymentMethod)}
          title={
            <span className="inline-flex items-center gap-2">
              <Smartphone size={16} className="text-muted" /> InstaPay
            </span>
          }
          description="Transfer the exact order amount using InstaPay."
          error={!!errors.payment}
        />
        {paymentMethod === "instapay" && (
          <div className="border border-border p-5 -mt-1 space-y-4">
            {!instaNumberConfigured ? (
              <p className="text-sm text-accent-secondary border border-accent-secondary/30 p-3">
                InstaPay is not configured yet. Please choose another payment method.
              </p>
            ) : (
              <InstaPayDetails
                instaConfirmed={instaConfirmed}
                setInstaConfirmed={setInstaConfirmed}
                number={instaNumber}
                onCopy={onCopy}
                copied={copied}
                total={total}
                error={errors.insta}
              />
            )}
          </div>
        )}
      </div>
      {errors.payment && <p className="mt-3 text-xs text-accent-secondary">{errors.payment}</p>}
    </section>
  );
}

function InstaPayDetails({
  instaConfirmed,
  setInstaConfirmed,
  number,
  onCopy,
  copied,
  total,
  error,
}: {
  instaConfirmed: boolean;
  setInstaConfirmed: (v: boolean) => void;
  number: string;
  onCopy: () => void;
  copied: boolean;
  total: number;
  error?: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-1">Amount to Transfer</p>
        <p className="font-display text-2xl text-booming-orange">{formatPrice(total)}</p>
      </div>

      <div>
        <p className="text-sm font-medium mb-1">InstaPay Payment Number</p>
        <div className="flex items-center gap-2 border border-border p-3">
          <span className="flex-1 text-sm font-medium">{number}</span>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 text-xs text-booming-orange hover:text-foreground transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy Number
              </>
            )}
          </button>
        </div>
      </div>

      <div className="border border-border p-4">
        <p className="text-sm font-medium mb-2">Important</p>
        <p className="text-sm text-muted leading-relaxed">
          After completing your InstaPay transfer, please take a screenshot of the successful
          payment and send it to our WhatsApp number shown below to confirm your payment.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-1">WhatsApp Payment Confirmation</p>
        <p className="border border-border p-3 text-sm font-medium">{number}</p>
      </div>

      {number && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            window.open(
              whatsappLink("Hello, I would like to confirm my InstaPay payment for my order."),
              "_blank"
            )
          }
        >
          Send Payment Screenshot on WhatsApp
        </Button>
      )}

      <Checkbox
        checked={instaConfirmed}
        onChange={setInstaConfirmed}
        error={!!error}
        label="I have completed the InstaPay transfer and sent the payment screenshot via WhatsApp."
      />
      {error && <p className="text-xs text-accent-secondary">{error}</p>}
    </div>
  );
}

function TermsSection({
  terms,
  setTerms,
  instaConfirmed,
  setInstaConfirmed,
  paymentMethod,
  errors,
}: {
  terms: boolean;
  setTerms: (v: boolean) => void;
  instaConfirmed: boolean;
  setInstaConfirmed: (v: boolean) => void;
  paymentMethod: PaymentMethod | "";
  errors: Errors;
}) {
  return (
    <section className="border border-border p-5 space-y-4">
      <Checkbox
        checked={terms}
        onChange={setTerms}
        error={!!errors.terms}
        label={
          <>
            I agree to the <Link href="/terms">Terms &amp; Conditions</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>.
          </>
        }
      />
      {errors.terms && <p className="text-xs text-accent-secondary">{errors.terms}</p>}
      {paymentMethod === "instapay" && (
        <>
          <Checkbox
            checked={instaConfirmed}
            onChange={setInstaConfirmed}
            error={!!errors.insta}
            label="I have completed the InstaPay transfer and sent the payment screenshot via WhatsApp."
          />
          {errors.insta && <p className="text-xs text-accent-secondary">{errors.insta}</p>}
        </>
      )}
    </section>
  );
}

/* ---------- Confirmation ---------- */
function Confirmation({ order }: { order: Order }) {
  const router = useRouter();
  const isInsta = order.paymentMethod === "instapay";
  const isCod = order.paymentMethod === "cod";
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 lg:py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-booming-orange text-booming-orange mb-5">
          <Check size={26} />
        </div>
        <h1 className="font-display text-booming-red text-3xl sm:text-4xl mb-3">
          {isInsta ? "Order Received" : "Thank You For Your Order!"}
        </h1>
        <p className="text-muted">
          {isInsta
            ? "Your order has been received and your payment is pending verification."
            : isCod
            ? "Your order has been confirmed."
            : "Your order has been received successfully."}
        </p>
      </div>

      <div className="border border-border p-6 mb-8 space-y-3 text-sm">
        <Row label="Order Number" value={order.orderNumber} bold />
        <Row label="Payment Method" value={paymentMethodName(order.paymentMethod)} />
        <Row
          label="Payment Status"
          value={paymentStatusLabel(order.paymentStatus)}
          accent={order.paymentStatus === "pending_verification"}
        />
        <Row label="Estimated Delivery" value={order.estimatedDelivery} />
        <Row label="Confirmation Email" value={order.address.email} />
      </div>

      {isInsta && (
        <div className="border border-accent-secondary/40 p-5 mb-8">
          <p className="font-medium mb-1 text-accent-secondary">Important</p>
          <p className="text-sm text-muted leading-relaxed">
            Please make sure you have sent your successful InstaPay payment screenshot to our
            WhatsApp number so we can confirm your payment. Your order will be marked Paid once we
            verify it manually.
          </p>
        </div>
      )}

      <div className="text-center">
        <Button size="lg" onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
        <p className="text-xs text-muted mt-4">
          A confirmation email is on its way to {order.address.email}.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className={accent ? "text-accent-secondary font-medium" : "text-right font-medium"}>
        {bold ? <span className="font-bold">{value}</span> : value}
      </span>
    </div>
  );
}

function paymentLabel(method: PaymentMethod | "", total: number): string {
  if (method === "cod") return `Place Order - ${formatPrice(total)}`;
  if (method === "instapay") return `Place Order - ${formatPrice(total)}`;
  if (method === "card") return `Pay ${formatPrice(total)}`;
  return `Place Order - ${formatPrice(total)}`;
}

function paymentMethodName(m: PaymentMethod): string {
  if (m === "card") return "Credit / Debit Card";
  if (m === "cod") return "Cash on Delivery";
  return "InstaPay";
}

function paymentStatusLabel(s: Order["paymentStatus"]): string {
  switch (s) {
    case "pending":
      return "Pending";
    case "pending_verification":
      return "Pending Verification";
    case "paid":
      return "Paid";
    case "failed":
      return "Failed";
    case "cancelled":
      return "Cancelled";
  }
}