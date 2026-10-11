import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "../types";
import { localJSON, sessionJSON, storageKey } from "./storage";

/**
 * Demo-only authentication. Accounts live in this browser's storage and
 * passwords are hashed with SHA-256 so they are never stored in plain text.
 * Swap for Firebase Auth when the backend is added.
 */

export interface Customer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
  address?: Address;
  createdAt: string;
}

async function sha256(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Result = { ok: true } | { ok: false; error: string };

interface AccountState {
  customers: Customer[];
  currentEmail: string | null;
  register: (input: Omit<Customer, "passwordHash" | "createdAt"> & { password: string }) => Promise<Result>;
  login: (email: string, password: string) => Promise<Result>;
  logout: () => void;
  updateProfile: (patch: Partial<Omit<Customer, "email" | "passwordHash">>) => void;
}

export const useAccount = create<AccountState>()(
  persist(
    (set, get) => ({
      customers: [],
      currentEmail: null,
      register: async ({ password, ...input }) => {
        const email = input.email.trim().toLowerCase();
        if (get().customers.some((c) => c.email === email)) {
          return { ok: false, error: "An account with this email already exists." };
        }
        const customer: Customer = {
          ...input,
          email,
          passwordHash: await sha256(password),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ customers: [...s.customers, customer], currentEmail: email }));
        return { ok: true };
      },
      login: async (rawEmail, password) => {
        const email = rawEmail.trim().toLowerCase();
        const customer = get().customers.find((c) => c.email === email);
        if (!customer || customer.passwordHash !== (await sha256(password))) {
          return { ok: false, error: "Incorrect email or password." };
        }
        set({ currentEmail: email });
        return { ok: true };
      },
      logout: () => set({ currentEmail: null }),
      updateProfile: (patch) =>
        set((s) => ({
          customers: s.customers.map((c) => (c.email === s.currentEmail ? { ...c, ...patch } : c)),
        })),
    }),
    { name: storageKey("account"), storage: localJSON, version: 1 },
  ),
);

export function useCurrentCustomer(): Customer | null {
  return useAccount((s) => s.customers.find((c) => c.email === s.currentEmail) ?? null);
}

/** Demo admin credentials — shown on the admin login screen. */
export const DEMO_ADMIN = { email: "admin@fashionstore.sg", password: "admin123" };

interface AdminSessionState {
  email: string | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAdminSession = create<AdminSessionState>()(
  persist(
    (set) => ({
      email: null,
      login: (email, password) => {
        const ok =
          email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
        if (ok) set({ email: DEMO_ADMIN.email });
        return ok;
      },
      logout: () => set({ email: null }),
    }),
    { name: storageKey("admin-session"), storage: sessionJSON, version: 1 },
  ),
);
