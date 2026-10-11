import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { productAlt, productHref, productImage, seedProducts } from "@/lib/catalog";
import { InstagramIcon } from "@/components/ui/social-icons";

const IDS = ["fs-003", "fs-053", "fs-044", "fs-093", "fs-012", "fs-076"];
const byId = new Map(seedProducts.map((p) => [p.id, p]));

export function SocialGrid() {
  const products = IDS.map((id) => byId.get(id)).filter((p) => p !== undefined);
  return (
    <section className="py-14 lg:py-20">
      <div className="container-page mb-8 text-center">
        <p className="eyebrow text-accent">As seen on you</p>
        <h2 className="heading-display mt-2 text-3xl sm:text-4xl lg:text-5xl">#FashionStoreStyle</h2>
        <p className="mt-3 text-sm text-muted">Tag us @fashionstore.sg for a chance to be featured.</p>
      </div>
      <ul className="grid grid-cols-3 gap-1 lg:grid-cols-6">
        {products.map((p) => (
          <li key={p.id}>
            <Link href={productHref(p)} className="group relative block aspect-square overflow-hidden bg-soft">
              <Image
                src={productImage(p, "detail")}
                alt={productAlt(p)}
                fill
                sizes="(min-width: 1024px) 17vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 grid place-items-center bg-ink/0 text-paper opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
                <InstagramIcon className="size-7" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
