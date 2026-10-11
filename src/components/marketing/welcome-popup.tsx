"use client";

import { Check, Copy } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { banners, photoUrl } from "@/lib/catalog";
import { useUI } from "@/lib/store/ui";
import { isEmail } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { SmartImage as Image } from "@/components/ui/smart-image";

const SEEN_KEY = "fashion-store:welcome-seen";

/**
 * First-visit offer: opens after 25 seconds or when the pointer heads for the
 * browser chrome (exit intent). Shown once per browser.
 */
export function WelcomePopup() {
  const intro = useUI((s) => s.introDone);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const blocked = pathname.startsWith("/checkout") || pathname.startsWith("/cart");

  useEffect(() => {
    if (!intro || blocked) return;
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }
    const show = () => {
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      setOpen(true);
      cleanup();
    };
    const exitIntent = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    const timer = setTimeout(show, 25_000);
    document.addEventListener("mouseleave", exitIntent);
    const cleanup = () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", exitIntent);
    };
    return cleanup;
  }, [intro, blocked]);

  return (
    <Sheet open={open} onClose={() => setOpen(false)} side="center" width="max-w-3xl">
      <div className="grid sm:grid-cols-2">
        <div className="relative hidden min-h-96 sm:block">
          <Image src={photoUrl(banners["hero-3"])} alt="" fill sizes="384px" className="object-cover" />
        </div>
        <div className="relative p-8">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-3 right-4 text-xs text-muted underline hover:text-ink"
          >
            No thanks
          </button>
          <p className="eyebrow mt-6 text-accent">Welcome to Fashion Store</p>
          <h2 className="heading-display mt-3 text-4xl leading-[0.92]">
            Take 10%
            <br />
            off
          </h2>
          {done ? (
            <div className="mt-6">
              <p className="text-sm text-ink/75">Your code is ready — use it at checkout:</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText("WELCOME10").catch(() => {});
                  setCopied(true);
                }}
                className="mt-3 flex w-full items-center justify-between border-2 border-dashed border-ink px-4 py-3 font-display text-2xl"
              >
                WELCOME10
                {copied ? <Check className="size-5 text-success" /> : <Copy className="size-5" />}
              </button>
              <Button className="mt-4 w-full" onClick={() => setOpen(false)}>
                Start shopping
              </Button>
            </div>
          ) : (
            <form
              className="mt-6 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (isEmail(email)) setDone(true);
              }}
            >
              <p className="text-sm text-ink/75">
                Join the list for first dibs on drops, exclusive offers and 10% off your first order.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Email address"
                className="h-12 w-full border border-line px-4 text-sm focus:border-ink focus:outline-none"
              />
              <Button type="submit" size="lg" className="w-full">
                Unlock 10% off
              </Button>
              <p className="text-[11px] text-muted">By signing up you agree to receive marketing emails. Unsubscribe anytime.</p>
            </form>
          )}
        </div>
      </div>
    </Sheet>
  );
}
