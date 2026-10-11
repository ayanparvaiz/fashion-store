"use client";

import { usePathname } from "next/navigation";
import { useMounted } from "@/hooks/use-mounted";
import { collectionHref } from "@/lib/collections";
import { useProductBySlug } from "@/lib/store/catalog";
import { LinkButton } from "@/components/ui/button";
import { ProductView } from "@/components/product/product-view";

/**
 * Products created in the admin panel have no prerendered page in the static
 * export, so their URLs land here — render them from the local catalog.
 */
export function NotFoundView() {
  const pathname = usePathname();
  const mounted = useMounted();
  const slug = pathname.match(/^\/products\/([^/]+)\/?$/)?.[1] ?? "";
  const product = useProductBySlug(slug);

  if (mounted && product) return <ProductView slug={slug} />;

  return (
    <div className="container-page flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-[120px] leading-none sm:text-[180px]">
        4<span className="text-accent">0</span>4
      </p>
      <h1 className="heading-display mt-2 text-3xl">This page went out of style</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to the good stuff.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/">Go home</LinkButton>
        <LinkButton href={collectionHref("new-arrivals")} variant="outline">
          Shop New Arrivals
        </LinkButton>
      </div>
    </div>
  );
}
