import type { Product } from "./types";

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  size: string;
  fit: "Runs small" | "True to size" | "Runs large";
  createdAt: string;
  verified: boolean;
}

const AUTHORS = [
  "Jia Hui T.", "Nadia R.", "Kavya P.", "Sarah L.", "Hui Min C.", "Aaliyah M.", "Wei Ling O.",
  "Ashley N.", "Dinesh K.", "Jun Jie L.", "Farhan A.", "Bryan T.", "Clara W.", "Marcus Y.",
  "Natasha G.", "Zhi Hao K.", "Melissa S.", "Hafiz I.", "Rachel K.", "Joel P.",
];

const PRAISE = [
  ["Obsessed!", "Fits like a dream and the quality is way better than I expected for the price. Already planning to get another colour."],
  ["Wore it all weekend", "Super comfortable and got so many compliments. Delivery was fast too — arrived in two days."],
  ["Exactly like the photos", "Colour is spot on and the fabric feels premium. Washed it once and it still looks brand new."],
  ["New favourite", "Flattering cut and easy to style. Paid cash on delivery which was really convenient."],
  ["Great value", "Looks and feels expensive. Packaging was cute as well. Would definitely recommend."],
  ["Perfect fit", "I'm usually between sizes but this one fit perfectly. Material is breathable for Singapore weather."],
] as const;

const MIXED = [
  ["Nice but check the size", "Love the style but it runs slightly small — I'd size up if you're between sizes."],
  ["Pretty good", "Good quality overall. The colour is a touch darker in person but I still like it."],
] as const;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Deterministic sample reviews for a product (same output on server and client). */
export function sampleReviews(product: Product, count = 5): Review[] {
  const rand = mulberry32(hash(product.id));
  const base = new Date(product.createdAt).getTime();
  return Array.from({ length: Math.min(count, product.reviewCount) }, (_, i) => {
    const positive = rand() < product.rating / 5.2;
    const [title, body] = positive
      ? PRAISE[Math.floor(rand() * PRAISE.length)]
      : MIXED[Math.floor(rand() * MIXED.length)];
    const fitRoll = rand();
    return {
      id: `${product.id}-r${i}`,
      author: AUTHORS[Math.floor(rand() * AUTHORS.length)],
      rating: positive ? (rand() < 0.75 ? 5 : 4) : rand() < 0.6 ? 4 : 3,
      title,
      body,
      size: product.sizes[Math.floor(rand() * product.sizes.length)],
      fit: fitRoll < 0.72 ? "True to size" : fitRoll < 0.9 ? "Runs small" : "Runs large",
      createdAt: new Date(base + (3 + i * 6 + Math.floor(rand() * 5)) * 86_400_000).toISOString(),
      verified: rand() < 0.85,
    };
  });
}

/** Approximate star distribution (5★ → 1★) that matches the average rating. */
export function ratingDistribution(rating: number, total: number): number[] {
  const five = Math.max(0, Math.min(1, (rating - 3.6) / 1.4));
  const weights = [five, (1 - five) * 0.62, (1 - five) * 0.24, (1 - five) * 0.09, (1 - five) * 0.05];
  return weights.map((w) => Math.round(w * total));
}
