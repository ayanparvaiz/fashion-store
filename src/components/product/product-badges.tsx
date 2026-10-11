import { cn } from "@/lib/cn";
import { discountPercent } from "@/lib/format";
import type { Product } from "@/lib/types";

const base = "px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.12em]";

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const soldOut = Object.values(product.stock).every((n) => n === 0);

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      {soldOut ? (
        <span className={cn(base, "bg-ink/70 text-paper")}>Sold out</span>
      ) : (
        <>
          {off > 0 && <span className={cn(base, "bg-accent text-paper")}>-{off}%</span>}
          {product.isNew && <span className={cn(base, "bg-ink text-paper")}>New</span>}
          {product.isBestseller && !product.isNew && (
            <span className={cn(base, "bg-paper text-ink")}>Bestseller</span>
          )}
        </>
      )}
    </div>
  );
}
