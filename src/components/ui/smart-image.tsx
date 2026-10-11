import Image, { type ImageProps } from "next/image";

/**
 * next/image that only builds a responsive srcset for Unsplash photos (served
 * by the image loader). Admin uploads (data URLs) and pasted URLs render as-is,
 * so a data URL is never repeated across srcset entries.
 */
export function SmartImage({ alt, unoptimized, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const optimizable = src.startsWith("https://images.unsplash.com/");
  return <Image alt={alt} unoptimized={unoptimized ?? !optimizable} {...props} />;
}
