import { create } from "zustand";
import { persist } from "zustand/middleware";
import { localJSON, storageKey } from "./storage";

export interface StockAlert {
  productId: string;
  size: string;
  email: string;
  createdAt: string;
}

/** "Notify me when it's back" requests (moves to Firestore + email later). */
interface AlertsState {
  alerts: StockAlert[];
  add: (alert: Omit<StockAlert, "createdAt">) => void;
}

export const useStockAlerts = create<AlertsState>()(
  persist(
    (set) => ({
      alerts: [],
      add: (alert) =>
        set((s) => ({
          alerts: [
            { ...alert, createdAt: new Date().toISOString() },
            ...s.alerts.filter(
              (a) => !(a.productId === alert.productId && a.size === alert.size && a.email === alert.email),
            ),
          ],
        })),
    }),
    { name: storageKey("stock-alerts"), storage: localJSON, version: 1 },
  ),
);
