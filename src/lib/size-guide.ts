import type { CategorySlug, Gender } from "./types";

export interface SizeTable {
  title: string;
  columns: string[];
  rows: (string | number)[][];
}

export const SIZE_TABLES = {
  womenTops: {
    title: "Women — Tops, Dresses, Hoodies & Jackets (cm)",
    columns: ["Size", "UK", "Bust", "Waist", "Hips"],
    rows: [
      ["XS", 6, "78–81", "60–63", "86–89"],
      ["S", 8, "82–86", "64–67", "90–93"],
      ["M", 10, "87–91", "68–72", "94–98"],
      ["L", 12, "92–97", "73–78", "99–104"],
      ["XL", 14, "98–104", "79–85", "105–111"],
    ],
  },
  womenJeans: {
    title: "Women — Jeans (cm)",
    columns: ["Waist size", "Waist", "Hips", "Inseam"],
    rows: [
      [24, 61, 86, 76],
      [25, 64, 89, 76],
      [26, 66, 91, 77],
      [27, 69, 94, 77],
      [28, 71, 96, 78],
      [29, 74, 99, 78],
      [30, 76, 101, 79],
    ],
  },
  menTops: {
    title: "Men — Tees, Shirts, Hoodies & Jackets (cm)",
    columns: ["Size", "Chest", "Length", "Shoulder"],
    rows: [
      ["S", "92–97", 70, 44],
      ["M", "98–103", 72, 46],
      ["L", "104–109", 74, 48],
      ["XL", "110–116", 76, 50],
      ["XXL", "117–124", 78, 52],
    ],
  },
  menPants: {
    title: "Men — Pants & Jeans (cm)",
    columns: ["Waist size", "Waist", "Hips", "Inseam"],
    rows: [
      [28, 72, 92, 79],
      [30, 77, 97, 80],
      [32, 82, 102, 81],
      [34, 87, 107, 82],
      [36, 92, 112, 82],
    ],
  },
} satisfies Record<string, SizeTable>;

export function sizeTableFor(gender: Gender, category: CategorySlug): SizeTable {
  if (gender === "women") return category === "jeans" ? SIZE_TABLES.womenJeans : SIZE_TABLES.womenTops;
  return category === "pants" || category === "jeans" ? SIZE_TABLES.menPants : SIZE_TABLES.menTops;
}
