"use client";

import { gsap } from "./motion";

const COLORS = ["#e5005a", "#0a0a0a", "#ff9ec4", "#f5b301", "#0f8a4b", "#ffffff"];

/**
 * Bursts confetti from the centre of an element: pieces shoot up and out,
 * then tumble down and fade. Cleans up after itself.
 */
export function burstConfetti(from: Element, count = 80) {
  const r = from.getBoundingClientRect();
  const ox = r.left + r.width / 2;
  const oy = r.top + r.height / 2;
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  Object.assign(layer.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "60", overflow: "hidden" });
  document.body.appendChild(layer);

  const random = gsap.utils.random;
  const pieces = Array.from({ length: count }, (_, i) => {
    const piece = document.createElement("span");
    const round = i % 4 === 0;
    const w = random(6, 10, 1);
    Object.assign(piece.style, {
      position: "absolute",
      left: `${ox}px`,
      top: `${oy}px`,
      width: `${w}px`,
      height: `${round ? w : random(10, 16, 1)}px`,
      background: COLORS[i % COLORS.length],
      borderRadius: round ? "50%" : "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.04)",
    });
    layer.appendChild(piece);
    return piece;
  });

  const tl = gsap.timeline({ onComplete: () => layer.remove() });
  for (const piece of pieces) {
    const up = random(0.6, 0.95);
    tl.to(piece, { x: random(-380, 380), y: random(-360, -110), rotation: random(-540, 540), duration: up, ease: "power3.out" }, 0)
      .to(
        piece,
        {
          y: `+=${window.innerHeight * random(0.55, 0.8)}`,
          x: `+=${random(-70, 70)}`,
          rotation: `+=${random(-360, 360)}`,
          opacity: 0,
          duration: random(1.3, 2),
          ease: "power1.in",
        },
        up,
      );
  }
}
