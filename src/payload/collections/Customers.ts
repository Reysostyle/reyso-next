import type { CollectionConfig } from "payload";

// Shoppers who signed in with an SMS code. They have no password and never
// use the admin panel; the storefront talks to them through /api/account.
export const Customers: CollectionConfig = {
  slug: "customers",
  labels: { singular: "مشتری", plural: "مشتری‌ها" },
  admin: {
    useAsTitle: "phone",
    defaultColumns: ["phone", "firstName", "lastName", "lastLoginAt"],
    listSearchableFields: ["phone", "firstName", "lastName"],
    group: "فروشگاه",
  },
  // Staff only. The storefront reaches these records through its own
  // routes, which check the customer's session cookie.
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: "phone",
      label: "موبایل",
      type: "text",
      required: true,
      unique: true,
      index: true,
      validate: (value: string | null | undefined) =>
        /^09\d{9}$/.test(value ?? "") || "شماره موبایل باید ۱۱ رقم باشه و با ۰۹ شروع بشه",
    },
    {
      type: "row",
      fields: [
        { name: "firstName", label: "نام", type: "text" },
        { name: "lastName", label: "نام خانوادگی", type: "text" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "email", label: "ایمیل", type: "email" },
        { name: "birthday", label: "تاریخ تولد", type: "text" },
      ],
    },
    { name: "telegram", label: "آیدی تلگرام", type: "text" },
    {
      name: "addresses",
      label: "آدرس‌ها",
      type: "array",
      labels: { singular: "آدرس", plural: "آدرس‌ها" },
      fields: [
        // The id the storefront gave the address, so edits find it again.
        {
          name: "clientId",
          type: "text",
          admin: { hidden: true },
          // Addresses added here in the panel get one too.
          hooks: {
            beforeChange: [
              ({ value }) => value || `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ],
          },
        },
        {
          type: "row",
          fields: [
            { name: "label", label: "عنوان", type: "text" },
            { name: "province", label: "استان", type: "text" },
            { name: "city", label: "شهر", type: "text" },
          ],
        },
        { name: "full", label: "آدرس کامل", type: "textarea", required: true },
        {
          type: "row",
          fields: [
            { name: "postal", label: "کد پستی", type: "text" },
            { name: "isDefault", label: "آدرس پیش‌فرض", type: "checkbox" },
          ],
        },
      ],
    },
    {
      name: "wishlist",
      label: "علاقه‌مندی‌ها",
      type: "json",
      admin: { components: { Field: "/components/admin/WishlistField" } },
    },
    {
      name: "lastLoginAt",
      label: "آخرین ورود",
      type: "date",
      admin: {
        position: "sidebar",
        components: {
          Cell: "/components/admin/JalaliDateCell",
          Field: "/components/admin/JalaliDateField",
        },
      },
    },
  ],
};
