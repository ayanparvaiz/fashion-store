import { cn } from "@/lib/cn";

interface StarsProps {
  rating: number;
  count?: number;
  className?: string;
  size?: number;
}

/**
 * Five-star rating drawn with a single CSS mask (see .stars in globals.css),
 * so dozens of ratings on a page don't add dozens of inline SVGs.
 */
export function Stars({ rating, count, className, size = 14 }: StarsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of 5`}
        className="stars relative inline-block bg-line"
        style={{ width: (size + 1) * 5, height: size, ["--star" as string]: `${size}px` }}
      >
        <span className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${(rating / 5) * 100}%` }} />
      </span>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </div>
  );
}
