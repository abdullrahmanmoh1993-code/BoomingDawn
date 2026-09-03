import type { DeliveryOption } from "@/lib/types";

/* ============================================================
 * THE BOOMING DAWN — EYG Checkout Configuration
 *
 * Single source of truth for Egypt-specific checkout settings.
 * Everything here is configurable — nothing is hard-coded in the
 * checkout UI. Update one value here and the whole checkout follows.
 * ============================================================ */

/** Store's InstaPay account = the phone number to transfer money to AND
 *  the WhatsApp number that receives the payment screenshot.
 *  Leave empty until the real number is available — the checkout then
 *  treats InstaPay as not yet configured (no fake number is shown). */
export const INSTAPAY_PHONE_NUMBER = "";

/** WhatsApp number (international digits, no +) used for order help + payment screenshots. */
export const STORE_WHATSAPP_NUMBER = "";

/** Support email configured on the site. */
export const STORE_EMAIL = "support@theboomingdawn.com";

/** The country is Egypt-only. */
export const CHECKOUT_COUNTRY = "Egypt";

/** All 27 Egyptian governorates (Egypt-only store — no US states/provinces). */
export const GOVERNORATES = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Qalyubia",
  "Dakahlia",
  "Sharqia",
  "Gharbia",
  "Monufia",
  "Beheira",
  "Kafr El Sheikh",
  "Damietta",
  "Port Said",
  "Ismailia",
  "Suez",
  "North Sinai",
  "South Sinai",
  "Red Sea",
  "Fayoum",
  "Beni Suef",
  "Minya",
  "Assiut",
  "Sohag",
  "Qena",
  "Luxor",
  "Aswan",
  "New Valley",
  "Matrouh",
] as const;

/** Major cities/areas per governorate for the searchable dropdown.
 *  Customers may always type a free-text area if one isn't listed. */
export const CITIES_BY_GOVERNORATE: Record<string, string[]> = {
  Cairo: [
    "New Cairo",
    "Nasr City",
    "Maadi",
    "Zamalek",
    "Heliopolis",
    "Downtown",
    "Garden City",
    "6th of October (Giza side)",
    "Shorouk City",
    "Rehab City",
    "Madinaty",
    "Obour City",
    "15th of May",
    "El Marg",
    "Shubra",
    "Hadayek El Qobba",
  ],
  Giza: [
    "Dokki",
    "Mohandessin",
    "Agouza",
    "Haram",
    "Faisal",
    "Sheikh Zayed",
    "6th of October City",
    "El Wahat",
    "Bulaq El Dakrour",
    "Imbaba",
  ],
  Alexandria: [
    "Alexandria",
    "El Montazah",
    "Smouha",
    "Sidi Gaber",
    "San Stefano",
    "Agami",
    "Miami",
    "Victoria",
    "Raml Station",
  ],
  Qalyubia: ["Banha", "Shubra El Kheima", "Obour", "Kafr Shukr"],
  Dakahlia: ["Mansoura", "Talkha", "Mit Ghamr", "Sinbillawin"],
  Sharqia: ["Zagazig", "10th of Ramadan City", "Belbeis", "Abu Hammad"],
  Gharbia: ["Tanta", "El Mahalla El Kubra", "Zefta", "Kafr El Zayat"],
  Monufia: ["Shibin El Kom", "Sadat City", "Menuf", "Quesna"],
  Beheira: ["Damanhur", "Kafr El Dawwar", "Rashid", "Edku"],
  "Kafr El Sheikh": ["Kafr El Sheikh", "Desouk", "Baltim"],
  Damietta: ["Damietta", "New Damietta", "Ras El Bar"],
  "Port Said": ["Port Said", "Port Fuad"],
  Ismailia: ["Ismailia", "Kasassin", "Fayed"],
  Suez: ["Suez", "Ain Sokhna"],
  "North Sinai": ["Arish"],
  "South Sinai": ["Sharm El Sheikh", "Dahab", "Nuweiba", "Taba"],
  "Red Sea": ["Hurghada", "Safaga", "El Gouna", "Marsa Alam"],
  Fayoum: ["Fayoum", "Ibsheway"],
  "Beni Suef": ["Beni Suef", "El Wasta"],
  Minya: ["Minya", "Bani Mazar", "Maghagha"],
  Assiut: ["Assiut", "Abu Tig", "Dairut"],
  Sohag: ["Sohag", "Akhmim", "Tahta"],
  Qena: ["Qena", "Deshna", "Nag Hammadi"],
  Luxor: ["Luxor", "West Bank"],
  Aswan: ["Aswan", "Kom Ombo"],
  "New Valley": ["El Kharga"],
  Matrouh: ["Marsa Matrouh", "El Alamein"],
};

/** Free delivery threshold (subtotal >= this → delivery fee waived). */
export const FREE_DELIVERY_THRESHOLD = 1500;

/** Delivery options. Business days drive the estimated delivery window.
 *  No express option is shown when unavailable. */
export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "standard", name: "Standard Delivery", businessDays: [3, 7], fee: 60, available: true },
  { id: "express", name: "Express Delivery", businessDays: [1, 3], fee: 100, available: true },
];

/** Cash on Delivery fee in EGP. Set to 0 for no fee. */
export const COD_FEE = 0;

/**
 * The per-governorate clothing-courier zones used for a small, fair cost
 * ladder so distant governorates pay a little more. Flat fee is used when a
 * governorate is not explicitly listed.
 */
const DELIVERY_ZONES: Record<string, { fee: number; businessDays: [number, number] }> = {
  Cairo: { fee: 60, businessDays: [2, 5] },
  Giza: { fee: 60, businessDays: [2, 5] },
  Alexandria: { fee: 70, businessDays: [3, 6] },
  Qalyubia: { fee: 60, businessDays: [2, 5] },
  "Port Said": { fee: 75, businessDays: [3, 6] },
  Ismailia: { fee: 70, businessDays: [3, 6] },
  Suez: { fee: 70, businessDays: [3, 6] },
  Fayoum: { fee: 70, businessDays: [3, 7] },
  "Red Sea": { fee: 80, businessDays: [3, 7] },
  "North Sinai": { fee: 85, businessDays: [4, 8] },
  "South Sinai": { fee: 85, businessDays: [4, 8] },
  Matrouh: { fee: 85, businessDays: [4, 8] },
  "New Valley": { fee: 90, businessDays: [4, 9] },
};

type ZoneKey = keyof typeof DELIVERY_ZONES;

/** Base delivery fee for a governorate (before the free-shipping waiver). */
export function baseDeliveryFee(governorate: string): number {
  const zone = DELIVERY_ZONES[governorate as ZoneKey];
  return zone?.fee ?? 60;
}

/** Business-day window for a governorate (falls back to the standard window). */
export function deliveryDaysFor(governorate: string): [number, number] {
  const zone = DELIVERY_ZONES[governorate as ZoneKey];
  return zone?.businessDays ?? [3, 7];
}

/** Whether this governorate supports COD (all do for now — configurable). */
export function isCodAvailable(governorate: string): boolean {
  void governorate;
  return true;
}

/** Whether InstaPay is properly configured (a real store number exists). */
export function isInstaPayConfigured(): boolean {
  return INSTAPAY_PHONE_NUMBER.trim().length > 0;
}

/** Normalized WhatsApp international digits for a deep-link. */
export function whatsappDigital(): string {
  return STORE_WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${whatsappDigital()}?text=${encodeURIComponent(message)}`;
}

/** Display-dash version of the store number (digits only, no formatting yet). */
export function displayInstaPayNumber(): string {
  return INSTAPAY_PHONE_NUMBER.trim();
}

/* ---------------- Promo codes (server-validated) ---------------- */
const PROMO_CODES: Record<string, number> = {
  DAWN10: 0.1, // 10% off subtotal
  BOOMING: 100, // flat 100 EGP off
};

/** Returns discount amount (EGP) for a promo code against a subtotal, or 0. */
export function lookupDiscount(code: string, subtotal: number): number {
  const value = PROMO_CODES[code.trim().toUpperCase()];
  if (value === undefined) return 0;
  const discount = value <= 1 ? subtotal * value : Math.min(value, subtotal);
  return Math.max(0, Math.round(discount));
}

/** Whether a code is valid (non-zero discount, positive subtotal). */
export function isValidPromo(code: string, subtotal: number): boolean {
  return subtotal > 0 && lookupDiscount(code, subtotal) > 0;
}