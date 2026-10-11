"use client";

import { useRef } from "react";
import { getLenis, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { useUI } from "@/lib/store/ui";

const SESSION_KEY = "fs:intro";
const WORD = "FASHION.STORE";

/**
 * Inline script (runs before first paint) that hides the preloader for the
 * rest of the session once it has played, so repeat visits never flash it.
 */
export function PreloaderGate() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `try{if(sessionStorage.getItem("${SESSION_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.intro="done"}catch(e){}`,
      }}
    />
  );
}

/** Brand intro: letters rise, a counter runs to 100, then a curtain lifts. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const setIntroDone = useUI((s) => s.setIntroDone);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (document.documentElement.dataset.intro === "done" || prefersReducedMotion()) {
        setIntroDone();
        return;
      }

      document.documentElement.style.overflow = "hidden";
      getLenis()?.stop();
      const counter = { value: 0 };
      const number = el.querySelector<HTMLElement>("[data-counter]");

      const finish = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {}
        document.documentElement.dataset.intro = "done";
        document.documentElement.style.overflow = "";
        getLenis()?.start();
      };

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-char]", { yPercent: 120, duration: 1.1, stagger: 0.045 })
        .to(
          counter,
          {
            value: 100,
            duration: 1.6,
            ease: "power2.inOut",
            onUpdate: () => {
              if (number) number.textContent = String(Math.round(counter.value)).padStart(3, "0");
            },
          },
          0.2,
        )
        .from("[data-bar]", { scaleX: 0, duration: 1.6, ease: "power2.inOut" }, 0.2)
        .to("[data-char]", { yPercent: -120, duration: 0.7, stagger: 0.02, ease: "expo.in" }, ">0.1")
        .add(() => setIntroDone(), "<0.45")
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "<0.2")
        .add(finish);

      return () => {
        // Unmounted mid-intro (or StrictMode re-run): release scroll, don't mark as seen.
        tl.kill();
        document.documentElement.style.overflow = "";
        getLenis()?.start();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[100] flex flex-col justify-between bg-ink p-6 text-paper [clip-path:inset(0%)] sm:p-10"
    >
      <div className="flex justify-between text-[11px] font-semibold tracking-[0.2em] text-paper/60 uppercase">
        <span>Singapore</span>
        <span>SS26 Collection</span>
      </div>
      <p className="flex justify-center overflow-hidden font-display text-[11vw] leading-none sm:text-[9vw]">
        {WORD.split("").map((ch, i) => (
          <span key={i} data-char className={ch === "." ? "inline-block text-accent" : "inline-block"}>
            {ch}
          </span>
        ))}
      </p>
      <div>
        <div className="flex items-end justify-between">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-paper/60 uppercase">Loading the drop</span>
          <span data-counter className="font-display text-5xl tabular-nums sm:text-7xl">
            000
          </span>
        </div>
        <div data-bar className="mt-4 h-px origin-left bg-paper/80" />
      </div>
    </div>
  );
}
