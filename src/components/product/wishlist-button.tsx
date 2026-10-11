"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUI } from "@/lib/store/ui";
import { useWishlist } from "@/lib/store/wishlist";

export function WishlistButton({
  productId,
  className,
  withLabel = false,
}: {
  productId: string;
  className?: string;
  withLabel?: boolean;
}) {
  const saved = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const toast = useUI((s) => s.toast);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(productId);
        toast(added ? "Saved to your wishlist" : "Removed from wishlist", added ? "success" : "default");
      }}
      className={cn("transition-transform active:scale-90", className)}
    >
      <Heart
        className={cn("size-5", saved && "fill-accent text-accent")}
        strokeWidth={saved ? 2 : 1.6}
      />
      {withLabel && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
