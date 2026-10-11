import type { Metadata } from "next";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { banners, photoUrl } from "@/lib/catalog";
import { collectionHref } from "@/lib/collections";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About us",
  description: "Fashion Store brings trend-led, affordable fashion for women and men to Singapore.",
};

const VALUES = [
  { title: "New drops weekly", text: "Fresh styles land every Friday, inspired by what you're wearing right now." },
  { title: "Fair, honest prices", text: "Runway-worthy looks without the runway price tag — most pieces under S$60." },
  { title: "Made to be worn", text: "Every style is quality checked in Singapore before it reaches your door." },
  { title: "Pay your way", text: "Cash on Delivery islandwide, with cards and PayNow coming soon." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative grid min-h-[60vh] place-items-center overflow-hidden bg-ink text-paper">
        <Image src={photoUrl(banners.about)} alt="" fill priority sizes="100vw" className="object-cover opacity-50" />
        <div className="container-page relative py-24 text-center">
          <p className="eyebrow text-paper/80">Our story</p>
          <h1 className="heading-display mx-auto mt-3 max-w-4xl text-5xl leading-[0.95] sm:text-7xl">
            Fashion that makes you feel like you
          </h1>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div className="space-y-5 text-base leading-relaxed text-ink/80">
          <p className="eyebrow text-accent">Born in Singapore</p>
          <h2 className="heading-display text-4xl text-ink">Style for every main-character moment</h2>
          <p>
            Fashion Store started with a simple idea: everyone deserves to feel confident in what they wear,
            without spending a fortune. We design and curate trend-led pieces for women and men — from
            going-out dresses and perfect-fit denim to heavyweight streetwear essentials.
          </p>
          <p>
            We keep our collections tight, our prices honest and our service personal. Every order is packed by
            our team, and we call to confirm before it ships so you&apos;re never left guessing.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <LinkButton href={collectionHref("women")}>Shop Women</LinkButton>
            <LinkButton href={collectionHref("men")} variant="outline">
              Shop Men
            </LinkButton>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={photoUrl(banners["about-2"])} alt="Folded tees on hangers" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="bg-soft">
        <ul className="container-page grid gap-8 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
          {VALUES.map((v, i) => (
            <li key={v.title}>
              <span className="font-display text-4xl text-accent">0{i + 1}</span>
              <h3 className="mt-3 text-sm font-bold uppercase tracking-[0.14em]">{v.title}</h3>
              <p className="mt-2 text-sm text-ink/70">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
