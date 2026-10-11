import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountPage } from "@/components/account/account-page";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <AccountPage />
    </Suspense>
  );
}
