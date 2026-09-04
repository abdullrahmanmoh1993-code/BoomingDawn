"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      const next = { ...errors };
      delete next[e.target.name];
      setErrors(next);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email || !/.+@.+\..+/.test(form.email))
      next.email = "Please enter a valid email address.";
    if (!form.message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
        <div className="max-w-xl mx-auto px-4 py-24 lg:py-32 text-center">
          <h1 className="font-display text-booming-red text-3xl sm:text-4xl mb-4">
            Message Sent
          </h1>
          <p className="text-muted">
            Thank you for reaching out. Our team will get back to you within 1-2
            business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[max(4rem,calc(env(safe-area-inset-top,0px)_+_2.75rem))] lg:pt-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4">
            Get In Touch
          </p>
          <h1 className="font-display text-booming-red text-4xl sm:text-5xl">
            Contact Us
          </h1>
          <p className="text-muted mt-4 max-w-lg mx-auto">
            Questions about an order, sizing, or a collaboration? We&apos;d love
            to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <Input
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Your full name"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@example.com"
              />
            </div>
            <Input
              label="Subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="How can we help?"
            />
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1.5"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Tell us more..."
                className="w-full px-4 py-3 bg-surface border border-border text-sm placeholder:text-muted focus:outline-none focus:border-foreground transition-colors resize-y"
              />
              {errors.message && (
                <p className="mt-1 text-xs text-accent-secondary">
                  {errors.message}
                </p>
              )}
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Send Message
            </Button>
          </form>

          {/* Info */}
          <div className="space-y-8">
            <div className="border border-border p-8">
              <h3 className="font-display text-lg font-medium mb-2">
                Customer Care
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                Our team is available Monday–Friday, 9am–6pm EST.
                <br />
                support@theboomingdawn.com
              </p>
            </div>
            <div className="border border-border p-8">
              <h3 className="font-display text-lg font-medium mb-2">
                Press & Collaborations
              </h3>
              <p className="text-muted text-sm leading-relaxed">
                For editorial or partnership inquiries:
                <br />
                press@theboomingdawn.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
