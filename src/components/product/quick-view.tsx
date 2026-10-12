"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { categoryLabel, productAlt, productGallery, productHref, productThumb, totalStock } from "@/lib/catalog";
import { flyToCart } from "@/lib/fly-to-cart";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/store/cart";
import { useProductMap } from "@/lib/store/catalog";
import { useUI } from "@/lib/store/ui";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Sheet } from "@/components/ui/sheet";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { Stars } from "@/components/ui/stars";
import { ProductBadges } from "./product-badges";
import { WishlistButton } from "./wishlist-button";

function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const toast = useUI((s) => s.toast);
  const images = productGallery(product);
  const [image, setImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const photo = useRef<HTMLDivElement>(null);
  const soldOut = totalStock(product) === 0;

  return (
    <div className="grid md:grid-cols-[1.1fr_1fr]">
      <div className="relative bg-soft">
        <div ref={photo} className="relative aspect-[3/4]">
          <Image src={images[image]} alt={productAlt(product)} fill sizes="(min-width: 768px) 420px, 100vw" className="object-cover" />
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setImage(i)}
                aria-label={`Show image ${i + 1}`}
                className={cn("relative h-14 w-11 overflow-hidden border-2", i === image ? "border-paper" : "border-transparent opacity-70")}
              >
                <Image src={src} alt="" fill sizes="44px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col p-6">
        <ProductBadges product={product} className="mb-3 flex-row" />
        <p className="eyebrow text-muted">{categoryLabel(product)}</p>
        <h2 className="mt-2 text-2xl leading-tight font-semibold">{product.name}</h2>
        <Stars rating={product.rating} count={product.reviewCount} className="mt-2" />
        <Price price={product.price} compareAt={product.compareAtPrice} size="lg" className="mt-4" />
        <p className="mt-4 text-sm leading-relaxed text-ink/75">{product.description}</p>

        <p className="mt-6 text-xs font-bold tracking-[0.14em] uppercase">
          Colour: <span className="font-normal tracking-normal normal-case">{product.color.name}</span>
        </p>
        <p className="mt-5 text-xs font-bold tracking-[0.14em] uppercase">Size</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a size">
          {product.sizes.map((s) => {
            const out = (product.stock[s] ?? 0) === 0;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                disabled={out}
                onClick={() => {
                  setSize(s);
                  setError(false);
                }}
                className={cn(
                  "h-10 min-w-11 border px-2.5 text-sm",
                  size === s ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                  out && "cursor-not-allowed text-subtle line-through",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-2 text-xs text-accent">Please select a size.</p>}

        <div className="mt-6 flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            disabled={soldOut}
            onClick={async () => {
              if (!size) return setError(true);
              // Measure the photo, close the modal, then fly the photo into the bag.
              const flight = flyToCart([photo.current], productThumb(product));
              onClose();
              await flight;
              add({ productId: product.id, size, quantity: 1 });
              toast(`${product.name} (${size}) added to bag`, "success");
              setCartOpen(true);
            }}
          >
            {soldOut ? "Sold out" : "Add to bag"}
          </Button>
          <WishlistButton productId={product.id} className="grid size-13 shrink-0 place-items-center border border-line" />
        </div>

        <Link
          href={productHref(product)}
          onClick={onClose}
          className="mt-auto flex items-center gap-1.5 pt-6 text-xs font-semibold tracking-[0.14em] uppercase hover:text-accent"
        >
          View full details <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

/** Global Quick View modal, opened from product cards and the lookbook. */
export function QuickView() {
  const id = useUI((s) => s.quickViewId);
  const open = useUI((s) => s.openQuickView);
  const products = useProductMap();
  const product = id ? products.get(id) : undefined;
  const close = () => open(null);

  return (
    <Sheet open={Boolean(product)} onClose={close} side="center" title="Quick view" width="max-w-4xl">
      {product && <QuickViewBody key={product.id} product={product} onClose={close} />}
    </Sheet>
  );
}
