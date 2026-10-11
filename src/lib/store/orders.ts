import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateDemoOrders } from "../demo-orders";
import type { Order, OrderStatus } from "../types";
import { localJSON, storageKey } from "./storage";

interface OrdersState {
  orders: Order[];
  seeded: boolean;
  ensureSeeded: () => void;
  add: (order: Order) => void;
  setStatus: (id: string, status: OrderStatus, note?: string) => void;
  reset: () => void;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      seeded: false,
      // Demo orders are generated in the browser so their dates are relative to today.
      ensureSeeded: () => {
        if (get().seeded) return;
        set((s) => ({ orders: [...s.orders, ...generateDemoOrders()], seeded: true }));
      },
      add: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      setStatus: (id, status, note) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  history: [...o.history, { status, at: new Date().toISOString(), note }],
                }
              : o,
          ),
        })),
      reset: () => set({ orders: generateDemoOrders(), seeded: true }),
    }),
    { name: storageKey("orders"), storage: localJSON, version: 1 },
  ),
);

export function nextOrderNumber(orders: Order[]): string {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.number.replace(/\D/g, "")) || 0), 10200);
  return `FS${max + 1}`;
}
