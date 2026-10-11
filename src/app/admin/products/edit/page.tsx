import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Edit product" };

export default function Page() {
  return (
    <Suspense>
      <ProductForm />
    </Suspense>
  );
}
