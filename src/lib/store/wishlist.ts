import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localJSON, storageKey } from "./storage";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => boolean;
  remove: (productId: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const has = get().ids.includes(productId);
        set({ ids: has ? get().ids.filter((id) => id !== productId) : [productId, ...get().ids] });
        return !has;
      },
      remove: (productId) => set((s) => ({ ids: s.ids.filter((id) => id !== productId) })),
    }),
    { name: storageKey("wishlist"), storage: localJSON, version: 1 },
  ),
);

interface RecentState {
  ids: string[];
  push: (productId: string) => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (productId) =>
        set((s) => ({ ids: [productId, ...s.ids.filter((id) => id !== productId)].slice(0, 12) })),
    }),
    { name: storageKey("recent"), storage: localJSON, version: 1 },
  ),
);
