export type Gender = "women" | "men";

export type CategorySlug =
  | "dresses"
  | "tops"
  | "jeans"
  | "hoodies"
  | "jackets"
  | "t-shirts"
  | "shirts"
  | "pants";

export interface ProductImage {
  /** Unsplash photo id (seed catalog). */
  id?: string;
  /** Direct URL or data URL (products created in the admin panel). */
  src?: string;
  /** Vertical focal point (0–1) used for detail crops. */
  focusY: number;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  gender: Gender;
  category: CategorySlug;
  price: number;
  compareAtPrice: number | null;
  color: { name: string; hex: string };
  sizes: string[];
  stock: Record<string, number>;
  image: ProductImage;
  description: string;
  features: string[];
  material: string;
  care: string[];
  rating: number;
  reviewCount: number;
  sold: number;
  isNew: boolean;
  isBestseller: boolean;
  createdAt: string;
  status?: "active" | "draft";
}

export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderLine {
  productId: string;
  name: string;
  slug: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  address: string;
  unit: string;
  postalCode: string;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string; note?: string }[];
  email: string;
  phone: string;
  shippingAddress: Address;
  shippingMethod: "standard" | "express";
  paymentMethod: "cod";
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  discountCode: string | null;
  shipping: number;
  total: number;
  note?: string;
  /** Seeded demo orders are flagged so the admin can tell them apart. */
  demo?: boolean;
}

export interface DiscountCode {
  code: string;
  type: "percent" | "fixed" | "shipping";
  value: number;
  minSubtotal: number;
  active: boolean;
  description: string;
  uses: number;
}

export interface StoreSettings {
  storeName: string;
  announcements: string[];
  standardShipping: number;
  expressShipping: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  contactEmail: string;
  contactPhone: string;
}
