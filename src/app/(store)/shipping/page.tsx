import type { Metadata } from "next";
import { ContentPage } from "@/components/pages/content-page";
import { DEFAULT_SETTINGS as S } from "@/lib/store/settings";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shipping & delivery",
  description: "Delivery options, costs and timings for Fashion Store orders in Singapore.",
};

export default function ShippingPage() {
  return (
    <ContentPage eyebrow="Help centre" title="Shipping & delivery" intro="Fast, tracked delivery to every corner of Singapore.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="bg-ink text-left text-paper">
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Timing</th>
              <th className="px-4 py-3">Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="px-4 py-3 font-semibold text-ink">Standard</td>
              <td className="px-4 py-3">2–4 business days</td>
              <td className="px-4 py-3">{formatPrice(S.standardShipping)} · Free over {formatPrice(S.freeShippingThreshold)}</td>
            </tr>
            <tr className="border-b border-line">
              <td className="px-4 py-3 font-semibold text-ink">Express</td>
              <td className="px-4 py-3">Next business day (order by 2pm)</td>
              <td className="px-4 py-3">{formatPrice(S.expressShipping)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h2>Cash on Delivery</h2>
      <p>All orders are paid in cash to the courier when they arrive. We&apos;ll call or WhatsApp you to confirm your order before it ships, and the courier will contact you on the day of delivery.</p>
      <h2>Dispatch times</h2>
      <p>Orders placed before 2pm on a business day are dispatched the same day. Orders placed after 2pm, on weekends or on public holidays are dispatched the next business day.</p>
      <h2>Missed deliveries</h2>
      <p>If you&apos;re not home, the courier will reattempt delivery the next business day. After two missed attempts the parcel returns to us and we&apos;ll contact you to rearrange.</p>
    </ContentPage>
  );
}
