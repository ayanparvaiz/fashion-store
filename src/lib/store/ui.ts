import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  tone?: "default" | "success" | "error";
}

/** Ephemeral UI state (not persisted). */
interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  toasts: Toast[];
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useUI = create<UIState>()((set, get) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  toasts: [],
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toast: (message, tone = "default") => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, tone }].slice(-3) });
    setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
