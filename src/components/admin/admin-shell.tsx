"use client";

import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/cn";
import { useAdminSession } from "@/lib/store/auth";
import { useOrders } from "@/lib/store/orders";

const NAV = [
  { href: "/admin/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders/", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products/", label: "Products", icon: Package },
  { href: "/admin/customers/", label: "Customers", icon: Users },
  { href: "/admin/discounts/", label: "Discounts", icon: Tag },
  { href: "/admin/settings/", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return href === "/admin/" ? path === "/admin/" : path.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();
  const pathname = usePathname();
  const router = useRouter();
  const email = useAdminSession((s) => s.email);
  const logout = useAdminSession((s) => s.logout);
  const ensureSeeded = useOrders((s) => s.ensureSeeded);
  const pending = useOrders((s) => s.orders.filter((o) => o.status === "pending").length);
  const [navOpen, setNavOpen] = useState(false);
  const isLogin = pathname.startsWith("/admin/login");

  useEffect(() => {
    ensureSeeded();
  }, [ensureSeeded]);

  useEffect(() => {
    if (mounted && !email && !isLogin) router.replace("/admin/login/");
  }, [mounted, email, isLogin, router]);

  if (!mounted) return <div className="min-h-dvh bg-soft" />;
  if (isLogin) return <>{children}</>;
  if (!email) return <div className="min-h-dvh bg-soft" />;

  const nav = (
    <nav className="space-y-1 px-3">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setNavOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-paper text-ink" : "text-paper/70 hover:bg-paper/10 hover:text-paper",
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{label}</span>
            {label === "Orders" && pending > 0 && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-paper">{pending}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-soft lg:grid lg:grid-cols-[240px_1fr]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ink py-5 text-paper transition-transform lg:sticky lg:top-0 lg:h-dvh lg:w-auto lg:translate-x-0",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between px-6">
          <Link href="/admin/" className="font-display text-lg leading-none">
            FASHION<span className="text-accent">.</span>STORE
            <span className="mt-1 block font-sans text-[10px] font-semibold tracking-[0.2em] text-paper/50">ADMIN</span>
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setNavOpen(false)} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        {nav}
        <div className="mt-auto space-y-1 px-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-paper/70 hover:bg-paper/10 hover:text-paper"
          >
            <ExternalLink className="size-4" /> View store
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/admin/login/");
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-paper/70 hover:bg-paper/10 hover:text-paper"
          >
            <LogOut className="size-4" /> Sign out
          </button>
          <p className="truncate px-3 pt-3 text-xs text-paper/40">{email}</p>
        </div>
      </aside>
      {navOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper px-4 lg:hidden">
          <button type="button" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <span className="font-display">ADMIN</span>
        </header>
        <div className="border-b border-warning/20 bg-warning/10 px-4 py-2 text-center text-xs text-warning lg:px-8">
          Demo mode — data is stored in this browser only. Connect Firebase to go live.
        </div>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
