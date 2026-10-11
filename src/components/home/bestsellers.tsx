"use client";

import { useMemo } from "react";
import { collectionHref, sortProducts } from "@/lib/collections";
import { useProducts } from "@/lib/store/catalog";
import { ProductCard } from "@/components/product/product-card";
import { FadeUp } from "@/components/motion/reveal";
import { SectionHeading } from "./section-heading";

export function Bestsellers() {
  const products = useProducts();
  const list = useMemo(
    () => sortProducts(products.filter((p) => p.isBestseller), "bestselling").slice(0, 8),
    [products],
  );

  return (
    <section className="container-page py-14 lg:py-20">
      <SectionHeading eyebrow="Everyone's adding to bag" title="Bestsellers" href={collectionHref("bestsellers")} />
      <FadeUp as="ul" className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10">
        {list.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </FadeUp>
    </section>
  );
}
