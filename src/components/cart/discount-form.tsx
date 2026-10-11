"use client";

import { Tag, X } from "lucide-react";
import { useState } from "react";
import { checkDiscount } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { useDiscounts } from "@/lib/store/discounts";
import { useUI } from "@/lib/store/ui";

export function DiscountForm({ subtotal }: { subtotal: number }) {
  const code = useCart((s) => s.discountCode);
  const apply = useCart((s) => s.applyDiscount);
  const codes = useDiscounts((s) => s.codes);
  const toast = useUI((s) => s.toast);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (code) {
    const check = checkDiscount(code, codes, subtotal);
    return (
      <div>
        <div className="flex items-center justify-between bg-soft px-3 py-2.5 text-sm">
          <span className="flex items-center gap-2 font-semibold">
            <Tag className="size-4" /> {code}
          </span>
          <button
            type="button"
            onClick={() => apply(null)}
            className="p-1 text-muted hover:text-ink"
            aria-label={`Remove code ${code}`}
          >
            <X className="size-4" />
          </button>
        </div>
        {!check.ok && <p className="mt-1.5 text-xs text-accent">{check.error}</p>}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const result = checkDiscount(value, codes, subtotal);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        apply(result.code.code);
        setValue("");
        setError(null);
        toast(`Code ${result.code.code} applied — ${result.code.description}`, "success");
      }}
    >
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Discount code"
          aria-label="Discount code"
          aria-invalid={error ? true : undefined}
          className="h-11 min-w-0 flex-1 border border-line px-3 text-sm uppercase placeholder:normal-case focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="h-11 bg-ink px-5 text-xs font-semibold uppercase tracking-[0.14em] text-paper disabled:opacity-40"
        >
          Apply
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-accent">{error}</p>}
      <p className="mt-1.5 text-xs text-muted">Try WELCOME10 for 10% off.</p>
    </form>
  );
}
