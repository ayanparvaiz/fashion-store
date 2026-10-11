"use client";

import { Download, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { downloadCsv } from "@/lib/csv";
import { formatDate, formatPrice } from "@/lib/format";
import { useOrders } from "@/lib/store/orders";
import { Button } from "@/components/ui/button";
import { Card, PageHeader, Td, Th, adminInput } from "./admin-ui";

interface CustomerRow {
  email: string;
  name: string;
  phone: string;
  postalCode: string;
  orders: number;
  spent: number;
  lastOrder: string;
  lastNumber: string;
}

export function CustomersPage() {
  const orders = useOrders((s) => s.orders);
  const [query, setQuery] = useState("");

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();
    for (const o of orders) {
      const row = map.get(o.email) ?? {
        email: o.email,
        name: `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}`,
        phone: o.phone,
        postalCode: o.shippingAddress.postalCode,
        orders: 0,
        spent: 0,
        lastOrder: o.createdAt,
        lastNumber: o.number,
      };
      row.orders += 1;
      if (o.status !== "cancelled") row.spent += o.total;
      if (o.createdAt > row.lastOrder) {
        row.lastOrder = o.createdAt;
        row.lastNumber = o.number;
      }
      map.set(o.email, row);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const list = customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers.length} customers have ordered from the store.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv("customers.csv", [
                ["Name", "Email", "Phone", "Postal code", "Orders", "Total spent", "Last order"],
                ...list.map((c) => [c.name, c.email, c.phone, c.postalCode, c.orders, c.spent.toFixed(2), c.lastOrder]),
              ])
            }
          >
            <Download className="size-3.5" /> Export CSV
          </Button>
        }
      />
      <Card>
        <div className="border-b border-line px-4 py-3">
          <label className="relative block max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or phone…"
              aria-label="Search customers"
              className={cn(adminInput, "w-full pl-9")}
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line bg-soft/60">
              <tr>
                <Th>Customer</Th>
                <Th>Phone</Th>
                <Th>Orders</Th>
                <Th>Last order</Th>
                <Th className="text-right">Total spent</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((c) => (
                <tr key={c.email} className="hover:bg-soft/60">
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-semibold text-paper">
                        {c.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted">{c.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{c.phone}</Td>
                  <Td>{c.orders}</Td>
                  <Td>
                    <Link href={`/admin/orders/?order=${c.lastNumber}`} className="hover:underline">
                      #{c.lastNumber}
                    </Link>
                    <span className="ml-2 text-xs text-muted">{formatDate(c.lastOrder)}</span>
                  </Td>
                  <Td className="text-right font-semibold tabular-nums">{formatPrice(c.spent)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="py-14 text-center text-sm text-muted">No customers found.</p>}
        </div>
      </Card>
    </div>
  );
}
