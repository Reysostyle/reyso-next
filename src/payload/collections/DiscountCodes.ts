import type { CollectionConfig } from "payload";

// Checked on the server when an order is placed, so codes are no longer
// visible in the site's JavaScript.
export const DiscountCodes: CollectionConfig = {
  slug: "discount-codes",
  labels: { singular: "کد تخفیف", plural: "کدهای تخفیف" },
  admin: {
    useAsTitle: "code",
    defaultColumns: ["code", "label", "active", "usedCount"],
    group: "فروشگاه",
  },
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => (data?.code ? { ...data, code: String(data.code).trim().toUpperCase() } : data),
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "code", label: "کد", type: "text", required: true, unique: true, index: true },
        { name: "active", label: "فعال", type: "checkbox", defaultValue: true },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          label: "نوع",
          type: "select",
          required: true,
          defaultValue: "percent",
          options: [
            { value: "percent", label: "درصدی" },
            { value: "fixed", label: "مبلغ ثابت (تومان)" },
          ],
        },
        { name: "value", label: "مقدار", type: "number", required: true, min: 1 },
      ],
    },
    {
      name: "label",
      label: "متنی که مشتری می‌بینه",
      type: "text",
      required: true,
      admin: { description: "مثلاً «۱۰٪ تخفیف»" },
    },
    {
      type: "row",
      fields: [
        { name: "minSubtotal", label: "حداقل خرید (تومان)", type: "number", min: 0 },
        { name: "maxUses", label: "حداکثر دفعات استفاده", type: "number", min: 1 },
        {
          name: "usedCount",
          label: "دفعات استفاده‌شده",
          type: "number",
          defaultValue: 0,
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: "expiresAt",
      label: "تاریخ انقضا",
      type: "date",
      admin: { description: "خالی = بدون انقضا" },
    },
  ],
};
