import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedProducts } from "../catalog";
import type { Product } from "../types";
import { localJSON, storageKey } from "./storage";

/**
 * Admin changes to the catalog, layered over the seed products at runtime.
 * This is the piece to replace with Firestore reads/writes later.
 */
interface CatalogState {
  edits: Record<string, Partial<Product>>;
  created: Product[];
  deleted: string[];
  save: (product: Product) => void;
  remove: (id: string) => void;
  adjustStock: (id: string, size: string, delta: number) => void;
  reset: () => void;
}

const seedIds = new Set(seedProducts.map((p) => p.id));

export const useCatalog = create<CatalogState>()(
  persist(
    (set, get) => ({
      edits: {},
      created: [],
      deleted: [],
      save: (product) =>
        set((s) =>
          seedIds.has(product.id)
            ? { edits: { ...s.edits, [product.id]: product } }
            : {
                created: s.created.some((p) => p.id === product.id)
                  ? s.created.map((p) => (p.id === product.id ? product : p))
                  : [product, ...s.created],
              },
        ),
      remove: (id) =>
        set((s) =>
          seedIds.has(id)
            ? { deleted: [...s.deleted, id] }
            : { created: s.created.filter((p) => p.id !== id) },
        ),
      adjustStock: (id, size, delta) => {
        const product = mergeProducts(get()).find((p) => p.id === id);
        if (!product) return;
        const qty = Math.max(0, (product.stock[size] ?? 0) + delta);
        get().save({ ...product, stock: { ...product.stock, [size]: qty } });
      },
      reset: () => set({ edits: {}, created: [], deleted: [] }),
    }),
    { name: storageKey("catalog"), storage: localJSON, version: 1 },
  ),
);

type CatalogSlices = Pick<CatalogState, "edits" | "created" | "deleted">;

export function mergeProducts({ edits, created, deleted }: CatalogSlices): Product[] {
  const removed = new Set(deleted);
  const merged = seedProducts
    .filter((p) => !removed.has(p.id))
    .map((p) => (edits[p.id] ? { ...p, ...edits[p.id] } : p));
  return [...created, ...merged];
}

/** Every product including drafts (admin views). */
export function useAllProducts(): Product[] {
  const edits = useCatalog((s) => s.edits);
  const created = useCatalog((s) => s.created);
  const deleted = useCatalog((s) => s.deleted);
  return useMemo(() => mergeProducts({ edits, created, deleted }), [edits, created, deleted]);
}

/** Products visible on the storefront. */
export function useProducts(): Product[] {
  const all = useAllProducts();
  return useMemo(() => all.filter((p) => p.status !== "draft"), [all]);
}

export function useProductBySlug(slug: string): Product | undefined {
  const products = useAllProducts();
  return useMemo(() => products.find((p) => p.slug === slug), [products, slug]);
}

export function useProductMap(): Map<string, Product> {
  const products = useAllProducts();
  return useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
}
