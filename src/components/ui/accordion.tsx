import { Plus } from "lucide-react";
import type { ReactNode } from "react";

interface AccordionItemProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Native <details> accordion — accessible and works without JavaScript. */
export function AccordionItem({ title, children, defaultOpen }: AccordionItemProps) {
  return (
    <details className="group border-b border-line" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-xs font-bold uppercase tracking-[0.14em] [&::-webkit-details-marker]:hidden">
        {title}
        <Plus className="size-4 transition-transform group-open:rotate-45" />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-ink/80">{children}</div>
    </details>
  );
}
