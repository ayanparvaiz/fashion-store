import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during prerender and hydration, true afterwards. Use it to gate UI
 * that depends on browser-only state (localStorage, session) without
 * causing hydration mismatches.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
