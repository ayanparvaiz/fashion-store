import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiscountCode } from "../types";
import { localJSON, storageKey } from "./storage";

export const DEFAULT_DISCOUNTS: DiscountCode[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minSubtotal: 0,
    active: true,
    description: "10% off your first order",
    uses: 184,
  },
  {
    code: "STYLE20",
    type: "percent",
    value: 20,
    minSubtotal: 120,
    active: true,
    description: "20% off orders over S$120",
    uses: 62,
  },
  {
    code: "SAVE15",
    type: "fixed",
    value: 15,
    minSubtotal: 100,
    active: true,
    description: "S$15 off orders over S$100",
    uses: 41,
  },
  {
    code: "FLASH10",
    type: "percent",
    value: 10,
    minSubtotal: 0,
    active: true,
    description: "Flash sale: extra 10% off, today only",
    uses: 23,
  },
  {
    code: "FREESHIP",
    type: "shipping",
    value: 0,
    minSubtotal: 0,
    active: true,
    description: "Free standard delivery",
    uses: 97,
  },
];

interface DiscountState {
  codes: DiscountCode[];
  upsert: (code: DiscountCode) => void;
  remove: (code: string) => void;
  recordUse: (code: string) => void;
  reset: () => void;
}

export const useDiscounts = create<DiscountState>()(
  persist(
    (set) => ({
      codes: DEFAULT_DISCOUNTS,
      upsert: (code) =>
        set((s) => ({
          codes: s.codes.some((c) => c.code === code.code)
            ? s.codes.map((c) => (c.code === code.code ? code : c))
            : [code, ...s.codes],
        })),
      remove: (code) => set((s) => ({ codes: s.codes.filter((c) => c.code !== code) })),
      recordUse: (code) =>
        set((s) => ({
          codes: s.codes.map((c) => (c.code === code ? { ...c, uses: c.uses + 1 } : c)),
        })),
      reset: () => set({ codes: DEFAULT_DISCOUNTS }),
    }),
    {
      name: storageKey("discounts"),
      storage: localJSON,
      version: 2,
      // v2 adds the FLASH10 code for browsers that saved v1 codes.
      migrate: (persisted, version) => {
        const state = persisted as Pick<DiscountState, "codes">;
        if (version < 2 && !state.codes.some((c) => c.code === "FLASH10")) {
          state.codes = [...state.codes, DEFAULT_DISCOUNTS.find((c) => c.code === "FLASH10")!];
        }
        return state as DiscountState;
      },
    },
  ),
);
