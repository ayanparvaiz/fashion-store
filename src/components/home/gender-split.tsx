import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { banners, photoUrl } from "@/lib/catalog";
import { collectionHref } from "@/lib/collections";
import { Parallax } from "@/components/motion/reveal";

const TILES = [
  {
    href: collectionHref("women"),
    image: banners.women,
    title: "Women",
    text: "Dresses, denim & statement outerwear",
    position: "object-[50%_30%]",
  },
  {
    href: collectionHref("men"),
    image: banners.men,
    title: "Men",
    text: "Heavyweight tees, hoodies & jackets",
    position: "object-[50%_40%]",
  },
];

export function GenderSplit() {
  return (
    <section className="container-page grid gap-3 py-14 sm:grid-cols-2 lg:gap-5 lg:py-20">
      {TILES.map((tile) => (
        <Link key={tile.href} href={tile.href} className="group relative block aspect-[4/5] overflow-hidden bg-ink sm:aspect-[4/5] lg:aspect-[5/6]">
          <Parallax className="absolute inset-0" speed={0.1}>
            <div className="absolute inset-[-12%_0]">
              <Image
                src={photoUrl(tile.image)}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className={`object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 ${tile.position}`}
              />
            </div>
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <div className="absolute inset-x-6 bottom-6 text-paper lg:inset-x-10 lg:bottom-10">
            <h2 className="heading-display text-5xl lg:text-7xl">{tile.title}</h2>
            <p className="mt-2 text-sm text-paper/85">{tile.text}</p>
            <span className="mt-5 inline-block border-b-2 border-paper pb-1 text-xs font-bold uppercase tracking-[0.16em]">
              Shop {tile.title}
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
