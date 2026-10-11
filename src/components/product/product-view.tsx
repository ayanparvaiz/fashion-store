"use client";

import { useEffect } from "react";
import { CATEGORIES, genderLabel, productAlt, productGallery } from "@/lib/catalog";
import { categoryHref, collectionHref } from "@/lib/collections";
import { useProductBySlug } from "@/lib/store/catalog";
import { useRecentlyViewed } from "@/lib/store/wishlist";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { LinkButton } from "@/components/ui/button";
import { CompleteTheLook } from "./complete-the-look";
import { ProductGallery } from "./product-gallery";
import { ProductInfo } from "./product-info";
import { ProductRecommendations } from "./product-recommendations";
import { ProductReviews } from "./product-reviews";

export function ProductView({ slug }: { slug: string }) {
  const product = useProductBySlug(slug);
  const pushRecent = useRecentlyViewed((s) => s.push);

  useEffect(() => {
    if (product) pushRecent(product.id);
  }, [product, pushRecent]);

  if (!product || product.status === "draft") {
    return (
      <div className="container-page py-28 text-center">
        <p className="font-display text-3xl uppercase">This style is no longer available</p>
        <p className="mt-3 text-sm text-muted">It may have sold out or been removed.</p>
        <LinkButton href={collectionHref("new-arrivals")} className="mt-8">
          Shop New Arrivals
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="container-page pt-6 pb-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: genderLabel(product.gender), href: collectionHref(product.gender) },
          { label: CATEGORIES[product.category].label, href: categoryHref(product.gender, product.category) },
          { label: product.name },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <ProductGallery
          images={productGallery(product)}
          alt={productAlt(product)}
          morphName={`product-${product.id}`}
        />
        <ProductInfo key={product.id} product={product} />
      </div>
      <CompleteTheLook key={product.id} product={product} />
      <ProductReviews product={product} />
      <ProductRecommendations product={product} />
    </div>
  );
}
