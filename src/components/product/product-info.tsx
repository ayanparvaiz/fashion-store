"use client";

import { Banknote, Minus, Plus, RotateCcw, Truck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { categoryLabel, totalStock } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { deliveryEstimate } from "@/lib/delivery";
import { formatPrice, formatWeekday } from "@/lib/format";
import { MAX_QTY_PER_LINE, useCart } from "@/lib/store/cart";
import { useSettings } from "@/lib/store/settings";
import { useUI } from "@/lib/store/ui";
import type { Product } from "@/lib/types";
import { AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { ProductBadges } from "./product-badges";
import { SizeFinder } from "./size-finder";
import { SizeGuideDialog } from "./size-guide-dialog";
import { LiveViewers } from "@/components/marketing/social-proof";
import { useStockAlerts } from "@/lib/store/alerts";
import { isEmail } from "@/lib/validation";
import { WishlistButton } from "./wishlist-button";

export function ProductInfo({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const toast = useUI((s) => s.toast);
  const settings = useSettings((s) => s.settings);
  const mounted = useMounted();
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const addButton = useRef<HTMLDivElement>(null);

  const soldOut = totalStock(product) === 0;
  const available = size ? (product.stock[size] ?? 0) : 0;
  const maxQty = Math.min(MAX_QTY_PER_LINE, available || MAX_QTY_PER_LINE);
  const estimate = mounted ? deliveryEstimate() : null;

  // Show a sticky "Add to bag" bar on mobile once the main button scrolls away.
  useEffect(() => {
    const el = addButton.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const addToBag = () => {
    if (!size) {
      setError(true);
      return;
    }
    if (available === 0) return;
    add({ productId: product.id, size, quantity });
    toast(`${product.name} (${size}) added to bag`, "success");
    setCartOpen(true);
  };

  return (
    <div className="lg:sticky lg:top-32">
      <ProductBadges product={product} className="mb-3 flex-row" />
      <p className="eyebrow text-muted">{categoryLabel(product)}</p>
      <h1 className="mt-2 text-2xl leading-tight font-semibold sm:text-3xl">{product.name}</h1>
      <a href="#reviews" className="mt-2 inline-block">
        <Stars rating={product.rating} count={product.reviewCount} />
      </a>
      <Price price={product.price} compareAt={product.compareAtPrice} size="lg" className="mt-4" />
      <p className="mt-1 text-xs text-muted">Price includes GST. Pay with cash on delivery.</p>
      <div className="mt-4">
        <LiveViewers product={product} />
      </div>

      <div className="mt-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em]">
          Colour: <span className="font-normal normal-case tracking-normal">{product.color.name}</span>
        </p>
        <span
          className="mt-3 block size-9 rounded-full border border-ink/15 ring-2 ring-ink ring-offset-2"
          style={{ backgroundColor: product.color.hex }}
          aria-hidden
        />
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.14em]">
            Size{size && <span className="font-normal normal-case tracking-normal">: {size}</span>}
          </p>
          <div className="flex items-center gap-4">
            <SizeFinder
              product={product}
              onSelect={(s) => {
                setSize(s);
                setError(false);
                setQuantity(1);
              }}
            />
            <SizeGuideDialog gender={product.gender} category={product.category} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose a size">
          {product.sizes.map((s) => {
            const qty = product.stock[s] ?? 0;
            const out = qty === 0;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={size === s}
                aria-label={out ? `${s} — sold out, get notified` : s}
                onClick={() => {
                  setSize(s);
                  setError(false);
                  setQuantity(1);
                }}
                className={cn(
                  "relative h-11 min-w-13 border px-3 text-sm font-medium transition-colors",
                  size === s ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                  out && size !== s && "text-subtle line-through",
                )}
              >
                {s}
                {!out && qty <= 3 && (
                  <span className="absolute -top-2 -right-2 size-2.5 rounded-full bg-accent" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
        {error && <p className="mt-2 text-xs font-medium text-accent">Please select a size.</p>}
        {size && available > 0 && available <= 3 && (
          <p className="mt-2 text-xs font-semibold text-accent">Hurry — only {available} left in {size}!</p>
        )}
        {size && available === 0 && <NotifyMe productId={product.id} size={size} />}
      </div>

      <div ref={addButton} className="mt-7 flex gap-3">
        <div className="flex h-13 items-center border border-line">
          <button
            type="button"
            className="grid h-full w-9 place-items-center hover:bg-soft disabled:opacity-30 sm:w-11"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="grid h-full w-9 place-items-center hover:bg-soft disabled:opacity-30 sm:w-11"
            onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            disabled={quantity >= maxQty}
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button
          size="lg"
          className="flex-1 px-4 whitespace-nowrap"
          onClick={addToBag}
          disabled={soldOut || (size !== null && available === 0)}
        >
          {soldOut ? "Sold out" : size && available === 0 ? `${size} sold out` : "Add to bag"}
        </Button>
        <WishlistButton
          productId={product.id}
          className="grid h-13 w-13 shrink-0 place-items-center border border-line hover:border-ink"
        />
      </div>

      <ul className="mt-6 space-y-3 border-y border-line py-5 text-sm">
        <li className="flex gap-3">
          <Truck className="mt-0.5 size-4 shrink-0" />
          <span>
            {estimate ? (
              <>
                Get it <strong>{formatWeekday(estimate.standard[0])} – {formatWeekday(estimate.standard[1])}</strong>
                {" "}or <strong>{formatWeekday(estimate.express)}</strong> with express.
              </>
            ) : (
              "Islandwide delivery in 2–4 business days."
            )}{" "}
            Free over {formatPrice(settings.freeShippingThreshold)}.
          </span>
        </li>
        <li className="flex gap-3">
          <Banknote className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>Cash on Delivery</strong> — pay the courier when your order arrives.
          </span>
        </li>
        <li className="flex gap-3">
          <RotateCcw className="mt-0.5 size-4 shrink-0" />
          <span>Free 30-day returns and exchanges.</span>
        </li>
      </ul>

      <div className="mt-2">
        <AccordionItem title="Description" defaultOpen>
          <p>{product.description}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </AccordionItem>
        <AccordionItem title="Fabric & care">
          <p>
            <strong>Composition:</strong> {product.material}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {product.care.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">SKU: {product.sku}</p>
        </AccordionItem>
        <AccordionItem title="Delivery & returns">
          <p>
            Standard delivery ({formatPrice(settings.standardShipping)}) arrives in 2–4 business days and is
            free on orders over {formatPrice(settings.freeShippingThreshold)}. Express delivery (
            {formatPrice(settings.expressShipping)}) arrives the next business day when ordered before 2pm.
          </p>
          <p className="mt-3">
            Not quite right? Return or exchange unworn items within 30 days. Our courier can collect from your
            door.
          </p>
        </AccordionItem>
      </div>

      {/* Mobile sticky add-to-bag */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper p-3 transition-transform lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showSticky}
        inert={!showSticky}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="text-xs text-muted">{size ? `Size ${size}` : "Select a size"} · {formatPrice(product.price)}</p>
        </div>
        <Button
          onClick={() => {
            if (!size) addButton.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            addToBag();
          }}
          disabled={soldOut}
        >
          Add to bag
        </Button>
      </div>
    </div>
  );
}

function NotifyMe({ productId, size }: { productId: string; size: string }) {
  const add = useStockAlerts((s) => s.add);
  const toast = useUI((s) => s.toast);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="mt-3 bg-soft p-3 text-xs">
        Done — we&apos;ll email <strong>{email}</strong> as soon as size {size} is back.
      </p>
    );
  }
  return (
    <form
      className="mt-3 bg-soft p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isEmail(email)) return toast("Enter a valid email address.", "error");
        add({ productId, size, email });
        setSent(true);
        toast(`We'll let you know when ${size} is back`, "success");
      }}
    >
      <p className="text-xs font-semibold">Size {size} is sold out. Get notified when it&apos;s back:</p>
      <div className="mt-2 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Email for restock alert"
          className="h-10 min-w-0 flex-1 border border-line bg-paper px-3 text-sm focus:border-ink focus:outline-none"
        />
        <Button type="submit" size="sm" className="h-10">
          Notify me
        </Button>
      </div>
    </form>
  );
}
