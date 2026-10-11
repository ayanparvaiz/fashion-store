import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterBlock() {
  return (
    <section className="border-t border-line">
      <div className="container-page grid items-center gap-8 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="eyebrow text-accent">Join the club</p>
          <h2 className="heading-display mt-2 text-3xl leading-[0.95] sm:text-4xl">
            Get 10% off your
            <br />
            first order
          </h2>
        </div>
        <div className="lg:pl-16">
          <p className="mb-5 text-sm text-ink/70">
            Be first to know about new drops, exclusive offers and style inspo. Unsubscribe anytime.
          </p>
          <NewsletterForm tone="light" />
        </div>
      </div>
    </section>
  );
}
