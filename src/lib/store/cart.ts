import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types";
import { localJSON, storageKey } from "./storage";

export const MAX_QTY_PER_LINE = 10;

interface CartState {
  items: CartItem[];
  discountCode: string | null;
  add: (item: CartItem) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  remove: (productId: string, size: string) => void;
  applyDiscount: (code: string | null) => void;
  clear: () => void;
}

const same = (a: CartItem, productId: string, size: string) =>
  a.productId === productId && a.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      discountCode: null,
      add: ({ productId, size, quantity }) =>
        set((s) => {
          const existing = s.items.find((i) => same(i, productId, size));
          if (!existing) return { items: [...s.items, { productId, size, quantity }] };
          return {
            items: s.items.map((i) =>
              same(i, productId, size)
                ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, i.quantity + quantity) }
                : i,
            ),
          };
        }),
      setQuantity: (productId, size, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => !same(i, productId, size))
              : s.items.map((i) =>
                  same(i, productId, size)
                    ? { ...i, quantity: Math.min(MAX_QTY_PER_LINE, quantity) }
                    : i,
                ),
        })),
      remove: (productId, size) =>
        set((s) => ({ items: s.items.filter((i) => !same(i, productId, size)) })),
      applyDiscount: (code) => set({ discountCode: code }),
      clear: () => set({ items: [], discountCode: null }),
    }),
    { name: storageKey("cart"), storage: localJSON, version: 1 },
  ),
);

export function useCartCount(): number {
  return useCart((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
}
