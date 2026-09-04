/** Egyptian mobile number helpers. */
import { GOVERNORATES } from "@/lib/data/checkout";

const EGYPTIAN_MOBILE =
  /^(?:\+20|0020|20|0)?(10|11|12|15)\d{8}$/;

/** True if value looks like a valid Egyptian mobile number (local or +20 intl). */
export function isEgyptianMobile(value: string): boolean {
  const digits = value.replace(/[\s-]/g, "");
  return EGYPTIAN_MOBILE.test(digits);
}

/** Normalize an Egyptian mobile to local `010XXXXXXXX` form (for records/delivery/WhatsApp). */
export function normalizeMobile(value: string): string {
  const digits = value.replace(/[^\d+]/g, "").replace(/^\+/, "");
  let local = digits;
  if (local.startsWith("0020")) local = local.slice(4);
  else if (local.startsWith("20")) local = local.slice(2);
  if (local.startsWith("0")) return local;
  if (local.length === 10 && /^1[0125]/.test(local)) return local;
  return `0${local}`;
}

/** Normalize to international `+20...` form (for WhatsApp). */
export function normalizeMobileInternational(value: string): string {
  const local = normalizeMobile(value).replace(/^0/, "");
  return `+20${local}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidGovernorate(value: string): boolean {
  return GOVERNORATES.includes(value as (typeof GOVERNORATES)[number]);
}

export function isValidCardNumber(value: string): boolean {
  // Luhn check + 12–19 digits.
  const digits = value.replace(/\s+/g, "");
  if (!/^\d{12,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = +digits[i];
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(value: string): boolean {
  const m = value.match(/^\s*(\d{2})\s*\/\s*(\d{2})\s*$/);
  if (!m) return false;
  const month = +m[1];
  const year = 2000 + +m[2];
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const exp = new Date(year, month, 0, 23, 59, 59);
  return exp >= now;
}

export function isValidCvv(value: string, cardType?: string): boolean {
  const digits = value.replace(/\s+/g, "");
  if (cardType === "amex") return /^\d{4}$/.test(digits);
  return /^\d{3,4}$/.test(digits);
}

/** Detect a card brand from a number prefix (for display only). */
export function detectCardType(value: string): "visa" | "mastercard" | "amex" | "unknown" {
  const d = value.replace(/\s+/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  return "unknown";
}

/** Format raw card digits into spaced groups for nicer input. */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}