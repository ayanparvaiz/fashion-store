"use client";

import Image from "next/image";
import Link from "next/link";
import { isLowStock, productAlt, productHref, productImage } from "@/lib/catalog";
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

  const quickAdd = (size: string) => {
    add({ productId: product.id, size, quantity: 1 });
    toast(`${product.name} (${size}) added to bag`, "success");
    setCartOpen(true);
  };

  return (
    <article className={cn("group relative", className)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-soft">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          <Image
            src={productImage(product)}
            alt={productAlt(product)}
            fill
            sizes={sizes}
            priority={priority}
            className={cn(
              "object-cover transition-all duration-700 ease-out",
              hoverImage && "group-hover:opacity-0",
            )}
          />
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

        <ProductBadges product={product} className="pointer-events-none absolute top-2 left-2" />
        <WishlistButton
          productId={product.id}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-paper/90 shadow-sm"
        />

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
