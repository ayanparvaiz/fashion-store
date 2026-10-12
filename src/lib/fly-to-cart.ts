"use client";

import { gsap, prefersReducedMotion } from "./motion";

/** The header bag button carries this attribute so animations can find it. */
export const CART_TARGET_ATTR = "data-cart-target";

function isVisible(rect: DOMRect) {
  return rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
}

/** Briefly bounces the header bag icon. */
export function bumpCartIcon() {
  const target = document.querySelector<HTMLElement>(`[${CART_TARGET_ATTR}]`);
  if (!target || prefersReducedMotion()) return;
  gsap.fromTo(
    target,
    { scale: 1 },
    { scale: 1.3, duration: 0.16, ease: "power2.out", yoyo: true, repeat: 1, clearProps: "scale" },
  );
}

/**
 * Flies a copy of a product photo from the first visible source element into
 * the header bag icon, then bumps the icon. Resolves when it lands, or
 * immediately when motion is reduced or nothing is on screen.
 *
 * @param sources candidate elements to fly from (first visible wins)
 * @param fallbackImage photo URL used when the source has no <img>
 */
export function flyToCart(sources: (Element | null | undefined)[], fallbackImage: string): Promise<void> {
  return new Promise((resolve) => {
    const target = document.querySelector<HTMLElement>(`[${CART_TARGET_ATTR}]`);
    const from = sources.find((el): el is Element => !!el && isVisible(el.getBoundingClientRect()));
    if (!target || !from || prefersReducedMotion()) return resolve();

    const a = from.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const img = from instanceof HTMLImageElement ? from : from.querySelector("img");
    // Buttons get a small photo chip; big photos start as a card-sized copy.
    const w = a.height < 80 ? 72 : Math.min(a.width, 220);
    const size = { w, h: a.height < 80 ? 96 : w * (a.height / a.width) };
    const start = { x: a.left + a.width / 2 - size.w / 2, y: a.top + a.height / 2 - size.h / 2 };

    const ghost = document.createElement("img");
    ghost.src = img?.currentSrc || img?.src || fallbackImage;
    ghost.alt = "";
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, {
      position: "fixed",
      left: `${start.x}px`,
      top: `${start.y}px`,
      width: `${size.w}px`,
      height: `${size.h}px`,
      objectFit: "cover",
      zIndex: "95",
      pointerEvents: "none",
      boxShadow: "0 18px 40px -12px rgba(0,0,0,0.45)",
      willChange: "transform",
    });
    document.body.appendChild(ghost);

    const dx = b.left + b.width / 2 - (start.x + size.w / 2);
    const dy = b.top + b.height / 2 - (start.y + size.h / 2);
    const endScale = 26 / Math.max(size.w, size.h);

    gsap
      .timeline({
        onComplete: () => {
          ghost.remove();
          bumpCartIcon();
          resolve();
        },
      })
      // Different easings on x and y bend the path into an arc.
      .to(ghost, { x: dx, duration: 0.85, ease: "power1.inOut" }, 0)
      .to(ghost, { y: dy, duration: 0.85, ease: "back.in(1.6)" }, 0)
      .to(ghost, { scale: endScale, borderRadius: "50%", duration: 0.85, ease: "power2.in" }, 0)
      .to(ghost, { opacity: 0.4, duration: 0.2 }, 0.65);
  });
}
