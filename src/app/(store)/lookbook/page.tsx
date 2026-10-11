import type { Metadata } from "next";
import { Lookbook } from "@/components/home/lookbook";
import { Marquee } from "@/components/motion/marquee";
import { SplitReveal } from "@/components/motion/reveal";
import { CategoryShowcase } from "@/components/home/category-showcase";

export const metadata: Metadata = {
  title: "SS26 Lookbook",
  description: "Six looks from the Fashion Store SS26 collection — shop every piece.",
};

export default function LookbookPage() {
  return (
    <>
      <section className="bg-ink pt-16 pb-6 text-paper lg:pt-24">
        <div className="container-page">
          <p className="eyebrow text-accent">Spring / Summer 2026</p>
          <SplitReveal as="h1" trigger="mount" className="heading-display mt-4 max-w-5xl text-4xl leading-[0.92] sm:text-5xl lg:text-7xl">
            The lookbook
          </SplitReveal>
          <p className="mt-6 max-w-lg text-paper/70">
            Six stories styled in our Singapore studio — from after-hours satin to resort linen. Tap any piece to shop it.
          </p>
        </div>
      </section>
      <Lookbook />
      <Marquee tone="accent" items={["Shop the look", "New drops every Friday", "Cash on delivery"]} />
      <CategoryShowcase />
    </>
  );
}
