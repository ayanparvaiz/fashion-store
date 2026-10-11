import type { Metadata } from "next";
import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <ContentPage title="Terms of service" intro="Last updated October 2026.">
      <p>By placing an order with Fashion Store you agree to these terms. All prices are in Singapore dollars and include GST.</p>
      <h2>Orders</h2>
      <p>Orders are confirmed by phone or WhatsApp before dispatch. We may cancel an order if an item is out of stock or we cannot reach you to confirm.</p>
      <h2>Payment</h2>
      <p>Orders are paid in cash on delivery. Please have the exact amount ready for the courier.</p>
      <h2>Returns</h2>
      <p>See our returns &amp; exchanges policy for details on our 30-day returns.</p>
    </ContentPage>
  );
}
