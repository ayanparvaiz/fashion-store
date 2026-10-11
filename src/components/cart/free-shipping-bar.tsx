import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";

export function FreeShippingBar({ remaining, threshold }: { remaining: number; threshold: number }) {
  const progress = Math.min(100, ((threshold - remaining) / threshold) * 100);
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-xs">
        <Truck className="size-4 shrink-0" />
        {remaining > 0 ? (
          <span>
            You&apos;re <strong>{formatPrice(remaining)}</strong> away from{" "}
            <strong>free delivery</strong>
          </span>
        ) : (
          <span className="font-semibold">You&apos;ve unlocked free delivery 🎉</span>
        )}
      </p>
      <div className="h-1 w-full overflow-hidden bg-line">
        <div
          className="h-full bg-accent transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
