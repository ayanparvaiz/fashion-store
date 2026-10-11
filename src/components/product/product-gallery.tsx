"use client";

import { ZoomIn } from "lucide-react";
import { SmartImage as Image } from "@/components/ui/smart-image";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Sheet } from "@/components/ui/sheet";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (i: number) => {
    setActive(i);
    track.current?.scrollTo({ left: i * (track.current?.clientWidth ?? 0), behavior: "smooth" });
  };

  return (
    <div className="lg:grid lg:grid-cols-[84px_1fr] lg:gap-4">
      {/* Thumbnails (desktop) */}
      <ul className="hidden flex-col gap-3 lg:flex">
        {images.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative block aspect-[3/4] w-full overflow-hidden bg-soft transition",
                i === active ? "ring-2 ring-ink ring-offset-2" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="84px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto sm:mx-0"
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => {
                setActive(i);
                setZoomOpen(true);
              }}
              className="group relative aspect-[3/4] w-full shrink-0 snap-center cursor-zoom-in overflow-hidden bg-soft"
              aria-label={`Zoom image ${i + 1}`}
            >
              <Image
                src={src}
                alt={i === 0 ? alt : `${alt} — detail ${i}`}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-paper/90 opacity-0 shadow transition group-hover:opacity-100">
                <ZoomIn className="size-4" />
              </span>
            </button>
          ))}
        </div>
        {/* Dots (mobile) */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn("h-1.5 rounded-full transition-all", i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/30")}
            />
          ))}
        </div>
      </div>

      <Sheet open={zoomOpen} onClose={() => setZoomOpen(false)} side="center" title={alt} width="max-w-3xl">
        <div className="relative aspect-[3/4] w-full bg-soft">
          <Image src={images[active]} alt={alt} fill sizes="(min-width: 768px) 768px, 100vw" quality={90} className="object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex justify-center gap-2 p-3">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(i)}
                className={cn("relative h-16 w-12 overflow-hidden", i === active ? "ring-2 ring-ink" : "opacity-60")}
                aria-label={`Show image ${i + 1}`}
              >
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  );
}
