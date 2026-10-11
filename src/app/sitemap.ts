import type { MetadataRoute } from "next";
import { productHref, seedProducts } from "@/lib/catalog";
import { COLLECTIONS, collectionHref } from "@/lib/collections";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const PAGES = ["/", "/lookbook/", "/about/", "/contact/", "/faq/", "/shipping/", "/returns/", "/size-guide/", "/track-order/"];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly" as const, priority: path === "/" ? 1 : 0.5 })),
    ...COLLECTIONS.map((c) => ({ url: `${SITE_URL}${collectionHref(c.handle)}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...seedProducts.map((p) => ({
      url: `${SITE_URL}${productHref(p)}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
