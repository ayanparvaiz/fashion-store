"use client";

import { Ruler } from "lucide-react";
import { useState } from "react";
import { sizeTableFor } from "@/lib/size-guide";
import type { CategorySlug, Gender } from "@/lib/types";
import { Sheet } from "@/components/ui/sheet";
import { SizeTable } from "./size-table";

export function SizeGuideDialog({ gender, category }: { gender: Gender; category: CategorySlug }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium underline underline-offset-4 hover:text-accent"
      >
        <Ruler className="size-3.5" /> Size guide
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="center" title="Size guide">
        <div className="space-y-5 p-5">
          <SizeTable table={sizeTableFor(gender, category)} />
          <div className="bg-soft p-4 text-sm leading-relaxed text-ink/80">
            <p className="font-semibold text-ink">How to measure</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Bust / chest: around the fullest part, keeping the tape level.</li>
              <li>Waist: around your natural waistline, the narrowest part.</li>
              <li>Hips: around the fullest part of your hips.</li>
            </ul>
            <p className="mt-3">Between sizes? We recommend sizing up for a relaxed fit.</p>
          </div>
        </div>
      </Sheet>
    </>
  );
}
