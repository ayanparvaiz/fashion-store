"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { gsap, prefersReducedMotion, scrollVelocity } from "@/lib/motion";

/**
 * Infinite ticker whose speed (and direction) follows the visitor's scroll.
 * Content is rendered twice so the loop is seamless.
 */
export function Marquee({
  items,
  className,
  speed = 70,
  tone = "dark",
}: {
  items: string[];
  className?: string;
  speed?: number;
  tone?: "dark" | "light" | "accent";
}) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let direction = -1;
    let skew = 0;
    const tick = (_time: number, deltaMs: number) => {
      const velocity = scrollVelocity();
      if (Math.abs(velocity) > 0.5) direction = velocity > 0 ? -1 : 1;
      const half = el.scrollWidth / 2;
      x += direction * (speed + Math.min(Math.abs(velocity) * 14, 900)) * (deltaMs / 1000);
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      skew += (gsap.utils.clamp(-10, 10, -velocity * 0.6) - skew) * 0.1;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed]);

  const row = (hidden: boolean) =>
    items.map((item, i) => (
      <span key={`${hidden}-${i}`} aria-hidden={hidden || undefined} className="flex items-center">
        <span
          className={cn(
            "px-6 font-display text-5xl whitespace-nowrap uppercase sm:text-7xl lg:text-8xl",
            i % 2 === 1 && "text-transparent [-webkit-text-stroke:1.5px_currentColor]",
          )}
        >
          {item}
        </span>
        <span className="text-3xl text-accent sm:text-5xl" aria-hidden>
          ✦
        </span>
      </span>
    ));

  return (
    <div
      className={cn(
        "overflow-hidden py-6 sm:py-8",
        tone === "dark" && "bg-ink text-paper",
        tone === "light" && "bg-paper text-ink",
        tone === "accent" && "bg-accent text-paper",
        className,
      )}
    >
      <div ref={track} className="flex w-max will-change-transform">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
