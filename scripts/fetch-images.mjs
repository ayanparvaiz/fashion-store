// Fetches candidate photos from the Unsplash API for every catalog category.
// Usage: npm run fetch:images            (needs UNSPLASH_ACCESS_KEY in .env.local)
//        npm run fetch:images -- men-hoodies women-dresses   (only these groups)
// Output: scripts/.cache/unsplash.json (git-ignored), used to curate src/data.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!KEY) {
  console.error("Missing UNSPLASH_ACCESS_KEY (see .env.example)");
  process.exit(1);
}

const GROUPS = {
  "women-dresses": { query: "woman dress fashion", orientation: "portrait" },
  "women-tops": { query: "woman crop top fashion", orientation: "portrait" },
  "women-jeans": { query: "woman jeans outfit", orientation: "portrait" },
  "women-hoodies": { query: "woman hoodie streetwear", orientation: "portrait" },
  "women-jackets": { query: "woman jacket outfit", orientation: "portrait" },
  "men-tshirts": { query: "man t-shirt streetwear", orientation: "portrait" },
  "men-shirts": { query: "man shirt fashion", orientation: "portrait" },
  "men-hoodies": { query: "man hoodie streetwear", orientation: "portrait" },
  "men-pants": { query: "men pants outfit", orientation: "portrait" },
  "men-jackets": { query: "man jacket streetwear", orientation: "portrait" },
  "banner-editorial": { query: "fashion editorial model", orientation: "landscape" },
  "banner-women": { query: "women fashion outfit", orientation: "landscape" },
  "banner-men": { query: "men streetwear fashion", orientation: "landscape" },
  "banner-store": { query: "clothing store", orientation: "landscape" },

  // Catalogue expansion (≈450 products). `pages` × 30 photos per group.
  "x-women-dresses": { query: "woman midi dress", orientation: "portrait", pages: 2 },
  "x-women-tops": { query: "woman blouse top", orientation: "portrait", pages: 1 },
  "x-women-jeans": { query: "woman denim jeans", orientation: "portrait", pages: 1 },
  "x-women-skirts": { query: "woman skirt", orientation: "portrait", pages: 2 },
  "x-women-shorts": { query: "woman shorts outfit", orientation: "portrait", pages: 1 },
  "x-women-hoodies": { query: "woman hoodie", orientation: "portrait", pages: 2 },
  "x-women-sweatshirts": { query: "woman sweatshirt", orientation: "portrait", pages: 1 },
  "x-women-knitwear": { query: "woman knit sweater", orientation: "portrait", pages: 2 },
  "x-women-denim-jackets": { query: "woman denim jacket", orientation: "portrait", pages: 2 },
  "x-women-jackets": { query: "woman coat fashion", orientation: "portrait", pages: 1 },
  "x-women-blazers": { query: "woman blazer", orientation: "portrait", pages: 1 },
  "x-women-activewear": { query: "woman activewear", orientation: "portrait", pages: 2 },
  "x-men-tshirts": { query: "man t-shirt", orientation: "portrait", pages: 2 },
  "x-men-shirts": { query: "man linen shirt", orientation: "portrait", pages: 1 },
  "x-men-flannel": { query: "man flannel shirt", orientation: "portrait", pages: 1 },
  "x-men-polos": { query: "man polo shirt", orientation: "portrait", pages: 2 },
  "x-men-hoodies": { query: "man hoodie", orientation: "portrait", pages: 2 },
  "x-men-sweatshirts": { query: "man sweatshirt", orientation: "portrait", pages: 1 },
  "x-men-knitwear": { query: "man sweater", orientation: "portrait", pages: 2 },
  "x-men-denim-jackets": { query: "man denim jacket", orientation: "portrait", pages: 2 },
  "x-men-jackets": { query: "man bomber jacket", orientation: "portrait", pages: 1 },
  "x-men-coats": { query: "man coat", orientation: "portrait", pages: 1 },
  "x-men-puffers": { query: "man puffer jacket", orientation: "portrait", pages: 1 },
  "x-men-jeans": { query: "man jeans", orientation: "portrait", pages: 2 },
  "x-men-pants": { query: "man cargo pants", orientation: "portrait", pages: 1 },
  "x-men-shorts": { query: "man shorts", orientation: "portrait", pages: 2 },
  "x-lookbook": { query: "fashion campaign", orientation: "landscape", pages: 1 },
};

const OUT = path.join(import.meta.dirname, ".cache", "unsplash.json");

async function search({ query, orientation }, page = 1) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.search = new URLSearchParams({
    query,
    orientation,
    page: String(page),
    per_page: "30",
    content_filter: "high",
  });
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  console.log(`  rate limit left: ${res.headers.get("x-ratelimit-remaining")}`);
  const data = await res.json();
  return data.results.map((p) => ({
    id: p.id,
    raw: p.urls.raw,
    width: p.width,
    height: p.height,
    color: p.color,
    alt: p.alt_description ?? p.description ?? "",
    author: p.user.name,
    authorUrl: p.user.links.html,
    pageUrl: p.links.html,
  }));
}

const only = process.argv.slice(2);
const existing = JSON.parse(await readFile(OUT, "utf8").catch(() => "{}"));

for (const [name, group] of Object.entries(GROUPS)) {
  if (only.length && !only.includes(name)) continue;
  console.log(`${name}: "${group.query}"`);
  const pages = [];
  for (let page = 1; page <= (group.pages ?? 1); page++) pages.push(...(await search(group, page)));
  existing[name] = [...new Map(pages.map((p) => [p.id, p])).values()];
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(existing, null, 2));
console.log(`Saved ${OUT}`);
