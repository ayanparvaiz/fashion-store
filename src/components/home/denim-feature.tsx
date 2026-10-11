import Image from "next/image";
import { banners, photoUrl } from "@/lib/catalog";
import { categoryHref } from "@/lib/collections";
import { LinkButton } from "@/components/ui/button";

const FITS = ["Skinny", "Mom", "Flare", "Wide leg", "Boyfriend", "Tapered"];

export function DenimFeature() {
  return (
    <section className="bg-soft">
      <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="relative aspect-[4/3] overflow-hidden lg:order-2">
          <Image
            src={photoUrl(banners.denim)}
            alt="Stacks of folded denim jeans"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="eyebrow text-accent">The denim edit</p>
          <h2 className="heading-display mt-3 text-5xl leading-[0.92] lg:text-7xl">
            Find your
            <br />
            perfect fit
          </h2>
          <p className="mt-5 max-w-md text-base text-ink/75">
            Premium stretch denim that holds its shape, in every wash and silhouette you love.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {FITS.map((fit) => (
              <li key={fit} className="border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium">
                {fit}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href={categoryHref("women", "jeans")} size="lg">
              Women&apos;s Jeans
            </LinkButton>
            <LinkButton href={categoryHref("men", "pants")} variant="outline" size="lg">
              Men&apos;s Pants
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
