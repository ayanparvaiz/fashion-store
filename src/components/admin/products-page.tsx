"use client";

import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES, categoryLabel, productHref, productImage, totalStock } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useAllProducts, useCatalog } from "@/lib/store/catalog";
import { useUI } from "@/lib/store/ui";
import type { CategorySlug, Gender } from "@/lib/types";
import { LinkButton } from "@/components/ui/button";
import { Card, PageHeader, Td, Th, adminInput } from "./admin-ui";

export function ProductsPage() {
  const products = useAllProducts();
  const remove = useCatalog((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<Gender | "all">("all");
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const [stock, setStock] = useState<"all" | "low" | "out">("all");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (gender !== "all" && p.gender !== gender) return false;
      if (category !== "all" && p.category !== category) return false;
      const total = totalStock(p);
      if (stock === "low" && !(total > 0 && total <= 10)) return false;
      if (stock === "out" && total !== 0) return false;
      return !q || `${p.name} ${p.sku} ${p.color.name}`.toLowerCase().includes(q);
    });
  }, [products, query, gender, category, stock]);

  return (
    <div>
      <PageHeader
        title="Products"
        description={`${products.length} products in the catalogue.`}
        actions={
          <LinkButton href="/admin/products/edit/" size="sm">
            <Plus className="size-4" /> Add product
          </LinkButton>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <label className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, SKU or colour…"
              aria-label="Search products"
              className={cn(adminInput, "w-full pl-9")}
            />
          </label>
          <select aria-label="Gender" value={gender} onChange={(e) => setGender(e.target.value as Gender | "all")} className={adminInput}>
            <option value="all">All genders</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
          </select>
          <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as CategorySlug | "all")} className={adminInput}>
            <option value="all">All categories</option>
            {(Object.keys(CATEGORIES) as CategorySlug[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORIES[c].label}
              </option>
            ))}
          </select>
          <select aria-label="Stock" value={stock} onChange={(e) => setStock(e.target.value as typeof stock)} className={adminInput}>
            <option value="all">Any stock</option>
            <option value="low">Low stock (≤10)</option>
            <option value="out">Sold out</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-line bg-soft/60">
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((p) => {
                const total = totalStock(p);
                return (
                  <tr key={p.id} className="hover:bg-soft/60">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded bg-soft">
                          <Image src={productImage(p)} alt="" fill sizes="44px" className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/edit/?id=${p.id}`} className="block truncate font-medium hover:underline">
                            {p.name}
                          </Link>
                          <p className="text-xs text-muted">
                            {p.sku} · {p.color.name}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-muted">{categoryLabel(p)}</Td>
                    <Td className="tabular-nums">
                      {formatPrice(p.price)}
                      {p.compareAtPrice && <span className="ml-1.5 text-xs text-muted line-through">{formatPrice(p.compareAtPrice)}</span>}
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          "tabular-nums",
                          total === 0 ? "font-semibold text-accent" : total <= 10 ? "font-semibold text-warning" : "",
                        )}
                      >
                        {total === 0 ? "Sold out" : `${total} in stock`}
                      </span>
                    </Td>
                    <Td>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-medium",
                          p.status === "draft" ? "bg-soft text-muted" : "bg-success/10 text-success",
                        )}
                      >
                        {p.status === "draft" ? "Draft" : "Active"}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={productHref(p)} target="_blank" className="rounded p-2 hover:bg-soft" aria-label={`View ${p.name} in store`}>
                          <Eye className="size-4" />
                        </Link>
                        <Link href={`/admin/products/edit/?id=${p.id}`} className="rounded p-2 hover:bg-soft" aria-label={`Edit ${p.name}`}>
                          <Pencil className="size-4" />
                        </Link>
                        <button
                          type="button"
                          className="rounded p-2 text-accent hover:bg-accent-soft"
                          aria-label={`Delete ${p.name}`}
                          onClick={() => {
                            if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
                            remove(p.id);
                            toast(`Deleted ${p.name}`);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {list.length === 0 && <p className="py-14 text-center text-sm text-muted">No products match.</p>}
        </div>
      </Card>
    </div>
  );
}
