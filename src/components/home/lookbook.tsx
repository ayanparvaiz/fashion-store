"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useMemo, useRef } from "react";
import { lookbookPhotos, photoUrl, productImage, seedProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { useUI } from "@/lib/store/ui";
import type { CategorySlug, Gender, Product } from "@/lib/types";
import { SmartImage as Image } from "@/components/ui/smart-image";

interface Look {
  title: string;
  note: string;
  /** Lookbook editorial photo index, or omit to use the first product's photo. */
  photo?: number;
  shop: [Gender, CategorySlug][];
  wide?: boolean;
}

const LOOKS: Look[] = [
  { title: "After Hours", note: "Sequins, satin and a sharp shoulder.", photo: 2, shop: [["women", "dresses"], ["women", "jackets"]], wide: true },
  { title: "Denim Theory", note: "Double denim, done right.", shop: [["women", "denim-jackets"], ["women", "jeans"]] },
  { title: "Street Uniform", note: "Heavyweight layers for city nights.", shop: [["men", "hoodies"], ["men", "pants"]] },
  { title: "Soft Power", note: "Knits you'll live in all season.", shop: [["women", "knitwear"], ["women", "skirts"]] },
  { title: "Resort Mode", note: "Linen, light and made for the heat.", shop: [["men", "shirts"], ["men", "shorts"]] },
  { title: "Studio Classic", note: "Clean lines, quiet confidence.", photo: 0, shop: [["women", "tops"], ["men", "polos"]], wide: true },
];

function pick(gender: Gender, category: CategorySlug, offset: number): Product | undefined {
  const items = seedProducts.filter((p) => p.gender === gender && p.category === category);
  return items[(offset * 3) % Math.max(1, items.length)];
}

export function Lookbook() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const openQuickView = useUI((s) => s.openQuickView);

  const looks = useMemo(
    () =>
      LOOKS.map((look, i) => {
        const products = look.shop.map(([g, c]) => pick(g, c, i)).filter((p): p is Product => !!p);
        const image =
          look.photo !== undefined && lookbookPhotos[look.photo]
            ? photoUrl(lookbookPhotos[look.photo])
            : productImage(products[0]);
        return { ...look, products, image };
      }),
    [],
  );

  // Desktop: pin the section and translate the track horizontally with scroll.
  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        // Each photo drifts inside its frame for depth.
        gsap.utils.toArray<HTMLElement>("[data-look-img]").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
        return () => ScrollTrigger.refresh();
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-label="SS26 Lookbook" className="overflow-hidden bg-ink text-paper">
      <div
        ref={track}
        className="no-scrollbar flex h-auto snap-x snap-mandatory gap-4 overflow-x-auto px-4 py-16 lg:h-[100svh] lg:snap-none lg:items-center lg:gap-8 lg:overflow-visible lg:px-10 lg:py-0"
      >
        <div className="flex w-[80vw] shrink-0 snap-start flex-col justify-center sm:w-[50vw] lg:w-[32vw]">
          <p className="eyebrow text-accent">The SS26 lookbook</p>
          <h2 className="heading-display mt-4 text-5xl leading-[0.9] lg:text-8xl">
            Six looks.
            <br />
            Zero rules.
          </h2>
          <p className="mt-6 max-w-sm text-sm text-paper/70">
            Styled by our Singapore studio. Tap a product to see it up close and add it to your bag.
          </p>
          <p className="mt-10 hidden items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-paper/60 uppercase lg:flex">
            Keep scrolling <ArrowRight className="size-4" />
          </p>
        </div>

        {looks.map((look, i) => (
          <article
            key={look.title}
            className={cn(
              "relative shrink-0 snap-start",
              look.wide ? "w-[85vw] sm:w-[70vw] lg:w-[62vw]" : "w-[70vw] sm:w-[45vw] lg:w-[30vw]",
            )}
          >
            <div className={cn("relative overflow-hidden", look.wide ? "aspect-[4/3] lg:aspect-[16/10]" : "aspect-[3/4]")}>
              <div data-look-img className="absolute inset-[-8%]">
                <Image src={look.image} alt="" fill sizes="(min-width: 1024px) 62vw, 85vw" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 font-display text-6xl text-paper/90 lg:text-8xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                {look.products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openQuickView(p.id)}
                    className="group flex items-center gap-2 bg-paper/95 py-1.5 pr-3 pl-1.5 text-left text-ink backdrop-blur transition hover:bg-paper"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden bg-soft">
                      <Image src={productImage(p)} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-36 truncate text-xs font-medium">{p.name}</span>
                      <span className="block text-xs text-muted">{formatPrice(p.price)}</span>
                    </span>
                    <Plus className="size-4 transition-transform group-hover:rotate-90" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <h3 className="font-display text-2xl uppercase lg:text-3xl">{look.title}</h3>
              <p className="text-sm text-paper/60">{look.note}</p>
            </div>
          </article>
        ))}
        <div className="w-4 shrink-0 lg:w-10" aria-hidden />
      </div>
    </section>
  );
}
