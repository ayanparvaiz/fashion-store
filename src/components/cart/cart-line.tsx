"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CartLineView } from "@/hooks/use-cart-details";
import { productAlt, productHref, productImage } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { MAX_QTY_PER_LINE, useCart } from "@/lib/store/cart";

export function CartLine({ line, onNavigate }: { line: CartLineView; onNavigate?: () => void }) {
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const { product, size, quantity, available } = line;
  const max = Math.min(MAX_QTY_PER_LINE, available);
  const overStock = quantity > available;

  return (
    <div className="flex gap-4">
      <Link
        href={productHref(product)}
        onClick={onNavigate}
        className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-soft"
      >
        <Image src={productImage(product)} alt={productAlt(product)} fill sizes="96px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <Link
            href={productHref(product)}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium hover:underline"
          >
            {product.name}
          </Link>
          <p className="shrink-0 text-sm font-semibold">{formatPrice(product.price * quantity)}</p>
        </div>
        <p className="mt-1 text-xs text-muted">
          {product.color.name} / {size}
        </p>
        {overStock && (
          <p className="mt-1 text-xs font-medium text-accent">
            {available === 0 ? "Sold out — please remove" : `Only ${available} left`}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex h-9 items-center border border-line">
            <button
              type="button"
              className="grid size-9 place-items-center hover:bg-soft"
              onClick={() => setQuantity(product.id, size, quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className="grid size-9 place-items-center hover:bg-soft disabled:opacity-30"
              onClick={() => setQuantity(product.id, size, quantity + 1)}
              disabled={quantity >= max}
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(product.id, size)}
            className="flex items-center gap-1 text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}
