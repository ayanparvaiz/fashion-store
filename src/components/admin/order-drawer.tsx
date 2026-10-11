"use client";

import { MessageCircle, Phone, Printer } from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/format";
import { useCatalog } from "@/lib/store/catalog";
import { useOrders } from "@/lib/store/orders";
import { useUI } from "@/lib/store/ui";
import type { Order, OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { OrderLines } from "@/components/order/order-details";
import { OrderTimeline } from "@/components/order/order-timeline";
import { OrderTotals } from "@/components/cart/order-totals";
import { StatusBadge } from "./admin-ui";

const NEXT: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  pending: { status: "confirmed", label: "Confirm order" },
  confirmed: { status: "shipped", label: "Mark as shipped" },
  shipped: { status: "delivered", label: "Mark as delivered & paid" },
};

function printInvoice(order: Order) {
  const a = order.shippingAddress;
  const rows = order.lines
    .map(
      (l) =>
        `<tr><td>${escapeHtml(l.name)}<br><small>${escapeHtml(l.color)} / ${escapeHtml(l.size)}</small></td><td>${l.quantity}</td><td>${formatPrice(l.price)}</td><td>${formatPrice(l.price * l.quantity)}</td></tr>`,
    )
    .join("");
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><title>Invoice ${order.number}</title>
<style>body{font:14px/1.5 system-ui,sans-serif;margin:40px;color:#0a0a0a}h1{font-size:28px;margin:0}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e7e7e7}th:not(:first-child),td:not(:first-child){text-align:right}.tot td{border:0;padding:4px 8px}.grand td{font-weight:700;font-size:16px}small{color:#6b6b6b}.top{display:flex;justify-content:space-between}</style>
</head><body><div class="top"><div><h1>FASHION.STORE</h1><small>hello@fashionstore.sg · +65 6123 4567</small></div><div style="text-align:right"><strong>Invoice #${order.number}</strong><br><small>${formatDateTime(order.createdAt)}</small></div></div>
<p style="margin-top:32px"><strong>Deliver to</strong><br>${escapeHtml(`${a.firstName} ${a.lastName}`)}<br>${escapeHtml(a.address)}${a.unit ? `, ${escapeHtml(a.unit)}` : ""}<br>Singapore ${escapeHtml(a.postalCode)}<br>${escapeHtml(order.phone)}</p>
<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
<table style="width:280px;margin-left:auto"><tbody>
<tr class="tot"><td>Subtotal</td><td>${formatPrice(order.subtotal)}</td></tr>
${order.discount ? `<tr class="tot"><td>Discount</td><td>-${formatPrice(order.discount)}</td></tr>` : ""}
<tr class="tot"><td>Delivery</td><td>${order.shipping ? formatPrice(order.shipping) : "Free"}</td></tr>
<tr class="tot grand"><td>Cash to collect</td><td>${formatPrice(order.total)}</td></tr></tbody></table>
<p style="margin-top:40px"><small>Payment method: Cash on Delivery. Prices include GST.</small></p>
<script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function OrderDrawer({ order, onClose }: { order: Order | null; onClose: () => void }) {
  const setStatus = useOrders((s) => s.setStatus);
  const adjustStock = useCatalog((s) => s.adjustStock);
  const toast = useUI((s) => s.toast);

  return (
    <Sheet open={order !== null} onClose={onClose} title={order ? `Order #${order.number}` : ""} className="max-w-xl">
      {order && (
        <div className="space-y-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <StatusBadge status={order.status} />
              <p className="mt-1 text-xs text-muted">Placed {formatDateTime(order.createdAt)}{order.demo && " · demo order"}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => printInvoice(order)}>
              <Printer className="size-4" /> Invoice
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {NEXT[order.status] && (
              <Button
                onClick={() => {
                  const next = NEXT[order.status]!;
                  setStatus(order.id, next.status);
                  toast(`Order #${order.number} → ${next.status}`, "success");
                }}
              >
                {NEXT[order.status]!.label}
              </Button>
            )}
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Button
                variant="outline"
                onClick={() => {
                  if (!confirm(`Cancel order #${order.number}? Items will be returned to stock.`)) return;
                  setStatus(order.id, "cancelled");
                  for (const l of order.lines) adjustStock(l.productId, l.size, l.quantity);
                  toast(`Order #${order.number} cancelled and restocked`);
                }}
              >
                Cancel order
              </Button>
            )}
          </div>

          <div className="rounded-lg border border-line p-4">
            <OrderTimeline order={order} />
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em]">Items</h3>
            <OrderLines order={order} />
          </div>

          <div className="rounded-lg bg-soft p-4">
            <OrderTotals
              totals={order}
              discountCode={order.discountCode}
              shippingLabel={order.shippingMethod === "express" ? "Express delivery" : "Standard delivery"}
            />
            <p className="mt-3 text-xs font-semibold">Cash to collect: {formatPrice(order.total)}</p>
          </div>

          <div className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em]">Customer</h3>
              <p>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p className="text-muted">{order.email}</p>
              <p className="text-muted">{order.phone}</p>
              <div className="mt-3 flex gap-2">
                <a
                  href={`tel:${order.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:border-ink"
                >
                  <Phone className="size-3.5" /> Call
                </a>
                <a
                  href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${order.shippingAddress.firstName}, this is Fashion Store confirming your order #${order.number} (${formatPrice(order.total)}, cash on delivery).`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:border-ink"
                >
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em]">Delivery</h3>
              <p>
                {order.shippingAddress.address}
                {order.shippingAddress.unit && `, ${order.shippingAddress.unit}`}
                <br />
                Singapore {order.shippingAddress.postalCode}
              </p>
              <p className="mt-1 text-muted">{order.shippingMethod === "express" ? "Express" : "Standard"} delivery</p>
            </div>
          </div>

          {order.note && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">Customer note</p>
              <p className="mt-1">{order.note}</p>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
