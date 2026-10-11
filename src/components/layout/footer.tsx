import { Banknote, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { FOOTER_NAV } from "@/lib/navigation";
import { Logo } from "@/components/ui/logo";
import {
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
  TikTokIcon,
} from "@/components/ui/social-icons";
import { NewsletterForm } from "./newsletter-form";

const PERKS = [
  { icon: Truck, title: "Free delivery", text: "On orders over S$80" },
  { icon: Banknote, title: "Cash on Delivery", text: "Pay when it arrives" },
  { icon: RotateCcw, title: "30-day returns", text: "Easy, no-fuss returns" },
  { icon: ShieldCheck, title: "Shop safely", text: "Quality checked styles" },
];

const SOCIALS = [
  { label: "Instagram", icon: InstagramIcon },
  { label: "TikTok", icon: TikTokIcon },
  { label: "Facebook", icon: FacebookIcon },
  { label: "Pinterest", icon: PinterestIcon },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-paper">
      <div className="border-b border-paper/10">
        <ul className="container-page grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <Icon className="size-6 shrink-0 text-accent" strokeWidth={1.6} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em]">{title}</p>
                <p className="text-xs text-paper/60">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo inverse />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
            Trend-led fashion for women and men, delivered across Singapore. New drops every
            Friday.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid size-10 place-items-center rounded-full border border-paper/20 transition-colors hover:border-accent hover:bg-accent"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_NAV.map((group) => (
          <div key={group.title} className="lg:col-span-2">
            <p className="eyebrow mb-4 text-paper/50">{group.title}</p>
            <ul className="space-y-2.5">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-paper/80 hover:text-paper">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="lg:col-span-2">
          <p className="eyebrow mb-4 text-paper/50">Stay in the loop</p>
          <p className="mb-4 text-sm text-paper/70">Get 10% off your first order plus first access to drops.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Fashion Store. All prices in SGD and include GST.</p>
          <div className="flex items-center gap-2">
            <span className="rounded-sm border border-paper/20 px-2 py-1 font-semibold text-paper/80">
              Cash on Delivery
            </span>
            <span className="rounded-sm border border-paper/10 px-2 py-1">Cards &amp; PayNow soon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
