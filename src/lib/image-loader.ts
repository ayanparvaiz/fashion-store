"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

// Unsplash URLs go through their imgix CDN (resize + modern format).
// Everything else (local files, data URLs from the admin panel) is used as-is.
export default function imageLoader({ src, width, quality }: LoaderArgs) {
  if (!src.startsWith("https://images.unsplash.com/")) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max");
  return url.toString();
}
