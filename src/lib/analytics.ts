import { CATEGORIES, genderLabel } from "./catalog";
import type { Order, Product } from "./types";

const DAY = 86_400_000;
const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Singapore",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** YYYY-MM-DD in Singapore time. */
export function dayKey(date: Date | string | number): string {
  return dayKeyFormat.format(new Date(date));
}

const counted = (o: Order) => o.status !== "cancelled";

function inWindow(orders: Order[], from: number, to: number) {
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t > from && t <= to;
  });
}

export interface Kpis {
  revenue: number;
  orders: number;
  aov: number;
  units: number;
}

function kpis(orders: Order[]): Kpis {
  const valid = orders.filter(counted);
  const revenue = valid.reduce((s, o) => s + o.total, 0);
  return {
    revenue,
    orders: valid.length,
    aov: valid.length ? revenue / valid.length : 0,
    units: valid.reduce((s, o) => s + o.lines.reduce((n, l) => n + l.quantity, 0), 0),
  };
}

export function periodKpis(orders: Order[], days: number, now = Date.now()) {
  return {
    current: kpis(inWindow(orders, now - days * DAY, now)),
    previous: kpis(inWindow(orders, now - 2 * days * DAY, now - days * DAY)),
  };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export interface DailyPoint {
  key: string;
  date: Date;
  revenue: number;
  orders: number;
}

export function dailySeries(orders: Order[], days: number, now = Date.now()): DailyPoint[] {
  const points = new Map<string, DailyPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * DAY);
    const key = dayKey(date);
    points.set(key, { key, date, revenue: 0, orders: 0 });
  }
  for (const o of inWindow(orders, now - days * DAY, now).filter(counted)) {
    const point = points.get(dayKey(o.createdAt));
    if (!point) continue;
    point.revenue += o.total;
    point.orders += 1;
  }
  return [...points.values()];
}

export function salesByCategory(orders: Order[], products: Map<string, Product>, days: number, now = Date.now()) {
  const totals = new Map<string, number>();
  for (const o of inWindow(orders, now - days * DAY, now).filter(counted)) {
    for (const l of o.lines) {
      const p = products.get(l.productId);
      const label = p ? `${genderLabel(p.gender)} · ${CATEGORIES[p.category].label}` : "Other";
      totals.set(label, (totals.get(label) ?? 0) + l.price * l.quantity);
    }
  }
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function topProducts(orders: Order[], days: number, now = Date.now(), limit = 5) {
  const units = new Map<string, { productId: string; name: string; image: string; units: number; revenue: number }>();
  for (const o of inWindow(orders, now - days * DAY, now).filter(counted)) {
    for (const l of o.lines) {
      const row = units.get(l.productId) ?? { productId: l.productId, name: l.name, image: l.image, units: 0, revenue: 0 };
      row.units += l.quantity;
      row.revenue += l.price * l.quantity;
      units.set(l.productId, row);
    }
  }
  return [...units.values()].sort((a, b) => b.units - a.units || b.revenue - a.revenue).slice(0, limit);
}

/** Compact currency for axis ticks and tiles: S$950, S$1.2K, S$12K. */
export function compactPrice(value: number): string {
  if (value >= 1000) return `S$${(value / 1000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return `S$${Math.round(value)}`;
}

/** Rounded tick step so an axis gets 3–5 clean ticks. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
  const ticks = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}
