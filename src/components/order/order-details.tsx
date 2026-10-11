import Image from "next/image";
import Link from "next/link";
import { OrderTotals } from "@/components/cart/order-totals";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderLines({ order }: { order: Order }) {
  return (
    <ul className="divide-y divide-line">
      {order.lines.map((line) => (
        <li key={`${line.productId}-${line.size}`} className="flex items-center gap-4 py-4">
          <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-soft">
            {line.image && <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/products/${line.slug}/`} className="line-clamp-1 text-sm font-medium hover:underline">
              {line.name}
            </Link>
            <p className="text-xs text-muted">
              {line.color} / {line.size} · Qty {line.quantity}
            </p>
          </div>
          <p className="text-sm tabular-nums">{formatPrice(line.price * line.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}

export function OrderSummaryCard({ order }: { order: Order }) {
  const a = order.shippingAddress;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.14em]">Items</h3>
        <OrderLines order={order} />
      </div>
      <div className="space-y-6">
        <div className="bg-soft p-5">
          <OrderTotals
            totals={order}
            discountCode={order.discountCode}
            shippingLabel={order.shippingMethod === "express" ? "Express delivery" : "Standard delivery"}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-1">
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em]">Delivery to</h3>
            <p>
              {a.firstName} {a.lastName}
              <br />
              {a.address}
              {a.unit && `, ${a.unit}`}
              <br />
              Singapore {a.postalCode}
            </p>
            <p className="mt-1 text-muted">{order.phone}</p>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em]">Payment</h3>
            <p>Cash on Delivery</p>
            <p className="text-muted">Due on arrival: {formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
