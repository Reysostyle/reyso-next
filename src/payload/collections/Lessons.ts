import type { CollectionConfig } from "payload";
import { revalidateHooks } from "../revalidate";

export const Lessons: CollectionConfig = {
  slug: "lessons",
  labels: { singular: "آموزش", plural: "آموزش‌ها" },
  admin: { useAsTitle: "title", defaultColumns: ["title", "category", "duration"], group: "محتوا" },
  access: { read: () => true },
  defaultSort: "order",
  hooks: revalidateHooks,
  fields: [
    { name: "title", label: "عنوان", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "category", label: "دسته", type: "text", required: true },
        { name: "duration", label: "مدت (مثل ۱۸:۲۰)", type: "text", required: true },
      ],
    },
    { name: "thumbnail", label: "تصویر", type: "upload", relationTo: "media", required: true },
    {
      name: "aparatId",
      label: "کد ویدیوی آپارات",
      type: "text",
      admin: {
        description: "بخش آخر لینک اشتراک آپارات. تا خالی باشه، «به‌زودی» نمایش داده می‌شه.",
      },
    },
    { name: "description", label: "توضیح", type: "textarea", required: true },
    { name: "order", label: "ترتیب نمایش", type: "number", defaultValue: 0 },
  ],
};
