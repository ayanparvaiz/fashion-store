"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { POPULAR_SEARCHES, searchProducts } from "@/lib/search";
import { useProducts } from "@/lib/store/catalog";
import { ProductListing } from "@/components/collection/product-listing";

export function SearchPage() {
  const query = useSearchParams().get("q") ?? "";
  // Re-mount on a new query so the input resets to it.
  return <SearchResults key={query} query={query} />;
}

function SearchResults({ query }: { query: string }) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const products = useProducts();
  const results = useMemo(() => searchProducts(products, query), [products, query]);

  const go = (q: string) => router.push(`/search/?q=${encodeURIComponent(q)}`);

  return (
    <div className="container-page pt-10 pb-20">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) go(value.trim());
        }}
        className="mx-auto flex max-w-2xl items-center gap-3 border-b-2 border-ink pb-3"
      >
        <Search className="size-6 shrink-0" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search for styles…"
          aria-label="Search products"
          className="min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-subtle sm:text-2xl"
        />
      </form>

      <div className="mt-10">
        {query ? (
          <>
            <h1 className="mb-8 text-center text-sm text-muted">
              {results.length} {results.length === 1 ? "result" : "results"} for{" "}
              <span className="font-display text-2xl text-ink uppercase">&ldquo;{query}&rdquo;</span>
            </h1>
            <ProductListing
              products={results}
              emptyMessage="Try a different search, like “dress”, “hoodie” or “denim”."
            />
          </>
        ) : (
          <div className="text-center">
            <h1 className="heading-display text-3xl">What are you looking for?</h1>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setValue(term);
                    go(term);
                  }}
                  className="border border-line px-4 py-2 text-sm hover:border-ink"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
