import { CATEGORIES, GENDER_CATEGORIES, genderLabel } from "./catalog";
import type { CategorySlug, Gender, Product } from "./types";

export interface Collection {
  handle: string;
  title: string;
  description: string;
  filter: (product: Product) => boolean;
  gender?: Gender;
  category?: CategorySlug;
}

const base: Collection[] = [
  {
    handle: "all",
    title: "Shop All",
    description: "Every style, every drop — the full Fashion Store edit.",
    filter: () => true,
  },
  {
    handle: "new-arrivals",
    title: "New Arrivals",
    description: "Fresh drops every week. Be the first to wear what's next.",
    filter: (p) => p.isNew,
  },
  {
    handle: "bestsellers",
    title: "Bestsellers",
    description: "The styles everyone's adding to bag right now.",
    filter: (p) => p.isBestseller,
  },
  {
    handle: "sale",
    title: "Sale",
    description: "Major markdowns on styles you'll love. Limited stock — move fast.",
    filter: (p) => p.compareAtPrice !== null && p.compareAtPrice > p.price,
  },
  {
    handle: "women",
    title: "Women",
    description: "Dresses, denim, tops and outerwear made for every main-character moment.",
    filter: (p) => p.gender === "women",
    gender: "women",
  },
  {
    handle: "men",
    title: "Men",
    description: "Elevated streetwear essentials, from heavyweight tees to statement jackets.",
    filter: (p) => p.gender === "men",
    gender: "men",
  },
];

const categoryCollections: Collection[] = (Object.keys(GENDER_CATEGORIES) as Gender[]).flatMap(
  (gender) =>
    GENDER_CATEGORIES[gender].map((category) => ({
      handle: `${gender}-${category}`,
      title: `${genderLabel(gender)}'s ${CATEGORIES[category].label}`,
      description: `Shop ${genderLabel(gender).toLowerCase()}'s ${CATEGORIES[category].label.toLowerCase()} — new styles added weekly.`,
      filter: (p: Product) => p.gender === gender && p.category === category,
      gender,
      category,
    })),
);

export const COLLECTIONS: Collection[] = [...base, ...categoryCollections];

export function getCollection(handle: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.handle === handle);
}

export function categoryHref(gender: Gender, category: CategorySlug): string {
  return `/collections/${gender}-${category}/`;
}

export function collectionHref(handle: string): string {
  return `/collections/${handle}/`;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "bestselling" | "rating";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "bestselling", label: "Best Selling" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const list = [...products];
  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "bestselling":
      return list.sort((a, b) => b.sold - a.sold);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    default:
      // Featured: new + bestsellers first, then everything else by popularity.
      return list.sort(
        (a, b) =>
          Number(b.isNew) + Number(b.isBestseller) - (Number(a.isNew) + Number(a.isBestseller)) ||
          b.sold - a.sold,
      );
  }
}
