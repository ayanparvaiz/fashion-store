import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function ContentPage({
  eyebrow,
  title,
  intro,
  children,
  wide = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="container-page pt-6 pb-20">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <header className="mx-auto mt-10 max-w-3xl text-center">
        {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
        <h1 className="heading-display mt-2 text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-base text-ink/70">{intro}</p>}
      </header>
      <div
        className={
          wide
            ? "mt-12"
            : "mx-auto mt-12 max-w-3xl space-y-5 text-[15px] leading-relaxed text-ink/80 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-4 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:tracking-[0.14em] [&_h2]:text-ink [&_h2]:uppercase [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink"
        }
      >
        {children}
      </div>
    </div>
  );
}
