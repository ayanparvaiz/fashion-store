"use client";

import { Banknote, Lock, ShoppingBag } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { useCartDetails } from "@/hooks/use-cart-details";
import { collectionHref } from "@/lib/collections";
import { LinkButton } from "@/components/ui/button";
import { CartLine } from "./cart-line";
import { DiscountForm } from "./discount-form";
import { FreeShippingBar } from "./free-shipping-bar";
import { OrderTotals } from "./order-totals";

export function CartPage() {
  const mounted = useMounted();
  const { lines, totals, count, settings, discount } = useCartDetails();
  const blocked = lines.some((l) => l.quantity > l.available);

  if (!mounted) return <div className="container-page min-h-[60vh] py-16" />;

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="size-12 text-subtle" strokeWidth={1.3} />
        <h1 className="heading-display mt-6 text-4xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted">Fill it with something you&apos;ll love.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href={collectionHref("women")}>Shop Women</LinkButton>
          <LinkButton href={collectionHref("men")} variant="outline">
            Shop Men
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="heading-display text-3xl lg:text-4xl">
        Your bag <span className="text-muted">({count})</span>
      </h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div>
          <FreeShippingBar remaining={totals.freeShippingRemaining} threshold={settings.freeShippingThreshold} />
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.size}`} className="py-6">
                <CartLine line={line} />
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit space-y-6 bg-soft p-6 lg:sticky lg:top-32">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em]">Order summary</h2>
          <DiscountForm subtotal={totals.subtotal} />
          <OrderTotals totals={totals} discountCode={discount?.code} shippingLabel="Standard delivery" />
          <LinkButton
            href="/checkout/"
            size="lg"
            className="w-full"
            aria-disabled={blocked}
            style={blocked ? { pointerEvents: "none", opacity: 0.4 } : undefined}
          >
            <Lock className="size-4" /> Secure checkout
          </LinkButton>
          {blocked && (
            <p className="text-xs text-accent">Some items exceed available stock. Please update your bag.</p>
          )}
          <div className="flex items-start gap-3 border-t border-line pt-5 text-xs text-ink/75">
            <Banknote className="size-5 shrink-0 text-ink" />
            <p>
              <strong className="text-ink">Cash on Delivery</strong> — no card needed. Pay the courier when your
              order arrives.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
