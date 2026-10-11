"use client";

import { CircleCheck, Info, X } from "lucide-react";
import { useUI } from "@/lib/store/ui";
import { cn } from "@/lib/cn";

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismissToast);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm animate-pop items-center gap-3 px-4 py-3 text-sm shadow-lg",
            t.tone === "error" ? "bg-accent text-paper" : "bg-ink text-paper",
          )}
        >
          {t.tone === "success" ? (
            <CircleCheck className="size-4 shrink-0" />
          ) : (
            <Info className="size-4 shrink-0" />
          )}
          <span className="flex-1">{t.message}</span>
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <X className="size-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  );
}
