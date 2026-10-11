import type { Metadata } from "next";
import { StoreChrome } from "@/components/layout/store-chrome";
import { NotFoundView } from "@/components/pages/not-found-view";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <StoreChrome>
      <NotFoundView />
    </StoreChrome>
  );
}
