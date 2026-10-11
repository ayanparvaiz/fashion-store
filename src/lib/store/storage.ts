import { createJSONStorage } from "zustand/middleware";

/** All persisted stores share a prefix so "reset demo data" can clear them. */
export const STORAGE_PREFIX = "fashion-store:";

export const localJSON = createJSONStorage(() => localStorage);
export const sessionJSON = createJSONStorage(() => sessionStorage);

export function storageKey(name: string): string {
  return `${STORAGE_PREFIX}${name}`;
}
