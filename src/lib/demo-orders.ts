import { productImage, seedProducts } from "./catalog";
import { DEFAULT_SETTINGS } from "./store/settings";
import { computeTotals } from "./pricing";
import type { Order, OrderLine, OrderStatus } from "./types";

const CUSTOMERS = [
  ["Rachel", "Tan", "Blk 512 Ang Mo Kio Ave 8", "#08-221", "560512"],
  ["Nur", "Aisyah", "Blk 230 Tampines St 21", "#05-118", "520230"],
  ["Priya", "Raman", "18 Holland Grove Road", "", "278801"],
  ["Jasmine", "Lim", "Blk 107 Punggol Field", "#12-340", "820107"],
  ["Daniel", "Ong", "9 Tanjong Pagar Road", "#03-02", "088700"],
  ["Hannah", "Wong", "Blk 640 Jurong West St 61", "#10-55", "640640"],
  ["Marcus", "Lee", "21 Robin Road", "#07-01", "258207"],
  ["Siti", "Rahman", "Blk 31 Bedok South Ave 2", "#04-77", "460031"],
  ["Arjun", "Menon", "Blk 455 Sengkang West Way", "#14-129", "790455"],
  ["Chloe", "Ng", "88 Orchard Boulevard", "#21-03", "248649"],
  ["Ethan", "Goh", "Blk 168 Bishan St 13", "#06-210", "570168"],
  ["Farah", "Hassan", "Blk 702 Woodlands Dr 70", "#11-08", "730702"],
  ["Megan", "Chua", "3 Sentosa Gateway", "#02-15", "098544"],
  ["Ravi", "Kumar", "Blk 86 Toa Payoh Lor 4", "#09-402", "310086"],
  ["Olivia", "Teo", "Blk 403 Clementi Ave 3", "#03-88", "120403"],
  ["Ryan", "Koh", "45 Joo Chiat Place", "", "427783"],
  ["Amanda", "Yeo", "Blk 216 Yishun St 21", "#07-311", "760216"],
  ["Isaac", "Chen", "11 Marina Way", "#30-06", "018973"],
  ["Shanti", "Pillai", "Blk 98 Geylang Bahru", "#13-2730", "330098"],
  ["Kayla", "Ho", "Blk 289 Bukit Batok St 25", "#02-160", "650289"],
] as const;

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function statusForAge(ageDays: number, roll: number): OrderStatus {
  if (roll < 0.05) return "cancelled";
  if (ageDays < 0.5) return "pending";
  if (ageDays < 1.5) return roll < 0.5 ? "pending" : "confirmed";
  if (ageDays < 4) return "shipped";
  return "delivered";
}

const FLOW: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered"];

/**
 * Generates realistic-looking demo orders for the last 30 days: a steady
 * upward trend with weekend peaks and day-to-day noise.
 */
export function generateDemoOrders(now = Date.now()): Order[] {
  const rand = mulberry32(7);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)];
  const orders: Order[] = [];

  const ages: number[] = [];
  for (let day = 29; day >= 0; day--) {
    const weekday = new Date(now - day * DAY).getDay();
    const weekend = weekday === 0 || weekday === 6 ? 1.5 : 0;
    const trend = 1.6 + ((29 - day) / 29) * 2.4;
    const count = Math.max(1, Math.round(trend + weekend + (rand() - 0.5) * 2.2));
    for (let n = 0; n < count; n++) {
      // Today only has orders up to the current time.
      const hours = day === 0 ? rand() * Math.min(22, new Date(now).getHours() + 1) : rand() * 24;
      ages.push(day + hours / 24);
    }
  }

  for (let i = 0; i < ages.length; i++) {
    const ageDays = ages[i];
    const createdAt = now - ageDays * DAY;
    const [firstName, lastName, address, unit, postalCode] = pick(CUSTOMERS);

    const lines: OrderLine[] = [];
    const lineCount = 1 + Math.floor(rand() * rand() * 3.2);
    for (let l = 0; l < lineCount; l++) {
      const p = pick(seedProducts);
      if (lines.some((x) => x.productId === p.id)) continue;
      lines.push({
        productId: p.id,
        name: p.name,
        slug: p.slug,
        color: p.color.name,
        size: pick(p.sizes),
        price: p.price,
        quantity: rand() < 0.85 ? 1 : 2,
        image: productImage(p),
      });
    }

    const method = rand() < 0.2 ? "express" : "standard";
    const totals = computeTotals(lines, DEFAULT_SETTINGS, { method });
    const status = statusForAge(ageDays, rand());
    const steps =
      status === "cancelled" ? ["pending", "cancelled"] : FLOW.slice(0, FLOW.indexOf(status) + 1);

    orders.push({
      id: `demo-${i + 1}`,
      number: "",
      createdAt: new Date(createdAt).toISOString(),
      status,
      history: steps.map((s, idx) => ({
        status: s as OrderStatus,
        at: new Date(Math.min(now, createdAt + idx * (idx === 1 ? 3 : 26) * HOUR)).toISOString(),
      })),
      email: `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, "") + "@example.com",
      phone: `+65 ${pick(["8", "9"])}${String(Math.floor(rand() * 1e3)).padStart(3, "0")} ${String(Math.floor(rand() * 1e4)).padStart(4, "0")}`,
      shippingAddress: { firstName, lastName, address, unit, postalCode },
      shippingMethod: method,
      paymentMethod: "cod",
      lines,
      subtotal: totals.subtotal,
      discount: 0,
      discountCode: null,
      shipping: totals.shipping,
      total: totals.total,
      demo: true,
    });
  }

  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  orders.forEach((o, idx) => (o.number = `FS${10201 + idx}`));
  return orders.reverse();
}
