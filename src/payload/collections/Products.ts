import type { CollectionConfig } from "payload";
import { revalidateHooks } from "../revalidate";

const PRICE_COMPONENTS = {
  Cell: "/components/admin/PriceCell",
  afterInput: ["/components/admin/PriceHint"],
};

const SIZE_OPTIONS = ["36", "38", "40", "42", "44", "46", "48", "فری‌سایز"];

export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: "محصول", plural: "محصولات" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["thumb", "name", "category", "price", "published"],
    group: "فروشگاه",
  },
  // Visitors only see published products; staff see everything.
  access: { read: ({ req }) => (req.user ? true : { published: { equals: true } }) },
  hooks: revalidateHooks,
  fields: [
    {
      // List-only column with the first photo.
      name: "thumb",
      label: "عکس",
      type: "ui",
      admin: { components: { Cell: "/components/admin/ThumbCell" } },
    },
    {
      name: "name",
      label: "نام",
      type: "text",
      required: true,
      admin: { components: { Cell: "/components/admin/NameCell" } },
    },
    {
      name: "slug",
      label: "شناسه در آدرس (انگلیسی، مثل manteau-abrisham)",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: (value: string | null | undefined) =>
        /^[a-z0-9-]+$/.test(value ?? "") || "فقط حروف کوچک انگلیسی، عدد و خط تیره",
    },
    {
      name: "published",
      label: "نمایش در سایت",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar", components: { Cell: "/components/admin/PublishedCell" } },
    },
    {
      name: "category",
      label: "کالکشن",
      type: "relationship",
      relationTo: "categories",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      type: "row",
      fields: [
        {
          name: "price",
          label: "قیمت (تومان)",
          type: "number",
          required: true,
          min: 0,
          admin: { components: PRICE_COMPONENTS },
        },
        {
          name: "oldPrice",
          label: "قیمت قبل از تخفیف (تومان)",
          type: "number",
          min: 0,
          admin: { components: PRICE_COMPONENTS },
        },
      ],
    },
    { name: "description", label: "توضیحات", type: "textarea", required: true },
    {
      name: "images",
      label: "تصاویر",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
      minRows: 1,
    },
    {
      name: "sizes",
      label: "سایزها",
      type: "select",
      hasMany: true,
      required: true,
      options: SIZE_OPTIONS,
    },
    {
      name: "soldOutSizes",
      label: "سایزهای ناموجود",
      type: "select",
      hasMany: true,
      options: SIZE_OPTIONS,
    },
    {
      name: "colors",
      label: "رنگ‌ها",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "رنگ", plural: "رنگ‌ها" },
      fields: [
        {
          type: "row",
          fields: [
            { name: "name", label: "نام رنگ", type: "text", required: true },
            {
              name: "hex",
              label: "کد رنگ",
              type: "text",
              required: true,
              admin: { description: "مثلاً #1C4436" },
              validate: (value: string | null | undefined) =>
                /^#[0-9a-fA-F]{6}$/.test(value ?? "") || "کد رنگ باید مثل #1C4436 باشه",
            },
          ],
        },
        { name: "image", label: "تصویر این رنگ", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      type: "collapsible",
      label: "مرتب‌سازی و امتیاز",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "popularity",
          label: "محبوبیت (برای مرتب‌سازی «محبوب‌ترین»)",
          type: "number",
          defaultValue: 0,
        },
        { name: "rating", label: "امتیاز (۱ تا ۵)", type: "number", min: 1, max: 5, defaultValue: 5 },
        { name: "reviews", label: "تعداد نظرها", type: "number", min: 0, defaultValue: 0 },
      ],
    },
  ],
};
