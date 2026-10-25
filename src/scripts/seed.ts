// Loads the built-in catalogue (src/data/seed-catalog.ts) into an empty
// database: images, collections, products, lessons and the homepage's
// featured row. Run once after creating the database: `npm run seed`.
import path from "path";
import { getPayload } from "payload";
import config from "@payload-config";
import { COLLECTIONS, FEATURED_PRODUCT_IDS, LESSONS, PRODUCTS } from "@/data/seed-catalog";

const payload = await getPayload({ config });
const context = { skipRevalidate: true };

const existing = await payload.count({ collection: "products" });
if (existing.totalDocs > 0) {
  payload.logger.info(`Database already has ${existing.totalDocs} products; nothing seeded.`);
  process.exit(0);
}

// One media document per image file, shared by everything that uses it.
const mediaIds = new Map<string, number>();
async function media(src: string, alt: string): Promise<number> {
  const known = mediaIds.get(src);
  if (known) return known;
  const doc = await payload.create({
    collection: "media",
    data: { alt },
    filePath: path.join(process.cwd(), "public", src),
    context,
  });
  mediaIds.set(src, doc.id);
  return doc.id;
}

const categoryIds = new Map<string, number>();
for (const [order, c] of COLLECTIONS.entries()) {
  const doc = await payload.create({
    collection: "categories",
    data: {
      name: c.name,
      slug: c.slug,
      description: c.description,
      order,
      image: await media(c.image, c.name),
    },
    context,
  });
  categoryIds.set(c.slug, doc.id);
}

// Created in catalogue order (the storefront lists products by id), with
// creation times spaced by the old dateAdded so "newest" sorts as before.
const productIds = new Map<string, number>();
const base = Date.now() - 365 * 24 * 3600 * 1000;
for (const p of PRODUCTS) {
  const images = [];
  for (const src of p.images) images.push(await media(src, p.name));
  const colors = [];
  for (const c of p.colors) colors.push({ name: c.name, hex: c.hex, image: await media(c.image, p.name) });

  const doc = await payload.create({
    collection: "products",
    data: {
      name: p.name,
      slug: p.id,
      published: true,
      category: categoryIds.get(p.category)!,
      price: p.price,
      oldPrice: p.oldPrice,
      description: p.description,
      images,
      sizes: p.sizes as never,
      soldOutSizes: p.soldOutSizes as never,
      colors,
      popularity: p.popularity,
      rating: p.rating,
      reviews: p.reviews,
      createdAt: new Date(base + p.dateAdded * 24 * 3600 * 1000).toISOString(),
    },
    context,
  });
  productIds.set(p.id, doc.id);
}

for (const [order, l] of LESSONS.entries()) {
  await payload.create({
    collection: "lessons",
    data: {
      title: l.title,
      category: l.category,
      duration: l.duration,
      aparatId: l.aparatId,
      description: l.description,
      order,
      thumbnail: await media(l.thumbnail, l.title),
    },
    context,
  });
}

await payload.updateGlobal({
  slug: "home",
  data: { featured: FEATURED_PRODUCT_IDS.map((id) => productIds.get(id)!) },
  context,
});

payload.logger.info(
  `Seeded ${COLLECTIONS.length} collections, ${PRODUCTS.length} products, ${LESSONS.length} lessons, ${mediaIds.size} images.`,
);
process.exit(0);
