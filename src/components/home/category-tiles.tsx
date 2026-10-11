import Image from "next/image";
import Link from "next/link";
import { productImage, seedProducts } from "@/lib/catalog";
import { categoryHref } from "@/lib/collections";
import type { CategorySlug, Gender } from "@/lib/types";
import { SectionHeading } from "./section-heading";

const TILES: { label: string; gender: Gender; category: CategorySlug; productId: string }[] = [
  { label: "Dresses", gender: "women", category: "dresses", productId: "fs-004" },
  { label: "Tops", gender: "women", category: "tops", productId: "fs-015" },
  { label: "Jeans", gender: "women", category: "jeans", productId: "fs-025" },
  { label: "Hoodies", gender: "women", category: "hoodies", productId: "fs-035" },
  { label: "Coats", gender: "women", category: "jackets", productId: "fs-041" },
  { label: "Graphic Tees", gender: "men", category: "t-shirts", productId: "fs-053" },
  { label: "Shirts", gender: "men", category: "shirts", productId: "fs-061" },
  { label: "Men's Hoodies", gender: "men", category: "hoodies", productId: "fs-071" },
  { label: "Pants", gender: "men", category: "pants", productId: "fs-081" },
  { label: "Jackets", gender: "men", category: "jackets", productId: "fs-091" },
];

const byId = new Map(seedProducts.map((p) => [p.id, p]));

export function CategoryTiles() {
  return (
    <section className="container-page py-14 lg:py-20">
      <SectionHeading eyebrow="Find your fit" title="Shop by category" />
      <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
        {TILES.map((tile) => {
          const product = byId.get(tile.productId);
          if (!product) return null;
          return (
            <li key={tile.label} className="w-[38%] shrink-0 snap-start sm:w-[24%] lg:w-auto">
              <Link href={categoryHref(tile.gender, tile.category)} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-soft">
                  <Image
                    src={productImage(product)}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, 38vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/60 to-transparent" />
                  <span className="absolute right-3 bottom-3 left-3 font-display text-base leading-tight text-paper uppercase sm:text-lg">
                    {tile.label}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
