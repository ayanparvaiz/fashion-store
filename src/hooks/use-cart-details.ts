"use client";

import { useMemo } from "react";
import { checkDiscount, computeTotals } from "@/lib/pricing";
import { useCart } from "@/lib/store/cart";
import { useProductMap } from "@/lib/store/catalog";
import { useDiscounts } from "@/lib/store/discounts";
import { useSettings } from "@/lib/store/settings";
import type { CartItem, Product } from "@/lib/types";

export interface CartLineView extends CartItem {
  product: Product;
  available: number;
}

/** Cart items joined with live product data, plus computed totals. */
export function useCartDetails(method: "standard" | "express" = "standard") {
  const items = useCart((s) => s.items);
  const discountCode = useCart((s) => s.discountCode);
  const products = useProductMap();
  const codes = useDiscounts((s) => s.codes);
  const settings = useSettings((s) => s.settings);

  return useMemo(() => {
    const lines: CartLineView[] = items.flatMap((item) => {
      const product = products.get(item.productId);
      return product ? [{ ...item, product, available: product.stock[item.size] ?? 0 }] : [];
    });
    const priced = lines.map((l) => ({ price: l.product.price, quantity: l.quantity }));
    const subtotal = priced.reduce((s, l) => s + l.price * l.quantity, 0);
    const check = discountCode ? checkDiscount(discountCode, codes, subtotal) : null;
    const discount = check?.ok ? check.code : null;
    const totals = computeTotals(priced, settings, { discount, method });
    return {
      lines,
      totals,
      discount,
      discountError: check && !check.ok ? check.error : null,
      settings,
      count: lines.reduce((s, l) => s + l.quantity, 0),
    };
  }, [items, discountCode, products, codes, settings, method]);
}
