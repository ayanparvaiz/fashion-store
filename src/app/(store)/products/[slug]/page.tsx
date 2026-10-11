import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductView } from "@/components/product/product-view";
import { productAlt, productHref, productImage, seedProducts, totalStock } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export const dynamicParams = false;

const bySlug = new Map(seedProducts.map((p) => [p.slug, p]));

export function generateStaticParams() {
  return seedProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = bySlug.get(slug);
  if (!product) return {};
  const image = `${productImage(product)}&w=1200&q=80&auto=format`;
  return {
    title: `${product.name} — ${product.color.name}`,
    description: product.description,
    alternates: { canonical: productHref(product) },
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: image, width: 1200, height: 1600, alt: productAlt(product) }],
    },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = bySlug.get(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    color: product.color.name,
    material: product.material,
    description: product.description,
    image: `${productImage(product)}&w=1200&q=80&auto=format`,
    brand: { "@type": "Brand", name: "Fashion Store" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${productHref(product)}`,
      priceCurrency: "SGD",
      price: product.price.toFixed(2),
      availability:
        totalStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductView slug={slug} />
    </>
  );
}
