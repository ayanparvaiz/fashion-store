import { CATEGORIES, genderLabel } from "./catalog";
import type { CategorySlug, Product } from "./types";

const SYNONYMS: Record<CategorySlug, string> = {
  dresses: "dress frock",
  tops: "top crop cami tank blouse",
  skirts: "skirt",
  jeans: "denim jean",
  shorts: "short",
  hoodies: "hoodie sweatshirt sweat fleece",
  knitwear: "knit knitwear sweater jumper cardigan",
  "denim-jackets": "denim jacket jean outerwear trucker",
  jackets: "jacket coat outerwear blazer bomber puffer",
  activewear: "activewear gym sport leggings workout",
  "t-shirts": "tee tshirt t-shirt graphic",
  shirts: "shirt button-up linen flannel",
  polos: "polo",
  pants: "pant trouser chino jogger cargo bottoms",
};

function words(p: Product): string[] {
  const category = CATEGORIES[p.category];
  return [
    p.name,
    p.color.name,
    category.label,
    category.singular,
    genderLabel(p.gender),
    p.gender === "women" ? "womens ladies" : "mens guys",
    SYNONYMS[p.category],
    p.material,
    p.isNew ? "new" : "",
    p.compareAtPrice ? "sale" : "",
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function stem(term: string): string {
  if (term.endsWith("sses")) return term.slice(0, -2);
  if (term.length > 3 && term.endsWith("s") && !term.endsWith("ss")) return term.slice(0, -1);
  return term;
}

/**
 * Simple ranked keyword search: every term must prefix-match a word
 * (so "men" never matches "women"); name hits rank higher.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .map(stem);
  if (terms.length === 0) return [];

  return products
    .map((p) => {
      const all = words(p);
      const name = p.name.toLowerCase();
      if (!terms.every((t) => all.some((w) => w.startsWith(t)))) return null;
      const score = terms.reduce((s, t) => s + (name.includes(t) ? 3 : 1), 0) + p.sold / 1000;
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export const POPULAR_SEARCHES = ["Dresses", "Hoodies", "Denim", "Blazer", "Graphic tee", "Linen", "Leather jacket"];
