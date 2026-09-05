"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  Handshake,
  Headphones,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

type FieldName = keyof typeof emptyForm;

const FIELD_ORDER: FieldName[] = ["name", "email", "subject", "message"];

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const formStatusId = useId();

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isDirty = Object.values(form).some((value) => value.trim().length > 0);

  useEffect(() => {
    if (!isDirty || submitted) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty, submitted]);

  useEffect(() => {
    if (submitted) headingRef.current?.focus();
  }, [submitted]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError(null);
    if (errors[name as FieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as FieldName];
        return next;
      });
    }
  };

  const validate = () => {
    const next: Partial<Record<FieldName, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim() || !/.+@.+\..+/.test(form.email.trim())) {
      next.email = "Please enter a valid email address.";
    }
    if (!form.message.trim()) next.message = "Please enter a message.";
    return next;
  };

  const focusFirstInvalid = (next: Partial<Record<FieldName, string>>) => {
    const first = FIELD_ORDER.find((field) => next[field]);
    if (first === "name") nameRef.current?.focus();
    else if (first === "email") emailRef.current?.focus();
    else if (first === "message") messageRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSubmitError("Please fix the highlighted fields before sending.");
      focusFirstInvalid(next);
      return;
    }

    setSending(true);
    setSubmitError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError(
        "We couldn't send your message. Please try again or email us directly."
      );
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
    requestAnimationFrame(() => nameRef.current?.focus());
  };

  if (submitted) {
    return (
      <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
        <div className="max-w-2xl mx-auto px-page py-16 lg:py-24">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-booming-orange text-booming-orange mb-5"
              aria-hidden="true"
            >
              <Check size={26} />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
              Get In Touch
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-booming-red text-3xl sm:text-4xl mb-3 outline-none"
            >
              Message Sent
            </h1>
            <p role="status" className="text-muted max-w-md mx-auto">
              Thank you, {form.name.trim().split(" ")[0] || "there"}. Our team
              will get back to you within 1–2 business days.
            </p>
          </div>

          <div className="border border-border p-6 mb-8 space-y-3 text-sm">
            <SuccessRow label="From" value={form.name} />
            <SuccessRow label="Email" value={form.email} />
            {form.subject.trim() && (
              <SuccessRow label="Subject" value={form.subject} />
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Button
              size="lg"
              href="/products"
              className="active:scale-[0.96] motion-reduce:active:scale-100"
            >
              Explore Products
            </Button>
            <Button
              size="lg"
              variant="outline"
              type="button"
              onClick={resetForm}
              className="active:scale-[0.96] motion-reduce:active:scale-100"
            >
              Send Another Message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <section className="py-16 lg:py-24 border-b border-border">
        <div className="max-w-[1440px] mx-auto px-page">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">
            Get In Touch
          </p>
          <h1 className="font-display text-booming-red text-4xl sm:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 text-muted max-w-xl leading-relaxed">
            Questions about an order, sizing, or a collaboration? Write to us
            and we&apos;ll reply within 1–2 business days.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-[1200px] mx-auto px-page grid lg:grid-cols-[minmax(0,1fr)_340px] gap-12 lg:gap-16 items-start">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            aria-busy={sending}
            aria-describedby={submitError ? formStatusId : undefined}
            className="space-y-6"
          >
            <p className="text-xs text-muted">
              Required fields are marked with{" "}
              <span className="text-accent-secondary" aria-hidden="true">
                *
              </span>
              <span className="sr-only">an asterisk</span>.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <Input
                ref={nameRef}
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
              <Input
                ref={emailRef}
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
                spellCheck={false}
                required
              />
            </div>
            <Input
              label="Subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Order, sizing, or collaboration"
              autoComplete="off"
              hint="Optional — a short line helps us route your note."
            />
            <Textarea
              ref={messageRef}
              label="Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              error={errors.message}
              rows={6}
              className="min-h-[140px]"
              placeholder="Tell us what you need help with."
              required
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  formRef.current?.requestSubmit();
                }
              }}
            />

            {submitError && (
              <p
                id={formStatusId}
                role="alert"
                className="text-sm text-accent-secondary border border-accent-secondary/30 p-3"
              >
                {submitError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={sending}
                className="w-full sm:w-auto active:scale-[0.96] motion-reduce:active:scale-100"
              >
                {sending && (
                  <Loader2
                    size={16}
                    className="animate-spin mr-2 motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                )}
                Send Message
              </Button>
              <p className="text-xs text-muted">
                We typically reply Monday–Friday, 9am–6pm Cairo time.
              </p>
            </div>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <ContactCard
              icon={<Headphones size={16} />}
              title="Customer Care"
              body="Monday–Friday, 9am–6pm Cairo time (EET). We reply to every note within 1–2 business days."
            >
              <a
                href="mailto:support@theboomingdawn.com"
                className="inline-flex items-center gap-2 text-sm text-booming-orange hover:text-foreground transition-colors duration-150 min-h-11"
              >
                <Mail size={15} aria-hidden="true" />
                support@theboomingdawn.com
              </a>
            </ContactCard>

            <ContactCard
              icon={<Handshake size={16} />}
              title="Press & Collaborations"
              body="Editorial features, wholesale, and partnership inquiries."
            >
              <a
                href="mailto:press@theboomingdawn.com"
                className="inline-flex items-center gap-2 text-sm text-booming-orange hover:text-foreground transition-colors duration-150 min-h-11"
              >
                <Mail size={15} aria-hidden="true" />
                press@theboomingdawn.com
              </a>
            </ContactCard>

            <ContactCard
              icon={<Clock size={16} />}
              title="Orders & Delivery"
              body="Need a size exchange or a delivery update? Include your order number if you have one."
            >
              <Link
                href="/shipping"
                className="inline-flex items-center text-sm underline underline-offset-4 hover:text-accent transition-colors duration-150 min-h-11"
              >
                Shipping &amp; delivery details
              </Link>
            </ContactCard>
          </aside>
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 shrink-0 border border-border text-booming-orange"
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <h2 className="font-display text-lg">{title}</h2>
      </div>
      <p className="text-muted text-sm leading-relaxed mb-4">{body}</p>
      {children}
    </div>
  );
}

function SuccessRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium break-all">{value}</span>
    </div>
  );
}
