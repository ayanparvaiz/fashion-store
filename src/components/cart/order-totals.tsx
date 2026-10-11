import { formatPrice } from "@/lib/format";
import type { Totals } from "@/lib/pricing";

export function OrderTotals({
  totals,
  discountCode,
  shippingLabel = "Delivery",
}: {
  totals: Pick<Totals, "subtotal" | "discount" | "shipping" | "total">;
  discountCode?: string | null;
  shippingLabel?: string;
}) {
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-accent">
          <dt>Discount{discountCode && ` (${discountCode})`}</dt>
          <dd className="tabular-nums">-{formatPrice(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>{shippingLabel}</dt>
        <dd className="tabular-nums">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3 text-base font-bold">
        <dt>Total</dt>
        <dd className="tabular-nums">
          <span className="mr-1.5 text-xs font-normal text-muted">SGD</span>
          {formatPrice(totals.total)}
        </dd>
      </div>
      <p className="text-xs text-muted">Includes GST.</p>
    </dl>
  );
}
