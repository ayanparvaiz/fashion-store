"use client";

import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { productAlt, productHref, productImage } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/store/cart";
import { useProducts } from "@/lib/store/catalog";
import { useUI } from "@/lib/store/ui";
import type { CategorySlug, Gender, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SmartImage as Image } from "@/components/ui/smart-image";

// What pairs well with what.
const PAIRS: Record<CategorySlug, CategorySlug[]> = {
  dresses: ["denim-jackets", "jackets"],
  tops: ["jeans", "skirts"],
  skirts: ["tops", "knitwear"],
  jeans: ["tops", "denim-jackets"],
  shorts: ["tops", "denim-jackets"],
  hoodies: ["pants", "denim-jackets"],
  knitwear: ["jeans", "skirts"],
  "denim-jackets": ["t-shirts", "jeans"],
  jackets: ["knitwear", "pants"],
  activewear: ["hoodies", "shorts"],
  "t-shirts": ["jeans", "denim-jackets"],
  shirts: ["pants", "shorts"],
  polos: ["shorts", "pants"],
  pants: ["t-shirts", "jackets"],
};

// Categories a gender doesn't have map to the closest one it does.
const SUBSTITUTE: Record<Gender, Partial<Record<CategorySlug, CategorySlug>>> = {
  women: { pants: "jeans", "t-shirts": "tops", polos: "tops", shirts: "tops" },
  men: { skirts: "pants", tops: "t-shirts", dresses: "shirts", activewear: "t-shirts" },
};

const firstInStock = (p: Product) => p.sizes.find((s) => (p.stock[s] ?? 0) > 0) ?? null;

/** Bundle the current product with two complementary pieces. */
export function CompleteTheLook({ product }: { product: Product }) {
  const products = useProducts();
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const toast = useUI((s) => s.toast);

  const bundle = useMemo(() => {
    const picks = PAIRS[product.category]
      .map((wanted) => SUBSTITUTE[product.gender][wanted] ?? wanted)
      .filter((category, i, all) => category !== product.category && all.indexOf(category) === i)
      .map((category, i) => {
        const options = products.filter(
          (p) => p.gender === product.gender && p.category === category && firstInStock(p),
        );
        // Stable but varied pick per product.
        const seed = [...product.id].reduce((n, c) => n + c.charCodeAt(0), 0) + i * 7;
        return options[seed % Math.max(1, options.length)];
      })
      .filter((p): p is Product => Boolean(p));
    return [product, ...picks];
  }, [product, products]);

  const [chosen, setChosen] = useState<Record<string, { on: boolean; size: string | null }>>(() =>
    Object.fromEntries(bundle.map((p) => [p.id, { on: true, size: p.id === product.id ? null : firstInStock(p) }])),
  );

  if (bundle.length < 2) return null;

  const selected = bundle.filter((p) => chosen[p.id]?.on);
  const total = selected.reduce((sum, p) => sum + p.price, 0);
  const missingSize = selected.some((p) => !chosen[p.id]?.size);

  return (
    <section className="border-t border-line py-14 lg:py-20">
      <p className="eyebrow text-accent">Styled for you</p>
      <h2 className="heading-display mt-2 text-3xl lg:text-4xl">Complete the look</h2>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {bundle.map((p, i) => {
            const state = chosen[p.id] ?? { on: false, size: null };
            return (
              <li key={p.id} className="relative">
                {i > 0 && (
                  <span className="absolute top-1/3 -left-4 z-10 hidden size-7 place-items-center rounded-full bg-ink text-paper sm:grid">
                    <Plus className="size-4" />
                  </span>
                )}
                <div className={cn("transition-opacity", !state.on && "opacity-40")}>
                  <Link href={productHref(p)} className="relative block aspect-[3/4] overflow-hidden bg-soft">
                    <Image src={productImage(p)} alt={productAlt(p)} fill sizes="(min-width: 640px) 25vw, 100vw" className="object-cover" />
                  </Link>
                  <div className="mt-3 flex items-start gap-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={state.on}
                      aria-label={`Include ${p.name}`}
                      onClick={() => setChosen((c) => ({ ...c, [p.id]: { ...state, on: !state.on } }))}
                      className={cn(
                        "mt-0.5 grid size-5 shrink-0 place-items-center border",
                        state.on ? "border-ink bg-ink text-paper" : "border-ink/30",
                      )}
                    >
                      {state.on && <Check className="size-3.5" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm">{i === 0 ? "This item: " : ""}{p.name}</p>
                      <p className="text-sm font-semibold">{formatPrice(p.price)}</p>
                      <select
                        value={state.size ?? ""}
                        onChange={(e) => setChosen((c) => ({ ...c, [p.id]: { ...state, size: e.target.value || null } }))}
                        aria-label={`Size for ${p.name}`}
                        className="mt-2 h-9 w-full border border-line bg-paper px-2 text-sm"
                      >
                        <option value="">Select size</option>
                        {p.sizes.map((s) => (
                          <option key={s} value={s} disabled={(p.stock[s] ?? 0) === 0}>
                            {s}
                            {(p.stock[s] ?? 0) === 0 ? " — sold out" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="bg-soft p-6">
          <p className="text-sm text-muted">{selected.length} items</p>
          <p className="mt-1 text-3xl font-semibold">{formatPrice(total)}</p>
          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={selected.length === 0 || missingSize}
            onClick={() => {
              for (const p of selected) add({ productId: p.id, size: chosen[p.id].size!, quantity: 1 });
              toast(`Added ${selected.length} items to your bag`, "success");
              setCartOpen(true);
            }}
          >
            Add {selected.length} to bag
          </Button>
          {missingSize && <p className="mt-2 text-xs text-muted">Choose a size for each selected item.</p>}
        </div>
      </div>
    </section>
  );
}
