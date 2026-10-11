"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { COLOR_FAMILIES, PRICE_RANGES, type ColorFamily, type FilterState } from "@/lib/filters";
import type { CategorySlug } from "@/lib/types";

interface FilterPanelProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  categories: CategorySlug[];
  sizes: string[];
  colors: ColorFamily[];
  counts: { categories: Record<string, number> };
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details open className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-xs font-bold uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-lg leading-none font-normal transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

function CheckRow({
  checked,
  onClick,
  children,
}: {
  checked: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className="flex w-full items-center gap-3 py-1.5 text-left text-sm hover:text-accent"
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center border",
          checked ? "border-ink bg-ink text-paper" : "border-ink/30",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {children}
    </button>
  );
}

export function FilterPanel({ filters, onChange, categories, sizes, colors, counts }: FilterPanelProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <div>
      {categories.length > 1 && (
        <Group title="Category">
          {categories.map((c) => (
            <CheckRow
              key={c}
              checked={filters.categories.includes(c)}
              onClick={() => set({ categories: toggle(filters.categories, c) })}
            >
              <span className="flex-1">{CATEGORIES[c].label}</span>
              <span className="text-xs text-muted">{counts.categories[c] ?? 0}</span>
            </CheckRow>
          ))}
        </Group>
      )}

      <Group title="Size">
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const active = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => set({ sizes: toggle(filters.sizes, s) })}
                className={cn(
                  "h-9 min-w-11 border px-2 text-xs font-medium transition-colors",
                  active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Colour">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {COLOR_FAMILIES.filter((f) => colors.includes(f.name)).map((f) => {
            const active = filters.colors.includes(f.name);
            return (
              <button
                key={f.name}
                type="button"
                aria-pressed={active}
                onClick={() => set({ colors: toggle(filters.colors, f.name) })}
                className="flex items-center gap-2 py-1.5 text-left text-sm hover:text-accent"
              >
                <span
                  className={cn(
                    "size-5 shrink-0 rounded-full border",
                    active ? "ring-2 ring-ink ring-offset-2" : "border-ink/15",
                  )}
                  style={{ backgroundColor: f.hex }}
                />
                {f.name}
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Price">
        {PRICE_RANGES.map((r) => (
          <CheckRow
            key={r.id}
            checked={filters.prices.includes(r.id)}
            onClick={() => set({ prices: toggle(filters.prices, r.id) })}
          >
            {r.label}
          </CheckRow>
        ))}
      </Group>

      <Group title="Availability">
        <CheckRow checked={filters.inStock} onClick={() => set({ inStock: !filters.inStock })}>
          In stock only
        </CheckRow>
        <CheckRow checked={filters.onSale} onClick={() => set({ onSale: !filters.onSale })}>
          On sale
        </CheckRow>
      </Group>
    </div>
  );
}
