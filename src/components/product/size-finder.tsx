"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

type Fit = "snug" | "regular" | "relaxed";

/**
 * Estimates a size from height, weight and preferred fit. A simple body-size
 * score (BMI blended with height) is mapped onto the product's size run.
 */
export function recommendSize(product: Product, height: number, weight: number, fit: Fit): string {
  const bmi = weight / (height / 100) ** 2;
  const shift = fit === "snug" ? -0.6 : fit === "relaxed" ? 0.7 : 0;
  const female = product.gender === "women";
  // Roughly 0 (smallest) … 1 (largest) across a typical size range.
  const score =
    ((bmi - (female ? 17.5 : 18.5)) / (female ? 13 : 14)) * 0.75 +
    ((height - (female ? 150 : 162)) / (female ? 30 : 32)) * 0.25;
  const sizes = product.sizes;
  const index = Math.round(score * (sizes.length - 1) + shift);
  return sizes[Math.max(0, Math.min(sizes.length - 1, index))];
}

export function SizeFinder({ product, onSelect }: { product: Product; onSelect: (size: string) => void }) {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(product.gender === "women" ? 162 : 175);
  const [weight, setWeight] = useState(product.gender === "women" ? 55 : 70);
  const [fit, setFit] = useState<Fit>("regular");
  const [result, setResult] = useState<string | null>(null);
  const inStock = result ? (product.stock[result] ?? 0) > 0 : true;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setResult(null);
          setOpen(true);
        }}
        className="flex items-center gap-1.5 text-xs font-medium text-accent underline underline-offset-4 hover:text-accent-dark"
      >
        <Sparkles className="size-3.5" /> Find my size
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="center" title="Find my size">
        <div className="space-y-6 p-5">
          {result ? (
            <div className="text-center">
              <p className="eyebrow text-muted">We recommend</p>
              <p className="mt-2 font-display text-7xl">{result}</p>
              <p className="mx-auto mt-3 max-w-xs text-sm text-ink/70">
                Based on {height} cm, {weight} kg and a {fit} fit.{" "}
                {inStock ? "It's in stock — nice!" : "That size is sold out right now; you can ask to be notified."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button variant="outline" onClick={() => setResult(null)}>
                  Start over
                </Button>
                <Button
                  onClick={() => {
                    onSelect(result);
                    setOpen(false);
                  }}
                >
                  Select {result}
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                setResult(recommendSize(product, height, weight, fit));
              }}
            >
              <p className="text-sm text-ink/70">
                Answer three quick questions and we&apos;ll suggest your size for the {product.name}.
              </p>
              <label className="block">
                <span className="flex justify-between text-xs font-semibold">
                  Height <span className="tabular-nums">{height} cm</span>
                </span>
                <input
                  type="range"
                  min={140}
                  max={205}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="mt-3 w-full accent-ink"
                />
              </label>
              <label className="block">
                <span className="flex justify-between text-xs font-semibold">
                  Weight <span className="tabular-nums">{weight} kg</span>
                </span>
                <input
                  type="range"
                  min={38}
                  max={130}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="mt-3 w-full accent-ink"
                />
              </label>
              <fieldset>
                <legend className="text-xs font-semibold">How do you like it to fit?</legend>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {(["snug", "regular", "relaxed"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      aria-pressed={fit === f}
                      onClick={() => setFit(f)}
                      className={cn(
                        "border py-2.5 text-sm capitalize transition-colors",
                        fit === f ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Button type="submit" size="lg" className="w-full">
                Show my size
              </Button>
            </form>
          )}
        </div>
      </Sheet>
    </>
  );
}
