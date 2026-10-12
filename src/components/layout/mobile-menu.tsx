"use client";

import { ArrowUpRight, Heart, Package, Plus, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { productImage, seedProducts } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { getLenis, gsap, prefersReducedMotion } from "@/lib/motion";
import { MAIN_NAV } from "@/lib/navigation";
import { useUI } from "@/lib/store/ui";
import { Logo } from "@/components/ui/logo";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { FacebookIcon, InstagramIcon, PinterestIcon, TikTokIcon } from "@/components/ui/social-icons";

const productsById = new Map(seedProducts.map((p) => [p.id, p]));
const SPOTLIGHT = MAIN_NAV.flatMap((item) => item.mega?.spotlight ?? [])
  .map((s) => ({ ...s, product: productsById.get(s.productId) }))
  .filter((s) => s.product);

/** Where the reveal circle grows from: the centre of the header menu button. */
function origin() {
  const button = document.querySelector("[data-menu-button]");
  const r = button?.getBoundingClientRect();
  return r ? `${r.left + r.width / 2}px ${r.top + r.height / 2}px` : "32px 32px";
}

/**
 * Full-screen mobile navigation. Opens with a circular reveal from the menu
 * button, then the big links rise in one after another.
 */
export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const dialog = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    gsap.killTweensOf(el);

    if (open && !el.open) {
      const at = origin();
      el.dataset.origin = at;
      el.showModal();
      document.documentElement.style.overflow = "hidden";
      getLenis()?.stop();
      if (reduced) return;
      gsap.fromTo(
        el,
        { clipPath: `circle(0% at ${at})` },
        { clipPath: `circle(150% at ${at})`, duration: 0.8, ease: "power3.inOut", clearProps: "clipPath" },
      );
      gsap.from(el.querySelectorAll("[data-menu-item]"), {
        yPercent: 110,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.06,
        delay: 0.3,
      });
      gsap.from(el.querySelectorAll("[data-menu-fade]"), { opacity: 0, y: 16, duration: 0.6, stagger: 0.08, delay: 0.55 });
    }

    if (!open && el.open) {
      const finish = () => {
        el.close();
        document.documentElement.style.overflow = "";
        getLenis()?.start();
        setExpanded(null);
      };
      if (reduced) return finish();
      gsap.to(el, {
        clipPath: `circle(0% at ${el.dataset.origin ?? "32px 32px"})`,
        duration: 0.55,
        ease: "power3.in",
        onComplete: finish,
      });
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label="Menu"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-ink p-0 text-paper backdrop:bg-transparent"
    >
      <div className="flex min-h-full flex-col px-5 pt-4 pb-8">
        <div className="flex h-12 items-center justify-between">
          <span onClick={close}>
            <Logo inverse className="text-xl" />
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="grid size-11 place-items-center rounded-full border border-paper/20 transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="mt-10">
          <ul>
            {MAIN_NAV.map((item, i) => {
              const isOpen = expanded === item.label;
              const number = <span className="w-8 shrink-0 text-xs text-paper/40 tabular-nums">{String(i + 1).padStart(2, "0")}</span>;
              const label = cn(
                "font-display text-[clamp(1.75rem,8.6vw,2.4rem)] leading-[1.1] uppercase sm:text-6xl",
                item.highlight && "text-accent",
              );
              return (
                <li key={item.href} className="border-b border-paper/10">
                  <div className="overflow-hidden">
                    {item.mega ? (
                      <button
                        type="button"
                        data-menu-item
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : item.label)}
                        className="flex w-full items-center py-2 text-left"
                      >
                        {number}
                        <span className={cn(label, "flex-1")}>{item.label}</span>
                        <Plus className={cn("size-6 transition-transform duration-500", isOpen && "rotate-45")} />
                      </button>
                    ) : (
                      <Link href={item.href} onClick={close} data-menu-item className="flex items-center py-2">
                        {number}
                        <span className={cn(label, "flex-1")}>{item.label}</span>
                        <ArrowUpRight className="size-6 text-paper/50" />
                      </Link>
                    )}
                  </div>

                  {item.mega && (
                    <div
                      className={cn(
                        "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.8,.2,1)]",
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                      )}
                    >
                      <div className="overflow-hidden" inert={!isOpen}>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 pb-6 pl-8">
                          {[...item.mega.categories, ...item.mega.featured].map((l) => (
                            <li key={l.href + l.label}>
                              <Link
                                href={l.href}
                                onClick={close}
                                className={cn("text-sm text-paper/80 hover:text-paper", l.highlight && "font-semibold text-accent")}
                              >
                                {l.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div data-menu-fade className="mt-10">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-paper/50 uppercase">Trending now</p>
          <ul className="no-scrollbar -mx-5 mt-3 flex gap-3 overflow-x-auto px-5">
            {SPOTLIGHT.map((s) => (
              <li key={s.href} className="w-32 shrink-0">
                <Link href={s.href} onClick={close} className="block">
                  <span className="relative block aspect-[3/4] overflow-hidden bg-paper/10">
                    {/* Detail crop: keeps these URLs distinct from the same products' page photos. */}
                    <Image src={productImage(s.product!, "detail")} alt="" fill sizes="128px" className="object-cover" />
                  </span>
                  <span className="mt-2 block text-xs font-semibold tracking-[0.14em] uppercase">{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div data-menu-fade className="mt-auto pt-10">
          <ul className="grid grid-cols-3 gap-2 text-xs">
            {[
              { href: "/account/", label: "Account", icon: User },
              { href: "/wishlist/", label: "Wishlist", icon: Heart },
              { href: "/track-order/", label: "Track order", icon: Package },
            ].map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={close}
                  className="flex flex-col items-center gap-2 border border-paper/15 py-3 transition-colors hover:border-paper"
                >
                  <Icon className="size-5" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-paper/50">Cash on Delivery · Singapore</p>
            <div className="flex gap-2">
              {[InstagramIcon, TikTokIcon, FacebookIcon, PinterestIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={["Instagram", "TikTok", "Facebook", "Pinterest"][i]}
                  className="grid size-9 place-items-center rounded-full border border-paper/20"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
