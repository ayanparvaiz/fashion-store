"use client";

import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { productAlt, productImage, seedProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { MAIN_NAV, type MegaMenu } from "@/lib/navigation";
import { useCartCount } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { useWishlist } from "@/lib/store/wishlist";
import { Logo } from "@/components/ui/logo";
import { Magnetic } from "@/components/motion/magnetic";

const productsById = new Map(seedProducts.map((p) => [p.id, p]));

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-paper">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function MegaPanel({ menu, onNavigate }: { menu: MegaMenu; onNavigate: () => void }) {
  return (
    <div className="absolute inset-x-0 top-full z-40 animate-fade-in border-t border-line bg-paper shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]">
      <div className="container-page grid grid-cols-12 gap-8 py-10">
        <div className="col-span-3">
          <p className="eyebrow mb-4 text-muted">Shop by category</p>
          <ul className="space-y-3">
            {menu.categories.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onNavigate}
                  className="text-sm font-medium hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <p className="eyebrow mb-4 text-muted">Featured</p>
          <ul className="space-y-3">
            {menu.featured.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={onNavigate}
                  className={cn(
                    "text-sm font-medium hover:text-accent",
                    l.highlight && "font-bold text-accent",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-6 grid grid-cols-2 gap-4">
          {menu.spotlight.map((s) => {
            const product = productsById.get(s.productId);
            if (!product) return null;
            return (
              <Link key={s.href} href={s.href} onClick={onNavigate} className="group relative block">
                <div className="relative aspect-[4/3] overflow-hidden bg-soft">
                  <Image
                    src={productImage(product)}
                    alt={productAlt(product)}
                    fill
                    sizes="25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                  <span className="absolute bottom-4 left-4 font-display text-xl text-paper uppercase">
                    {s.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const wishlistCount = useWishlist((s) => s.ids.length);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const iconButton = "relative p-2 text-ink transition-colors hover:text-accent";

  return (
    <header
      className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85"
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-[72px]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(iconButton, "-ml-2 lg:hidden")}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            data-menu-button
          >
            <Menu className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-10 w-full max-w-xs items-center gap-2 border border-line px-3 text-left text-sm text-muted transition-colors hover:border-ink lg:flex"
          >
            <Search className="size-4" />
            Search for styles, colours…
          </button>
          <button
            type="button"
            className={cn(iconButton, "lg:hidden")}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>
        </div>

        <Logo />

        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <Magnetic strength={0.4}>
            <Link href="/account/" className={cn(iconButton, "hidden sm:block")} aria-label="Account">
              <User className="size-5" />
            </Link>
          </Magnetic>
          <Magnetic strength={0.4}>
            <Link href="/wishlist/" className={cn(iconButton, "block")} aria-label={`Wishlist (${wishlistCount})`}>
              <Heart className="size-5" />
              <CountBadge count={wishlistCount} />
            </Link>
          </Magnetic>
          <Magnetic strength={0.4}>
            <button
              type="button"
              className={cn(iconButton, "-mr-2 block")}
              onClick={() => setCartOpen(true)}
              aria-label={`Shopping bag (${cartCount})`}
              data-cart-target
            >
              <ShoppingBag className="size-5" />
              <CountBadge count={cartCount} />
            </button>
          </Magnetic>
        </div>
      </div>

      <nav aria-label="Main" className="hidden lg:block">
        <ul className="flex items-center justify-center gap-9">
          {MAIN_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href} onMouseEnter={() => setOpenMenu(item.mega ? item.label : null)}>
                <Link
                  href={item.href}
                  onClick={() => setOpenMenu(null)}
                  onFocus={() => setOpenMenu(item.mega ? item.label : null)}
                  className={cn(
                    "relative block py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:text-accent",
                    item.highlight && "text-accent",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-current after:transition-transform hover:after:scale-x-100",
                    (active || openMenu === item.label) && "after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {MAIN_NAV.map(
        (item) =>
          item.mega &&
          openMenu === item.label && (
            <MegaPanel key={item.label} menu={item.mega} onNavigate={() => setOpenMenu(null)} />
          ),
      )}
    </header>
  );
}
