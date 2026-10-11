"use client";

import { BadgeCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { ratingDistribution, sampleReviews, type Review } from "@/lib/reviews";
import { useReviews } from "@/lib/store/reviews";
import { useUI } from "@/lib/store/ui";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Select, TextArea } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { Stars } from "@/components/ui/stars";

const EMPTY_LIST: Review[] = [];

function WriteReview({ product, onDone }: { product: Product; onDone: () => void }) {
  const add = useReviews((s) => s.add);
  const toast = useUI((s) => s.toast);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  return (
    <form
      className="space-y-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        add(product.id, {
          id: crypto.randomUUID(),
          author: String(data.get("name")),
          rating,
          title: String(data.get("title")),
          body: String(data.get("body")),
          size: String(data.get("size")),
          fit: String(data.get("fit")) as Review["fit"],
          createdAt: new Date().toISOString(),
          verified: false,
        });
        toast("Thanks! Your review has been posted.", "success");
        onDone();
      }}
    >
      <div>
        <p className="mb-1.5 text-xs font-semibold">Your rating</p>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={cn("size-7", n <= (hover || rating) ? "text-ink" : "text-line")}
                fill="currentColor"
                strokeWidth={0}
              />
            </button>
          ))}
        </div>
      </div>
      <Field label="Name" name="name" required maxLength={40} placeholder="e.g. Jia Hui T." />
      <Field label="Review title" name="title" required maxLength={60} />
      <TextArea label="Your review" name="body" required maxLength={600} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Size purchased" name="size" defaultValue={product.sizes[1] ?? product.sizes[0]}>
          {product.sizes.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select label="How does it fit?" name="fit" defaultValue="True to size">
          <option>Runs small</option>
          <option>True to size</option>
          <option>Runs large</option>
        </Select>
      </div>
      <Button type="submit" className="w-full" size="lg">
        Post review
      </Button>
    </form>
  );
}

export function ProductReviews({ product }: { product: Product }) {
  const mine = useReviews((s) => s.byProduct[product.id] ?? EMPTY_LIST);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const reviews = useMemo(() => [...mine, ...sampleReviews(product, 8)], [mine, product]);
  const total = product.reviewCount + mine.length;
  const distribution = ratingDistribution(product.rating, product.reviewCount);
  const trueToSize = Math.round(
    (reviews.filter((r) => r.fit === "True to size").length / Math.max(1, reviews.length)) * 100,
  );

  return (
    <section id="reviews" className="scroll-mt-32 border-t border-line py-14 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
        <div>
          <h2 className="heading-display text-3xl">Reviews</h2>
          <div className="mt-4 flex items-end gap-3">
            <span className="font-display text-5xl leading-none">{product.rating.toFixed(1)}</span>
            <div className="pb-1">
              <Stars rating={product.rating} size={16} />
              <p className="mt-1 text-xs text-muted">Based on {total} reviews</p>
            </div>
          </div>
          <ul className="mt-6 space-y-2">
            {distribution.map((count, i) => (
              <li key={i} className="flex items-center gap-3 text-xs">
                <span className="w-6 tabular-nums">{5 - i}★</span>
                <div className="h-1.5 flex-1 bg-line">
                  <div
                    className="h-full bg-ink"
                    style={{ width: `${(count / Math.max(1, product.reviewCount)) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm">
            <strong>{trueToSize}%</strong> of reviewers say this fits <strong>true to size</strong>.
          </p>
          <Button variant="outline" className="mt-6 w-full" onClick={() => setOpen(true)}>
            Write a review
          </Button>
        </div>

        <ul className="divide-y divide-line">
          {(showAll ? reviews : reviews.slice(0, 4)).map((r) => (
            <li key={r.id} className="py-6 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={r.rating} />
                <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
              </div>
              <p className="mt-3 font-semibold">{r.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{r.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                <span className="font-medium text-ink">{r.author}</span>
                {r.verified && (
                  <span className="flex items-center gap-1 text-success">
                    <BadgeCheck className="size-3.5" /> Verified buyer
                  </span>
                )}
                <span>Size bought: {r.size}</span>
                <span>Fit: {r.fit}</span>
              </div>
            </li>
          ))}
          {reviews.length > 4 && !showAll && (
            <li className="pt-6">
              <Button variant="ghost" className="px-0 underline" onClick={() => setShowAll(true)}>
                Show more reviews
              </Button>
            </li>
          )}
        </ul>
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} side="center" title="Write a review">
        <WriteReview product={product} onDone={() => setOpen(false)} />
      </Sheet>
    </section>
  );
}
