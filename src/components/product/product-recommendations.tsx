"use client";

import { useMemo } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useProductMap, useProducts } from "@/lib/store/catalog";
import { useRecentlyViewed } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";
import { SectionHeading } from "@/components/home/section-heading";
import { ProductCarousel } from "./product-carousel";

export function ProductRecommendations({ product }: { product: Product }) {
  const products = useProducts();
  const byId = useProductMap();
  const recentIds = useRecentlyViewed((s) => s.ids);
  const mounted = useMounted();

  const related = useMemo(() => {
    const sameCategory = products.filter(
      (p) => p.id !== product.id && p.gender === product.gender && p.category === product.category,
    );
    const completeTheLook = products.filter(
      (p) => p.gender === product.gender && p.category !== product.category && p.isBestseller,
    );
    return [...sameCategory.slice(0, 6), ...completeTheLook.slice(0, 6)];
  }, [products, product]);

  const recent = useMemo(
    () =>
      recentIds
        .filter((id) => id !== product.id)
        .map((id) => byId.get(id))
        .filter((p): p is Product => p !== undefined && p.status !== "draft"),
    [recentIds, byId, product.id],
  );

  return (
    <>
      <section className="border-t border-line py-14 lg:py-20">
        <SectionHeading eyebrow="Complete the look" title="You may also like" />
        <ProductCarousel products={related} />
      </section>
      {mounted && recent.length > 0 && (
        <section className="border-t border-line py-14 lg:py-20">
          <SectionHeading title="Recently viewed" />
          <ProductCarousel products={recent} />
        </section>
      )}
    </>
  );
}
