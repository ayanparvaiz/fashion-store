"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { ViewTransition, useRef } from "react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { isLowStock, productAlt, productHref, productImage, productThumb } from "@/lib/catalog";
import { flyToCart } from "@/lib/fly-to-cart";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import type { Product } from "@/lib/types";
import { Price } from "@/components/ui/price";
import { ProductBadges } from "./product-badges";
import { WishlistButton } from "./wishlist-button";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function ProductCard({
  product,
  priority = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  className,
}: ProductCardProps) {
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const toast = useUI((s) => s.toast);
  const href = productHref(product);
  const hoverImage = product.image.id ? productImage(product, "detail") : null;
  const openQuickView = useUI((s) => s.openQuickView);
  const morph = useUI((s) => s.morphId === product.id);
  const setMorphId = useUI((s) => s.setMorphId);
  const frame = useRef<HTMLDivElement>(null);

  // Subtle 3D tilt with a moving glare on precise pointers.
  const tilt = (e: React.PointerEvent) => {
    const el = frame.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  };
  const resetTilt = () => {
    const el = frame.current;
    el?.style.setProperty("--rx", "0deg");
    el?.style.setProperty("--ry", "0deg");
  };

  const quickAdd = async (size: string) => {
    // The bag count updates as the photo lands on the bag icon.
    await flyToCart([frame.current], productThumb(product));
    add({ productId: product.id, size, quantity: 1 });
    toast(`${product.name} (${size}) added to bag`, "success");
    setCartOpen(true);
  };

  return (
    <article className={cn("group relative [perspective:900px]", className)}>
      <div
        ref={frame}
        onPointerMove={tilt}
        onPointerLeave={resetTilt}
        className="relative aspect-[3/4] overflow-hidden bg-soft transition-transform duration-300 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
      >
        <Link
          href={href}
          aria-label={product.name}
          className="absolute inset-0"
          data-cursor="view"
          onClick={() => setMorphId(product.id)}
        >
          {/* Only the clicked card carries the shared name, so it morphs into the product page. */}
          <ViewTransition name={morph ? `product-${product.id}` : undefined} share="morph" default="none">
            <Image
              src={productImage(product)}
              alt={productAlt(product)}
              fill
              sizes={sizes}
              loading={priority ? "eager" : undefined}
              className={cn(
                "object-cover transition-all duration-700 ease-out",
                hoverImage && "group-hover:opacity-0",
              )}
            />
          </ViewTransition>
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes={sizes}
              className="scale-105 object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Glare that follows the pointer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgba(255,255,255,0.55),transparent_55%)]"
        />

        <ProductBadges product={product} className="pointer-events-none absolute top-2 left-2" />
        <WishlistButton
          productId={product.id}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-paper/90 shadow-sm"
        />
        <button
          type="button"
          onClick={() => openQuickView(product.id)}
          aria-label={`Quick view ${product.name}`}
          className="absolute top-13 right-2 hidden size-9 translate-x-2 place-items-center rounded-full bg-paper/90 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100 lg:grid"
        >
          <Eye className="size-4" />
        </button>

        <div className="absolute inset-x-2 bottom-2 hidden translate-y-2 bg-paper/95 p-2 opacity-0 transition-all duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 lg:block">
          <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-[0.14em]">
            Quick add
          </p>
          <div className="flex flex-wrap justify-center gap-1">
            {product.sizes.map((size) => {
              const out = (product.stock[size] ?? 0) === 0;
              return (
                <button
                  key={size}
                  type="button"
                  disabled={out}
                  onClick={() => quickAdd(size)}
                  className="h-8 min-w-9 border border-line px-1.5 text-xs font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:text-subtle disabled:line-through"
                  aria-label={`Add size ${size} to bag`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="line-clamp-1 text-[13px] leading-snug sm:text-sm">
          <Link href={href} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAt={product.compareAtPrice} />
        <div className="flex items-center gap-2 text-xs text-muted">
          <span
            className="size-3 rounded-full border border-ink/15"
            style={{ backgroundColor: product.color.hex }}
            aria-hidden
          />
          {product.color.name}
          {isLowStock(product) && <span className="font-semibold text-accent">· Almost gone</span>}
        </div>
      </div>
    </article>
  );
}
