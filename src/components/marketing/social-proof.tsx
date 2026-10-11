"use client";

import { Eye, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { productHref, productImage } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useProducts } from "@/lib/store/catalog";
import { useUI } from "@/lib/store/ui";
import type { Product } from "@/lib/types";
import { SmartImage as Image } from "@/components/ui/smart-image";

const AREAS = [
  "Tampines", "Punggol", "Jurong East", "Orchard", "Bishan", "Sengkang", "Clementi", "Bedok",
  "Toa Payoh", "Woodlands", "Holland Village", "Tiong Bahru", "Ang Mo Kio", "Pasir Ris", "Bukit Timah",
];

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** "12 people are viewing this" — stable per product, drifting gently. */
export function LiveViewers({ product }: { product: Product }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const base = 6 + (hash(product.id) % 18) + (product.isBestseller ? 9 : 0);
    const update = () => setCount(base + Math.round(Math.sin(Date.now() / 20_000 + base) * 3));
    const first = setTimeout(update, 0);
    const timer = setInterval(update, 8000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [product.id, product.isBestseller]);

  if (count === null) return <p className="h-5" />;
  return (
    <p className="flex items-center gap-2 text-xs text-ink/80">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-accent" />
      </span>
      <Eye className="size-3.5" />
      <strong>{count} people</strong> are viewing this right now
    </p>
  );
}

const DISMISS_KEY = "fs:proof-off";

/** Small "someone just bought…" notices, first after 12s then every ~35s. */
export function RecentPurchases() {
  const products = useProducts();
  const intro = useUI((s) => s.introDone);
  const pathname = usePathname();
  const [notice, setNotice] = useState<{ product: Product; area: string; minutes: number } | null>(null);
  const [off, setOff] = useState(false);

  useEffect(() => {
    if (off || products.length === 0) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {}
    let hide: ReturnType<typeof setTimeout>;
    const show = () => {
      const pool = products.filter((p) => p.isBestseller || p.isNew);
      const product = pool[Math.floor(Math.random() * pool.length)];
      setNotice({ product, area: AREAS[Math.floor(Math.random() * AREAS.length)], minutes: 1 + Math.floor(Math.random() * 18) });
      hide = setTimeout(() => setNotice(null), 6500);
    };
    const first = setTimeout(show, 12_000);
    const timer = setInterval(show, 35_000);
    return () => {
      clearTimeout(first);
      clearTimeout(hide);
      clearInterval(timer);
    };
  }, [products, off]);

  if (!intro || off || pathname.startsWith("/checkout")) return null;

  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-4 z-40 w-[calc(100%-2rem)] max-w-xs transition-all duration-500",
        notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      {notice && (
        <div className="flex items-center gap-3 bg-paper p-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-ink/5">
          <Link href={productHref(notice.product)} className="relative h-16 w-12 shrink-0 overflow-hidden bg-soft">
            <Image src={productImage(notice.product)} alt="" fill sizes="48px" className="object-cover" />
          </Link>
          <div className="min-w-0 flex-1 text-xs">
            <p className="text-muted">Someone in {notice.area} bought</p>
            <Link href={productHref(notice.product)} className="line-clamp-1 font-semibold hover:underline">
              {notice.product.name}
            </Link>
            <p className="mt-0.5 text-[11px] text-muted">
              {notice.minutes} min ago · <span className="text-success">Verified</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="Hide purchase notifications"
            onClick={() => {
              setOff(true);
              try {
                sessionStorage.setItem(DISMISS_KEY, "1");
              } catch {}
            }}
            className="self-start p-1 text-muted hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
