import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
  children,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
      <div>
        {eyebrow && <p className="eyebrow mb-2 text-accent">{eyebrow}</p>}
        <h2 className="heading-display text-3xl leading-none sm:text-4xl lg:text-5xl">{title}</h2>
      </div>
      <div className="flex items-center gap-6">
        {children}
        {href && (
          <Link
            href={href}
            className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] hover:text-accent"
          >
            {linkLabel}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
