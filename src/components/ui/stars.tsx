import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface StarsProps {
  rating: number;
  count?: number;
  className?: string;
  size?: number;
}

export function Stars({ rating, count, className, size = 14 }: StarsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="relative flex" aria-label={`Rated ${rating.toFixed(1)} out of 5`} role="img">
        <div className="flex text-line">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} style={{ width: size, height: size }} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex overflow-hidden text-ink"
          style={{ width: `${(rating / 5) * 100}%` }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className="shrink-0"
              style={{ width: size, height: size }}
              fill="currentColor"
              strokeWidth={0}
            />
          ))}
        </div>
      </div>
      {count !== undefined && <span className="text-xs text-muted">({count})</span>}
    </div>
  );
}
