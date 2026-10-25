import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { fa } from "@payloadcms/translations/languages/fa";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Categories } from "./payload/collections/Categories";
import { Lessons } from "./payload/collections/Lessons";
import { Media } from "./payload/collections/Media";
import { Products } from "./payload/collections/Products";
import { Users } from "./payload/collections/Users";
import { Home } from "./payload/globals/Home";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: " | پنل ReySo" },
    avatar: "default",
  },
  i18n: { supportedLanguages: { fa }, fallbackLanguage: "fa" },
  collections: [Products, Categories, Media, Lessons, Users],
  globals: [Home],
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    migrationDir: path.resolve(dirname, "migrations"),
    // Schema changes go through migrations (`npm run payload -- migrate:create`),
    // applied automatically when the production server starts.
    push: false,
    prodMigrations: migrations,
  }),
  sharp,
});
