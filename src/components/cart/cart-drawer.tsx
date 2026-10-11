"use client";

import { ShoppingBag } from "lucide-react";
import { useCartDetails } from "@/hooks/use-cart-details";
import { formatPrice } from "@/lib/format";
import { collectionHref } from "@/lib/collections";
import { useUI } from "@/lib/store/ui";
import { LinkButton } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { CartLine } from "./cart-line";
import { FreeShippingBar } from "./free-shipping-bar";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const { lines, totals, count, settings, discount } = useCartDetails();
  const close = () => setOpen(false);
  const blocked = lines.some((l) => l.quantity > l.available);

  return (
    <Sheet
      open={open}
      onClose={close}
      title={`Your Bag (${count})`}
      footer={
        lines.length > 0 && (
          <div className="space-y-3 p-5">
            {discount && totals.discount > 0 && (
              <div className="flex justify-between text-sm text-accent">
                <span>Discount ({discount.code})</span>
                <span>-{formatPrice(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotal - totals.discount)}</span>
            </div>
            <p className="text-xs text-muted">Delivery and discount codes calculated at checkout.</p>
            <LinkButton
              href="/checkout/"
              onClick={close}
              size="lg"
              className="w-full"
              aria-disabled={blocked}
              tabIndex={blocked ? -1 : undefined}
              style={blocked ? { pointerEvents: "none", opacity: 0.4 } : undefined}
            >
              Checkout · Cash on Delivery
            </LinkButton>
            <LinkButton href="/cart/" onClick={close} variant="outline" className="w-full">
              View Bag
            </LinkButton>
          </div>
        )
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
          <ShoppingBag className="size-10 text-subtle" strokeWidth={1.4} />
          <p className="font-display text-xl uppercase">Your bag is empty</p>
          <p className="text-sm text-muted">Looks like you haven&apos;t added anything yet.</p>
          <LinkButton href={collectionHref("new-arrivals")} onClick={close} className="mt-2">
            Shop New Arrivals
          </LinkButton>
        </div>
      ) : (
        <div className="p-5">
          <FreeShippingBar
            remaining={totals.freeShippingRemaining}
            threshold={settings.freeShippingThreshold}
          />
          <ul className="mt-6 space-y-6">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.size}`}>
                <CartLine line={line} onNavigate={close} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
