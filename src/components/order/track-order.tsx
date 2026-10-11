"use client";

import { PackageSearch } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { findOrder } from "@/lib/services/checkout";
import { formatDate } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { OrderSummaryCard } from "./order-details";
import { OrderTimeline, STATUS_LABEL } from "./order-timeline";

export function TrackOrder() {
  const params = useSearchParams();
  const [number, setNumber] = useState(params.get("order") ?? "");
  const [contact, setContact] = useState(params.get("contact") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container-page py-12 lg:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-lg text-center">
          <PackageSearch className="mx-auto size-12" strokeWidth={1.4} />
          <h1 className="heading-display mt-4 text-4xl sm:text-5xl">Track your order</h1>
          <p className="mt-3 text-sm text-muted">
            Enter your order number (e.g. FS10265) and the email or phone number you used at checkout.
          </p>
        </div>

        <form
          className="mx-auto mt-8 grid max-w-lg gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const found = findOrder(number, contact);
            setOrder(found ?? null);
            setError(found ? null : "We couldn't find an order with those details. Please check and try again.");
          }}
        >
          <Field label="Order number" value={number} onChange={(e) => setNumber(e.target.value)} required placeholder="FS10265" />
          <Field label="Email or phone" value={contact} onChange={(e) => setContact(e.target.value)} required placeholder="you@example.com" />
          {error && <p className="text-sm text-accent">{error}</p>}
          <Button type="submit" size="lg">
            Track order
          </Button>
        </form>

        {order && (
          <div className="mt-14 animate-fade-in">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="eyebrow text-muted">Order #{order.number}</p>
                <p className="mt-1 text-xl font-semibold">{STATUS_LABEL[order.status]}</p>
              </div>
              <p className="text-sm text-muted">Placed {formatDate(order.createdAt)}</p>
            </div>
            <div className="mt-8 border border-line p-6 sm:p-8">
              <OrderTimeline order={order} />
            </div>
            <div className="mt-10">
              <OrderSummaryCard order={order} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
