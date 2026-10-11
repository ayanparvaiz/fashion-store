import type { Metadata } from "next";
import Link from "next/link";
import { AccordionItem } from "@/components/ui/accordion";
import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about orders, Cash on Delivery, delivery times, sizing and returns.",
};

const FAQS: { group: string; items: [string, React.ReactNode][] }[] = [
  {
    group: "Orders & payment",
    items: [
      ["How does Cash on Delivery work?", "Place your order online and pay the courier in cash when your parcel arrives. Please have the exact amount ready — it's shown on your order confirmation."],
      ["Do you accept cards or PayNow?", "Card and PayNow payments are coming soon. For now, all orders are Cash on Delivery."],
      ["Can I change or cancel my order?", <>Contact us within 2 hours of ordering and we&apos;ll do our best. Once an order is out for delivery it can no longer be changed. <Link href="/contact/">Get in touch</Link>.</>],
      ["Will you call me before delivery?", "Yes. We call or WhatsApp to confirm every Cash on Delivery order before it ships."],
    ],
  },
  {
    group: "Delivery",
    items: [
      ["How long does delivery take?", "Standard delivery takes 2–4 business days. Express delivery arrives the next business day when you order before 2pm."],
      ["How much is delivery?", "Standard delivery is S$4.99 and free on orders over S$80. Express delivery is S$9.99."],
      ["Do you deliver outside Singapore?", "Not yet — we currently deliver islandwide within Singapore only."],
      ["How do I track my order?", <>Use our <Link href="/track-order/">order tracker</Link> with your order number and email or phone.</>],
    ],
  },
  {
    group: "Sizing & returns",
    items: [
      ["How do I find my size?", <>Check the size guide on each product page or our full <Link href="/size-guide/">size guide</Link>. Between sizes? Size up for a relaxed fit.</>],
      ["What is your returns policy?", <>Return unworn items with tags within 30 days for an exchange or refund. See <Link href="/returns/">returns &amp; exchanges</Link>.</>],
      ["Are sale items returnable?", "Yes — sale items can be exchanged or returned within 30 days, just like full-price items."],
    ],
  },
];

export default function FaqPage() {
  return (
    <ContentPage eyebrow="Help centre" title="FAQ" intro="Everything you need to know about shopping with Fashion Store.">
      {FAQS.map((section) => (
        <section key={section.group}>
          <h2>{section.group}</h2>
          <div className="mt-2 border-t border-line">
            {section.items.map(([q, a]) => (
              <AccordionItem key={q} title={q}>
                {a}
              </AccordionItem>
            ))}
          </div>
        </section>
      ))}
    </ContentPage>
  );
}
