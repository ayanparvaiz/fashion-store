"use client";

import { ChevronDown, Heart, Package, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { MAIN_NAV } from "@/lib/navigation";
import { useUI } from "@/lib/store/ui";
import { Logo } from "@/components/ui/logo";
import { Sheet } from "@/components/ui/sheet";

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onClose={close} side="left" title={<Logo className="text-xl" />}>
      <nav aria-label="Mobile" className="px-5 py-2">
        <ul>
          {MAIN_NAV.map((item) =>
            item.mega ? (
              <li key={item.href} className="border-b border-line">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-bold uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden">
                    {item.label}
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <ul className="space-y-3 pb-5 pl-1">
                    {[...item.mega.categories, ...item.mega.featured].map((l) => (
                      <li key={l.href + l.label}>
                        <Link
                          href={l.href}
                          onClick={close}
                          className={cn("text-sm", l.highlight && "font-semibold text-accent")}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ) : (
              <li key={item.href} className="border-b border-line">
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "block py-4 text-sm font-bold uppercase tracking-[0.14em]",
                    item.highlight && "text-accent",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ),
          )}
        </ul>
        <ul className="mt-6 space-y-4 text-sm">
          <li>
            <Link href="/account/" onClick={close} className="flex items-center gap-3">
              <User className="size-4" /> My Account
            </Link>
          </li>
          <li>
            <Link href="/wishlist/" onClick={close} className="flex items-center gap-3">
              <Heart className="size-4" /> Wishlist
            </Link>
          </li>
          <li>
            <Link href="/track-order/" onClick={close} className="flex items-center gap-3">
              <Package className="size-4" /> Track My Order
            </Link>
          </li>
        </ul>
      </nav>
    </Sheet>
  );
}
