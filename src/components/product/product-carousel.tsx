"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

export function ProductCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLUListElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={track}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:gap-5 lg:scroll-px-0 lg:px-0"
      >
        {products.map((p) => (
          <li key={p.id} className="w-[44%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-15px)]">
            <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 45vw" />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute top-[38%] -left-5 hidden size-11 place-items-center rounded-full bg-paper shadow-md transition hover:bg-ink hover:text-paper lg:grid"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute top-[38%] -right-5 hidden size-11 place-items-center rounded-full bg-paper shadow-md transition hover:bg-ink hover:text-paper lg:grid"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
