"use client";

import { Heart } from "lucide-react";
import { useMemo } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { collectionHref } from "@/lib/collections";
import { useProductMap } from "@/lib/store/catalog";
import { useWishlist } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";

export function WishlistPage() {
  const mounted = useMounted();
  const ids = useWishlist((s) => s.ids);
  const byId = useProductMap();
  const products = useMemo(
    () => ids.map((id) => byId.get(id)).filter((p): p is Product => !!p && p.status !== "draft"),
    [ids, byId],
  );

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="heading-display text-4xl lg:text-5xl">
        Wishlist {mounted && products.length > 0 && <span className="text-muted">({products.length})</span>}
      </h1>
      {!mounted ? (
        <div className="min-h-[40vh]" />
      ) : products.length === 0 ? (
        <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
          <Heart className="size-12 text-subtle" strokeWidth={1.3} />
          <p className="mt-5 font-display text-2xl uppercase">Nothing saved yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Tap the heart on any style to save it here and come back to it later.
          </p>
          <LinkButton href={collectionHref("new-arrivals")} className="mt-8">
            Discover New Arrivals
          </LinkButton>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-10">
          {products.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
