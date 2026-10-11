"use client";

import { useEffect, useRef, useState } from "react";
import { compactPrice, niceTicks, type DailyPoint } from "@/lib/analytics";
import { formatPrice, formatWeekday } from "@/lib/format";

const HEIGHT = 240;
const PAD = { top: 16, right: 56, bottom: 28, left: 52 };

/**
 * Single-series area chart of daily revenue with a crosshair tooltip that
 * snaps to the nearest day (hover or arrow keys).
 */
export function RevenueChart({ data }: { data: DailyPoint[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const innerW = Math.max(10, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join("");
  const area = `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const last = data.length - 1;
  const labelEvery = Math.ceil(data.length / Math.max(2, Math.floor(innerW / 90)));

  const pick = (clientX: number) => {
    const rect = wrap.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = clientX - rect.left - PAD.left;
    const i = Math.round((rel / innerW) * (data.length - 1));
    setActive(Math.max(0, Math.min(last, i)));
  };

  const shown = active ?? null;
  const tipLeft = shown !== null ? Math.min(Math.max(x(shown), 80), width - 80) : 0;

  return (
    <div ref={wrap} className="relative select-none">
      <svg
        width={width}
        height={HEIGHT}
        role="img"
        aria-label={`Daily revenue for the last ${data.length} days`}
        tabIndex={0}
        className="block overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={() => setActive(null)}
        onFocus={() => setActive(last)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? last) - 1));
          if (e.key === "ArrowRight") setActive((a) => Math.min(last, (a ?? last) + 1));
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
            <text x={PAD.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
              {compactPrice(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          i % labelEvery === 0 || i === last ? (
            <text key={d.key} x={x(i)} y={HEIGHT - 6} textAnchor="middle" className="fill-muted text-[11px]">
              {formatWeekday(d.date).replace(/^\w+,?\s*/, "")}
            </text>
          ) : null,
        )}

        <path d={area} fill="var(--color-accent)" fillOpacity={0.1} />
        <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {shown !== null && (
          <line x1={x(shown)} x2={x(shown)} y1={PAD.top} y2={y(0)} stroke="var(--color-ink)" strokeOpacity={0.35} strokeWidth={1} />
        )}
        {/* End marker + label (selective direct label on the latest value) */}
        <circle cx={x(last)} cy={y(data[last]?.revenue ?? 0)} r={4} fill="var(--color-accent)" stroke="var(--color-paper)" strokeWidth={2} />
        <text x={x(last) + 8} y={y(data[last]?.revenue ?? 0)} dy="0.32em" className="fill-ink text-[11px] font-semibold">
          {compactPrice(data[last]?.revenue ?? 0)}
        </text>
        {shown !== null && shown !== last && (
          <circle cx={x(shown)} cy={y(data[shown].revenue)} r={4} fill="var(--color-accent)" stroke="var(--color-paper)" strokeWidth={2} />
        )}
      </svg>

      {shown !== null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-line bg-paper px-3 py-2 text-xs shadow-lg"
          style={{ left: tipLeft }}
        >
          <p className="text-sm font-semibold tabular-nums">{formatPrice(data[shown].revenue)}</p>
          <p className="text-muted">
            {formatWeekday(data[shown].date)} · {data[shown].orders} {data[shown].orders === 1 ? "order" : "orders"}
          </p>
        </div>
      )}
    </div>
  );
}
