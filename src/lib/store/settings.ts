import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreSettings } from "../types";
import { localJSON, storageKey } from "./storage";

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Fashion Store",
  announcements: [
    "Free islandwide delivery on orders over S$80",
    "Cash on Delivery available across Singapore",
    "New drops every Friday — don't miss out",
    "Use code WELCOME10 for 10% off your first order",
  ],
  standardShipping: 4.99,
  expressShipping: 9.99,
  freeShippingThreshold: 80,
  codEnabled: true,
  contactEmail: "hello@fashionstore.sg",
  contactPhone: "+65 6123 4567",
};

interface SettingsState {
  settings: StoreSettings;
  update: (patch: Partial<StoreSettings>) => void;
  reset: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: storageKey("settings"), storage: localJSON, version: 1 },
  ),
);
