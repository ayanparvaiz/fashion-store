"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { collectionHref, sortProducts } from "@/lib/collections";
import { useProducts } from "@/lib/store/catalog";
import type { Gender } from "@/lib/types";
import { ProductCarousel } from "@/components/product/product-carousel";
import { SectionHeading } from "./section-heading";

export function NewArrivals() {
  const products = useProducts();
  const [gender, setGender] = useState<Gender>("women");

  const list = useMemo(() => {
    const forGender = products.filter((p) => p.gender === gender);
    const fresh = forGender.filter((p) => p.isNew);
    // Top up with the newest items so the row always feels full.
    const rest = sortProducts(forGender.filter((p) => !p.isNew), "newest");
    return [...sortProducts(fresh, "newest"), ...rest].slice(0, 12);
  }, [products, gender]);

  return (
    <section className="container-page py-14 lg:py-20">
      <SectionHeading eyebrow="Just dropped" title="New arrivals" href={collectionHref("new-arrivals")}>
        <div role="tablist" aria-label="Filter new arrivals" className="flex gap-1 bg-soft p-1">
          {(["women", "men"] as const).map((g) => (
            <button
              key={g}
              type="button"
              role="tab"
              aria-selected={gender === g}
              onClick={() => setGender(g)}
              className={cn(
                "px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors",
                gender === g ? "bg-ink text-paper" : "text-ink/70 hover:text-ink",
              )}
            >
              {g === "women" ? "Women" : "Men"}
            </button>
          ))}
        </div>
      </SectionHeading>
      <ProductCarousel key={gender} products={list} />
    </section>
  );
}
