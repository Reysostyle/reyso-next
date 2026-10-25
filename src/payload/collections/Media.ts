import path from "path";
import { fileURLToPath } from "url";
import type { CollectionConfig } from "payload";
import { revalidateHooks } from "../revalidate";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "تصویر", plural: "تصاویر" },
  // No date columns: Payload shows them in the Gregorian calendar.
  admin: { group: "فروشگاه", defaultColumns: ["filename", "alt"] },
  access: { read: () => true },
  hooks: revalidateHooks,
  upload: {
    // MEDIA_DIR points at persistent storage on the server.
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, "../../../media"),
    mimeTypes: ["image/*"],
    resizeOptions: { width: 1800, withoutEnlargement: true },
  },
  fields: [{ name: "alt", label: "متن جایگزین", type: "text" }],
};
