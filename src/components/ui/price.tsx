import { cn } from "@/lib/cn";
import { discountPercent, formatPrice } from "@/lib/format";

interface PriceProps {
  price: number;
  compareAt?: number | null;
  size?: "sm" | "lg";
  className?: string;
}

export function Price({ price, compareAt = null, size = "sm", className }: PriceProps) {
  const off = discountPercent(price, compareAt);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span
        className={cn(
          "font-semibold",
          off > 0 && "text-accent",
          size === "lg" ? "text-xl" : "text-sm",
        )}
      >
        {formatPrice(price)}
      </span>
      {off > 0 && compareAt && (
        <>
          <span className={cn("text-muted line-through", size === "lg" ? "text-base" : "text-xs")}>
            {formatPrice(compareAt)}
          </span>
          {size === "lg" && (
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Save {off}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
