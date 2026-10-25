import type { CollectionConfig } from "payload";

// Staff accounts for the admin panel (email + password). Customers get
// their own collection with SMS login.
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "مدیر", plural: "مدیران" },
  admin: { useAsTitle: "email", group: "تنظیمات" },
  auth: true,
  fields: [{ name: "name", label: "نام", type: "text" }],
};
