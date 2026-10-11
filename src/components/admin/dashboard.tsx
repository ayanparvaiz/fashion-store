"use client";

import { AlertTriangle, ArrowDownRight, ArrowUpRight, Table2 } from "lucide-react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  compactPrice,
  dailySeries,
  percentChange,
  periodKpis,
  salesByCategory,
  topProducts,
} from "@/lib/analytics";
import { productImage, totalStock } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatDateTime, formatPrice, formatWeekday } from "@/lib/format";
import { useAllProducts, useProductMap } from "@/lib/store/catalog";
import { useOrders } from "@/lib/store/orders";
import { BarList } from "./charts/bar-list";
import { RevenueChart } from "./charts/revenue-chart";
import { Card, CardHeader, PageHeader, StatusBadge } from "./admin-ui";

const RANGES = [7, 14, 30] as const;

function StatTile({
  label,
  value,
  current,
  previous,
}: {
  label: string;
  value: string;
  current: number;
  previous: number;
}) {
  const delta = percentChange(current, previous);
  const up = delta !== null && delta >= 0;
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      {delta !== null ? (
        <p className={cn("mt-2 flex items-center gap-1 text-xs font-medium", up ? "text-success" : "text-accent")}>
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {up ? "+" : ""}
          {delta.toFixed(1)}% <span className="font-normal text-muted">vs previous period</span>
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">No previous data</p>
      )}
    </Card>
  );
}

export function Dashboard() {
  const orders = useOrders((s) => s.orders);
  const products = useAllProducts();
  const productMap = useProductMap();
  const [days, setDays] = useState<(typeof RANGES)[number]>(14);
  const [tableView, setTableView] = useState(false);
  // One shared "now" so every widget on the page agrees.
  const [now] = useState(() => Date.now());

  const { current, previous } = useMemo(() => periodKpis(orders, days, now), [orders, days, now]);
  const series = useMemo(() => dailySeries(orders, days, now), [orders, days, now]);
  const categories = useMemo(() => salesByCategory(orders, productMap, days, now).slice(0, 6), [orders, productMap, days, now]);
  const top = useMemo(() => topProducts(orders, days, now), [orders, days, now]);
  const pending = orders.filter((o) => o.status === "pending");
  const lowStock = products
    .filter((p) => p.status !== "draft")
    .map((p) => ({ p, stock: totalStock(p) }))
    .filter(({ stock }) => stock <= 10)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="How Fashion Store is performing." />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Date range">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={days === r}
            onClick={() => setDays(r)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              days === r ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
            )}
          >
            Last {r} days
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Revenue" value={formatPrice(current.revenue)} current={current.revenue} previous={previous.revenue} />
        <StatTile label="Orders" value={String(current.orders)} current={current.orders} previous={previous.orders} />
        <StatTile label="Average order value" value={formatPrice(current.aov)} current={current.aov} previous={previous.aov} />
        <StatTile label="Items sold" value={String(current.units)} current={current.units} previous={previous.units} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px] [&>*]:min-w-0">
        <Card>
          <CardHeader
            title="Revenue per day"
            actions={
              <button
                type="button"
                onClick={() => setTableView((v) => !v)}
                aria-pressed={tableView}
                className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
              >
                <Table2 className="size-3.5" /> {tableView ? "Show chart" : "Show table"}
              </button>
            }
          />
          <div className="p-5">
            {tableView ? (
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-paper text-left text-xs text-muted">
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2 text-right">Orders</th>
                      <th className="py-2 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line tabular-nums">
                    {[...series].reverse().map((d) => (
                      <tr key={d.key}>
                        <td className="py-2">{formatWeekday(d.date)}</td>
                        <td className="py-2 text-right">{d.orders}</td>
                        <td className="py-2 text-right">{formatPrice(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <RevenueChart data={series} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Sales by category" />
          <div className="p-5">
            <BarList data={categories} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3 [&>*]:min-w-0">
        <Card>
          <CardHeader
            title={`Needs confirmation (${pending.length})`}
            actions={<Link href="/admin/orders/?status=pending" className="text-xs font-medium text-accent hover:underline">View all</Link>}
          />
          <ul className="divide-y divide-line">
            {pending.slice(0, 5).map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/?order=${o.number}`} className="flex items-center gap-3 px-5 py-3 hover:bg-soft">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      #{o.number} · {o.shippingAddress.firstName} {o.shippingAddress.lastName}
                    </p>
                    <p className="text-xs text-muted">{formatDateTime(o.createdAt)} · {o.phone}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(o.total)}</span>
                </Link>
              </li>
            ))}
            {pending.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">All caught up 🎉</li>}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Top products" />
          <ul className="divide-y divide-line">
            {top.map((t, i) => (
              <li key={t.productId} className="flex items-center gap-3 px-5 py-3">
                <span className="w-4 text-xs text-muted tabular-nums">{i + 1}</span>
                <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded bg-soft">
                  {t.image && <Image src={t.image} alt="" fill sizes="36px" className="object-cover" />}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm">{t.name}</p>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">{t.units} sold</p>
                  <p className="text-xs text-muted tabular-nums">{compactPrice(t.revenue)}</p>
                </div>
              </li>
            ))}
            {top.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">No sales yet.</li>}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Low stock"
            actions={<Link href="/admin/products/" className="text-xs font-medium text-accent hover:underline">Manage</Link>}
          />
          <ul className="divide-y divide-line">
            {lowStock.map(({ p, stock }) => (
              <li key={p.id}>
                <Link href={`/admin/products/edit/?id=${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-soft">
                  <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded bg-soft">
                    <Image src={productImage(p)} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm">{p.name}</p>
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                      stock === 0 ? "bg-accent-soft text-accent-dark" : "bg-warning/10 text-warning",
                    )}
                  >
                    <AlertTriangle className="size-3" />
                    {stock === 0 ? "Sold out" : `${stock} left`}
                  </span>
                </Link>
              </li>
            ))}
            {lowStock.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted">Stock levels look healthy.</li>}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent orders"
          actions={<Link href="/admin/orders/" className="text-xs font-medium text-accent hover:underline">All orders</Link>}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <tbody className="divide-y divide-line text-sm">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id} className="hover:bg-soft">
                  <td className="px-5 py-3 font-medium">
                    <Link href={`/admin/orders/?order=${o.number}`} className="hover:underline">#{o.number}</Link>
                  </td>
                  <td className="px-5 py-3">{o.shippingAddress.firstName} {o.shippingAddress.lastName}</td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(o.createdAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
