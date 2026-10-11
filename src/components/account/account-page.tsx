"use client";

import { LogOut, Package } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/cn";
import { formatDate, formatPrice, pluralize } from "@/lib/format";
import { useAccount, useCurrentCustomer } from "@/lib/store/auth";
import { useOrders } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/types";
import { Button, LinkButton } from "@/components/ui/button";
import { STATUS_LABEL } from "@/components/order/order-timeline";
import { AuthForms } from "./auth-forms";

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-ink/5 text-ink",
  shipped: "bg-accent-soft text-accent",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-soft text-muted line-through",
};

export function AccountPage() {
  const mounted = useMounted();
  const customer = useCurrentCustomer();
  const logout = useAccount((s) => s.logout);
  const orders = useOrders((s) => s.orders);
  const router = useRouter();
  const next = useSearchParams().get("next");
  const mine = useMemo(
    () => (customer ? orders.filter((o) => o.email === customer.email) : []),
    [orders, customer],
  );

  if (!mounted) return <div className="min-h-[60vh]" />;

  if (!customer) {
    return (
      <div className="container-page py-14 lg:py-20">
        <h1 className="heading-display mb-10 text-center text-3xl lg:text-4xl">My account</h1>
        <AuthForms onSuccess={() => next?.startsWith("/") && router.push(next)} />
      </div>
    );
  }

  const a = customer.address;
  return (
    <div className="container-page py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">My account</p>
          <h1 className="heading-display mt-2 text-3xl lg:text-4xl">Hi, {customer.firstName}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="size-3.5" /> Sign out
        </Button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em]">
            Order history · {pluralize(mine.length, "order")}
          </h2>
          {mine.length === 0 ? (
            <div className="mt-4 border border-dashed border-line p-10 text-center">
              <Package className="mx-auto size-10 text-subtle" strokeWidth={1.3} />
              <p className="mt-4 text-sm text-muted">You haven&apos;t placed any orders yet.</p>
              <LinkButton href="/collections/new-arrivals/" className="mt-6" size="sm">
                Start shopping
              </LinkButton>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {mine.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-4 py-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">#{o.number}</p>
                    <p className="text-xs text-muted">
                      {formatDate(o.createdAt)} · {pluralize(o.lines.reduce((s, l) => s + l.quantity, 0), "item")}
                    </p>
                  </div>
                  <span className={cn("px-2.5 py-1 text-[11px] font-semibold", STATUS_STYLE[o.status])}>
                    {STATUS_LABEL[o.status]}
                  </span>
                  <p className="w-24 text-right font-semibold tabular-nums">{formatPrice(o.total)}</p>
                  <Link
                    href={`/track-order/?order=${o.number}&contact=${encodeURIComponent(o.email)}`}
                    className="text-xs font-semibold underline underline-offset-4 hover:text-accent"
                  >
                    View
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <div className="bg-soft p-5 text-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em]">Profile</h2>
            <p className="font-medium">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-muted">{customer.email}</p>
            <p className="text-muted">{customer.phone}</p>
            <p className="mt-3 text-xs text-muted">Member since {formatDate(customer.createdAt)}</p>
          </div>
          <div className="bg-soft p-5 text-sm">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em]">Default address</h2>
            {a ? (
              <p>
                {a.firstName} {a.lastName}
                <br />
                {a.address}
                {a.unit && `, ${a.unit}`}
                <br />
                Singapore {a.postalCode}
              </p>
            ) : (
              <p className="text-muted">Your address will be saved at your next checkout.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
