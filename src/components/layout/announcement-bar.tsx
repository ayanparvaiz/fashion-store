"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettings } from "@/lib/store/settings";

export function AnnouncementBar() {
  const messages = useSettings((s) => s.settings.announcements);
  const [index, setIndex] = useState(0);
  const count = messages.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 4500);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return null;
  const current = messages[index % count];

  return (
    <div className="bg-ink text-paper">
      <div className="container-page flex h-9 items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous announcement"
          onClick={() => setIndex((i) => (i - 1 + count) % count)}
          className="p-1 opacity-70 hover:opacity-100"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <p
          key={index}
          className="animate-fade-in truncate text-center text-[11px] font-semibold uppercase tracking-[0.16em]"
          aria-live="polite"
        >
          {current}
        </p>
        <button
          type="button"
          aria-label="Next announcement"
          onClick={() => setIndex((i) => (i + 1) % count)}
          className="p-1 opacity-70 hover:opacity-100"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
