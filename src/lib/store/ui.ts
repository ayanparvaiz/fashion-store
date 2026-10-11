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
  /** Product id shown in the Quick View modal. */
  quickViewId: string | null;
  /** Set once the intro preloader has finished (or was skipped). */
  introDone: boolean;
  toasts: Toast[];
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  openQuickView: (productId: string | null) => void;
  setIntroDone: () => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;

export const useUI = create<UIState>()((set, get) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  quickViewId: null,
  introDone: false,
  toasts: [],
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  openQuickView: (quickViewId) => set({ quickViewId }),
  setIntroDone: () => set({ introDone: true }),
  toast: (message, tone = "default") => {
    const id = ++toastId;
    set({ toasts: [...get().toasts, { id, message, tone }].slice(-3) });
    setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
