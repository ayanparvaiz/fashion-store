import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className, inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Fashion Store home"
      className={cn(
        "font-display text-[22px] leading-none tracking-[-0.02em] sm:text-[26px]",
        inverse ? "text-paper" : "text-ink",
        className,
      )}
    >
      FASHION<span className="text-accent">.</span>STORE
    </Link>
  );
}
