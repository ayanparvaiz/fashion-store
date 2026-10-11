import Image from "next/image";
import { banners, photoUrl } from "@/lib/catalog";
import { collectionHref } from "@/lib/collections";
import { LinkButton } from "@/components/ui/button";

export function SaleBanner() {
  return (
    <section className="grid bg-accent text-paper lg:grid-cols-2">
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[560px]">
        <Image
          src={photoUrl(banners.sale)}
          alt="Shopper carrying bags from a sale"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <div className="relative flex flex-col justify-center overflow-hidden px-6 py-14 sm:px-12 lg:px-20">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -bottom-16 font-display text-[220px] leading-none text-paper/10 select-none lg:text-[300px]"
        >
          %
        </span>
        <p className="eyebrow text-paper/80">Mid-season sale</p>
        <h2 className="heading-display mt-3 text-6xl leading-[0.9] sm:text-7xl lg:text-8xl">
          Up to
          <br />
          30% off
        </h2>
        <p className="mt-6 max-w-sm text-base text-paper/85">
          Dresses, denim, hoodies and outerwear at prices that won&apos;t last. Extra 10% off your
          first order with code <strong className="text-paper">WELCOME10</strong>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href={collectionHref("sale")} variant="inverse" size="lg">
            Shop the Sale
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
