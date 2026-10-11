// Builds the demo catalog (src/data/products.json + src/data/media.json)
// from the curated Unsplash picks below and the cache written by
// scripts/fetch-images.mjs. Output is deterministic (seeded random).
// Usage: npm run build:catalog
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const cache = JSON.parse(
  await readFile(path.join(import.meta.dirname, ".cache", "unsplash.json"), "utf8"),
);
const photos = new Map(Object.values(cache).flat().map((p) => [p.id, p]));

// ---------------------------------------------------------------------------
// Curated picks: [unsplashId, name, colorName, colorHex, price, compareAt?]
// ---------------------------------------------------------------------------
const CATALOG = {
  women: {
    dresses: [
      ["qSA-x_pTHqQ", "Linen Rope-Belt Mini Dress", "White", "#F4F1EA", 49.9],
      ["UbrPTBBxaE8", "Sage Shirred Midi Slip Dress", "Sage", "#B7C4B1", 44.9],
      ["hCBN7m21gqM", "Blush Cowl Neck Bodycon Dress", "Blush", "#D9A79A", 39.9],
      ["6_LidIGnJqU", "Terracotta Belted Shirt Dress", "Terracotta", "#C8644A", 54.9],
      ["GbMYx4EDq9o", "Red Floral Strappy Mini Dress", "Red Floral", "#B3262E", 36.9, 49.9],
      ["Nn5tNjUVBJk", "Paisley Satin Slip Maxi Dress", "Cream", "#E9DCC6", 59.9],
      ["y-OMFTKo7UE", "Black Lace Long Sleeve Midi Dress", "Black", "#111111", 64.9],
      ["bZDTVuDH38M", "Belted Little Black Dress", "Black", "#111111", 42.9],
      ["cRpcTf0VfuE", "Floral Cami Midi Sundress", "White Floral", "#F2EEE6", 52.9, 69.9],
      ["x8Z4CrNUPWQ", "Rust Satin Maxi Dress", "Rust", "#B85A1E", 69.9],
      ["qn0qN-CwDsU", "Paisley Print Maxi Shirt Dress", "Sage Print", "#A9B39A", 58.9],
      ["rwkx7rVVA-o", "Emerald Floral Wrap Dress", "Emerald", "#1F4D3A", 46.9, 59.9],
    ],
    tops: [
      ["-h-O5_xkO0g", "Crochet Trim Crop Cami", "White", "#F7F7F5", 24.9],
      ["mU6vF37vufw", "Mock Neck Long Sleeve Crop Top", "White", "#F7F7F5", 22.9],
      ["KwYxJg_liVE", "Red Floral Off-Shoulder Tie Top", "Red", "#C8202E", 29.9],
      ["5s1e2yqNJNQ", "Striped Knit Crop Tank", "Navy Stripe", "#2B3A55", 21.9],
      ["SgIQxcePMco", "Ribbed Long Sleeve Crop Top", "Cream", "#EDE6D6", 24.9],
      ["FcORNGehslM", "Faux Leather Crop Tee", "Black", "#111111", 32.9],
      ["0jaoxej10-0", "Cap Sleeve Sweetheart Crop Top", "Sky Blue", "#A9C7E3", 26.9],
      ["YbYY5B4J14A", "Essential Square Neck Cami", "White", "#F7F7F5", 16.9],
      ["UVHB7rkWIYc", "Striped Boxy Crop Tee", "Red Stripe", "#B8312F", 19.9, 27.9],
      ["6VMGPluOpu0", "Graphic Slogan Crop Tee", "White", "#F7F7F5", 22.9],
    ],
    jeans: [
      ["ySwv-vRZ3nU", "Distressed Skinny Ankle Jeans", "Light Wash", "#8FA9C6", 45.9],
      ["xt-05J1bhzQ", "Tie-Waist Paperbag Mom Jeans", "Light Wash", "#9DB4CC", 52.9],
      ["LZWRNQN2dJE", "Ripped High Rise Skinny Jeans", "Mid Wash", "#4F6E96", 49.9],
      ["au5f7HyfATc", "White High Waist Skinny Jeans", "White", "#F7F7F5", 46.9],
      ["Oh65WnW2u44", "Sculpt High Rise Skinny Jeans", "Mid Blue", "#3E5F8A", 54.9],
      ["EURVEqZXh0o", "Dark Rinse Super Stretch Jeans", "Dark Wash", "#26354F", 54.9],
      ["TCRgPA4kbq4", "Belted Wide Leg Denim Trousers", "Mid Wash", "#3D5A86", 59.9],
      ["BciCcl8tjVU", "Patched Boyfriend Jeans", "Mid Wash", "#4A6A90", 49.9, 64.9],
      ["rRaMgfGdEEI", "Raw Hem Flare Jeans", "Dark Wash", "#2E4466", 56.9],
      ["tISS8kXY7gQ", "Studded Cuffed Boyfriend Jeans", "Mid Wash", "#476A97", 58.9],
    ],
    hoodies: [
      ["1i9K55ni5Dk", "Oversized Logo Hoodie", "Black", "#111111", 44.9],
      ["V1dX9O1B4pM", "Cloud Fleece Pullover Hoodie", "White", "#F7F7F5", 42.9],
      ["dN67hPE5KWY", "Blush Oversized Hoodie", "Blush Pink", "#EDC3C3", 42.9],
      ["aAPLeoSmbk4", "Lilac Graphic Hoodie", "Lilac", "#C9B6DE", 46.9],
      ["k9RYF3ii0g8", "Cherry Red Hoodie", "Cherry", "#C42A22", 39.9, 56.9],
      ["uNMH2TKD0MQ", "Cream Boyfriend Hoodie", "Cream", "#F1EAD7", 44.9],
      ["SGVyegCsh-U", "Forest Green Embroidered Hoodie", "Forest", "#1E4A3F", 46.9],
      ["4w_Yqqsb8s8", "Mustard Relaxed Hoodie", "Mustard", "#E0A526", 39.9],
    ],
    jackets: [
      ["Xn7GvimQrk8", "Red Double-Breasted Wool Coat", "Red", "#C2362B", 129.9],
      ["zzKT12IXGfA", "Classic Faux Leather Biker Jacket", "Espresso", "#3B2A23", 89.9],
      ["ua9ReZlzcIE", "Oversized Utility Jacket", "Olive", "#5B5A3A", 79.9],
      ["iRAOJYtPHZE", "Oversized White Blazer Coat", "White", "#F7F7F5", 94.9],
      ["mFyvoh63PvM", "Mustard Tailored Blazer", "Mustard", "#C98A2B", 74.9],
      ["m2evGtglxT4", "Shearling Trim Aviator Jacket", "Cream", "#EDE3D3", 109.9, 139.9],
      ["ZnHpOhHnkDY", "Beige Single-Breasted Blazer", "Beige", "#CDB79E", 79.9],
      ["spTRNa8ErJY", "Grey Oversized Boyfriend Blazer", "Grey", "#7E8078", 84.9],
      ["a3QXIQI8z90", "Black Moto Faux Leather Jacket", "Black", "#111111", 89.9],
      ["xJYtyE9dlsc", "Scarlet Tailored Blazer", "Scarlet", "#C21E35", 74.9, 94.9],
    ],
  },
  men: {
    "t-shirts": [
      ["TysFvOl78u0", "Saigon Script Back Print Tee", "White", "#F7F7F5", 29.9],
      ["RYqL5hecEJo", "Red Script Back Print Tee", "Black", "#111111", 29.9],
      ["wzRKn-AjKf4", "Skeleton Peace Graphic Tee", "Black", "#111111", 27.9],
      ["F5pJVjdwc-s", "Heavyweight Oversized Tee", "Black", "#111111", 32.9],
      ["cxQqh5FQt6g", "Flawless Graphic Oversized Tee", "Black", "#111111", 29.9],
      ["OcI6sNgM_NQ", "Embroidered Signature Boxy Tee", "White", "#F7F7F5", 27.9],
      ["JEpwot2mwko", "Line Art Back Print Tee", "White", "#F7F7F5", 27.9],
      ["7JmhXPtW5Co", "Lavender Arch Graphic Tee", "Lavender", "#9D8BD0", 29.9],
      ["3WrRx1nkvQs", "Bubble Letter Back Print Tee", "Brown", "#4A3B30", 29.9],
      ["314VZQb3G_8", "Photo Print Graphic Tee", "Black", "#111111", 24.9, 32.9],
    ],
    shirts: [
      ["D_Y-BuWJvjw", "Linen Band Collar Shirt", "Ecru", "#EAE3D2", 49.9],
      ["5EKJ4vw1krE", "Tropical Leaf Resort Shirt", "Sand Palm", "#C9B48C", 42.9],
      ["acDOZXe5UtQ", "Lilac Knit Polo Shirt", "Lilac", "#C8B6D6", 36.9],
      ["h0cztHfsLOk", "Classic Plaid Oxford Shirt", "Blue Plaid", "#8FA3C0", 44.9],
      ["bGg3BbYfNBY", "Striped Relaxed Fit Shirt", "Blue Stripe", "#6F86B8", 44.9],
      ["Ll6ggwPpKIo", "Crisp White Poplin Shirt", "White", "#F7F7F5", 39.9],
      ["F3um9jkcCZY", "Sky Blue Oxford Shirt", "Sky Blue", "#A8C2E0", 39.9],
      ["u3WdX52t-UI", "Bold Stripe Camp Collar Shirt", "Red Stripe", "#8E1F27", 36.9, 46.9],
      ["j88fRoQ92PQ", "Slim Fit Stretch Shirt", "Black", "#111111", 42.9],
      ["vKnRYW-mtek", "Leopard Print Camp Shirt", "Leopard", "#8A6A43", 38.9],
    ],
    hoodies: [
      ["VoP2WK9rTa4", "Essential Heavyweight Hoodie", "Ash Grey", "#D5D5D2", 49.9],
      ["ZCoqcrWp9GY", "Oatmeal Relaxed Hoodie", "Oatmeal", "#CDBFAE", 49.9],
      ["KMwpYURfx6E", "Charcoal Fleece Hoodie", "Charcoal", "#3A3D42", 46.9],
      ["oYSHFpUDCIU", "Chalk Pullover Hoodie", "Chalk", "#F2F0EB", 46.9],
      ["D86EPYMO6iE", "Pine Green Oversized Hoodie", "Pine", "#1F3B33", 49.9],
      ["HbY4XIMKxus", "Slogan Print Hoodie", "Burnt Orange", "#E0702B", 44.9, 56.9],
      ["g51Czpqv8yo", "Wake Graphic Hoodie", "Cornflower", "#6F8FE0", 52.9],
      ["DHt3xoDHGEs", "Dusty Pink Hoodie", "Dusty Pink", "#E3AFB3", 44.9],
      ["D6JVv1YnKdQ", "Sherpa Fleece Hoodie", "Navy", "#1D2233", 59.9],
      ["AGwMgxZs1L0", "Signature Script Hoodie", "White", "#F7F7F5", 52.9],
    ],
    pants: [
      ["jC7nVH_Sw8k", "Stretch Cuffed Chino Joggers", "Khaki", "#B49B74", 44.9],
      ["ylHcWlrMlzs", "Cropped Tapered Trousers", "Black", "#111111", 49.9],
      ["cp4ucXlnhYw", "Slim Fit White Chinos", "White", "#F7F7F5", 46.9],
      ["Q1oEbLdBP4g", "Relaxed Linen Drawstring Pants", "Stone", "#CFC7B5", 52.9],
      ["OenHGpOnsv0", "Ripped Skinny Jeans", "Black", "#111111", 54.9],
      ["iun3EnrZKxI", "Tech Jogger Pants", "Black", "#111111", 42.9],
      ["7HWyBKvcQ8g", "Cream Straight Leg Chinos", "Cream", "#E8E1D0", 46.9],
      ["N_dEi1iG69s", "Slim Dress Trousers", "Black", "#111111", 54.9, 69.9],
      ["zJBQr0bajIA", "Pleated Wide Leg Trousers", "Charcoal", "#2F2F2F", 59.9],
      ["YP9DYK6j5cM", "Slim Tapered Jeans", "Washed Black", "#2B2B2E", 49.9],
    ],
    jackets: [
      ["1QOsJGbNIgk", "Classic Trucker Denim Jacket", "Mid Wash", "#3F6E9C", 79.9],
      ["C8wkDP4tnP0", "Varsity Bomber Jacket", "Brown", "#5A3A26", 119.9],
      ["rXKGz1dZgDM", "Colour Block Puffer Jacket", "Orange", "#E8732C", 129.9, 159.9],
      ["CPztBtp6rQg", "Leather Racer Jacket", "Brown", "#5C3B28", 149.9],
      ["2cmLR_I_hn0", "Shearling Collar Aviator Jacket", "Tan", "#8A5A3A", 139.9],
      ["7LUqBD0LW90", "Canvas Workwear Jacket", "Tan", "#B59A6E", 89.9],
      ["Et0T2HVNzf0", "Black Leather Biker Jacket", "Black", "#111111", 149.9],
      ["LrzHcPuDspc", "Gloss Puffer Jacket", "Black", "#111111", 119.9],
      ["0nULZ2hmWpk", "Black Corduroy Trucker Jacket", "Black", "#111111", 84.9, 99.9],
      ["nIs-xAS752k", "Cropped Twill Overshirt Jacket", "Butter", "#E6D6A6", 74.9],
    ],
  },
};

// Banner / editorial imagery used across the storefront.
const BANNERS = {
  "hero-1": "banner-editorial:1",
  "hero-2": "banner-editorial:3",
  "hero-3": "banner-women:25",
  sale: "banner-store:1",
  men: "banner-men:21",
  women: "banner-women:6",
  essentials: "banner-editorial:0",
  denim: "banner-store:27",
  about: "banner-store:0",
  "about-2": "banner-store:12",
};

// ---------------------------------------------------------------------------
// Copy and attributes per category
// ---------------------------------------------------------------------------
const CATEGORY = {
  dresses: {
    label: "Dresses",
    code: "DR",
    focusY: 0.45,
    material: "95% Polyester, 5% Elastane",
    intros: [
      "Made for main-character moments, this dress moves with you from brunch plans to late-night dinners.",
      "A wardrobe hero that does the styling for you — just add your favourite heels or fresh sneakers.",
      "Flattering, effortless and ready for every invite on your calendar.",
    ],
    features: ["Lined bodice", "Hidden back zip", "Lightweight, breathable fabric"],
  },
  tops: {
    label: "Tops",
    code: "TP",
    focusY: 0.35,
    material: "92% Cotton, 8% Elastane",
    intros: [
      "The easy top that pairs with literally everything in your closet.",
      "Cropped, cute and made to layer — your new everyday essential.",
      "Soft stretch fabric and a flattering fit you'll reach for on repeat.",
    ],
    features: ["Cropped length", "Soft stretch fabric", "True to size"],
  },
  jeans: {
    label: "Jeans",
    code: "JN",
    focusY: 0.55,
    material: "98% Cotton, 2% Elastane",
    intros: [
      "Denim that hugs in all the right places with stretch that lasts all day.",
      "Your perfect-fit jeans — high-rise, comfortable and endlessly versatile.",
      "Premium stretch denim with a vintage-inspired wash.",
    ],
    features: ["High-rise waist", "Five-pocket styling", "Zip fly with button closure"],
  },
  hoodies: {
    label: "Hoodies",
    code: "HD",
    focusY: 0.4,
    material: "80% Cotton, 20% Polyester fleece",
    intros: [
      "Cosy, oversized and impossibly soft — the hoodie you'll steal back from everyone.",
      "Brushed fleece inside, clean finish outside. Comfort levels: maximum.",
      "A heavyweight staple built for chilly air-con offices and late-night drives.",
    ],
    features: ["Brushed fleece lining", "Kangaroo pocket", "Ribbed cuffs and hem"],
  },
  jackets: {
    label: "Jackets & Coats",
    code: "JK",
    focusY: 0.4,
    material: "Shell: 100% Polyester. Lining: 100% Polyester",
    intros: [
      "The finishing layer that instantly elevates jeans and a tee.",
      "Structured, statement-making and built to last season after season.",
      "Throw it on and you're done — outerwear with serious style credentials.",
    ],
    features: ["Fully lined", "Front pockets", "Relaxed fit for easy layering"],
  },
  "t-shirts": {
    label: "T-Shirts",
    code: "TS",
    focusY: 0.35,
    material: "100% Cotton, 240 GSM",
    intros: [
      "Heavyweight cotton, boxy fit and a print that does the talking.",
      "Streetwear essential cut from thick, premium cotton that keeps its shape.",
      "The tee you'll wear until it's your favourite — and then some more.",
    ],
    features: ["Dropped shoulders", "Ribbed crew neck", "Pre-shrunk cotton"],
  },
  shirts: {
    label: "Shirts",
    code: "SH",
    focusY: 0.4,
    material: "100% Cotton",
    intros: [
      "Sharp enough for the office, relaxed enough for weekend plans.",
      "A modern shirt with a clean collar and a cut that flatters.",
      "Breathable fabric made for Singapore heat — stay cool, look crisp.",
    ],
    features: ["Button-through front", "Curved hem", "Breathable fabric"],
  },
  pants: {
    label: "Pants",
    code: "PT",
    focusY: 0.7,
    material: "97% Cotton, 3% Elastane",
    intros: [
      "Tailored comfort with a modern tapered leg.",
      "The versatile pant that takes you from desk to dinner without missing a beat.",
      "Stretch fabric, sharp silhouette and all-day comfort.",
    ],
    features: ["Belt loops", "Side and back pockets", "Zip fly with button closure"],
  },
};
const MATERIAL_OVERRIDES = {
  "Linen Rope-Belt Mini Dress": "100% Linen",
  "Relaxed Linen Drawstring Pants": "55% Linen, 45% Cotton",
  "Linen Band Collar Shirt": "100% Linen",
  "Red Double-Breasted Wool Coat": "60% Wool, 40% Polyester",
  "Leather Racer Jacket": "100% Lambskin leather",
  "Black Leather Biker Jacket": "100% Lambskin leather",
  "Black Corduroy Trucker Jacket": "100% Cotton corduroy",
  "Classic Trucker Denim Jacket": "100% Cotton denim",
  "Rust Satin Maxi Dress": "100% Polyester satin",
  "Paisley Satin Slip Maxi Dress": "100% Polyester satin",
  "Faux Leather Crop Tee": "Polyurethane-coated viscose",
  "Classic Faux Leather Biker Jacket": "Polyurethane faux leather",
  "Black Moto Faux Leather Jacket": "Polyurethane faux leather",
  "Lilac Knit Polo Shirt": "100% Cotton knit",
};
const CARE = {
  default: ["Machine wash cold, inside out", "Do not bleach", "Hang to dry", "Cool iron if needed"],
  leather: ["Professional leather clean only", "Store on a padded hanger", "Keep away from direct heat"],
  wool: ["Dry clean only", "Steam to refresh", "Store folded or on a wide hanger"],
};

const SIZES = {
  women: { default: ["XS", "S", "M", "L", "XL"], jeans: ["24", "25", "26", "27", "28", "29", "30"] },
  men: { default: ["S", "M", "L", "XL", "XXL"], pants: ["28", "30", "32", "34", "36"] },
};

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261012);
const between = (min, max) => min + rand() * (max - min);
const int = (min, max) => Math.floor(between(min, max + 1));
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const round2 = (n) => Math.round(n * 100) / 100;

// Catalog "today" — keeps the output stable no matter when the script runs.
const CATALOG_DATE = Date.UTC(2026, 9, 10);
const DAY = 86_400_000;

function photoRef(id) {
  const p = photos.get(id);
  if (!p) throw new Error(`Photo ${id} missing from cache — run npm run fetch:images`);
  return p;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
const media = {};
const products = [];
let n = 0;

for (const [gender, categories] of Object.entries(CATALOG)) {
  for (const [category, items] of Object.entries(categories)) {
    const meta = CATEGORY[category];
    items.forEach(([photoId, name, colorName, colorHex, price, compareAt], i) => {
      n += 1;
      const p = photoRef(photoId);
      media[photoId] = {
        src: p.raw,
        alt: p.alt,
        color: p.color,
        author: p.author,
        authorUrl: p.authorUrl,
        pageUrl: p.pageUrl,
      };

      const sizeList = SIZES[gender][category] ?? SIZES[gender].default;
      const lowStockProduct = rand() < 0.12;
      const stock = Object.fromEntries(
        sizeList.map((s) => {
          const soldOut = rand() < 0.1;
          const qty = soldOut ? 0 : lowStockProduct ? int(1, 3) : int(4, 40);
          return [s, qty];
        }),
      );

      const ageDays = rand() < 0.25 ? int(1, 20) : int(21, 160);
      const isNew = ageDays <= 20;
      const material = MATERIAL_OVERRIDES[name] ?? meta.material;
      const care = /leather|Lambskin/i.test(material) && !/faux|Polyurethane/i.test(material)
        ? CARE.leather
        : /Wool/.test(material)
          ? CARE.wool
          : CARE.default;

      products.push({
        id: `fs-${String(n).padStart(3, "0")}`,
        sku: `FS-${gender === "women" ? "W" : "M"}${meta.code}-${String(i + 1).padStart(3, "0")}`,
        slug: slugify(`${name}-${colorName}`),
        name,
        gender,
        category,
        price,
        compareAtPrice: compareAt ?? null,
        color: { name: colorName, hex: colorHex },
        sizes: sizeList,
        stock,
        image: { id: photoId, focusY: meta.focusY },
        description: meta.intros[i % meta.intros.length],
        features: meta.features,
        material,
        care,
        rating: round2(between(4.1, 4.95)),
        reviewCount: int(6, 380),
        sold: int(10, 900),
        isNew,
        createdAt: new Date(CATALOG_DATE - ageDays * DAY).toISOString(),
      });
    });
  }
}

// Best sellers: top sellers per category become flagged.
const byCategory = Object.groupBy(products, (p) => `${p.gender}/${p.category}`);
for (const list of Object.values(byCategory)) {
  list.sort((a, b) => b.sold - a.sold).slice(0, 2).forEach((p) => (p.isBestseller = true));
}
for (const p of products) p.isBestseller ??= false;

const banners = {};
for (const [key, ref] of Object.entries(BANNERS)) {
  const [group, index] = ref.split(":");
  const p = cache[group][Number(index)];
  media[p.id] = {
    src: p.raw,
    alt: p.alt,
    color: p.color,
    author: p.author,
    authorUrl: p.authorUrl,
    pageUrl: p.pageUrl,
  };
  banners[key] = p.id;
}

const ids = new Set(products.map((p) => p.slug));
if (ids.size !== products.length) throw new Error("Duplicate product slugs");

await writeFile(
  path.join(root, "src/data/products.json"),
  JSON.stringify(products, null, 2) + "\n",
);
await writeFile(
  path.join(root, "src/data/media.json"),
  JSON.stringify({ banners, photos: media }, null, 2) + "\n",
);
console.log(`Wrote ${products.length} products and ${Object.keys(media).length} photos`);
