import type { CategorySlug, Product } from "./types";

export const COLOR_FAMILIES = [
  { name: "Black", hex: "#111111", match: ["black", "charcoal"] },
  { name: "White", hex: "#ffffff", match: ["white", "chalk", "ecru"] },
  { name: "Neutral", hex: "#d9c8ad", match: ["cream", "beige", "oatmeal", "stone", "sand", "khaki", "butter", "tan"] },
  { name: "Grey", hex: "#9ca3af", match: ["grey", "gray"] },
  { name: "Blue", hex: "#3b5b8f", match: ["blue", "wash", "navy", "cornflower"] },
  { name: "Red", hex: "#c8202e", match: ["red", "cherry", "scarlet"] },
  { name: "Pink", hex: "#e8a3b5", match: ["pink", "blush"] },
  { name: "Purple", hex: "#a58fd3", match: ["lilac", "lavender"] },
  { name: "Green", hex: "#4b6b4f", match: ["sage", "emerald", "forest", "olive", "pine"] },
  { name: "Brown", hex: "#6b4a33", match: ["brown", "espresso", "leopard", "rust", "terracotta"] },
  { name: "Orange & Yellow", hex: "#e8892c", match: ["orange", "mustard"] },
] as const;

export type ColorFamily = (typeof COLOR_FAMILIES)[number]["name"];

export function colorFamily(colorName: string): ColorFamily | null {
  const name = colorName.toLowerCase();
  return COLOR_FAMILIES.find((f) => f.match.some((m) => name.includes(m)))?.name ?? null;
}

export const PRICE_RANGES = [
  { id: "under-30", label: "Under S$30", min: 0, max: 30 },
  { id: "30-50", label: "S$30 – S$50", min: 30, max: 50 },
  { id: "50-80", label: "S$50 – S$80", min: 50, max: 80 },
  { id: "80-120", label: "S$80 – S$120", min: 80, max: 120 },
  { id: "120-plus", label: "S$120+", min: 120, max: Infinity },
] as const;

export interface FilterState {
  categories: CategorySlug[];
  sizes: string[];
  colors: ColorFamily[];
  prices: string[];
  inStock: boolean;
  onSale: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  categories: [],
  sizes: [],
  colors: [],
  prices: [],
  inStock: false,
  onSale: false,
};

export function countActiveFilters(f: FilterState): number {
  return (
    f.categories.length +
    f.sizes.length +
    f.colors.length +
    f.prices.length +
    Number(f.inStock) +
    Number(f.onSale)
  );
}

export function applyFilters(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.sizes.length && !f.sizes.some((s) => (p.stock[s] ?? 0) > 0)) return false;
    if (f.colors.length) {
      const family = colorFamily(p.color.name);
      if (!family || !f.colors.includes(family)) return false;
    }
    if (f.prices.length) {
      const inRange = PRICE_RANGES.filter((r) => f.prices.includes(r.id)).some(
        (r) => p.price >= r.min && p.price < r.max,
      );
      if (!inRange) return false;
    }
    if (f.inStock && Object.values(p.stock).every((n) => n === 0)) return false;
    if (f.onSale && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false;
    return true;
  });
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return Number(a) - Number(b);
  });
}
