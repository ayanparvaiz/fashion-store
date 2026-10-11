import type { DiscountCode, StoreSettings } from "./types";

export interface PricedLine {
  price: number;
  quantity: number;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  /** Amount still needed to unlock free standard delivery (0 when unlocked). */
  freeShippingRemaining: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export type DiscountCheck = { ok: true; code: DiscountCode } | { ok: false; error: string };

export function checkDiscount(
  input: string,
  codes: DiscountCode[],
  subtotal: number,
): DiscountCheck {
  const code = codes.find((c) => c.code === input.trim().toUpperCase());
  if (!code || !code.active) return { ok: false, error: "This code isn't valid." };
  if (subtotal < code.minSubtotal) {
    return { ok: false, error: `Spend S$${code.minSubtotal} or more to use ${code.code}.` };
  }
  return { ok: true, code };
}

export function computeTotals(
  lines: PricedLine[],
  settings: StoreSettings,
  options: { discount?: DiscountCode | null; method?: "standard" | "express" } = {},
): Totals {
  const subtotal = round(lines.reduce((sum, l) => sum + l.price * l.quantity, 0));
  const { discount: code = null, method = "standard" } = options;

  let discount = 0;
  if (code && subtotal >= code.minSubtotal) {
    if (code.type === "percent") discount = round((subtotal * code.value) / 100);
    if (code.type === "fixed") discount = Math.min(code.value, subtotal);
  }

  const afterDiscount = subtotal - discount;
  const freeStandard =
    afterDiscount >= settings.freeShippingThreshold || code?.type === "shipping";
  let shipping = 0;
  if (lines.length > 0) {
    shipping =
      method === "express"
        ? settings.expressShipping
        : freeStandard
          ? 0
          : settings.standardShipping;
  }

  return {
    subtotal,
    discount,
    shipping,
    total: round(afterDiscount + shipping),
    freeShippingRemaining: round(Math.max(0, settings.freeShippingThreshold - afterDiscount)),
  };
}
