import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrder } from "@/components/order/track-order";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the delivery status of your Fashion Store order.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <TrackOrder />
    </Suspense>
  );
}
