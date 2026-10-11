"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  side?: "left" | "right" | "center";
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
}

/**
 * Drawer / modal built on the native <dialog> element, which gives us focus
 * trapping, Escape to close and an inert background for free.
 */
export function Sheet({
  open,
  onClose,
  title,
  side = "right",
  className,
  children,
  footer,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
    }
    if (!open && dialog.open) dialog.close();
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const position =
    side === "center"
      ? "m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl animate-pop"
      : side === "right"
        ? "my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-md animate-slide-in-right"
        : "my-0 mr-auto ml-0 h-dvh max-h-dvh w-full max-w-sm animate-slide-in-left";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "bg-paper p-0 text-ink backdrop:bg-ink/50 backdrop:animate-fade-in",
        position,
        className,
      )}
    >
      {open && (
        <div className="flex h-full max-h-[inherit] flex-col">
          {title !== undefined && (
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="text-sm font-bold uppercase tracking-[0.14em]">{title}</div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 p-2 text-ink/70 hover:text-ink"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="border-t border-line">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
