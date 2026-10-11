"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { collectionHref } from "@/lib/collections";

/** Milliseconds until the next midnight in Singapore (UTC+8). */
function msToMidnightSGT(now = Date.now()) {
  const sg = now + 8 * 3_600_000;
  const nextMidnight = Math.ceil(sg / 86_400_000) * 86_400_000;
  return nextMidnight - sg;
}

function useCountdown() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(msToMidnightSGT());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  return left;
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className="flex flex-col items-center">
      <span className="min-w-12 bg-paper px-2 py-1 text-center font-display text-2xl text-ink tabular-nums sm:text-3xl">
        {value}
      </span>
      <span className="mt-1 text-[9px] font-semibold tracking-[0.2em] uppercase opacity-70">{label}</span>
    </span>
  );
}

/** Daily flash sale banner that counts down to midnight Singapore time. */
export function FlashSaleBar({ className }: { className?: string }) {
  const left = useCountdown();
  const parts =
    left === null
      ? ["--", "--", "--"]
      : [left / 3_600_000, (left / 60_000) % 60, (left / 1000) % 60].map((n) => String(Math.floor(n)).padStart(2, "0"));

  return (
    <div className={cn("bg-ink text-paper", className)}>
      <div className="container-page flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
        <p className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-accent">
            <Zap className="size-5" fill="currentColor" />
          </span>
          <span>
            <span className="block font-display text-xl uppercase sm:text-2xl">Flash sale · Extra 10% off</span>
            <span className="block text-xs text-paper/70">
              Use code <strong className="text-paper">FLASH10</strong> at checkout — ends at midnight
            </span>
          </span>
        </p>
        <div className="flex items-center gap-4">
          <div className="flex items-start gap-1.5" aria-label="Time left" role="timer">
            <Unit value={parts[0]} label="Hrs" />
            <span className="pt-1 font-display text-2xl">:</span>
            <Unit value={parts[1]} label="Min" />
            <span className="pt-1 font-display text-2xl">:</span>
            <Unit value={parts[2]} label="Sec" />
          </div>
          <Link
            href={collectionHref("sale")}
            className="hidden border-b-2 border-accent pb-0.5 text-xs font-bold tracking-[0.16em] uppercase hover:text-accent md:block"
          >
            Shop sale
          </Link>
        </div>
      </div>
    </div>
  );
}
