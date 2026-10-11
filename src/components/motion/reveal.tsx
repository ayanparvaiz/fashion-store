"use client";

import { useRef, type ElementType, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

interface SplitRevealProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  delay?: number;
  /** Animate on scroll into view (default) or immediately on mount. */
  trigger?: "scroll" | "mount";
}

/** Heading whose lines slide up from behind a mask as it scrolls into view. */
export function SplitReveal({ as = "h2", className, children, delay = 0, trigger = "scroll" }: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);
  // Polymorphic tag; typed as a div for JSX purposes.
  const Tag = as as "div";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const split = SplitText.create(el, {
        type: "lines,words",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 115,
            rotate: 2,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.09,
            delay,
            scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 88%", once: true } : undefined,
          }),
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}

/** Children fade and rise in sequence when the group scrolls into view. */
export function FadeUp({
  children,
  className,
  stagger = 0.08,
  y = 40,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as "div";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
      gsap.from(items.length ? items : el.children, {
        y,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}

/** Image that wipes in from the bottom while settling from a slight zoom. */
export function ImageReveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      tl.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut" }).from(
        el.firstElementChild,
        { scale: 1.3, duration: 1.6, ease: "expo.out" },
        "<0.1",
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden [clip-path:inset(0%)]", className)}>
      {children}
    </div>
  );
}

/** Moves its content slower or faster than the page for depth. */
export function Parallax({
  children,
  className,
  speed = 0.15,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      gsap.fromTo(
        el.firstElementChild,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      {children}
    </div>
  );
}
