import { productImage } from "../catalog";
import { checkDiscount, computeTotals } from "../pricing";
import { useCart } from "../store/cart";
import { mergeProducts, useCatalog } from "../store/catalog";
import { useDiscounts } from "../store/discounts";
import { nextOrderNumber, useOrders } from "../store/orders";
import { useSettings } from "../store/settings";
import type { Address, Order, OrderLine } from "../types";

export interface CheckoutInput {
  email: string;
  phone: string;
  shippingAddress: Address;
  shippingMethod: "standard" | "express";
  note?: string;
}

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; error: string };

/**
 * Creates an order from the current cart. Runs entirely in the browser for
 * the MVP; with Firebase this becomes a Firestore transaction (or a Cloud
 * Function) that re-checks stock and prices on the server.
 */
export function placeOrder(input: CheckoutInput): PlaceOrderResult {
  const cart = useCart.getState();
  const catalog = useCatalog.getState();
  const { settings } = useSettings.getState();
  const { codes, recordUse } = useDiscounts.getState();
  const products = new Map(mergeProducts(catalog).map((p) => [p.id, p]));

  if (cart.items.length === 0) return { ok: false, error: "Your bag is empty." };
  if (!settings.codEnabled) return { ok: false, error: "Cash on Delivery is currently unavailable." };

  const lines: OrderLine[] = [];
  for (const item of cart.items) {
    const product = products.get(item.productId);
    if (!product || product.status === "draft") {
      return { ok: false, error: "An item in your bag is no longer available." };
    }
    const inStock = product.stock[item.size] ?? 0;
    if (inStock < item.quantity) {
      return {
        ok: false,
        error: `Only ${inStock} left of ${product.name} in size ${item.size}. Please update your bag.`,
      };
    }
    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      color: product.color.name,
      size: item.size,
      price: product.price,
      quantity: item.quantity,
      image: productImage(product),
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const discountCheck = cart.discountCode ? checkDiscount(cart.discountCode, codes, subtotal) : null;
  const discount = discountCheck?.ok ? discountCheck.code : null;
  const totals = computeTotals(lines, settings, { discount, method: input.shippingMethod });

  const { orders, add } = useOrders.getState();
  const now = new Date().toISOString();
  const order: Order = {
    id: crypto.randomUUID(),
    number: nextOrderNumber(orders),
    createdAt: now,
    status: "pending",
    history: [{ status: "pending", at: now }],
    email: input.email.trim().toLowerCase(),
    phone: input.phone.trim(),
    shippingAddress: input.shippingAddress,
    shippingMethod: input.shippingMethod,
    paymentMethod: "cod",
    lines,
    subtotal: totals.subtotal,
    discount: totals.discount,
    discountCode: discount?.code ?? null,
    shipping: totals.shipping,
    total: totals.total,
    note: input.note?.trim() || undefined,
  };

  add(order);
  for (const line of lines) catalog.adjustStock(line.productId, line.size, -line.quantity);
  if (discount) recordUse(discount.code);
  cart.clear();

  return { ok: true, order };
}

export function findOrder(number: string, emailOrPhone: string): Order | undefined {
  const needle = emailOrPhone.trim().toLowerCase().replace(/\s+/g, "");
  return useOrders
    .getState()
    .orders.find(
      (o) =>
        o.number.toLowerCase() === number.trim().toLowerCase().replace(/^#/, "") &&
        (o.email === needle || o.phone.replace(/\s+/g, "") === needle),
    );
}
