"use client";

import { CircleCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { collectionHref } from "@/lib/collections";
import { formatDate, formatPrice } from "@/lib/format";
import { useOrders } from "@/lib/store/orders";
import { LinkButton } from "@/components/ui/button";
import { OrderSummaryCard } from "./order-details";
import { OrderTimeline } from "./order-timeline";

export function OrderConfirmation() {
  const params = useSearchParams();
  const mounted = useMounted();
  const number = params.get("order") ?? "";
  const order = useOrders((s) => s.orders.find((o) => o.number === number));

  if (!mounted) return <div className="min-h-[60vh]" />;

  if (!order) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="heading-display text-3xl">Order not found</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          We couldn&apos;t find that order on this device. Use your order number and email to track it.
        </p>
        <LinkButton href="/track-order/" className="mt-8">
          Track an order
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <CircleCheck className="mx-auto size-14 text-success" strokeWidth={1.5} />
          <p className="eyebrow mt-5 text-muted">Order #{order.number}</p>
          <h1 className="heading-display mt-2 text-4xl sm:text-5xl">
            Thank you, {order.shippingAddress.firstName}!
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-ink/75">
            Your order is confirmed. We&apos;ll send updates to <strong>{order.email}</strong> and call{" "}
            <strong>{order.phone}</strong> before delivery. Please have{" "}
            <strong>{formatPrice(order.total)}</strong> in cash ready for the courier.
          </p>
          <p className="mt-2 text-xs text-muted">Placed on {formatDate(order.createdAt)}</p>
        </div>

        <div className="mt-12 border border-line p-6 sm:p-8">
          <OrderTimeline order={order} />
        </div>

        <div className="mt-10">
          <OrderSummaryCard order={order} />
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <LinkButton href={`/track-order/?order=${order.number}&contact=${encodeURIComponent(order.email)}`} variant="outline">
            Track this order
          </LinkButton>
          <LinkButton href={collectionHref("new-arrivals")}>Continue shopping</LinkButton>
        </div>
      </div>
    </div>
  );
}
