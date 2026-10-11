"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion } from "@/lib/motion";

const LABELS: Record<string, string> = { view: "View", drag: "Drag", shop: "Shop" };
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function useFinePointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(FINE_POINTER);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(FINE_POINTER).matches && !prefersReducedMotion(),
    () => false,
  );
}

/**
 * A soft follower ring for mouse users. Elements with data-cursor="view|drag|shop"
 * grow it into a labelled disc. The native cursor stays visible.
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [hot, setHot] = useState(false);
  const enabled = useFinePointer();

  useEffect(() => {
    const el = ring.current;
    if (!enabled || !el) return;
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x(e.clientX);
      y(e.clientY);
      el.style.opacity = "1";
    };
    const over = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const tagged = target?.closest<HTMLElement>("[data-cursor]");
      setLabel(tagged ? (LABELS[tagged.dataset.cursor ?? ""] ?? null) : null);
      setHot(Boolean(target?.closest("a, button, [role=button], input, select, textarea, label")));
    };
    const leave = () => (el.style.opacity = "0");
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[90] opacity-0 mix-blend-difference transition-opacity duration-300"
    >
      <div
        className={cn(
          "grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white text-[10px] font-bold tracking-[0.18em] text-black uppercase transition-all duration-300 ease-out",
          label ? "size-20 bg-white" : hot ? "size-12 bg-white/0" : "size-7 bg-white/0",
        )}
      >
        {label && <span className="animate-fade-in">{label}</span>}
      </div>
    </div>
  );
}
