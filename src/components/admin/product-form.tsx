"use client";

import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, GENDER_CATEGORIES, productHref, productImage } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { resizeImage } from "@/lib/image-upload";
import { useAllProducts, useCatalog } from "@/lib/store/catalog";
import { useUI } from "@/lib/store/ui";
import type { CategorySlug, Gender, Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { Card, CardHeader, PageHeader, adminInput } from "./admin-ui";

const SIZE_SETS = {
  women: { default: ["XS", "S", "M", "L", "XL"], jeans: ["24", "25", "26", "27", "28", "29", "30"] },
  men: {
    default: ["S", "M", "L", "XL", "XXL"],
    pants: ["28", "30", "32", "34", "36"],
    jeans: ["28", "30", "32", "34", "36"],
  },
} as const;

function sizesFor(gender: Gender, category: CategorySlug): string[] {
  const set = SIZE_SETS[gender] as Record<string, readonly string[]>;
  return [...(set[category] ?? set.default)];
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function blankProduct(): Product {
  return {
    id: "",
    sku: "",
    slug: "",
    name: "",
    gender: "women",
    category: "dresses",
    price: 0,
    compareAtPrice: null,
    color: { name: "", hex: "#111111" },
    sizes: sizesFor("women", "dresses"),
    stock: Object.fromEntries(sizesFor("women", "dresses").map((s) => [s, 10])),
    image: { focusY: 0.45 },
    description: "",
    features: [],
    material: "",
    care: ["Machine wash cold, inside out", "Hang to dry"],
    rating: 5,
    reviewCount: 0,
    sold: 0,
    isNew: true,
    isBestseller: false,
    createdAt: "",
    status: "active",
  };
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-ink/80">
      {children}
    </label>
  );
}

export function ProductForm() {
  const id = useSearchParams().get("id");
  const products = useAllProducts();
  const existing = id ? products.find((p) => p.id === id) : undefined;

  if (id && !existing) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg font-semibold">Product not found</p>
        <Link href="/admin/products/" className="mt-3 inline-block text-sm text-accent underline">
          Back to products
        </Link>
      </div>
    );
  }
  return <ProductEditor key={id ?? "new"} initial={existing ?? blankProduct()} isNew={!existing} />;
}

function ProductEditor({ initial, isNew }: { initial: Product; isNew: boolean }) {
  const router = useRouter();
  const save = useCatalog((s) => s.save);
  const remove = useCatalog((s) => s.remove);
  const toast = useUI((s) => s.toast);
  const [p, setP] = useState<Product>(initial);
  const [imageUrl, setImageUrl] = useState(initial.image.src && !initial.image.src.startsWith("data:") ? initial.image.src : "");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const update = (patch: Partial<Product>) => setP((prev) => ({ ...prev, ...patch }));
  const preview = productImage(p);

  const setGenderCategory = (gender: Gender, category: CategorySlug) => {
    const validCategory = GENDER_CATEGORIES[gender].includes(category) ? category : GENDER_CATEGORIES[gender][0];
    const sizes = sizesFor(gender, validCategory);
    update({
      gender,
      category: validCategory,
      sizes,
      stock: Object.fromEntries(sizes.map((s) => [s, p.stock[s] ?? 10])),
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const problems: string[] = [];
    if (!p.name.trim()) problems.push("Add a product name.");
    if (!(p.price > 0)) problems.push("Price must be greater than 0.");
    if (p.compareAtPrice !== null && p.compareAtPrice <= p.price) problems.push("Compare-at price must be higher than the price.");
    if (!p.color.name.trim()) problems.push("Add a colour name.");
    if (!p.image.id && !p.image.src) problems.push("Add a product image.");
    setErrors(problems);
    if (problems.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const now = new Date().toISOString();
    const product: Product = isNew
      ? {
          ...p,
          id: `fs-c${Date.now().toString(36)}`,
          sku: `FS-${p.gender === "women" ? "W" : "M"}NEW-${Date.now().toString(36).slice(-4).toUpperCase()}`,
          slug: `${slugify(`${p.name}-${p.color.name}`)}-${Date.now().toString(36).slice(-4)}`,
          createdAt: now,
        }
      : p;
    save({ ...product, name: product.name.trim(), color: { ...product.color, name: product.color.name.trim() } });
    toast(isNew ? `Created ${product.name}` : `Saved ${product.name}`, "success");
    router.push("/admin/products/");
  };

  return (
    <form onSubmit={submit} noValidate>
      <Link href="/admin/products/" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Products
      </Link>
      <PageHeader
        title={isNew ? "Add product" : p.name || "Edit product"}
        description={isNew ? "Create a new product for the storefront." : `${p.sku} · last saved to this browser`}
        actions={
          <>
            {!isNew && (
              <Link href={productHref(p)} target="_blank" className="flex h-9 items-center rounded-md border border-line px-3 text-sm hover:border-ink">
                View in store
              </Link>
            )}
            <Button type="submit" size="sm">
              {isNew ? "Create product" : "Save changes"}
            </Button>
          </>
        }
      />

      {errors.length > 0 && (
        <div role="alert" className="mb-6 rounded-lg border border-accent/30 bg-accent-soft p-4 text-sm text-accent-dark">
          <p className="font-semibold">Please fix the following:</p>
          <ul className="mt-1 list-disc pl-5">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Details" />
            <div className="space-y-4 p-5">
              <div>
                <Label htmlFor="name">Name</Label>
                <input id="name" className={cn(adminInput, "w-full")} value={p.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Satin Cowl Neck Midi Dress" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  rows={3}
                  className={cn(adminInput, "h-auto w-full py-2")}
                  value={p.description}
                  onChange={(e) => update({ description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="features">Features (one per line)</Label>
                  <textarea
                    id="features"
                    rows={4}
                    className={cn(adminInput, "h-auto w-full py-2")}
                    value={p.features.join("\n")}
                    onChange={(e) => update({ features: e.target.value.split("\n").filter((l) => l.trim()) })}
                  />
                </div>
                <div>
                  <Label htmlFor="care">Care (one per line)</Label>
                  <textarea
                    id="care"
                    rows={4}
                    className={cn(adminInput, "h-auto w-full py-2")}
                    value={p.care.join("\n")}
                    onChange={(e) => update({ care: e.target.value.split("\n").filter((l) => l.trim()) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="material">Material</Label>
                <input id="material" className={cn(adminInput, "w-full")} value={p.material} onChange={(e) => update({ material: e.target.value })} placeholder="95% Polyester, 5% Elastane" />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Pricing" />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (S$)</Label>
                <input id="price" type="number" min={0} step="0.1" className={cn(adminInput, "w-full")} value={p.price || ""} onChange={(e) => update({ price: Number(e.target.value) })} />
              </div>
              <div>
                <Label htmlFor="compare">Compare-at price (S$) — for sales</Label>
                <input
                  id="compare"
                  type="number"
                  min={0}
                  step="0.1"
                  className={cn(adminInput, "w-full")}
                  value={p.compareAtPrice ?? ""}
                  onChange={(e) => update({ compareAtPrice: e.target.value ? Number(e.target.value) : null })}
                  placeholder="Leave empty if not on sale"
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Inventory" />
            <div className="p-5">
              <p className="mb-3 text-xs text-muted">Units in stock per size. Set 0 to mark a size as sold out.</p>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
                {p.sizes.map((s) => (
                  <div key={s}>
                    <Label htmlFor={`stock-${s}`}>{s}</Label>
                    <input
                      id={`stock-${s}`}
                      type="number"
                      min={0}
                      className={cn(adminInput, "w-full tabular-nums", (p.stock[s] ?? 0) === 0 && "border-accent/50 text-accent")}
                      value={p.stock[s] ?? 0}
                      onChange={(e) => update({ stock: { ...p.stock, [s]: Math.max(0, Number(e.target.value)) } })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Status" />
            <div className="space-y-3 p-5">
              <select aria-label="Status" className={cn(adminInput, "w-full")} value={p.status ?? "active"} onChange={(e) => update({ status: e.target.value as Product["status"] })}>
                <option value="active">Active — visible in store</option>
                <option value="draft">Draft — hidden</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-ink" checked={p.isNew} onChange={(e) => update({ isNew: e.target.checked })} />
                Show &ldquo;New&rdquo; badge
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-ink" checked={p.isBestseller} onChange={(e) => update({ isBestseller: e.target.checked })} />
                Feature as bestseller
              </label>
            </div>
          </Card>

          <Card>
            <CardHeader title="Image" />
            <div className="space-y-3 p-5">
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-soft">
                {preview ? (
                  <Image src={preview} alt="Product preview" fill sizes="300px" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted">No image yet</div>
                )}
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-ink/30 px-3 py-3 text-sm font-medium hover:border-ink">
                <ImagePlus className="size-4" />
                {uploading ? "Processing…" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const src = await resizeImage(file);
                      update({ image: { focusY: p.image.focusY, src } });
                      setImageUrl("");
                    } catch {
                      toast("Couldn't read that image.", "error");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
              <div>
                <Label htmlFor="image-url">…or paste an image URL</Label>
                <input
                  id="image-url"
                  className={cn(adminInput, "w-full")}
                  placeholder="https://"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (/^https?:\/\//.test(e.target.value)) update({ image: { focusY: p.image.focusY, src: e.target.value } });
                  }}
                />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Organisation" />
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select id="gender" className={cn(adminInput, "w-full")} value={p.gender} onChange={(e) => setGenderCategory(e.target.value as Gender, p.category)}>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select id="category" className={cn(adminInput, "w-full")} value={p.category} onChange={(e) => setGenderCategory(p.gender, e.target.value as CategorySlug)}>
                    {GENDER_CATEGORIES[p.gender].map((c) => (
                      <option key={c} value={c}>
                        {CATEGORIES[c].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                <div>
                  <Label htmlFor="color-name">Colour name</Label>
                  <input id="color-name" className={cn(adminInput, "w-full")} value={p.color.name} onChange={(e) => update({ color: { ...p.color, name: e.target.value } })} placeholder="Black" />
                </div>
                <input
                  type="color"
                  aria-label="Colour swatch"
                  className="h-10 w-12 cursor-pointer rounded-md border border-line bg-paper p-1"
                  value={p.color.hex}
                  onChange={(e) => update({ color: { ...p.color, hex: e.target.value } })}
                />
              </div>
            </div>
          </Card>

          {!isNew && (
            <button
              type="button"
              onClick={() => {
                if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
                remove(p.id);
                toast(`Deleted ${p.name}`);
                router.push("/admin/products/");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-accent/30 py-2.5 text-sm font-medium text-accent hover:bg-accent-soft"
            >
              <Trash2 className="size-4" /> Delete product
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
