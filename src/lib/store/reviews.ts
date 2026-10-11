import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Review } from "../reviews";
import { localJSON, storageKey } from "./storage";

/** Reviews written by shoppers in this browser (moves to Firestore later). */
interface ReviewsState {
  byProduct: Record<string, Review[]>;
  add: (productId: string, review: Review) => void;
}

export const useReviews = create<ReviewsState>()(
  persist(
    (set) => ({
      byProduct: {},
      add: (productId, review) =>
        set((s) => ({
          byProduct: { ...s.byProduct, [productId]: [review, ...(s.byProduct[productId] ?? [])] },
        })),
    }),
    { name: storageKey("reviews"), storage: localJSON, version: 1 },
  ),
);
