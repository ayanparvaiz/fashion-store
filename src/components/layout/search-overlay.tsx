"use client";

import { ArrowRight, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { productAlt, productHref, productImage } from "@/lib/catalog";
import { POPULAR_SEARCHES, searchProducts } from "@/lib/search";
import { useProducts } from "@/lib/store/catalog";
import { useUI } from "@/lib/store/ui";
import { Price } from "@/components/ui/price";

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const products = useProducts();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const results = searchProducts(products, deferred);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      requestAnimationFrame(() => input.current?.focus());
    }
    if (!open && el.open) el.close();
  }, [open]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const submit = (q: string) => {
    if (!q.trim()) return;
    close();
    router.push(`/search/?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <dialog
      ref={dialog}
      onClose={close}
      onClick={(e) => e.target === dialog.current && close()}
      aria-label="Search"
      className="m-0 h-auto max-h-dvh w-full max-w-none animate-fade-in bg-transparent p-0 backdrop:bg-ink/50"
    >
      <div className="bg-paper shadow-xl">
        <form
          className="container-page flex h-20 items-center gap-3 border-b border-line"
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
        >
          <Search className="size-5 shrink-0 text-muted" />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dresses, hoodies, denim…"
            className="h-full flex-1 bg-transparent text-base outline-none placeholder:text-subtle sm:text-lg"
            aria-label="Search products"
            type="search"
            enterKeyHint="search"
          />
          <button type="button" onClick={close} className="p-2" aria-label="Close search">
            <X className="size-5" />
          </button>
        </form>

        <div className="container-page max-h-[calc(100dvh-5rem)] overflow-y-auto py-6">
          {!deferred.trim() ? (
            <div>
              <p className="eyebrow mb-3 text-muted">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="border border-line px-4 py-2 text-sm transition-colors hover:border-ink"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="py-6 text-sm text-muted">
              No results for &ldquo;{deferred}&rdquo;. Try &ldquo;dress&rdquo; or &ldquo;hoodie&rdquo;.
            </p>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="eyebrow text-muted">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </p>
                <button
                  type="button"
                  onClick={() => submit(deferred)}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider hover:text-accent"
                >
                  View all <ArrowRight className="size-3.5" />
                </button>
              </div>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {results.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link href={productHref(p)} onClick={close} className="group block">
                      <div className="relative aspect-[3/4] overflow-hidden bg-soft">
                        <Image
                          src={productImage(p)}
                          alt={productAlt(p)}
                          fill
                          sizes="(min-width: 1024px) 16vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="mt-2 line-clamp-1 text-sm">{p.name}</p>
                      <Price price={p.price} compareAt={p.compareAtPrice} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
