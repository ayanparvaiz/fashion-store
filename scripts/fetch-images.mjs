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
  existing[name] = await search(group);
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(existing, null, 2));
console.log(`Saved ${OUT}`);
