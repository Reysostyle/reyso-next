import "server-only";
import { cache } from "react";
import { COLLECTIONS, FEATURED_PRODUCT_IDS, LESSONS, PRODUCTS } from "@/data/seed-catalog";
import type { Lesson } from "@/lib/lessons";
import type { Collection, Product } from "@/lib/products";
import type { Media } from "@/payload-types";

export type Catalog = {
  products: Product[];
  collections: Collection[];
  lessons: Lesson[];
  featuredIds: string[];
};

const mediaUrl = (m: number | Media | null | undefined) => (m && typeof m === "object" ? (m.url ?? "") : "");

/** The storefront catalogue: from the admin panel's database when one is
 *  configured, otherwise the built-in catalogue (GitHub Pages preview). */
export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!process.env.DATABASE_URL) {
    return {
      products: PRODUCTS,
      collections: COLLECTIONS,
      lessons: LESSONS,
      featuredIds: FEATURED_PRODUCT_IDS,
    };
  }

  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@payload-config"),
  ]);
  const payload = await getPayload({ config });
  const query = { depth: 1, pagination: false, overrideAccess: false } as const;
  const [products, categories, lessons, home] = await Promise.all([
    payload.find({ collection: "products", ...query, sort: "id" }),
    payload.find({ collection: "categories", ...query, sort: "order" }),
    payload.find({ collection: "lessons", ...query, sort: "order" }),
    payload.findGlobal({ slug: "home", depth: 1, overrideAccess: false }),
  ]);

  return {
    products: products.docs.map((p) => ({
      id: p.slug,
      name: p.name,
      category: typeof p.category === "object" ? p.category.slug : "",
      price: p.price,
      oldPrice: p.oldPrice ?? null,
      rating: p.rating ?? 5,
      reviews: p.reviews ?? 0,
      popularity: p.popularity ?? 0,
      dateAdded: Date.parse(p.createdAt),
      description: p.description,
      images: p.images.map(mediaUrl).filter(Boolean),
      sizes: p.sizes,
      soldOutSizes: p.soldOutSizes ?? [],
      colors: p.colors.map((c) => ({ name: c.name, hex: c.hex, image: mediaUrl(c.image) })),
    })),
    collections: categories.docs.map((c) => ({
      slug: c.slug,
      name: c.name,
      image: mediaUrl(c.image),
      description: c.description ?? "",
    })),
    lessons: lessons.docs.map((l) => ({
      id: String(l.id),
      title: l.title,
      category: l.category,
      duration: l.duration,
      thumbnail: mediaUrl(l.thumbnail),
      aparatId: l.aparatId ?? "",
      description: l.description,
    })),
    featuredIds: (home.featured ?? []).flatMap((p) => (typeof p === "object" && p.published ? [p.slug] : [])),
  };
});

export async function getProduct(id: string): Promise<Product | null> {
  return (await getCatalog()).products.find((p) => p.id === id) ?? null;
}

export async function getCollection(slug: string): Promise<Collection | null> {
  return (await getCatalog()).collections.find((c) => c.slug === slug) ?? null;
}
