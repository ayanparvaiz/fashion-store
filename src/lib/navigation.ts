import { CATEGORIES, GENDER_CATEGORIES } from "./catalog";
import { categoryHref, collectionHref } from "./collections";
import type { Gender } from "./types";

export interface NavLink {
  label: string;
  href: string;
  highlight?: boolean;
}

export interface MegaMenu {
  gender: Gender;
  categories: NavLink[];
  featured: NavLink[];
  /** Product ids whose photos headline the menu. */
  spotlight: { productId: string; label: string; href: string }[];
}

function megaMenu(gender: Gender, spotlight: MegaMenu["spotlight"]): MegaMenu {
  return {
    gender,
    categories: GENDER_CATEGORIES[gender].map((c) => ({
      label: CATEGORIES[c].label,
      href: categoryHref(gender, c),
    })),
    featured: [
      { label: "New Arrivals", href: collectionHref("new-arrivals") },
      { label: "Bestsellers", href: collectionHref("bestsellers") },
      { label: "Sale", href: collectionHref("sale"), highlight: true },
      { label: `Shop All ${gender === "women" ? "Women" : "Men"}`, href: collectionHref(gender) },
    ],
    spotlight,
  };
}

export const MAIN_NAV: (NavLink & { mega?: MegaMenu })[] = [
  { label: "New In", href: collectionHref("new-arrivals") },
  {
    label: "Women",
    href: collectionHref("women"),
    mega: megaMenu("women", [
      { productId: "fs-003", label: "Dresses", href: categoryHref("women", "dresses") },
      { productId: "fs-044", label: "Jackets", href: categoryHref("women", "jackets") },
    ]),
  },
  {
    label: "Men",
    href: collectionHref("men"),
    mega: megaMenu("men", [
      { productId: "fs-071", label: "Hoodies", href: categoryHref("men", "hoodies") },
      { productId: "fs-091", label: "Jackets", href: categoryHref("men", "jackets") },
    ]),
  },
  { label: "Bestsellers", href: collectionHref("bestsellers") },
  { label: "Sale", href: collectionHref("sale"), highlight: true },
];

export const FOOTER_NAV: { title: string; links: NavLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: collectionHref("new-arrivals") },
      { label: "Women", href: collectionHref("women") },
      { label: "Men", href: collectionHref("men") },
      { label: "Bestsellers", href: collectionHref("bestsellers") },
      { label: "Sale", href: collectionHref("sale") },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track My Order", href: "/track-order/" },
      { label: "Shipping & Delivery", href: "/shipping/" },
      { label: "Returns & Exchanges", href: "/returns/" },
      { label: "Size Guide", href: "/size-guide/" },
      { label: "FAQ", href: "/faq/" },
      { label: "Contact Us", href: "/contact/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about/" },
      { label: "My Account", href: "/account/" },
      { label: "Privacy Policy", href: "/privacy/" },
      { label: "Terms of Service", href: "/terms/" },
      { label: "Photo Credits", href: "/credits/" },
    ],
  },
];
