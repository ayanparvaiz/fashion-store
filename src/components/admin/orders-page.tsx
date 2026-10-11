"use client";

import { Download, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { downloadCsv } from "@/lib/csv";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useOrders } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, PageHeader, StatusBadge, Td, Th, adminInput } from "./admin-ui";
import { OrderDrawer } from "./order-drawer";

const TABS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export function OrdersPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orders = useOrders((s) => s.orders);
  const [tab, setTab] = useState<OrderStatus | "all">((params.get("status") as OrderStatus) ?? "all");
  const [query, setQuery] = useState("");
  const openNumber = params.get("order");
  const open = orders.find((o) => o.number === openNumber) ?? null;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "all" && o.status !== tab) return false;
      if (!q) return true;
      const a = o.shippingAddress;
      return [o.number, `${a.firstName} ${a.lastName}`, o.email, o.phone.replace(/\s/g, "")]
        .join(" ")
        .toLowerCase()
        .includes(q.replace(/^#/, ""));
    });
  }, [orders, tab, query]);

  const setOpen = (number: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (number) next.set("order", number);
    else next.delete("order");
    router.replace(`/admin/orders/${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Confirm cash-on-delivery orders by phone, then ship and mark as paid."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv("orders.csv", [
                ["Order", "Date", "Status", "Customer", "Email", "Phone", "Postal code", "Items", "Subtotal", "Discount", "Delivery", "Total"],
                ...list.map((o) => [
                  o.number,
                  o.createdAt,
                  o.status,
                  `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`,
                  o.email,
                  o.phone,
                  o.shippingAddress.postalCode,
                  o.lines.reduce((s, l) => s + l.quantity, 0),
                  o.subtotal,
                  o.discount,
                  o.shipping,
                  o.total,
                ]),
              ])
            }
          >
            <Download className="size-3.5" /> Export CSV
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                  tab === t.id ? "bg-ink text-paper" : "text-muted hover:bg-soft hover:text-ink",
                )}
              >
                {t.label} <span className="opacity-60">{counts[t.id] ?? 0}</span>
              </button>
            ))}
          </div>
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, name, phone…"
              aria-label="Search orders"
              className={cn(adminInput, "w-64 pl-9")}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-line bg-soft/60">
              <tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th>Delivery</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setOpen(o.number)}
                  className="cursor-pointer hover:bg-soft"
                >
                  <Td className="font-semibold">
                    <button type="button" className="hover:underline" onClick={() => setOpen(o.number)}>
                      #{o.number}
                    </button>
                  </Td>
                  <Td className="text-muted">{formatDateTime(o.createdAt)}</Td>
                  <Td>
                    <p>
                      {o.shippingAddress.firstName} {o.shippingAddress.lastName}
                    </p>
                    <p className="text-xs text-muted">{o.phone}</p>
                  </Td>
                  <Td>{o.lines.reduce((s, l) => s + l.quantity, 0)}</Td>
                  <Td className="text-muted capitalize">{o.shippingMethod}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                  </Td>
                  <Td className="text-right font-semibold tabular-nums">{formatPrice(o.total)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="py-14 text-center text-sm text-muted">No orders match.</p>}
        </div>
      </Card>

      <OrderDrawer order={open} onClose={() => setOpen(null)} />
    </div>
  );
}
