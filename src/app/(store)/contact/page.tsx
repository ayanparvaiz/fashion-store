import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/pages/contact-form";
import { ContentPage } from "@/components/pages/content-page";
import { DEFAULT_SETTINGS } from "@/lib/store/settings";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about an order, sizing or returns? Our Singapore team is here to help.",
};

const DETAILS = [
  { icon: Mail, label: "Email", value: DEFAULT_SETTINGS.contactEmail },
  { icon: Phone, label: "Phone / WhatsApp", value: DEFAULT_SETTINGS.contactPhone },
  { icon: Clock, label: "Hours", value: "Mon – Sat, 10am – 7pm SGT" },
  { icon: MapPin, label: "Studio", value: "Singapore (online only)" },
];

export default function ContactPage() {
  return (
    <ContentPage eyebrow="We're here to help" title="Contact us" intro="We usually reply within one business day." wide>
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <ul className="space-y-6">
          {DETAILS.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center bg-soft">
                <Icon className="size-5" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em]">{label}</p>
                <p className="mt-1 text-sm text-ink/75">{value}</p>
              </div>
            </li>
          ))}
        </ul>
        <ContactForm />
      </div>
    </ContentPage>
  );
}
