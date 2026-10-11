"""Turns the hand-reviewed Unsplash picks into catalogue entries.

Reads  scripts/.cache/unsplash.json   (from npm run fetch:images)
       scripts/expansion-picks.json   (photo ids accepted after visual review)
Writes scripts/catalog-expansion.json (committed; consumed by build-catalog.mjs)

Colour comes from the photo description when it names one, otherwise from
the average pixel colour where the garment sits. Names, prices and markdowns
are generated deterministically so re-running gives the same catalogue.

Usage: python3 scripts/curate-expansion.py
"""

import io
import json
import random
import re
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent
CACHE = json.loads((ROOT / ".cache" / "unsplash.json").read_text())
PICKS = json.loads((ROOT / "expansion-picks.json").read_text())
PHOTOS = {p["id"]: p for group in CACHE.values() for p in group}

# (gender, category) -> (how many to add, [(source group, name template key)])
PLAN = {
    ("women", "dresses"): (18, [("x-women-dresses", "dress")]),
    ("women", "tops"): (18, [("x-women-tops", "blouse")]),
    ("women", "skirts"): (25, [("x-women-skirts", "skirt")]),
    ("women", "jeans"): (10, [("x-women-jeans", "jeans-w")]),
    ("women", "shorts"): (20, [("x-women-shorts", "shorts-w")]),
    ("women", "hoodies"): (22, [("x-women-hoodies", "hoodie"), ("x-women-sweatshirts", "sweatshirt")]),
    ("women", "knitwear"): (22, [("x-women-knitwear", "knit-w")]),
    ("women", "denim-jackets"): (24, [("x-women-denim-jackets", "denim")]),
    ("women", "jackets"): (20, [("x-women-jackets", "coat-w"), ("x-women-blazers", "blazer")]),
    ("women", "activewear"): (22, [("x-women-activewear", "active")]),
    ("men", "t-shirts"): (22, [("x-men-tshirts", "tee")]),
    ("men", "shirts"): (20, [("x-men-shirts", "linen"), ("x-men-flannel", "flannel")]),
    ("men", "polos"): (22, [("x-men-polos", "polo")]),
    ("men", "hoodies"): (20, [("x-men-hoodies", "hoodie-m"), ("x-men-sweatshirts", "sweatshirt")]),
    ("men", "knitwear"): (20, [("x-men-knitwear", "knit-m")]),
    ("men", "denim-jackets"): (24, [("x-men-denim-jackets", "denim")]),
    ("men", "jackets"): (20, [("x-men-jackets", "bomber"), ("x-men-coats", "coat-m"), ("x-men-puffers", "puffer")]),
    ("men", "jeans"): (14, [("x-men-jeans", "jeans-m")]),
    ("men", "pants"): (11, [("x-men-pants", "pants")]),
    ("men", "shorts"): (18, [("x-men-shorts", "shorts-m")]),
}

NAMES = {
    "dress": (["Floral", "Satin", "Wrap", "Tie-Waist", "Puff Sleeve", "Button-Through", "Tiered", "Pleated", "Smocked", "Belted", "Ruched", "Flutter Sleeve", "Linen", "Square Neck", "Shirred", "Printed"], ["Midi Dress", "Maxi Dress", "Mini Dress", "Shirt Dress", "Slip Dress", "Sundress"]),
    "blouse": (["Ruffle", "Puff Sleeve", "Linen", "Broderie", "Satin", "Wrap", "Tie-Front", "Off-Shoulder", "Button-Up", "Relaxed", "Printed", "Lace Trim"], ["Blouse", "Top", "Shirt"]),
    "skirt": (["Pleated", "Satin", "A-Line", "Tiered", "Wrap", "Denim", "Floral", "Slit", "Tennis", "Leather-Look", "Linen", "Printed"], ["Midi Skirt", "Maxi Skirt", "Mini Skirt"]),
    "jeans-w": (["High Rise", "Straight Leg", "Mom", "Wide Leg", "Slim", "Vintage Wash", "Ripped", "Flare", "Relaxed", "Cropped", "Barrel Leg", "Bootcut"], ["Jeans"]),
    "shorts-w": (["Paperbag", "High Waist", "Denim", "Linen-Blend", "Drawstring", "Cuffed", "Cotton Twill", "Crochet", "Relaxed", "Button-Fly", "Tailored", "Pleated"], ["Shorts", "Mini Shorts"]),
    "hoodie": (["Oversized", "Cloud Fleece", "Boyfriend", "Cropped", "Relaxed", "Heavyweight", "Brushed", "Graphic", "Essential", "Slouchy"], ["Hoodie", "Zip Hoodie"]),
    "hoodie-m": (["Heavyweight", "Essential", "Oversized", "Relaxed", "Fleece", "Garment-Dyed", "Washed", "Boxy", "Graphic", "Tech"], ["Hoodie", "Pullover Hoodie"]),
    "sweatshirt": (["Half-Zip", "Oversized", "Vintage Wash", "Brushed", "Varsity", "Relaxed", "Essential", "Fleece"], ["Sweatshirt", "Crew Sweatshirt"]),
    "knit-w": (["Chunky", "Cable Knit", "Ribbed", "Mohair-Blend", "Cropped", "Oversized", "Soft-Touch", "Mock Neck", "Turtleneck", "Fisherman", "Waffle Knit", "Cosy"], ["Jumper", "Sweater", "Knit Top"]),
    "knit-m": (["Merino", "Chunky", "Cable Knit", "Ribbed", "Lambswool-Blend", "Textured", "Fisherman", "Crew Neck", "Roll Neck", "Waffle"], ["Jumper", "Sweater"]),
    "denim": (["Classic", "Oversized", "Cropped", "Vintage Wash", "Boyfriend", "Sherpa-Lined", "Distressed", "Relaxed", "Trucker", "Raw Hem", "Washed", "Cord Collar", "Western", "Patchwork", "Stonewash"], ["Denim Jacket", "Jean Jacket"]),
    "coat-w": (["Belted", "Wool-Blend", "Double-Breasted", "Longline", "Tailored", "Wrap", "Oversized", "Teddy", "Classic", "Cocoon"], ["Coat", "Trench Coat", "Overcoat"]),
    "blazer": (["Oversized", "Tailored", "Single-Breasted", "Double-Breasted", "Boyfriend", "Cropped", "Relaxed", "Linen-Blend"], ["Blazer", "Suit Blazer"]),
    "active": (["Sculpt", "Seamless", "Contour", "Ribbed", "Flex", "Studio", "Power", "Second-Skin", "Breathe", "Motion"], ["Leggings Set", "Sports Bra Set", "Training Set", "Workout Set", "Active Set"]),
    "tee": (["Heavyweight", "Boxy", "Oversized", "Essential", "Graphic", "Vintage Wash", "Pocket", "Relaxed", "Slim Fit", "Ringer", "Longline", "Premium Cotton"], ["Tee", "T-Shirt"]),
    "linen": (["Relaxed", "Band Collar", "Short Sleeve", "Resort", "Classic", "Breathable", "Camp Collar", "Grandad Collar"], ["Linen Shirt", "Linen-Blend Shirt"]),
    "flannel": (["Brushed", "Heavyweight", "Buffalo Check", "Plaid", "Classic", "Oversized", "Utility"], ["Flannel Shirt", "Check Shirt"]),
    "polo": (["Knit", "Piqué", "Textured", "Slim Fit", "Classic", "Johnny Collar", "Ribbed", "Resort", "Waffle", "Performance", "Cotton", "Retro"], ["Polo", "Polo Shirt"]),
    "bomber": (["Classic", "Satin", "Nylon", "Utility", "Varsity", "Padded", "Suede-Look", "Lightweight"], ["Bomber Jacket"]),
    "coat-m": (["Wool-Blend", "Tailored", "Longline", "Single-Breasted", "Double-Breasted", "Camel", "Car", "Relaxed"], ["Coat", "Overcoat", "Topcoat"]),
    "puffer": (["Quilted", "Recycled Down", "Boxy", "Cropped", "Hooded", "Matte", "Glossy", "Lightweight"], ["Puffer Jacket"]),
    "jeans-m": (["Slim", "Straight Leg", "Tapered", "Relaxed", "Selvedge", "Washed", "Ripped", "Stretch", "Loose Fit", "Vintage", "Carpenter", "Bootcut", "Athletic Fit", "Rigid", "Raw Denim"], ["Jeans"]),
    "pants": (["Cargo", "Relaxed", "Utility", "Wide Leg", "Tapered", "Parachute", "Pleated", "Drawstring", "Twill"], ["Pants", "Trousers"]),
    "shorts-m": (["Linen", "Chino", "Swim", "Drawstring", "Cargo", "Training", "Relaxed", "Tailored", "Terry", "Board", "Pleated", "Nylon", "Utility", "Seersucker", "Twill", "Ripstop", "Denim", "Volley"], ["Shorts"]),
}

PRICES = {  # template -> (min, max) in S$
    "dress": (39, 89), "blouse": (22, 49), "skirt": (29, 59), "jeans-w": (45, 69), "shorts-w": (22, 39),
    "hoodie": (39, 65), "hoodie-m": (45, 69), "sweatshirt": (35, 59), "knit-w": (45, 89), "knit-m": (49, 99),
    "denim": (69, 129), "coat-w": (99, 189), "blazer": (69, 119), "active": (35, 75), "tee": (22, 39),
    "linen": (39, 65), "flannel": (39, 59), "polo": (32, 55), "bomber": (89, 139), "coat-m": (129, 219),
    "puffer": (99, 169), "jeans-m": (49, 79), "pants": (45, 69), "shorts-m": (25, 45),
}

# Where the garment usually sits in a 3:4 crop (for colour sampling and zoom crops).
FOCUS_Y = {
    "dresses": 0.5, "skirts": 0.62, "jeans": 0.62, "shorts": 0.5, "pants": 0.66,
    "activewear": 0.5,
}

GARMENT_WORDS = r"dress|skirt|jeans|denim|shorts|hoodie|sweatshirt|sweater|jumper|cardigan|jacket|coat|blazer|shirt|t-shirt|tee|top|blouse|polo|pants|trousers|leggings|bra|puffer|bomber"

PALETTE = [
    ("Black", "#111111"), ("Charcoal", "#36383c"), ("Grey", "#8a8d91"), ("Light Grey", "#c9cbcd"),
    ("White", "#f5f5f3"), ("Cream", "#ede4d3"), ("Beige", "#cdb79e"), ("Camel", "#b5855a"),
    ("Tan", "#a87c56"), ("Brown", "#6b4a33"), ("Chocolate", "#4a3326"), ("Khaki", "#a59a72"),
    ("Olive", "#5b5a3a"), ("Sage", "#9fb09a"), ("Forest", "#234536"), ("Mint", "#a8d5c2"),
    ("Teal", "#2f7d7a"), ("Navy", "#1d2a44"), ("Blue", "#3b5b8f"), ("Sky Blue", "#9cc0e0"),
    ("Lilac", "#c3b1dc"), ("Purple", "#6d4c8f"), ("Pink", "#e8a3b5"), ("Blush", "#e3c0b7"),
    ("Hot Pink", "#d63a7c"), ("Red", "#c0262d"), ("Burgundy", "#6e1f2f"), ("Rust", "#b05a2a"),
    ("Orange", "#e0752d"), ("Mustard", "#d4a02b"), ("Yellow", "#f0d34a"),
]
WORD_COLORS = {
    "black": "Black", "white": "White", "grey": "Grey", "gray": "Grey", "beige": "Beige", "cream": "Cream",
    "brown": "Brown", "tan": "Tan", "khaki": "Khaki", "olive": "Olive", "green": "Forest", "teal": "Teal",
    "navy": "Navy", "blue": "Blue", "purple": "Purple", "lilac": "Lilac", "lavender": "Lilac", "pink": "Pink",
    "red": "Red", "maroon": "Burgundy", "burgundy": "Burgundy", "orange": "Orange", "yellow": "Yellow",
    "mustard": "Mustard",
}
HEX = dict(PALETTE)
# Description words that should steer the generated name.
HINT_ADJECTIVES = {
    "polka": "Polka Dot", "striped": "Striped", "stripe": "Striped", "lace": "Lace", "leopard": "Leopard Print",
    "checkered": "Check", "plaid": "Plaid", "floral": "Floral", "print": "Printed", "ribbed": "Ribbed",
    "satin": "Satin", "linen": "Linen", "leather": "Leather-Look", "pleated": "Pleated", "knit": "Knit",
    "cropped": "Cropped", "crop": "Cropped", "oversized": "Oversized", "graphic": "Graphic", "denim": "Denim",
    "ripped": "Ripped", "distressed": "Distressed", "wide": "Wide Leg", "flare": "Flare", "cargo": "Cargo",
    "turtleneck": "Turtleneck", "cable": "Cable Knit", "puffer": "Quilted", "sherpa": "Sherpa-Lined",
}
DENIM = [("Light Wash", "#9db4cc"), ("Mid Wash", "#4f6e96"), ("Dark Wash", "#26354f"), ("Black Denim", "#2b2b2e")]


def hex_to_rgb(h):
    return tuple(int(h[i : i + 2], 16) for i in (1, 3, 5))


def to_lab(rgb):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (lin(c) for c in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return (116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z)))


def nearest(rgb, options):
    lab = to_lab(rgb)
    return min(options, key=lambda o: sum((a - b) ** 2 for a, b in zip(lab, to_lab(hex_to_rgb(o[1])))))


def sample(photo, focus_y, sides=False):
    """Dominant colour where the garment sits (most common quantised pixel in a
    small box, so background bleeding into an average can't win). Open
    jackets are sampled at the sides so the T-shirt underneath doesn't win."""
    url = photo["raw"] + "&w=60&h=80&fit=crop&fm=jpg&q=70"
    with urllib.request.urlopen(url, timeout=30) as res:
        img = Image.open(io.BytesIO(res.read())).convert("RGB")
    cy = int(focus_y * 80)
    xs = [(13, 21), (39, 47)] if sides else [(24, 36)]
    pixels = []
    for x0, x1 in xs:
        pixels += list(img.crop((x0, max(0, cy - 6), x1, min(80, cy + 6))).getdata())
    buckets = {}
    for px in pixels:
        key = tuple(c // 24 for c in px)
        buckets.setdefault(key, []).append(px)
    top = max(buckets.values(), key=len)
    return tuple(sum(p[i] for p in top) // len(top) for i in range(3))


def colour_for(photo, category, rgb):
    alt = (photo.get("alt") or "").lower()
    if category in ("denim-jackets", "jeans"):
        if re.search(r"black (?:denim|jeans|jacket)", alt):
            return DENIM[3]
        return nearest(rgb, DENIM[:3])
    # Prefer a colour word that directly precedes the garment ("in blue denim jacket").
    for m in re.finditer(rf"\b({'|'.join(WORD_COLORS)})\b(?:\s+[a-z-]+){{0,3}}?\s+(?:{GARMENT_WORDS})", alt):
        name = WORD_COLORS[m.group(1)]
        return name, HEX[name]
    return nearest(rgb, PALETTE)


def main():
    rand = random.Random(20261012)
    entries, seen_names = [], set()
    jobs = []
    for (gender, category), (count, sources) in PLAN.items():
        pools = [[(pid, template) for pid in PICKS[group]] for group, template in sources]
        chosen = []
        while len(chosen) < count and any(pools):
            for pool in pools:  # interleave sources (e.g. hoodies + sweatshirts)
                if pool and len(chosen) < count:
                    chosen.append(pool.pop(0))
        focus = FOCUS_Y.get(category, 0.42)
        jobs += [(gender, category, pid, template, focus) for pid, template in chosen]

    jacket_like = {"denim-jackets", "jackets"}
    with ThreadPoolExecutor(16) as pool:
        colours = list(pool.map(lambda j: sample(PHOTOS[j[2]], j[4], j[1] in jacket_like), jobs))

    for (gender, category, pid, template, focus), rgb in zip(jobs, colours):
        photo = PHOTOS[pid]
        adjectives, nouns = NAMES[template]
        alt = (photo.get("alt") or "").lower()
        hinted_adj = [a for a in adjectives if a.lower() in alt]
        hinted_adj += [v for k, v in HINT_ADJECTIVES.items() if re.search(rf"\b{k}", alt) and v not in hinted_adj]
        hinted_noun = [n for n in nouns if n.split()[0].lower() in alt]
        def fits(a, n):  # avoid "Denim Jean Jacket", "Mini Mini Skirt"…
            return a.split()[-1] not in n and not (a == "Denim" and ("Jean" in n or "Denim" in n))

        combos = [f"{a} {n}" for a in adjectives for n in nouns if fits(a, n)]
        rand.shuffle(combos)
        hinted = [f"{a} {n}" for a in hinted_adj for n in (hinted_noun or nouns) if fits(a, n)]
        hinted += [c for c in combos if any(c.endswith(n) for n in hinted_noun)]
        name = next((c for c in hinted + combos if (gender, c) not in seen_names), f"{rand.choice(adjectives)} {nouns[0]} II")
        seen_names.add((gender, name))
        colour_name, colour_hex = colour_for(photo, category, rgb)
        low, high = PRICES[template]
        price = round(rand.uniform(low, high)) - 0.1
        compare = None
        if rand.random() < 0.16:
            compare = round(price * rand.uniform(1.25, 1.5)) - 0.1
        entries.append({
            "photoId": pid,
            "gender": gender,
            "category": category,
            "name": name,
            "color": {"name": colour_name, "hex": colour_hex.upper()},
            "price": round(price, 2),
            "compareAtPrice": round(compare, 2) if compare else None,
            "focusY": focus,
            "photo": {k: photo[k] for k in ("raw", "alt", "color", "author", "authorUrl", "pageUrl")},
        })

    out = ROOT / "catalog-expansion.json"
    out.write_text(json.dumps(entries, indent=1, ensure_ascii=False) + "\n")
    print(f"Wrote {len(entries)} entries to {out.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    main()
