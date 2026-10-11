import productsJson from "@/data/products.json";
import mediaJson from "@/data/media.json";
import type { CategorySlug, Gender, Product } from "./types";

/** Seed catalog shipped with the build. Admin edits are layered on top at runtime. */
export const seedProducts = productsJson as unknown as Product[];

type Photo = (typeof mediaJson.photos)[keyof typeof mediaJson.photos];
const photos = mediaJson.photos as Record<string, Photo>;
export const banners = mediaJson.banners as Record<string, string>;

export const CATEGORIES: Record<CategorySlug, { label: string; singular: string }> = {
  dresses: { label: "Dresses", singular: "Dress" },
  tops: { label: "Tops", singular: "Top" },
  jeans: { label: "Jeans", singular: "Jeans" },
  hoodies: { label: "Hoodies", singular: "Hoodie" },
  jackets: { label: "Jackets & Coats", singular: "Jacket" },
  "t-shirts": { label: "T-Shirts", singular: "T-Shirt" },
  shirts: { label: "Shirts", singular: "Shirt" },
  pants: { label: "Pants", singular: "Pants" },
};

export const GENDER_CATEGORIES: Record<Gender, CategorySlug[]> = {
  women: ["dresses", "tops", "jeans", "hoodies", "jackets"],
  men: ["t-shirts", "shirts", "hoodies", "pants", "jackets"],
};

export function getPhoto(id: string) {
  return photos[id];
}

export function photoUrl(id: string, params = "") {
  const photo = photos[id];
  return photo ? `${photo.src}${params}` : "";
}

export type ImageView = "main" | "detail" | "close";

/**
 * Product image URL for a given view. Seed products use one Unsplash photo
 * and derive extra gallery views from focal-point crops of it.
 */
export function productImage(product: Product, view: ImageView = "main"): string {
  const { id, src, focusY } = product.image;
  if (!id) return src ?? "";
  const base = "&fit=crop&ar=3:4";
  if (view === "main") return photoUrl(id, base);
  const zoom = view === "detail" ? 1.6 : 2.6;
  const y = view === "detail" ? focusY : Math.min(focusY + 0.08, 0.9);
  return photoUrl(id, `${base}&crop=focalpoint&fp-x=0.5&fp-y=${y}&fp-z=${zoom}`);
}

export function productGallery(product: Product): string[] {
  if (!product.image.id) return [productImage(product)];
  return (["main", "detail", "close"] as const).map((v) => productImage(product, v));
}

export function productAlt(product: Product): string {
  return `${product.name} in ${product.color.name}`;
}

export function totalStock(product: Product): number {
  return Object.values(product.stock).reduce((sum, n) => sum + n, 0);
}

export function isLowStock(product: Product): boolean {
  const total = totalStock(product);
  return total > 0 && total <= 10;
}

export function productHref(product: Pick<Product, "slug">): string {
  return `/products/${product.slug}/`;
}

export function genderLabel(gender: Gender): string {
  return gender === "women" ? "Women" : "Men";
}

export function categoryLabel(product: Pick<Product, "gender" | "category">): string {
  return `${genderLabel(product.gender)}'s ${CATEGORIES[product.category].label}`;
}
