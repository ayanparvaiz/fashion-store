"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

/**
 * Horizontal single-series bars (one hue), sorted by value. Each row is the
 * hit target; the value sits at the bar tip and the share shows on hover/focus.
 */
export function BarList({ data }: { data: { label: string; value: number }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  if (data.length === 0) return <p className="py-8 text-center text-sm text-muted">No sales in this period.</p>;

  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li
          key={d.label}
          tabIndex={0}
          onPointerEnter={() => setActive(d.label)}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive(d.label)}
          onBlur={() => setActive(null)}
          className="group rounded outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          aria-label={`${d.label}: ${formatPrice(d.value)} (${Math.round((d.value / total) * 100)}%)`}
        >
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-ink/80">{d.label}</span>
            <span className="text-muted tabular-nums">
              {active === d.label ? `${Math.round((d.value / total) * 100)}% of sales` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3.5 rounded-r-[4px] bg-accent transition-opacity group-hover:opacity-80"
              style={{ width: `${Math.max(2, (d.value / max) * 82)}%` }}
            />
            <span className="text-xs font-semibold tabular-nums">{formatPrice(d.value)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
