import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { fa } from "@payloadcms/translations/languages/fa";
import { buildConfig, type CollectionConfig } from "payload";
import sharp from "sharp";
import { Categories } from "./payload/collections/Categories";
import { Lessons } from "./payload/collections/Lessons";
import { Media } from "./payload/collections/Media";
import { Products } from "./payload/collections/Products";
import { Users } from "./payload/collections/Users";
import { Home } from "./payload/globals/Home";
import { migrations } from "./migrations";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Persian (Jalali) created/updated dates on every edit page; the Gregorian
// ones Payload shows are hidden in custom.scss.
const withDocDates = (collection: CollectionConfig): CollectionConfig => ({
  ...collection,
  admin: {
    ...collection.admin,
    components: {
      ...collection.admin?.components,
      edit: {
        ...collection.admin?.components?.edit,
        beforeDocumentControls: ["/components/admin/DocDates"],
      },
    },
  },
});

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " | پنل ReySo",
      icons: [{ rel: "icon", type: "image/png", url: "/images/favicon-32x32.png" }],
    },
    avatar: "default",
    // The brand palette is light-only.
    theme: "light",
    components: {
      graphics: { Logo: "/components/admin/Logo", Icon: "/components/admin/Icon" },
      beforeDashboard: ["/components/admin/Dashboard"],
    },
  },
  i18n: { supportedLanguages: { fa }, fallbackLanguage: "fa" },
  collections: [Products, Categories, Media, Lessons, Users].map(withDocDates),
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
