import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionView } from "@/components/collection/collection-view";
import { COLLECTIONS, collectionHref, getCollection } from "@/lib/collections";

export const dynamicParams = false;

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata(props: PageProps<"/collections/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const collection = getCollection(handle);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.description,
    alternates: { canonical: collectionHref(handle) },
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[handle]">) {
  const { handle } = await props.params;
  if (!getCollection(handle)) notFound();
  return <CollectionView handle={handle} />;
}
