import type { CollectionConfig } from "payload";
import { revalidateHooks } from "../revalidate";

// The storefront's "collections" (مانتو، پالتو، ...). Named categories
// here to avoid clashing with Payload's own "collections".
export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "کالکشن", plural: "کالکشن‌ها" },
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug", "order"], group: "فروشگاه" },
  access: { read: () => true },
  defaultSort: "order",
  hooks: revalidateHooks,
  fields: [
    { name: "name", label: "نام", type: "text", required: true },
    {
      name: "slug",
      label: "نامک (در آدرس صفحه)",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    { name: "image", label: "تصویر", type: "upload", relationTo: "media", required: true },
    { name: "description", label: "توضیح", type: "textarea" },
    { name: "order", label: "ترتیب نمایش", type: "number", defaultValue: 0 },
  ],
};
