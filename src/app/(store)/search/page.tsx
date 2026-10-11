import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/components/pages/search-page";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <SearchPage />
    </Suspense>
  );
}
