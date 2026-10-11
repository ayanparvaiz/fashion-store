"use client";

import { ArrowDown, MoveHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { productHref, productImage, seedProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { collectionHref } from "@/lib/collections";
import { formatPrice } from "@/lib/format";
import { SplitText, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { useUI } from "@/lib/store/ui";
import { LinkButton } from "@/components/ui/button";
import { SmartImage as Image } from "@/components/ui/smart-image";

const RingScene = dynamic(() => import("./ring-scene"), { ssr: false });

// Hand-picked for a colourful, balanced ring (women + men, every category).
const RING_IDS = [
  "fs-003", "fs-092", "fs-044", "fs-053", "fs-015", "fs-091", "fs-041",
  "fs-071", "fs-006", "fs-093", "fs-037", "fs-061", "fs-050", "fs-004",
];

const byId = new Map(seedProducts.map((p) => [p.id, p]));

function useWebGL(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (prefersReducedMotion()) return false;
      try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
      } catch {
        return false;
      }
    },
    () => null,
  );
}

export function Hero3D() {
  const router = useRouter();
  const intro = useUI((s) => s.introDone);
  const webgl = useWebGL();
  const section = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(true);

  const products = useMemo(() => RING_IDS.map((id) => byId.get(id)!).filter(Boolean), []);
  const items = useMemo(
    () => products.map((p) => ({ id: p.id, texture: `${productImage(p)}&w=560&q=72&fm=jpg` })),
    [products],
  );

  // Stop rendering the WebGL scene when the hero is off screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Headline entrance once the intro curtain lifts.
  useGSAP(
    () => {
      if (!intro || prefersReducedMotion()) return;
      const split = SplitText.create("[data-hero-title]", { type: "lines,words", mask: "lines" });
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-hero-bg] span", { yPercent: 100, opacity: 0, duration: 1.6, stagger: 0.12 })
        .from(split.lines, { yPercent: 110, duration: 1.2, stagger: 0.1 }, 0.25)
        .from("[data-hero-fade]", { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.6);
      return () => split.revert();
    },
    { scope: section, dependencies: [intro] },
  );

  const active = hovered !== null ? products[hovered] : null;

  return (
    <section
      ref={section}
      aria-label="New season collection"
      // Fill the first screen below the sticky header (≈100px mobile, ≈152px desktop).
      className="relative h-[calc(100svh-100px)] min-h-[560px] overflow-hidden bg-ink text-paper lg:h-[calc(100svh-152px)] lg:min-h-[640px]"
    >
      {/* Giant outlined type sits behind the ring for depth. */}
      <div
        data-hero-bg
        aria-hidden
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-display leading-[0.78] tracking-tight select-none"
      >
        <span className="block text-[24vw] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.22)] sm:text-[19vw]">
          NEW
        </span>
        <span className="block text-[24vw] text-paper/[0.06] sm:text-[19vw]">SEASON</span>
      </div>

      <div className="absolute inset-0" data-cursor="drag">
        {webgl ? (
          <RingScene
            items={items}
            intro={intro}
            active={visible}
            onHover={setHovered}
            onSelect={(i) => router.push(productHref(products[i]))}
          />
        ) : webgl === false ? (
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center gap-3 px-4">
            {products.slice(0, 5).map((p, i) => (
              <div
                key={p.id}
                className={cn("relative aspect-[3/4] w-[28vw] max-w-56 overflow-hidden", i % 2 ? "translate-y-6" : "-translate-y-6", i > 2 && "hidden sm:block")}
              >
                <Image src={productImage(p)} alt="" fill sizes="20vw" className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Scrim so the copy stays readable over the ring. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/70 to-transparent"
      />

      {/* Foreground copy */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between">
        <div className="container-page flex justify-between pt-6 text-[11px] font-semibold tracking-[0.2em] text-paper/70 uppercase">
          <span data-hero-fade>SS26 · New season drop</span>
          <span data-hero-fade className="hidden sm:inline">492 styles · Singapore</span>
        </div>

        <div className="container-page grid gap-6 pb-8 sm:pb-10 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="pointer-events-auto max-w-md">
            <h1 data-hero-title className="heading-display text-4xl leading-[0.92] sm:text-6xl">
              Main character energy
            </h1>
            <p data-hero-fade className="mt-4 max-w-sm text-sm text-paper/75">
              Bold colour, sharp tailoring and statement fits for women and men. Drag the ring to explore.
            </p>
            <div data-hero-fade className="mt-6 flex flex-wrap gap-3">
              <LinkButton href={collectionHref("women")} variant="inverse" size="lg">
                Shop Women
              </LinkButton>
              <LinkButton
                href={collectionHref("men")}
                variant="outline"
                size="lg"
                className="border-paper text-paper hover:bg-paper hover:text-ink"
              >
                Shop Men
              </LinkButton>
            </div>
          </div>

          <p
            data-hero-fade
            className="hidden items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-paper/60 uppercase lg:flex"
          >
            <MoveHorizontal className="size-4" /> Drag to explore
          </p>

          <div className="hidden min-h-24 justify-end lg:flex">
            <div
              className={cn(
                "w-64 border border-paper/15 bg-ink/60 p-4 backdrop-blur transition-all duration-500",
                active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              aria-live="polite"
            >
              {active && (
                <>
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-paper/50 uppercase">Click to view</p>
                  <p className="mt-1 text-sm font-medium">{active.name}</p>
                  <p className="text-sm text-paper/70">{formatPrice(active.price)}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <a
        href="#shop-categories"
        aria-label="Scroll to categories"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce text-paper/70 sm:block lg:hidden"
      >
        <ArrowDown className="size-5" />
      </a>
    </section>
  );
}
