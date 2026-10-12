"use client";

import { useSearchParams } from "next/navigation";
import { useRef } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { collectionHref } from "@/lib/collections";
import { formatDate, formatPrice } from "@/lib/format";
import { burstConfetti } from "@/lib/confetti";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { useOrders } from "@/lib/store/orders";
import type { Order } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { OrderSummaryCard } from "./order-details";
import { OrderTimeline } from "./order-timeline";

/** Orders this recent count as "just placed" and get the confetti. */
const CELEBRATE_WITHIN_MS = 2 * 60_000;

function SuccessCheck() {
  return (
    <span className="relative mx-auto grid size-20 place-items-center">
      <span data-check-ripple aria-hidden className="absolute inset-0 rounded-full bg-success/15" />
      <svg data-check viewBox="0 0 64 64" className="relative size-16 text-success" aria-hidden>
        <circle
          data-check-stroke
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          pathLength={1}
          strokeDasharray="1"
          transform="rotate(-90 32 32)"
        />
        <path
          data-check-stroke
          d="M20 33.5l8 8 16-17"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
        />
      </svg>
    </span>
  );
}

function ConfirmationBody({ order }: { order: Order }) {
  const root = useRef<HTMLDivElement>(null);

  // Draw the tick, ripple, lift the copy in and (for fresh orders) burst confetti.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const fresh = Date.now() - new Date(order.createdAt).getTime() < CELEBRATE_WITHIN_MS;
      const [circle, mark] = gsap.utils.toArray<SVGElement>("[data-check-stroke]");
      gsap
        .timeline()
        .from("[data-check]", { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(2.2)", transformOrigin: "50% 50%" })
        .fromTo(circle, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, 0.05)
        .fromTo(mark, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.4, ease: "power3.out" }, 0.5)
        .fromTo("[data-check-ripple]", { scale: 0.6, opacity: 1 }, { scale: 2.2, opacity: 0, duration: 1, ease: "power2.out" }, 0.55)
        .add(() => {
          const check = root.current?.querySelector("[data-check]");
          if (fresh && check) burstConfetti(check);
        }, 0.6)
        .from("[data-success-fade]", { y: 18, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 0.45);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <SuccessCheck />
          <p data-success-fade className="eyebrow mt-5 text-muted">
            Order #{order.number}
          </p>
          <h1 data-success-fade className="heading-display mt-2 text-3xl sm:text-4xl">
            Thank you, {order.shippingAddress.firstName}!
          </h1>
          <p data-success-fade className="mx-auto mt-4 max-w-lg text-sm text-ink/75">
            Your order is confirmed. We&apos;ll send updates to <strong>{order.email}</strong> and call{" "}
            <strong>{order.phone}</strong> before delivery. Please have{" "}
            <strong>{formatPrice(order.total)}</strong> in cash ready for the courier.
          </p>
          <p data-success-fade className="mt-2 text-xs text-muted">
            Placed on {formatDate(order.createdAt)}
          </p>
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

  return <ConfirmationBody order={order} />;
}
