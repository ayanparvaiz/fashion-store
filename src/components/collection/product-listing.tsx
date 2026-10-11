"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { SORT_OPTIONS, sortProducts, type SortKey } from "@/lib/collections";
import {
  COLOR_FAMILIES,
  EMPTY_FILTERS,
  PRICE_RANGES,
  applyFilters,
  colorFamily,
  countActiveFilters,
  sortSizes,
  type ColorFamily,
  type FilterState,
} from "@/lib/filters";
import { CATEGORIES, GENDER_CATEGORIES } from "@/lib/catalog";
import type { CategorySlug, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/product-card";
import { FilterPanel } from "./filter-panel";

const PAGE_SIZE = 24;

/** Filterable, sortable product grid shared by collections and search. */
export function ProductListing({
  products,
  emptyMessage = "No styles match these filters.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [mobileOpen, setMobileOpen] = useState(false);

  const facets = useMemo(() => {
    const order = [...GENDER_CATEGORIES.women, ...GENDER_CATEGORIES.men];
    const categoryCounts: Record<string, number> = {};
    for (const p of products) categoryCounts[p.category] = (categoryCounts[p.category] ?? 0) + 1;
    const categories = [...new Set(order)].filter((c) => categoryCounts[c]) as CategorySlug[];
    const sizes = sortSizes([...new Set(products.flatMap((p) => p.sizes))]);
    const present = new Set(products.map((p) => colorFamily(p.color.name)));
    const colors = COLOR_FAMILIES.map((f) => f.name).filter((n) => present.has(n)) as ColorFamily[];
    return { categories, sizes, colors, counts: { categories: categoryCounts } };
  }, [products]);

  const results = useMemo(
    () => sortProducts(applyFilters(products, filters), sort),
    [products, filters, sort],
  );
  const activeCount = countActiveFilters(filters);

  const update = (next: FilterState) => {
    setFilters(next);
    setVisible(PAGE_SIZE);
  };

  const chips = [
    ...filters.categories.map((c) => ({
      label: CATEGORIES[c].label,
      clear: () => update({ ...filters, categories: filters.categories.filter((x) => x !== c) }),
    })),
    ...filters.sizes.map((s) => ({
      label: `Size ${s}`,
      clear: () => update({ ...filters, sizes: filters.sizes.filter((x) => x !== s) }),
    })),
    ...filters.colors.map((c) => ({
      label: c,
      clear: () => update({ ...filters, colors: filters.colors.filter((x) => x !== c) }),
    })),
    ...filters.prices.map((id) => ({
      label: PRICE_RANGES.find((r) => r.id === id)?.label ?? id,
      clear: () => update({ ...filters, prices: filters.prices.filter((x) => x !== id) }),
    })),
    ...(filters.inStock ? [{ label: "In stock", clear: () => update({ ...filters, inStock: false }) }] : []),
    ...(filters.onSale ? [{ label: "On sale", clear: () => update({ ...filters, onSale: false }) }] : []),
  ];

  const panel = <FilterPanel filters={filters} onChange={update} {...facets} />;

  return (
    <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="no-scrollbar sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto pb-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em]">Filter</p>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => update(EMPTY_FILTERS)}
                className="text-xs text-muted underline underline-offset-4 hover:text-ink"
              >
                Clear all
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div>
        <div className="mb-5 flex items-center justify-between gap-3 border-y border-line py-3 lg:border-t-0 lg:pt-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] lg:hidden"
          >
            <SlidersHorizontal className="size-4" />
            Filter {activeCount > 0 && `(${activeCount})`}
          </button>
          <p className="hidden text-sm text-muted lg:block" aria-live="polite">
            {results.length} {results.length === 1 ? "style" : "styles"}
          </p>
          <label className="flex items-center gap-2 text-xs">
            <span className="hidden font-bold uppercase tracking-[0.14em] sm:inline">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 cursor-pointer border border-line bg-paper px-2 text-sm focus:border-ink focus:outline-none"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.clear}
                className="flex items-center gap-1.5 bg-soft px-3 py-1.5 text-xs font-medium hover:bg-line"
              >
                {chip.label}
                <X className="size-3" />
              </button>
            ))}
          </div>
        )}

        {results.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl uppercase">Nothing here… yet</p>
            <p className="mt-2 text-sm text-muted">{emptyMessage}</p>
            {activeCount > 0 && (
              <Button variant="outline" className="mt-6" onClick={() => update(EMPTY_FILTERS)}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:gap-x-5 lg:gap-y-10 xl:grid-cols-4">
              {results.slice(0, visible).map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 4} />
                </li>
              ))}
            </ul>
            <div className="mt-14 flex flex-col items-center gap-3">
              <p className="text-xs text-muted">
                Showing {Math.min(visible, results.length)} of {results.length}
              </p>
              <div className="h-0.5 w-48 bg-line">
                <div
                  className="h-full bg-ink transition-[width]"
                  style={{ width: `${(Math.min(visible, results.length) / results.length) * 100}%` }}
                />
              </div>
              {visible < results.length && (
                <Button variant="outline" className="mt-2" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  Load more
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <Sheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        side="left"
        title={`Filter${activeCount ? ` (${activeCount})` : ""}`}
        footer={
          <div className="grid grid-cols-2 gap-3 p-4">
            <Button variant="outline" onClick={() => update(EMPTY_FILTERS)}>
              Clear
            </Button>
            <Button onClick={() => setMobileOpen(false)}>Show {results.length}</Button>
          </div>
        }
      >
        <div className={cn("px-5")}>{panel}</div>
      </Sheet>
    </div>
  );
}
