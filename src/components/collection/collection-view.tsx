"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CATEGORIES, GENDER_CATEGORIES, genderLabel } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { categoryHref, collectionHref, getCollection } from "@/lib/collections";
import { useProducts } from "@/lib/store/catalog";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { ProductListing } from "./product-listing";

export function CollectionView({ handle }: { handle: string }) {
  const collection = getCollection(handle)!;
  const products = useProducts();
  const items = useMemo(() => products.filter(collection.filter), [products, collection]);
  const { gender, category } = collection;

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }];
  if (gender && category) {
    crumbs.push({ label: genderLabel(gender), href: collectionHref(gender) });
    crumbs.push({ label: CATEGORIES[category].label });
  } else {
    crumbs.push({ label: collection.title });
  }

  const subnav = gender
    ? [
        { label: "All", href: collectionHref(gender), active: !category },
        ...GENDER_CATEGORIES[gender].map((c) => ({
          label: CATEGORIES[c].label,
          href: categoryHref(gender, c),
          active: c === category,
        })),
      ]
    : null;

  return (
    <div className="container-page pt-6 pb-20">
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 mb-8 max-w-3xl">
        <h1 className="heading-display text-4xl leading-none sm:text-5xl lg:text-6xl">
          {collection.title}
        </h1>
        <p className="mt-3 text-sm text-ink/70 sm:text-base">{collection.description}</p>
      </header>

      {subnav && (
        <nav aria-label="Categories" className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex gap-2">
            {subnav.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={s.active ? "page" : undefined}
                  className={cn(
                    "block border px-4 py-2 text-xs font-semibold whitespace-nowrap uppercase tracking-[0.1em] transition-colors",
                    s.active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                  )}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <ProductListing key={handle} products={items} />
    </div>
  );
}
