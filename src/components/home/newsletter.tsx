"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <section className="py-20 lg:py-28 bg-accent/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted mb-4">
          Stay Connected
        </p>
        <h2 className="font-display text-booming-red text-3xl sm:text-4xl mb-4">
          Join the Dawn List
        </h2>
        <p className="text-muted mb-8 max-w-lg mx-auto leading-relaxed">
          Be first to know about new arrivals, exclusive drops, and private
          sales. No noise, just the good stuff.
        </p>

        {submitted ? (
          <div className="p-6 border border-accent/30 bg-surface">
            <p className="font-medium">Welcome to the Dawn List.</p>
            <p className="text-sm text-muted mt-1">
              Watch your inbox for something special.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              aria-label="Email address"
            />
            <Button type="submit" className="shrink-0">
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
