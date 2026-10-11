import type { Metadata } from "next";
import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy policy" intro="Last updated October 2026.">
      <p>This demo storefront stores your bag, wishlist, account and orders only in your own browser. Nothing is sent to a server. When the store goes live, personal data will be handled in line with Singapore&apos;s Personal Data Protection Act (PDPA).</p>
      <h2>What we collect</h2>
      <p>To fulfil an order we need your name, email, mobile number and delivery address. We use these only to process and deliver your order and to contact you about it.</p>
      <h2>Marketing</h2>
      <p>We only send marketing emails if you subscribe, and you can unsubscribe at any time.</p>
      <h2>Contact</h2>
      <p>For any privacy question, email our Data Protection Officer at privacy@fashionstore.sg.</p>
    </ContentPage>
  );
}
