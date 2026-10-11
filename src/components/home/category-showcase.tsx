"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CATEGORIES, genderLabel, productImage, seedProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { categoryHref } from "@/lib/collections";
import { gsap } from "@/lib/motion";
import type { CategorySlug, Gender } from "@/lib/types";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { SectionHeading } from "./section-heading";

const ROWS: { gender: Gender; category: CategorySlug; label?: string }[] = [
  { gender: "women", category: "dresses" },
  { gender: "men", category: "denim-jackets" },
  { gender: "women", category: "knitwear" },
  { gender: "men", category: "t-shirts", label: "Graphic Tees" },
  { gender: "women", category: "skirts" },
  { gender: "men", category: "hoodies" },
  { gender: "women", category: "activewear" },
  { gender: "men", category: "jackets", label: "Outerwear" },
];

/**
 * Editorial category index: oversized type rows, with a product photo that
 * follows the cursor on desktop and a thumbnail on touch screens.
 */
export function CategoryShowcase() {
  const list = useRef<HTMLDivElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const rows = useMemo(
    () =>
      ROWS.map((row) => {
        const items = seedProducts.filter((p) => p.gender === row.gender && p.category === row.category);
        const hero = items.find((p) => p.isBestseller) ?? items[0];
        return { ...row, count: items.length, image: hero ? productImage(hero) : "" };
      }),
    [],
  );

  const follow = (e: React.PointerEvent) => {
    const box = list.current?.getBoundingClientRect();
    if (!box || !preview.current) return;
    gsap.to(preview.current, {
      x: e.clientX - box.left,
      y: e.clientY - box.top,
      duration: 0.6,
      ease: "power3.out",
      overwrite: "auto",
    });
  };

  return (
    <section id="shop-categories" className="container-page scroll-mt-32 py-16 lg:py-24">
      <SectionHeading eyebrow="Find your fit" title="Shop by category" />
      <div ref={list} className="relative" onPointerMove={follow} onPointerLeave={() => setActive(null)}>
        <ul className="border-t border-ink/15">
          {rows.map((row, i) => (
            <li key={`${row.gender}-${row.category}`}>
              <Link
                href={categoryHref(row.gender, row.category)}
                onPointerEnter={() => setActive(i)}
                data-cursor="view"
                className="group relative z-10 grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-ink/15 py-4 sm:grid-cols-[3rem_1fr_auto] lg:py-6"
              >
                <span className="text-xs text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex flex-wrap items-baseline gap-x-4">
                  <span className="font-display text-3xl uppercase transition-[transform,color] duration-500 ease-out group-hover:translate-x-3 group-hover:text-accent sm:text-5xl lg:text-7xl">
                    {row.label ?? CATEGORIES[row.category].label}
                  </span>
                  <span className="text-[11px] font-semibold tracking-[0.2em] text-muted uppercase">
                    {genderLabel(row.gender)}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="relative size-14 overflow-hidden rounded-full bg-soft lg:hidden">
                    <Image src={row.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="hidden text-sm text-muted sm:inline">{row.count} styles</span>
                  <ArrowUpRight className="size-5 transition-transform duration-500 group-hover:rotate-45 lg:size-7" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Floating preview (desktop pointers only) */}
        <div
          ref={preview}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-20 hidden lg:pointer-fine:block"
        >
          <div
            className={cn(
              "relative -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out",
              active === null ? "scale-50 opacity-0" : "scale-100 opacity-100",
            )}
          >
            {rows.map((row, i) => (
              <div
                key={row.category + row.gender}
                className={cn(
                  "absolute top-0 left-0 h-[22rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-[clip-path] duration-700 ease-[cubic-bezier(.7,0,.2,1)]",
                  active === i ? "[clip-path:inset(0%)]" : "[clip-path:inset(100%_0%_0%_0%)]",
                )}
              >
                <Image src={row.image} alt="" fill sizes="272px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
