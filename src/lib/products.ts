// Catalogue types and helpers. The products themselves come from the
// admin panel (src/lib/catalog.ts), or from src/data/seed-catalog.ts
// when no database is configured.

export type ProductColor = { name: string; hex: string; image: string };

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviews: number;
  popularity: number;
  dateAdded: number;
  description: string;
  images: string[];
  sizes: string[];
  soldOutSizes: string[];
  colors: ProductColor[];
};

export type Collection = { slug: string; name: string; image: string; description: string };

// Size guide (cm). Placeholder measurements shared by every product.
export const SIZE_GUIDE = [
  {
    size: "36",
    bust: 84,
    waist: 66,
    hip: 90,
  },
  {
    size: "38",
    bust: 88,
    waist: 70,
    hip: 94,
  },
  {
    size: "40",
    bust: 92,
    waist: 74,
    hip: 98,
  },
  {
    size: "42",
    bust: 96,
    waist: 78,
    hip: 102,
  },
  {
    size: "44",
    bust: 100,
    waist: 82,
    hip: 106,
  },
];

export function formatToman(amount: number): string {
  return amount.toLocaleString("fa-IR") + " تومان";
}

export function productHref(id: string): string {
  return "/shop/" + id;
}

export function collectionHref(slug: string): string {
  return "/collections/" + encodeURIComponent(slug);
}
