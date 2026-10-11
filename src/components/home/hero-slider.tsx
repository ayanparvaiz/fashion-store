"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { useEffect, useState } from "react";
import { banners, photoUrl } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { collectionHref } from "@/lib/collections";
import { LinkButton } from "@/components/ui/button";

const SLIDES = [
  {
    image: banners["hero-1"],
    position: "object-[50%_30%]",
    eyebrow: "New season drop",
    title: ["Main", "character", "energy"],
    text: "Bold colour, sharp tailoring and statement fits — just landed.",
    ctas: [
      { label: "Shop Women", href: collectionHref("women") },
      { label: "Shop Men", href: collectionHref("men") },
    ],
    align: "left",
  },
  {
    image: banners["hero-2"],
    position: "object-[60%_25%]",
    eyebrow: "The tailoring edit",
    title: ["Power", "dressing"],
    text: "Blazers and sleek separates from S$74.90.",
    ctas: [{ label: "Shop Jackets", href: collectionHref("women-jackets") }],
    align: "right",
  },
  {
    image: banners["hero-3"],
    position: "object-[50%_35%]",
    eyebrow: "Limited time only",
    title: ["Up to", "30% off"],
    text: "Markdowns on dresses, denim, hoodies and more. While stocks last.",
    ctas: [{ label: "Shop Sale", href: collectionHref("sale") }],
    align: "left",
  },
] as const;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6500);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (i: number) => setIndex((i + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative h-[78svh] min-h-[480px] overflow-hidden bg-ink lg:h-[82vh] lg:max-h-[860px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${SLIDES.length}`}
            aria-hidden={!active}
            inert={!active}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              active ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={photoUrl(slide.image)}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn(
                "object-cover transition-transform duration-[7000ms] ease-out",
                slide.position,
                active ? "scale-105" : "scale-100",
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                slide.align === "left"
                  ? "bg-gradient-to-r from-ink/70 via-ink/25 to-transparent"
                  : "bg-gradient-to-l from-ink/70 via-ink/25 to-transparent",
              )}
            />
            <div
              className={cn(
                "container-page relative flex h-full flex-col justify-end pb-16 lg:justify-center lg:pb-0",
                slide.align === "right" && "lg:items-end lg:text-right",
              )}
            >
              <div className={cn("max-w-xl text-paper", active && "animate-fade-in")}>
                <p className="eyebrow mb-4 text-paper/85">{slide.eyebrow}</p>
                <h2 className="heading-display text-[13vw] leading-[0.88] sm:text-7xl lg:text-[104px]">
                  {slide.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
                <p className="mt-5 max-w-md text-sm text-paper/85 sm:text-base">{slide.text}</p>
                <div
                  className={cn(
                    "mt-8 flex flex-wrap gap-3",
                    slide.align === "right" && "lg:justify-end",
                  )}
                >
                  {slide.ctas.map((cta, ci) => (
                    <LinkButton
                      key={cta.href}
                      href={cta.href}
                      variant={ci === 0 ? "inverse" : "outline"}
                      size="lg"
                      className={ci > 0 ? "border-paper text-paper hover:bg-paper hover:text-ink" : ""}
                    >
                      {cta.label}
                    </LinkButton>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="container-page absolute inset-x-0 bottom-5 flex items-center justify-between">
        <div className="flex gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.image}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-1 transition-all",
                i === index ? "w-10 bg-paper" : "w-5 bg-paper/40 hover:bg-paper/70",
              )}
            />
          ))}
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="grid size-10 place-items-center border border-paper/40 text-paper hover:bg-paper hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="grid size-10 place-items-center border border-paper/40 text-paper hover:bg-paper hover:text-ink"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
