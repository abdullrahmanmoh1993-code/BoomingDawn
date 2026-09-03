export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  colorHex?: string;
  sku: string;
  inStock: boolean;
}

export type DawnStage = "nautical" | "astronomical" | "orange-rising";

export interface Product {
  id: string;
  slug: string;
  name: string;
  arabicName?: string;
  subtitle?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  description: string;
  details: string[];
  materials: string;
  care: string[];
  images: ProductImage[];
  dawnStage: DawnStage;
  variants: ProductVariant[];
  collections: string[];
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: ProductImage;
  productIds: string[];
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  ogImage: string;
  navigation: NavItem[];
  footer: FooterSection[];
}

export interface NavItem {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: NavItem[];
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface FilterState {
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  sortBy: "newest" | "price-asc" | "price-desc" | "name";
}

/* ---------------- Checkout / Orders ---------------- */

/** Egyptian government-issued mobile number, kept in local `010XXXXXXXX` form. */
export type PaymentMethod = "card" | "cod" | "instapay";

export type PaymentStatus =
  | "pending"
  | "pending_verification"
  | "paid"
  | "failed"
  | "cancelled";

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface DeliveryOption {
  id: string;
  name: string;
  /** Business-day delivery window, e.g. [3, 7] means 3–7 business days. */
  businessDays: [number, number];
  /** Flat fee in EGP (0 = free). Delivery pricing is config-driven, not hard-coded in UI. */
  fee: number;
  available: boolean;
}

export interface CheckoutLineItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface OrderLineItem extends CheckoutLineItem {
  name: string;
  size?: string;
  color?: string;
  unitPrice: number;
  image: string;
}

export interface DeliveryAddress {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  governorate: string;
  city: string;
  street: string;
  apartment?: string;
  landmark?: string;
  postalCode?: string;
  instructions?: string;
}

export interface Order {
  orderNumber: string;
  lineItems: OrderLineItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  deliveryMethod: string;
  codFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  address: DeliveryAddress;
  estimatedDelivery: string;
  createdAt: string;
}
