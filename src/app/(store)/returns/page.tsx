import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = {
  title: "Returns & exchanges",
  description: "Free 30-day returns and exchanges on Fashion Store orders.",
};

export default function ReturnsPage() {
  return (
    <ContentPage eyebrow="Help centre" title="Returns & exchanges" intro="Not quite right? Returns are free within 30 days.">
      <h2>Our promise</h2>
      <p>You can return or exchange any unworn, unwashed item with its original tags within <strong>30 days</strong> of delivery — including sale items.</p>
      <h2>How to return</h2>
      <ul>
        <li><Link href="/contact/">Contact us</Link> with your order number and the items you&apos;d like to return.</li>
        <li>We&apos;ll arrange a free courier collection from your address within 2 business days.</li>
        <li>Pack the items securely with the original tags attached.</li>
      </ul>
      <h2>Refunds</h2>
      <p>As orders are paid by cash on delivery, refunds are made by PayNow or bank transfer within 5 business days of us receiving your return.</p>
      <h2>Exchanges</h2>
      <p>Need a different size? We&apos;ll deliver the new size when we collect the original — subject to availability.</p>
      <h2>Non-returnable items</h2>
      <p>For hygiene reasons, items that have been worn, washed or had their tags removed cannot be returned.</p>
    </ContentPage>
  );
}
