import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-paper">
        <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center">
          <Link href="/cart/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] hover:text-accent">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to bag</span>
          </Link>
          <Logo />
          <p className="flex items-center justify-end gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <Lock className="size-4" />
            <span className="hidden sm:inline">Secure checkout</span>
          </p>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
