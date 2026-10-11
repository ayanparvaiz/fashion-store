import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/order/order-confirmation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <OrderConfirmation />
    </Suspense>
  );
}
